const mongoose = require("mongoose");
const dishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Dish name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    priceKHR: {
      type: Number,
      required: [true, "Price in KHR is required"],
      min: 0,
    },
    priceUSD: {
      type: Number,
      required: [true, "Price in USD is required"],
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    image: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      default: 15,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Dish", dishSchema);
