const Table = require("../models/tableModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");
// ✅ 1. Add new table
const addTable = async (req, res, next) => {
  try {
    const { tableNo, seats, status } = req.body;
    if (!tableNo) {
      return next(createHttpError(400, "Please provide table No!"));
    }
    const isTablePresent = await Table.findOne({ tableNo });
    if (isTablePresent) {
      return next(createHttpError(400, "Table already exists!"));
    }
    const newTable = new Table({
      tableNo,
      seats: seats || 4,
      status: status || "Available",
    });
    await newTable.save();
    res.status(201).json({
      success: true,
      message: "Table added!",
      data: newTable,
    });
  } catch (error) {
    next(error);
  }
};
// ✅ 2. Get all tables
const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find()
      .populate({
        path: "currentOrder",
        select:
          "customerName customerPhone guests customerDetails bills orderStatus createdAt",
      })
      .sort({ tableNo: 1 });
    const formattedTables = tables.map((table) => {
      const tableObj = table.toObject();
      const order = tableObj.currentOrder;
      return {
        ...tableObj,
        // Get customer info from order
        customerName: order?.customerName || order?.customerDetails?.name || "",
        customerPhone:
          order?.customerPhone || order?.customerDetails?.phone || "",
        guests: order?.guests || order?.customerDetails?.guests || 0,
        // Order info
        orderTotal:
          order?.bills?.totalWithDiscountUSD || order?.bills?.totalUSD || 0,
        orderStatus: order?.orderStatus || "",
        orderTime: order?.createdAt || null,
      };
    });
    res.status(200).json({ success: true, data: formattedTables });
  } catch (error) {
    next(error);
  }
};
// ✅ 3. Update table (generic flexible update)
const updateTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid id!"));
    }
    const updateFields = {};
    const allowedFields = ["status", "orderId", "seats", "tableNo"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateFields[field] = req.body[field];
    });
    // Map orderId to currentOrder
    if (updateFields.orderId) {
      updateFields.currentOrder = updateFields.orderId;
      delete updateFields.orderId;
    }
    // If status is Available, clear order
    if (updateFields.status === "Available") {
      updateFields.currentOrder = null;
    }
    const table = await Table.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    if (!table) {
      return next(createHttpError(404, "Table not found!"));
    }
    res.status(200).json({
      success: true,
      message: "Table updated!",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};
// ✅ 4. Update table status (quick update from POS)
const updateTableStatus = async (req, res, next) => {
  try {
    const { tableId, status, orderId } = req.body;
    if (!tableId) {
      return next(createHttpError(400, "Table ID is required!"));
    }
    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return next(createHttpError(404, "Invalid table ID!"));
    }
    const updateFields = { status: status || "Available" };
    if (status === "In Progress" || status === "Reserved") {
      if (orderId) updateFields.currentOrder = orderId;
    } else if (status === "Available") {
      updateFields.currentOrder = null;
    }
    const table = await Table.findByIdAndUpdate(tableId, updateFields, {
      new: true,
    });
    if (!table) {
      return next(createHttpError(404, "Table not found!"));
    }
    res.status(200).json({
      success: true,
      message: "Table status updated!",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};
// ✅ 5. Release table (set available)
const releaseTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid id!"));
    }
    const table = await Table.findByIdAndUpdate(
      id,
      {
        status: "Available",
        currentOrder: null,
      },
      { new: true }
    );
    if (!table) {
      return next(createHttpError(404, "Table not found!"));
    }
    res.status(200).json({
      success: true,
      message: "Table released!",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};
// ✅ 6. Delete table
const deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid id!"));
    }
    const table = await Table.findById(id);
    if (!table) {
      return next(createHttpError(404, "Table not found!"));
    }
    if (table.status !== "Available") {
      return next(createHttpError(400, "Cannot delete an occupied table!"));
    }
    await Table.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Table deleted!",
    });
  } catch (error) {
    next(error);
  }
};
// ✅ 7. Get available tables only
const getAvailableTables = async (req, res, next) => {
  try {
    const tables = await Table.find({ status: "Available" }).sort({
      tableNo: 1,
    });
    res.status(200).json({
      success: true,
      data: tables,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  addTable,
  getTables,
  updateTable,
  updateTableStatus,
  releaseTable,
  deleteTable,
  getAvailableTables,
};
