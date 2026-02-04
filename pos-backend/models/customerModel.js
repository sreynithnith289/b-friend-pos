const mongoose = require("mongoose");
const EXCHANGE_RATE = 4100;
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      // KHR amount
    },
    totalSpentUSD: {
      type: Number,
      default: 0,
      // USD amount
    },
    lastOrderDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
// Pre-save middleware to auto-calculate USD from KHR
customerSchema.pre("save", function (next) {
  if (this.isModified("totalSpent")) {
    this.totalSpentUSD = Number((this.totalSpent / EXCHANGE_RATE).toFixed(2));
  }
  next();
});
module.exports = mongoose.model("Customer", customerSchema);
