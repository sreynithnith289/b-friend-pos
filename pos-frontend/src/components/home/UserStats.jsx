import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  HiCurrencyDollar,
  HiShoppingCart,
  HiClock,
  HiUsers,
} from "react-icons/hi";
import { FiRefreshCw } from "react-icons/fi";
import MiniCard from "./MiniCard";

const UserStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get logged-in user from Redux
  const user = useSelector((state) => state.user);
  const userName = user?.name;

  // Fetch user stats from API
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dashboard/user-stats`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();

      if (data.success) {
        setStats(data);
      } else {
        throw new Error(data.message || "Failed to fetch stats");
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Your Performance</h3>
          <p className="text-sm text-slate-500">
            Today's stats for {userName || "you"}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all text-sm font-medium disabled:opacity-50"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* My Earnings */}
        <MiniCard
          title="My Earnings"
          icon={<HiCurrencyDollar size={22} />}
          value={stats?.totalEarnings || 0}
          prefix="$"
          subValue={`៛ ${Math.round(
            (stats?.totalEarnings || 0) * 4100
          ).toLocaleString()}`}
          change={stats?.earningsChange || 0}
          changeLabel="vs yesterday"
          color="emerald"
          loading={loading}
        />

        {/* My Orders */}
        <MiniCard
          title="My Orders"
          icon={<HiShoppingCart size={22} />}
          value={stats?.totalOrders || 0}
          subValue="orders today"
          change={stats?.ordersChange || 0}
          changeLabel="vs yesterday"
          color="blue"
          loading={loading}
        />

        {/* In Progress */}
        <MiniCard
          title="In Progress"
          icon={<HiClock size={22} />}
          value={stats?.inProgress || 0}
          subValue="orders active"
          change={stats?.inProgressChange || 0}
          changeLabel="vs yesterday"
          color="amber"
          loading={loading}
        />

        {/* My Customers */}
        <MiniCard
          title="My Customers"
          icon={<HiUsers size={22} />}
          value={stats?.totalCustomers || 0}
          subValue="customers today"
          change={stats?.customersChange || 0}
          changeLabel="vs yesterday"
          color="purple"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default UserStats;
