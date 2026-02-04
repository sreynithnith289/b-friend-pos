const createHttpError = require("http-errors");
const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");
// Create a payment and mark order as Paid
const createPayment = async (req, res, next) => {
  try {
    const { orderId, amount, method, email, contact } = req.body;
    // ✅ Validate required fields
    if (!orderId || !amount || !method) {
      return next(createHttpError(400, "Missing required payment info!"));
    }
    // ✅ Check if order exists
    const order = await Order.findById(orderId);
    if (!order) return next(createHttpError(404, "Order not found!"));
    // Create new payment record
    const newPayment = new Payment({
      orderId,
      amount,
      method,
      status: "Paid", // mark as paid immediately
      currency: "KHR",
      email: email || "",
      contact: contact || "",
      createdAt: new Date(),
    });
    await newPayment.save();
    // Update order status to Paid
    order.orderStatus = "Paid";
    await order.save();
    res.status(201).json({
      success: true,
      message: "Payment successful!",
      payment: newPayment,
    });
  } catch (error) {
    next(error);
  }
};
// Optional: verify payment (mark order as Paid if needed)
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return next(createHttpError(400, "Order ID is required!"));
    const order = await Order.findById(orderId);
    if (!order) return next(createHttpError(404, "Order not found!"));
    order.orderStatus = "Paid";
    await order.save();
    res.status(200).json({ success: true, message: "Order marked as Paid!" });
  } catch (error) {
    next(error);
  }
};
module.exports = { createPayment, verifyPayment };
