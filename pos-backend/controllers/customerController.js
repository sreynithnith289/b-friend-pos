const Customer = require("../models/customerModel");
const Order = require("../models/orderModel");

// Get all customers from Customer collection
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
};

// Add new customer
const addCustomer = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    // Check if customer with same phone already exists
    if (phone) {
      const existingCustomer = await Customer.findOne({ phone });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: "Customer with this phone number already exists",
        });
      }
    }

    const customer = new Customer({
      name: name.trim(),
      phone: phone?.trim() || "",
    });

    await customer.save();

    res.status(201).json({
      success: true,
      message: "Customer added successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add customer",
      error: error.message,
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, oldName } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    // Find and update the customer
    const customer = await Customer.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        phone: phone?.trim() || "",
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Also update customer name in all related orders if name changed
    if (oldName && oldName !== name.trim()) {
      await Order.updateMany(
        { "customerDetails.name": { $regex: new RegExp(`^${oldName}$`, "i") } },
        {
          $set: {
            "customerDetails.name": name.trim(),
            "customerDetails.phone": phone?.trim() || "",
          },
        }
      );
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update customer",
      error: error.message,
    });
  }
};

// Delete customer (soft delete - set isActive to false)
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Optionally clear customer details from orders
    await Order.updateMany(
      {
        "customerDetails.name": {
          $regex: new RegExp(`^${customer.name}$`, "i"),
        },
      },
      {
        $set: {
          "customerDetails.name": "",
          "customerDetails.phone": "",
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};

// Hard delete customer (permanently remove)
const hardDeleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer permanently deleted",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};

// Search customers
const searchCustomers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const customers = await Customer.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
      ],
    }).limit(10);

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("Error searching customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search customers",
      error: error.message,
    });
  }
};

// Update customer stats (called when order is placed)
const updateCustomerStats = async (req, res) => {
  try {
    const { customerId, orderTotal } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      {
        $inc: {
          totalOrders: 1,
          totalSpent: orderTotal,
        },
        lastOrderDate: new Date(),
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error updating customer stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update customer stats",
      error: error.message,
    });
  }
};

// Sync all customer stats from orders (recalculate)
const syncAllCustomerStats = async (req, res) => {
  try {
    const EXCHANGE_RATE = 4100;

    // Get all orders with customer names
    const orders = await Order.find({
      "customerDetails.name": { $exists: true, $ne: "" },
    });

    // Aggregate customer stats from orders
    const customerStats = new Map();

    orders.forEach((order) => {
      const customerName = order.customerDetails?.name?.trim();
      const customerPhone = order.customerDetails?.phone?.trim();
      const orderTotal =
        order.bills?.totalWithDiscount || order.bills?.total || 0;
      const orderDate = new Date(order.createdAt);

      if (!customerName) return;

      const key = customerName.toLowerCase();

      if (customerStats.has(key)) {
        const stats = customerStats.get(key);
        stats.totalOrders += 1;
        stats.totalSpent += orderTotal;
        if (!stats.phone && customerPhone) stats.phone = customerPhone;
        if (orderDate > stats.lastOrderDate) stats.lastOrderDate = orderDate;
      } else {
        customerStats.set(key, {
          name: customerName,
          phone: customerPhone || "",
          totalOrders: 1,
          totalSpent: orderTotal,
          lastOrderDate: orderDate,
        });
      }
    });

    // Update or create customers in database
    let updated = 0;
    let created = 0;

    for (const [key, stats] of customerStats) {
      const totalSpentUSD = Number(
        (stats.totalSpent / EXCHANGE_RATE).toFixed(2)
      );

      let customer = await Customer.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${stats.name}$`, "i") } },
          ...(stats.phone ? [{ phone: stats.phone }] : []),
        ],
      });

      if (customer) {
        await Customer.findByIdAndUpdate(customer._id, {
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          totalSpentUSD: totalSpentUSD,
          lastOrderDate: stats.lastOrderDate,
          ...(stats.phone && !customer.phone ? { phone: stats.phone } : {}),
          isActive: true,
        });
        updated++;
      } else {
        const newCustomer = new Customer({
          name: stats.name,
          phone: stats.phone,
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          totalSpentUSD: totalSpentUSD,
          lastOrderDate: stats.lastOrderDate,
          isActive: true,
        });
        await newCustomer.save();
        created++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Synced customer stats: ${updated} updated, ${created} created`,
      data: { updated, created, total: updated + created },
    });
  } catch (error) {
    console.error("Error syncing customer stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync customer stats",
      error: error.message,
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  hardDeleteCustomer,
  searchCustomers,
  updateCustomerStats,
  syncAllCustomerStats,
};
