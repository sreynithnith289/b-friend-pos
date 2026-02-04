const mongoose = require("mongoose");
const loginHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    loginAt: {
      type: Date,
      default: Date.now,
    },
    logoutAt: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    device: {
      type: String,
      default: "Unknown",
    },
    status: {
      type: String,
      enum: ["Active", "Logged Out", "Expired"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("LoginHistory", loginHistorySchema);
