const mongoose = require("mongoose");
const config = require("./config");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.databaseURI);
    console.log(`MongDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Database connection failed: ${error.message}`);
    process.exit();
  }
};

module.exports = connectDB;
