const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["Cash", "Online"], required: true },
  status: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
  currency: { type: String, default: "KHR" },
  email: { type: String, default: "" },
  contact: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Payment", paymentSchema);
