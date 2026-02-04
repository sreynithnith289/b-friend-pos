const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/userModel");
const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
    // Get all existing users
    const existingUsers = await User.find().select("-password");
    if (existingUsers.length === 0) {
      console.log("⚠️ No users found in database.");
      console.log("💡 Please add users through the application first.");
      process.exit(0);
    }
    console.log(`\n📋 Existing Users (${existingUsers.length} total):`);
    console.log("─".repeat(60));
    console.log(
      `   ${"Name".padEnd(15)} | ${"Email".padEnd(25)} | ${"Role".padEnd(
        10
      )} | Active`
    );
    console.log("─".repeat(60));
    existingUsers.forEach((user) => {
      console.log(
        `   ${(user.name || "N/A").padEnd(15)} | ${(user.email || "N/A").padEnd(
          25
        )} | ${(user.role || "N/A").padEnd(10)} | ${
          user.isActive ? "✅" : "❌"
        }`
      );
    });
    console.log("─".repeat(60));
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};
seedUsers();
