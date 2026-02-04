import React, { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import { useSelector } from "react-redux";

const EXCHANGE_RATE = 4100;

const MiniCard = () => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    todayEarnings: 0,
    inProgress: 0,
    totalOrders: 0,
    todayOrders: 0,
    totalCustomers: 0,
    earningsChange: 0,
    ordersChange: 0,
  });
  const [loading, setLoading] = useState(true);

  // Get current logged-in user from Redux
  const userState = useSelector((state) => state.user);
  const user =
    userState?.user || userState?.userData || userState?.data || userState;
  const userId = user?._id || user?.id;

  useEffect(() => {
    fetchUserStats();
  }, [userId]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);

      const ordersRes = await fetch("http://localhost:8000/api/orders", {
        credentials: "include",
      });
      const ordersData = await ordersRes.json();
      const allOrders = ordersData?.data || ordersData || [];

      // Filter orders created by this user
      let myOrders = allOrders;
      if (userId) {
        myOrders = allOrders.filter((order) => {
          const creatorId = order.createdBy?._id || order.createdBy;
          return creatorId?.toString() === userId?.toString();
        });
      }

      // Date calculations
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Filter by date
      const todayOrders = myOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= today && orderDate < tomorrow;
      });

      const yesterdayOrders = myOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= yesterday && orderDate < today;
      });

      // Filter paid orders
      const paidOrders = myOrders.filter(
        (order) => order.orderStatus === "Paid" || order.status === "Paid"
      );
      const todayPaidOrders = todayOrders.filter(
        (order) => order.orderStatus === "Paid" || order.status === "Paid"
      );
      const yesterdayPaidOrders = yesterdayOrders.filter(
        (order) => order.orderStatus === "Paid" || order.status === "Paid"
      );

      // In progress orders
      const inProgressOrders = myOrders.filter(
        (order) =>
          order.orderStatus !== "Paid" &&
          order.status !== "Paid" &&
          order.orderStatus !== "Cancelled" &&
          order.status !== "Cancelled"
      );

      // Calculate earnings
      const totalEarningsKHR = paidOrders.reduce(
        (sum, order) =>
          sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
        0
      );
      const todayEarningsKHR = todayPaidOrders.reduce(
        (sum, order) =>
          sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
        0
      );
      const yesterdayEarningsKHR = yesterdayPaidOrders.reduce(
        (sum, order) =>
          sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
        0
      );

      // Calculate changes
      const earningsChange =
        yesterdayEarningsKHR > 0
          ? Math.round(
              ((todayEarningsKHR - yesterdayEarningsKHR) /
                yesterdayEarningsKHR) *
                100
            )
          : todayEarningsKHR > 0
          ? 100
          : 0;

      const ordersChange =
        yesterdayPaidOrders.length > 0
          ? Math.round(
              ((todayPaidOrders.length - yesterdayPaidOrders.length) /
                yesterdayPaidOrders.length) *
                100
            )
          : todayPaidOrders.length > 0
          ? 100
          : 0;

      // Unique customers
      const uniqueCustomers = new Set(
        myOrders.map(
          (order) => order.customerDetails?.name || order.customerDetails?.phone
        )
      ).size;

      setStats({
        totalEarnings: (totalEarningsKHR / EXCHANGE_RATE).toFixed(2),
        todayEarnings: (todayEarningsKHR / EXCHANGE_RATE).toFixed(2),
        inProgress: inProgressOrders.length,
        totalOrders: paidOrders.length,
        todayOrders: todayPaidOrders.length,
        totalCustomers: uniqueCustomers,
        earningsChange,
        ordersChange,
      });
    } catch (error) {
      console.error("MiniCard - Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-3 w-16 bg-stone-200 rounded mb-2"></div>
                <div className="h-6 w-20 bg-stone-200 rounded mb-1"></div>
                <div className="h-3 w-14 bg-stone-100 rounded"></div>
              </div>
              <div className="h-9 w-9 bg-stone-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "My Earnings",
      value: stats.totalEarnings,
      subValue: `Today: $${stats.todayEarnings}`,
      change: stats.earningsChange,
      icon: FiDollarSign,
      iconGradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 via-white to-teal-50",
      shadowColor: "shadow-emerald-500/20",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
      changePositiveColor: "text-emerald-600 bg-emerald-50",
      prefix: "$",
    },
    {
      title: "My Orders",
      value: stats.totalOrders,
      subValue: `Today: ${stats.todayOrders} orders`,
      change: stats.ordersChange,
      icon: FiShoppingBag,
      iconGradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 via-white to-indigo-50",
      shadowColor: "shadow-blue-500/20",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
      changePositiveColor: "text-blue-600 bg-blue-50",
      prefix: "",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      subValue: "Active orders",
      icon: FiClock,
      iconGradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 via-white to-orange-50",
      shadowColor: "shadow-amber-500/20",
      textColor: "text-amber-600",
      borderColor: "border-amber-100",
      changePositiveColor: "text-amber-600 bg-amber-50",
      prefix: "",
      pulse: stats.inProgress > 0,
    },
    {
      title: "My Customers",
      value: stats.totalCustomers,
      subValue: "Unique customers",
      icon: FiUsers,
      iconGradient: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 via-white to-violet-50",
      shadowColor: "shadow-purple-500/20",
      textColor: "text-purple-600",
      borderColor: "border-purple-100",
      changePositiveColor: "text-purple-600 bg-purple-50",
      prefix: "",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = (card.change || 0) >= 0;

        return (
          <div
            key={index}
            className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} rounded-xl p-4 shadow-sm border ${card.borderColor} hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group`}
          >
            {/* Decorative background circles */}
            <div className="absolute -right-6 -top-6 w-20 h-20 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-sm"></div>
            <div className="absolute -right-2 -bottom-8 w-16 h-16 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-sm"></div>

            <div className="relative flex items-center justify-between">
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-slate-500 text-[11px] font-medium mb-0.5">
                  {card.title}
                </p>
                <p
                  className={`text-xl font-bold ${card.textColor} tracking-tight`}
                >
                  {card.prefix}
                  {typeof card.value === "number"
                    ? card.value.toLocaleString()
                    : card.value}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {card.subValue}
                </p>

                {/* Change indicator */}
                {card.change !== undefined && (
                  <div
                    className={`inline-flex items-center gap-0.5 mt-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isPositive
                        ? card.changePositiveColor
                        : "text-red-600 bg-red-50"
                    }`}
                  >
                    {isPositive ? (
                      <FiTrendingUp size={10} />
                    ) : (
                      <FiTrendingDown size={10} />
                    )}
                    <span>
                      {isPositive ? "+" : ""}
                      {card.change}%
                    </span>
                  </div>
                )}
              </div>

              {/* Icon */}
              <div className="relative">
                <div
                  className={`p-2.5 bg-gradient-to-br ${card.iconGradient} rounded-xl shadow-lg ${card.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  <Icon className="text-white" size={18} />
                </div>
                {card.pulse && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MiniCard;
