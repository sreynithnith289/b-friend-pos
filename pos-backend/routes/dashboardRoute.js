const express = require("express");
const router = express.Router();
const {
  getUserStats,
  getAllStats,
  getItemStats,
  getWeeklyStats,
  getMonthlyStats,
  getTopSellingItems,
  getTopItems,
} = require("../controllers/dashboardController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
// HOME PAGE - Stats for logged-in user only
router.get("/user-stats", isVerifiedUser, getUserStats);
// DASHBOARD PAGE - Stats for all users (admin view)
router.get("/all-stats", isVerifiedUser, getAllStats);
// Item stats (dishes, categories, tables count)
router.get("/item-stats", isVerifiedUser, getItemStats);
// Weekly stats for charts
router.get("/weekly", isVerifiedUser, getWeeklyStats);
// Monthly stats for charts
router.get("/monthly", isVerifiedUser, getMonthlyStats);
// Alias for /stats (frontend compatibility)
router.get("/stats", isVerifiedUser, getAllStats);

// Top selling items (without images)
router.get("/top-selling", isVerifiedUser, getTopSellingItems);

// Top items with images
router.get("/top-items", isVerifiedUser, getTopItems);
module.exports = router;
