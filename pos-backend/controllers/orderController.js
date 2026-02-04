const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const Customer = require("../models/customerModel");
const { default: mongoose } = require("mongoose");
/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
const addOrder = async (req, res, next) => {
  try {
    const EXCHANGE_RATE = 4100;
    const createdBy = req.user?._id || null;
    const staffName = req.user?.name || "";
    // Get table number if table ID provided
    let tableNo = "";
    if (req.body.table) {
      const table = await Table.findById(req.body.table);
      if (table) {
        tableNo = table.tableNo || "";
      }
    }
    // Extract customer details (handle both old and new format)
    const customerName =
      req.body.customerName || req.body.customerDetails?.name?.trim() || "";
    const customerPhone =
      req.body.customerPhone || req.body.customerDetails?.phone?.trim() || "";
    const guests = req.body.guests || req.body.customerDetails?.guests || 1;
    const order = new Order({
      // Customer info (denormalized)
      customerName,
      customerPhone,
      guests,
      // Keep customerDetails for backward compatibility
      customerDetails: {
        name: customerName,
        phone: customerPhone,
        guests: guests,
      },
      // Table info
      table: req.body.table || null,
      tableNo,
      // Items
      items: req.body.items,
      // Bills
      bills: req.body.bills,
      // Payment
      paymentType: req.body.paymentType || "Cash",
      orderStatus: req.body.orderStatus || "In Progress",
      // Staff info (denormalized)
      createdBy,
      staffName,
    });
    await order.save();
    // ✅ UPDATE CUSTOMER STATS if customer name exists
    const orderTotal =
      req.body.bills?.totalWithDiscount || req.body.bills?.total || 0;
    const orderTotalUSD = Number((orderTotal / EXCHANGE_RATE).toFixed(2));
    if (customerName) {
      // Try to find existing customer by name (case-insensitive) or phone
      let customer = await Customer.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${customerName}$`, "i") } },
          ...(customerPhone ? [{ phone: customerPhone }] : []),
        ],
        isActive: true,
      });
      if (customer) {
        // Update existing customer stats
        const newTotalSpent = (customer.totalSpent || 0) + orderTotal;
        const newTotalSpentUSD = Number(
          (newTotalSpent / EXCHANGE_RATE).toFixed(2)
        );
        await Customer.findByIdAndUpdate(customer._id, {
          $inc: {
            totalOrders: 1,
            totalSpent: orderTotal,
          },
          totalSpentUSD: newTotalSpentUSD,
          lastOrderDate: new Date(),
          // Update phone if it was empty
          ...(customerPhone && !customer.phone ? { phone: customerPhone } : {}),
        });
      } else {
        // Create new customer
        customer = new Customer({
          name: customerName,
          phone: customerPhone || "",
          totalOrders: 1,
          totalSpent: orderTotal,
          totalSpentUSD: orderTotalUSD,
          lastOrderDate: new Date(),
        });
        await customer.save();
      }
    }
    // ✅ UPDATE TABLE with customer info if table is assigned
    if (req.body.table) {
      await Table.findByIdAndUpdate(req.body.table, {
        status: "In Progress",
        customerName: customerName || "",
        customerPhone: customerPhone || "",
        guests: guests || 1,
        currentOrder: order._id,
      });
    }
    // Populate for response
    const populatedOrder = await Order.findById(order._id)
      .populate("table")
      .populate("createdBy", "name email role");
    res.status(201).json({
      success: true,
      message: "Order created successfully!",
      data: populatedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    next(createHttpError(500, "Failed to create order"));
  }
};
/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("table")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });
    // Format orders to ensure customerName and staffName are always available
    const formattedOrders = orders.map((order) => {
      const orderObj = order.toObject();
      return {
        ...orderObj,
        // Ensure customerName is available (fallback to customerDetails)
        customerName:
          orderObj.customerName || orderObj.customerDetails?.name || "Unknown",
        // Ensure staffName is available (fallback to createdBy.name)
        staffName: orderObj.staffName || orderObj.createdBy?.name || "Unknown",
        // Ensure tableNo is available
        tableNo: orderObj.tableNo || orderObj.table?.tableNo || "",
      };
    });
    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    next(createHttpError(500, "Failed to fetch orders"));
  }
};
/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid order ID"));
    }
    const order = await Order.findById(id)
      .populate("table")
      .populate("createdBy", "name email role");
    if (!order) {
      return next(createHttpError(404, "Order not found"));
    }
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    next(createHttpError(500, "Failed to fetch order"));
  }
};
/**
 * @desc    Update order
 * @route   PUT /api/orders/:id
 * @access  Private
 */
const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid order ID"));
    }
    // Get the order first to check table
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return next(createHttpError(404, "Order not found"));
    }
    const order = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("table")
      .populate("createdBy", "name email role");

    // ✅ Release table when order is Paid, Completed, or Cancelled
    if (
      req.body.orderStatus === "Paid" ||
      req.body.orderStatus === "Completed" ||
      req.body.orderStatus === "Cancelled"
    ) {
      const tableId = existingOrder.table || order.table?._id;
      if (tableId) {
        await Table.findByIdAndUpdate(tableId, {
          status: "Available",
          customerName: "",
          customerPhone: "",
          guests: 0,
          currentOrder: null,
        });
      }
    }
    res.status(200).json({
      success: true,
      message: "Order updated successfully!",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    next(createHttpError(500, "Failed to update order"));
  }
};
/**
 * @desc    Delete order
 * @route   DELETE /api/orders/:id
 * @access  Private
 */
const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid order ID"));
    }
    const order = await Order.findById(id);
    if (!order) {
      return next(createHttpError(404, "Order not found"));
    }
    // ✅ DECREMENT CUSTOMER STATS when order is deleted
    const customerName =
      order.customerName || order.customerDetails?.name?.trim();
    const orderTotal =
      order.bills?.totalWithDiscount || order.bills?.total || 0;
    const EXCHANGE_RATE = 4100;
    if (customerName) {
      const customer = await Customer.findOne({
        name: { $regex: new RegExp(`^${customerName}$`, "i") },
        isActive: true,
      });
      if (customer) {
        const newTotalSpent = Math.max(
          0,
          (customer.totalSpent || 0) - orderTotal
        );
        const newTotalSpentUSD = Number(
          (newTotalSpent / EXCHANGE_RATE).toFixed(2)
        );
        await Customer.findByIdAndUpdate(customer._id, {
          $inc: {
            totalOrders: -1,
            totalSpent: -orderTotal,
          },
          totalSpentUSD: newTotalSpentUSD,
        });
      }
    }
    // ✅ Release table if order had a table
    if (order.table) {
      await Table.findByIdAndUpdate(order.table, {
        status: "Available",
        customerName: "",
        customerPhone: "",
        guests: 0,
        currentOrder: null,
      });
    }
    await Order.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Order deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    next(createHttpError(500, "Failed to delete order"));
  }
};
/**
 * @desc    Get orders by user/staff
 * @route   GET /api/orders/user/:userId
 * @access  Private
 */
const getOrdersByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(createHttpError(400, "Invalid user ID"));
    }
    const orders = await Order.find({ createdBy: userId })
      .populate("table")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    next(createHttpError(500, "Failed to fetch user orders"));
  }
};
/**
 * @desc    Get sales statistics
 * @route   GET /api/orders/sales-stats
 * @access  Private
 */
const getSalesStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$createdBy",
          totalOrders: { $sum: 1 },
          totalSales: {
            $sum: { $ifNull: ["$bills.totalWithDiscount", "$bills.total"] },
          },
          avgOrderValue: {
            $avg: { $ifNull: ["$bills.totalWithDiscount", "$bills.total"] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1,
          userName: "$user.name",
          userEmail: "$user.email",
          userRole: "$user.role",
          totalOrders: 1,
          totalSales: 1,
          avgOrderValue: 1,
        },
      },
      {
        $sort: { totalSales: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching sales stats:", error);
    next(createHttpError(500, "Failed to fetch sales statistics"));
  }
};
module.exports = {
  addOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUser,
  getSalesStats,
};
