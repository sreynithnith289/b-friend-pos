const express = require("express");
const {
  addOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUser,
  getSalesStats,
} = require("../controllers/orderController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const router = express.Router();
/**
 * @route   GET /api/orders/sales-stats
 * @desc    Get sales statistics by staff
 * @access  Private
 * @note    Must be before /:id route
 */
router.get("/sales-stats", isVerifiedUser, getSalesStats);
/**
 * @route   GET /api/orders/user/:userId
 * @desc    Get orders by specific user/staff
 * @access  Private
 * @note    Must be before /:id route
 */
router.get("/user/:userId", isVerifiedUser, getOrdersByUser);
/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (requires token verification)
 */
router.post("/", isVerifiedUser, addOrder);
/**
 * @route   GET /api/orders
 * @desc    Get all orders
 * @access  Private
 */
router.get("/", isVerifiedUser, getOrders);
/**
 * @route   GET /api/orders/:id
 * @desc    Get order details by ID
 * @access  Private
 */
router.get("/:id", isVerifiedUser, getOrderById);
/**
 * @route   PUT /api/orders/:id
 * @desc    Update order details or payment status
 * @access  Private
 */
router.put("/:id", isVerifiedUser, updateOrder);
/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete an order
 * @access  Private
 */
router.delete("/:id", isVerifiedUser, deleteOrder);
module.exports = router;
