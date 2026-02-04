import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { HiSparkles } from "react-icons/hi2";
import {
  FiRefreshCw,
  FiCalendar,
  FiTarget,
  FiGrid,
  FiDollarSign,
} from "react-icons/fi";
import MiniCard from "../components/home/MiniCard";
import TopSellingItems from "../components/home/TopSellingItems";
import PopularDishes from "../components/home/PopularDishes";

const Home = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [quickStats, setQuickStats] = useState({
    activeTables: 0,
    avgOrder: 0,
    todayGoal: 500,
  });

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 18
      ? "Good Afternoon"
      : "Good Evening";

  const user = useSelector((state) => state.user);

  // Get current date formatted
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Fetch quick stats
  useEffect(() => {
    fetchQuickStats();
  }, [refreshKey]);

  const fetchQuickStats = async () => {
    try {
      // Fetch tables
      const tablesRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/table`,
        {
          credentials: "include",
        }
      );
      const tablesData = await tablesRes.json();
      const tables = tablesData?.data || tablesData || [];
      const activeTables = Array.isArray(tables)
        ? tables.filter(
            (t) =>
              t.status?.toLowerCase() === "in progress" ||
              t.status?.toLowerCase() === "booked"
          ).length
        : 0;

      // Fetch orders for avg
      const ordersRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          credentials: "include",
        }
      );
      const ordersData = await ordersRes.json();
      const orders = Array.isArray(ordersData)
        ? ordersData
        : ordersData?.data || [];

      let totalValue = 0;
      orders.forEach((order) => {
        totalValue += order.bills?.totalWithDiscount || order.bills?.total || 0;
      });
      const avgOrder =
        orders.length > 0 ? totalValue / orders.length / 4100 : 0;

      setQuickStats({
        activeTables,
        avgOrder: avgOrder.toFixed(2),
        todayGoal: 500,
      });
    } catch (error) {
      console.error("Error fetching quick stats:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 overflow-hidden gap-5 p-5">
      {/* Left Panel - Main Content */}
      <div className="flex-[3] flex flex-col gap-4 overflow-auto pr-2">
        {/* Welcome Header - Compact Design */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 text-white relative overflow-hidden shadow-lg shadow-amber-500/20 flex-shrink-0">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full" />
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            {/* Top Row - Greeting, Date & Refresh */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-100 text-xs font-medium">
                      {greeting}
                    </span>
                    <HiSparkles className="text-amber-200" size={14} />
                  </div>
                  <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
                    Welcome{user?.name ? `, ${user.name}` : ""}! 👋
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                  <FiCalendar size={12} />
                  {formattedDate}
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 text-xs font-semibold disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  <FiRefreshCw
                    size={14}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  {refreshing ? "..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* Bottom Row - Quick Stats */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20">
              {/* Today's Goal */}
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FiTarget size={16} />
                </div>
                <div>
                  <p className="text-amber-100 text-[10px] font-medium uppercase tracking-wider">
                    Goal
                  </p>
                  <p className="text-lg font-bold">${quickStats.todayGoal}</p>
                </div>
              </div>

              {/* Active Tables */}
              <div className="flex items-center gap-2 justify-center border-x border-white/20 px-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FiGrid size={16} />
                </div>
                <div>
                  <p className="text-amber-100 text-[10px] font-medium uppercase tracking-wider">
                    Active
                  </p>
                  <p className="text-lg font-bold">{quickStats.activeTables}</p>
                </div>
              </div>

              {/* Avg. Order */}
              <div className="flex items-center gap-2 justify-end">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FiDollarSign size={16} />
                </div>
                <div>
                  <p className="text-amber-100 text-[10px] font-medium uppercase tracking-wider">
                    Avg
                  </p>
                  <p className="text-lg font-bold">${quickStats.avgOrder}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MiniCard Component - Stats Cards */}
        <MiniCard key={refreshKey} />

        {/* Top Selling Items */}
        <TopSellingItems key={`top-${refreshKey}`} />
      </div>

      {/* Right Panel */}
      <div className="flex-[1.2] flex flex-col min-h-0 overflow-hidden">
        <PopularDishes />
      </div>
    </div>
  );
};

export default Home;
