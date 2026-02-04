const express = require("express");
const router = express.Router();
const {
  getAllLoginHistory,
  getLoginHistoryByUser,
  getLoginStats,
  deleteOldLoginHistory,
} = require("../controllers/LoginHistoryController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
// All routes require authentication
router.get("/", isVerifiedUser, getAllLoginHistory);
router.get("/stats", isVerifiedUser, getLoginStats);
router.get("/user/:userId", isVerifiedUser, getLoginHistoryByUser);
router.delete("/cleanup", isVerifiedUser, deleteOldLoginHistory);
module.exports = router;
