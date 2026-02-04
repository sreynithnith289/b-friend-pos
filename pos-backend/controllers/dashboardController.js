const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const Dish = require("../models/dishModel");

// HOME PAGE - Stats for logged-in user (shows ALL-TIME stats)
const getUserStats = async (req, res) => {
  try {
    // Get ALL orders
    const allOrders = await Order.find({});

    // Calculate total earnings
    let totalEarningsKHR = 0;
    allOrders.forEach((order) => {
      totalEarningsKHR +=
        order.bills?.totalWithDiscount || order.bills?.total || 0;
    });

    // In progress orders count
    const inProgressOrders = await Order.countDocuments({
      orderStatus: { $in: ["Preparing", "In Progress", "Pending", "Ready"] },
    });

    // Unique customers
    const uniqueCustomers = new Set(
      allOrders
        .map((o) => o.customerDetails?.name || o.customerDetails?.phone)
        .filter(Boolean)
    ).size;

    const totalEarningsUSD = Math.round((totalEarningsKHR / 4100) * 100) / 100;

    res.status(200).json({
      success: true,
      totalEarnings: totalEarningsUSD,
      inProgress: inProgressOrders,
      totalOrders: allOrders.length,
      totalCustomers: uniqueCustomers || allOrders.length,
      earningsChange: 0,
      ordersChange: 0,
      inProgressChange: 0,
      customersChange: 0,
    });
  } catch (error) {
    console.error("User stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DASHBOARD PAGE - Stats for all users
const getAllStats = async (req, res) => {
  try {
    const allOrders = await Order.find({});

    let totalEarningsKHR = 0;
    allOrders.forEach((order) => {
      totalEarningsKHR +=
        order.bills?.totalWithDiscount || order.bills?.total || 0;
    });

    const inProgressOrders = await Order.countDocuments({
      orderStatus: { $in: ["Preparing", "In Progress", "Pending", "Ready"] },
    });

    const uniqueCustomers = new Set(
      allOrders
        .map((o) => o.customerDetails?.name || o.customerDetails?.phone)
        .filter(Boolean)
    ).size;

    const totalEarningsUSD = Math.round((totalEarningsKHR / 4100) * 100) / 100;

    res.status(200).json({
      success: true,
      totalEarnings: totalEarningsUSD,
      inProgress: inProgressOrders,
      totalOrders: allOrders.length,
      totalCustomers: uniqueCustomers || allOrders.length,
      earningsChange: 0,
      ordersChange: 0,
      inProgressChange: 0,
      customersChange: 0,
    });
  } catch (error) {
    console.error("All stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Item stats
const getItemStats = async (req, res) => {
  try {
    const tables = await Table.countDocuments();
    const allOrders = await Order.find({});

    let totalValue = 0;
    allOrders.forEach((order) => {
      totalValue += order.bills?.totalWithDiscount || order.bills?.total || 0;
    });

    const avgOrderValue =
      allOrders.length > 0 ? totalValue / allOrders.length / 4100 : 0;

    res.status(200).json({
      success: true,
      tables,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Weekly stats
const getWeeklyStats = async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: startDate },
    });

    const dailyStats = {};
    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { earnings: 0, orders: 0 };
      }
      dailyStats[dateKey].earnings +=
        order.bills?.totalWithDiscount || order.bills?.total || 0;
      dailyStats[dateKey].orders += 1;
    });

    const data = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        earnings: Math.round((stats.earnings / 4100) * 100) / 100,
        orders: stats.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Monthly stats
const getMonthlyStats = async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: startDate },
    });

    const dailyStats = {};
    let totalEarnings = 0;

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      const amount = order.bills?.totalWithDiscount || order.bills?.total || 0;
      totalEarnings += amount;

      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { earnings: 0, orders: 0 };
      }
      dailyStats[dateKey].earnings += amount;
      dailyStats[dateKey].orders += 1;
    });

    const data = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        earnings: Math.round((stats.earnings / 4100) * 100) / 100,
        orders: stats.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      totalEarnings: Math.round((totalEarnings / 4100) * 100) / 100,
      totalOrders: orders.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Top selling items (old version without images)
const getTopSellingItems = async (req, res) => {
  try {
    const topItems = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: topItems.map((item) => ({
        name: item._id,
        quantity: item.totalQuantity,
        revenue: Math.round((item.totalRevenue / 4100) * 100) / 100,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Top items WITH images (for PopularDishes & TopSellingItems components)
const getTopItems = async (req, res) => {
  try {
    // Get all paid orders
    const orders = await Order.find({ orderStatus: "Paid" });

    // Aggregate items from all orders
    const itemsMap = new Map();

    orders.forEach((order) => {
      // Check both 'items' and 'orderItems' fields
      const orderItems = order.orderItems || order.items || [];

      if (Array.isArray(orderItems)) {
        orderItems.forEach((item) => {
          const name = item.name;
          const quantity = item.quantity || 1;
          const price = item.price || 0;

          if (name) {
            if (itemsMap.has(name)) {
              const existing = itemsMap.get(name);
              existing.quantity += quantity;
              existing.revenue += price * quantity;
            } else {
              itemsMap.set(name, {
                name,
                quantity,
                revenue: price * quantity,
                image: null,
              });
            }
          }
        });
      }
    });

    // Convert to array and sort by quantity
    let topItems = Array.from(itemsMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Fetch dish images for top items
    const dishNames = topItems.map((item) => item.name);
    const dishes = await Dish.find({ name: { $in: dishNames } }).select(
      "name image"
    );

    // Create a map of dish names to images
    const dishImageMap = new Map();
    dishes.forEach((dish) => {
      dishImageMap.set(dish.name, dish.image);
    });

    // Add images to top items
    topItems = topItems.map((item) => ({
      ...item,
      image: dishImageMap.get(item.name) || null,
    }));

    // Convert revenue from KHR to USD
    const EXCHANGE_RATE = 4100;
    topItems = topItems.map((item) => ({
      ...item,
      revenue: Math.round((item.revenue / EXCHANGE_RATE) * 100) / 100,
    }));

    res.status(200).json({
      success: true,
      data: topItems,
    });
  } catch (error) {
    console.error("Error fetching top items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top items",
      error: error.message,
    });
  }
};

module.exports = {
  getUserStats,
  getAllStats,
  getItemStats,
  getWeeklyStats,
  getMonthlyStats,
  getTopSellingItems,
  getTopItems,
};
