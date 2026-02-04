const mongoose = require("mongoose");
const EXCHANGE_RATE = 4100;
const orderSchema = new mongoose.Schema(
  {
    // Customer info (denormalized for easy display)
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    guests: { type: Number, default: 1 },
    // Keep customerDetails for backward compatibility
    customerDetails: {
      name: { type: String },
      phone: { type: String },
      guests: { type: Number },
    },
    // Table info (denormalized)
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
    },
    tableNo: { type: String, default: "" }, // e.g., "T1", "T2"
    // Order items
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // KHR price per item
        total: { type: Number }, // KHR total for this item
      },
    ],
    // Billing info with both currencies
    bills: {
      total: { type: Number, required: true }, // KHR
      totalUSD: { type: Number }, // USD (auto-calculated)
      discount: { type: Number, default: 0 }, // KHR
      discountPercent: { type: Number, default: 0 },
      totalWithDiscount: { type: Number, required: true }, // KHR
      totalWithDiscountUSD: { type: Number }, // USD (auto-calculated)
    },
    // Payment info
    paymentType: {
      type: String,
      enum: ["Cash", "Online"],
      default: "Cash",
    },
    orderStatus: {
      type: String,
      enum: ["In Progress", "Preparing", "Completed", "Paid", "Cancelled"],
      default: "In Progress",
    },
    // Staff info (denormalized)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    staffName: { type: String, default: "" }, // e.g., "Sreynith"
  },
  {
    timestamps: true,
  }
);
// Pre-save middleware to auto-calculate USD amounts and sync customer fields
orderSchema.pre("save", function (next) {
  // Sync customerName from customerDetails if not set (backward compatibility)
  if (!this.customerName && this.customerDetails?.name) {
    this.customerName = this.customerDetails.name;
  }
  if (!this.customerPhone && this.customerDetails?.phone) {
    this.customerPhone = this.customerDetails.phone;
  }
  if (!this.guests && this.customerDetails?.guests) {
    this.guests = this.customerDetails.guests;
  }
  // Also sync the other way - keep customerDetails in sync
  if (this.customerName && !this.customerDetails?.name) {
    this.customerDetails = {
      name: this.customerName,
      phone: this.customerPhone || "",
      guests: this.guests || 1,
    };
  }
  // Calculate USD for bills
  if (this.bills) {
    if (this.bills.total) {
      this.bills.totalUSD = Number(
        (this.bills.total / EXCHANGE_RATE).toFixed(2)
      );
    }
    if (this.bills.totalWithDiscount) {
      this.bills.totalWithDiscountUSD = Number(
        (this.bills.totalWithDiscount / EXCHANGE_RATE).toFixed(2)
      );
    }
  }
  // Calculate total for each item if not set
  if (this.items && this.items.length > 0) {
    this.items.forEach((item) => {
      if (!item.total) {
        item.total = item.price * item.quantity;
      }
    });
  }
  next();
});
module.exports = mongoose.model("Order", orderSchema);
