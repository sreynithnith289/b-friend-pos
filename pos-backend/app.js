const express = require("express");
const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// Import routes
const userRoutes = require("./routes/userRoute");
const orderRoutes = require("./routes/orderRoute");
const tableRoutes = require("./routes/tableRoute");
const paymentRoutes = require("./routes/paymentRoute");
const dashboardRoutes = require("./routes/dashboardRoute");
const categoryRoutes = require("./routes/categoryRoute");
const dishRoutes = require("./routes/dishRoute");
const customerRoutes = require("./routes/customerRoute");
const app = express();
const PORT = config.port || 5000;
// Connect to MongoDB
connectDB();
// ✅ Fixed CORS settings
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
// Parse JSON bodies & cookies
app.use(express.json());
app.use(cookieParser());
// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Hello from POS server!" });
});
// Routes
app.use("/api/user", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/table", tableRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/dish", dishRoutes);
app.use("/api/customers", customerRoutes);
// Global Error Handler
app.use(globalErrorHandler);
// Start server
app.listen(PORT, () => {
  console.log(`POS server is listening on port ${PORT}`);
});
