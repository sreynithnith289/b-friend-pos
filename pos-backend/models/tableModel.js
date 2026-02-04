const mongoose = require("mongoose");
const tableSchema = new mongoose.Schema(
  {
    tableNo: {
      type: Number,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Available", "In Progress", "Reserved"],
      default: "Available",
    },
    seats: {
      type: Number,
      required: true,
      default: 4,
    },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Table", tableSchema);
