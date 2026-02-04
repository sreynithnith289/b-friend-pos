const express = require("express");
const router = express.Router();
const {
  getUserStats,
  getAllStats,
  getItemStats,
  getWeeklyStats,
  getMonthlyStats,
  getTopSellingItems,
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
// Top selling items
router.get("/top-items", isVerifiedUser, getTopSellingItems);
module.exports = router;
