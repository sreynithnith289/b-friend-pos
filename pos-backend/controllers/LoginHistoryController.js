const LoginHistory = require("../models/loginHistoryModel");
const createHttpError = require("http-errors");
/* ================= GET ALL LOGIN HISTORY ================= */
const getAllLoginHistory = async (req, res, next) => {
  try {
    const { limit = 50, page = 1, userId, status } = req.query;
    let filter = {};
    if (userId) filter.user = userId;
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const loginHistory = await LoginHistory.find(filter)
      .sort({ loginAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await LoginHistory.countDocuments(filter);
    res.status(200).json({
      success: true,
      data: loginHistory,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get login history error:", error);
    next(createHttpError(500, "Failed to fetch login history"));
  }
};
/* ================= GET LOGIN HISTORY BY USER ================= */
const getLoginHistoryByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    const loginHistory = await LoginHistory.find({ user: userId })
      .sort({ loginAt: -1 })
      .limit(parseInt(limit));

    const stats = await LoginHistory.aggregate([
      { $match: { user: require("mongoose").Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalLogins: { $sum: 1 },
          lastLogin: { $max: "$loginAt" },
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: {
        history: loginHistory,
        stats: stats[0] || { totalLogins: 0, lastLogin: null },
      },
    });
  } catch (error) {
    console.error("Get user login history error:", error);
    next(createHttpError(500, "Failed to fetch user login history"));
  }
};
/* ================= GET LOGIN STATS ================= */
const getLoginStats = async (req, res, next) => {
  try {
    // Today's logins
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogins = await LoginHistory.countDocuments({
      loginAt: { $gte: today },
    });
    // Active sessions
    const activeSessions = await LoginHistory.countDocuments({
      status: "Active",
    });
    // Logins by role
    const loginsByRole = await LoginHistory.aggregate([
      {
        $group: {
          _id: "$userRole",
          count: { $sum: 1 },
        },
      },
    ]);
    // Logins by device
    const loginsByDevice = await LoginHistory.aggregate([
      {
        $group: {
          _id: "$device",
          count: { $sum: 1 },
        },
      },
    ]);
    // Recent logins (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyLogins = await LoginHistory.aggregate([
      { $match: { loginAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$loginAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json({
      success: true,
      data: {
        todayLogins,
        activeSessions,
        loginsByRole,
        loginsByDevice,
        weeklyLogins,
      },
    });
  } catch (error) {
    console.error("Get login stats error:", error);
    next(createHttpError(500, "Failed to fetch login stats"));
  }
};
/* ================= DELETE OLD LOGIN HISTORY ================= */
const deleteOldLoginHistory = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    const result = await LoginHistory.deleteMany({
      loginAt: { $lt: cutoffDate },
    });
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old login records`,
    });
  } catch (error) {
    console.error("Delete old login history error:", error);
    next(createHttpError(500, "Failed to delete old login history"));
  }
};
module.exports = {
  getAllLoginHistory,
  getLoginHistoryByUser,
  getLoginStats,
  deleteOldLoginHistory,
};
