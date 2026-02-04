import React, { useState } from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiCalendar,
  FiFilter,
} from "react-icons/fi";
import {
  HiCurrencyDollar,
  HiShoppingCart,
  HiUsers,
  HiClock,
  HiCheck,
  HiCreditCard,
  HiChartBar,
} from "react-icons/hi";
import { MdTableBar, MdCategory, MdRestaurantMenu } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { useQuery } from "@tanstack/react-query";
import {
  getOrders,
  getTables,
  getCategories,
  getDishes,
} from "../../https/index";

const EXCHANGE_RATE = 4100;

const Metrics = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterDate, setFilterDate] = useState("all");

  // Fetch Orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  // Fetch Tables
  const {
    data: tablesRes,
    isLoading: tablesLoading,
    refetch: refetchTables,
  } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
  });

  // Fetch Categories
  const {
    data: categoriesRes,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Fetch Dishes
  const {
    data: dishesRes,
    isLoading: dishesLoading,
    refetch: refetchDishes,
  } = useQuery({
    queryKey: ["dishes"],
    queryFn: getDishes,
  });

  const isLoading =
    ordersLoading || tablesLoading || categoriesLoading || dishesLoading;

  // Extract data
  const orders = ordersData || [];
  const tables = tablesRes?.data?.data || tablesRes?.data || tablesRes || [];
  const categories =
    categoriesRes?.data?.data || categoriesRes?.data || categoriesRes || [];
  const dishes = dishesRes?.data?.data || dishesRes?.data || dishesRes || [];

  // Filter orders based on selected filters
  const filteredOrders = orders.filter((order) => {
    if (filterMethod !== "all" && order.paymentType !== filterMethod)
      return false;

    if (filterDate !== "all") {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filterDate === "today") {
        const orderDay = new Date(orderDate);
        orderDay.setHours(0, 0, 0, 0);
        if (orderDay.getTime() !== today.getTime()) return false;
      } else if (filterDate === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (orderDate < weekAgo) return false;
      } else if (filterDate === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (orderDate < monthAgo) return false;
      }
    }
    return true;
  });

  // Calculate statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayOrders = filteredOrders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });

  const yesterdayOrders = filteredOrders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === yesterday.getTime();
  });

  const todayRevenue = todayOrders.reduce(
    (sum, order) =>
      sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
    0
  );
  const yesterdayRevenue = yesterdayOrders.reduce(
    (sum, order) =>
      sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
    0
  );

  const totalRevenue = filteredOrders.reduce(
    (sum, order) =>
      sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
    0
  );

  const paidOrders = filteredOrders.filter((o) => o.orderStatus === "Paid");
  const paidRevenue = paidOrders.reduce(
    (sum, order) =>
      sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
    0
  );

  const calculateChange = (today, yesterday) => {
    if (yesterday === 0) return today > 0 ? 100 : 0;
    return Math.round(((today - yesterday) / yesterday) * 100);
  };

  const revenueChange = calculateChange(todayRevenue, yesterdayRevenue);
  const ordersChange = calculateChange(
    todayOrders.length,
    yesterdayOrders.length
  );

  const uniqueCustomers = new Set(
    filteredOrders
      .map((o) => o.customerDetails?.name || o.customerDetails?.phone)
      .filter(Boolean)
  ).size;

  const inProgressOrders = filteredOrders.filter(
    (o) => o.orderStatus === "In Progress" || o.orderStatus === "Preparing"
  ).length;
  const readyOrders = filteredOrders.filter(
    (o) => o.orderStatus === "Ready"
  ).length;
  const paidOrdersCount = paidOrders.length;

  const tablesArray = Array.isArray(tables) ? tables : [];
  const availableTables = tablesArray.filter(
    (t) => t.status?.toLowerCase() === "available"
  ).length;
  const occupiedTables = tablesArray.filter(
    (t) =>
      t.status?.toLowerCase() === "in progress" ||
      t.status?.toLowerCase() === "booked"
  ).length;

  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchOrders(),
      refetchTables(),
      refetchCategories(),
      refetchDishes(),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const formatUSD = (khr) => ((khr || 0) / EXCHANGE_RATE).toFixed(2);
  const formatKHR = (amount) => Math.round(amount || 0).toLocaleString();

  const tablesCount = Array.isArray(tables) ? tables.length : 0;
  const categoriesCount = Array.isArray(categories) ? categories.length : 0;
  const dishesCount = Array.isArray(dishes) ? dishes.length : 0;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-stone-200 rounded-lg animate-pulse"></div>
            <div className="h-4 w-64 bg-stone-100 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-stone-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-28 bg-stone-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 border border-stone-100 animate-pulse"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 bg-stone-200 rounded-lg"></div>
                <div className="h-6 w-16 bg-stone-100 rounded-full"></div>
              </div>
              <div className="h-4 w-20 bg-stone-100 rounded mb-2"></div>
              <div className="h-8 w-28 bg-stone-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Order Status Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-stone-200 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/25">
            <HiChartBar className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">
              Dashboard Overview
            </h2>
            <p className="text-xs text-slate-500">
              Real-time restaurant metrics
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by Method */}
          <div className="relative">
            <FiFilter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 appearance-none cursor-pointer min-w-[120px]"
            >
              <option value="all">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Online">Online/QR</option>
            </select>
          </div>

          {/* Filter by Date */}
          <div className="relative">
            <FiCalendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 appearance-none cursor-pointer min-w-[120px]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/20 hover:shadow-lg transition-all text-xs font-semibold disabled:opacity-70"
          >
            <FiRefreshCw
              size={14}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <div className="group bg-white rounded-xl p-5 border border-stone-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md shadow-emerald-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <HiCurrencyDollar className="text-white" size={18} />
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                revenueChange >= 0
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {revenueChange >= 0 ? (
                <FiTrendingUp size={10} />
              ) : (
                <FiTrendingDown size={10} />
              )}
              {Math.abs(revenueChange)}%
            </div>
          </div>
          <p className="text-slate-500 text-xs font-medium">Today's Revenue</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            ${formatUSD(todayRevenue)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            ៛ {formatKHR(todayRevenue)}
          </p>
        </div>

        {/* Total Revenue */}
        <div className="group bg-white rounded-xl p-5 border border-stone-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <HiCreditCard className="text-white" size={18} />
            </div>
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
              {filterDate === "all"
                ? "All Time"
                : filterDate === "today"
                ? "Today"
                : filterDate === "week"
                ? "Week"
                : "Month"}
            </span>
          </div>
          <p className="text-slate-500 text-xs font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            ${formatUSD(totalRevenue)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            ៛ {formatKHR(totalRevenue)}
          </p>
        </div>

        {/* Today's Orders */}
        <div className="group bg-white rounded-xl p-5 border border-stone-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-md shadow-purple-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <HiShoppingCart className="text-white" size={18} />
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                ordersChange >= 0
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {ordersChange >= 0 ? (
                <FiTrendingUp size={10} />
              ) : (
                <FiTrendingDown size={10} />
              )}
              {Math.abs(ordersChange)}%
            </div>
          </div>
          <p className="text-slate-500 text-xs font-medium">Today's Orders</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {todayOrders.length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            vs {yesterdayOrders.length} yesterday
          </p>
        </div>

        {/* Total Customers */}
        <div className="group bg-white rounded-xl p-5 border border-stone-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <HiUsers className="text-white" size={18} />
            </div>
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">
              Unique
            </span>
          </div>
          <p className="text-slate-500 text-xs font-medium">Total Customers</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {uniqueCustomers}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {orders.length} total orders
          </p>
        </div>
      </div>

      {/* Order Status Cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold text-slate-800 text-sm">Order Status</h3>
          <span className="text-xs text-slate-400">• Live tracking</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* In Progress */}
          <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="absolute -right-2 -bottom-6 w-16 h-16 bg-white/5 rounded-full"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <HiClock size={14} />
                </div>
                <span className="text-white/90 text-xs font-medium">
                  In Progress
                </span>
              </div>
              <p className="text-3xl font-bold">{inProgressOrders}</p>
              <p className="text-white/60 text-[10px] mt-1">being prepared</p>
            </div>
          </div>

          {/* Ready */}
          <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="absolute -right-2 -bottom-6 w-16 h-16 bg-white/5 rounded-full"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <HiCheck size={14} />
                </div>
                <span className="text-white/90 text-xs font-medium">Ready</span>
              </div>
              <p className="text-3xl font-bold">{readyOrders}</p>
              <p className="text-white/60 text-[10px] mt-1">to serve</p>
            </div>
          </div>

          {/* Paid */}
          <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="absolute -right-2 -bottom-6 w-16 h-16 bg-white/5 rounded-full"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <HiCreditCard size={14} />
                </div>
                <span className="text-white/90 text-xs font-medium">Paid</span>
              </div>
              <p className="text-3xl font-bold">{paidOrdersCount}</p>
              <p className="text-white/60 text-[10px] mt-1">
                ${formatUSD(paidRevenue)} earned
              </p>
            </div>
          </div>

          {/* Avg Order */}
          <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="absolute -right-2 -bottom-6 w-16 h-16 bg-white/5 rounded-full"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <HiCurrencyDollar size={14} />
                </div>
                <span className="text-white/90 text-xs font-medium">
                  Avg Order
                </span>
              </div>
              <p className="text-3xl font-bold">${formatUSD(avgOrderValue)}</p>
              <p className="text-white/60 text-[10px] mt-1">per order</p>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Overview */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold text-slate-800 text-sm">
            Restaurant Overview
          </h3>
          <span className="text-xs text-slate-400">• Inventory stats</span>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Tables */}
          <div className="group bg-white rounded-xl p-4 border border-stone-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <MdTableBar className="text-emerald-600" size={20} />
            </div>
            <p className="text-xl font-bold text-slate-800">{tablesCount}</p>
            <p className="text-[10px] text-slate-500 font-medium">Tables</p>
          </div>

          {/* Available */}
          <div className="group bg-white rounded-xl p-4 border border-stone-100 hover:border-green-200 hover:shadow-md transition-all duration-300 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <HiCheck className="text-green-600" size={20} />
            </div>
            <p className="text-xl font-bold text-slate-800">
              {availableTables}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Available</p>
          </div>

          {/* Occupied */}
          <div className="group bg-white rounded-xl p-4 border border-stone-100 hover:border-amber-200 hover:shadow-md transition-all duration-300 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <HiClock className="text-amber-600" size={20} />
            </div>
            <p className="text-xl font-bold text-slate-800">{occupiedTables}</p>
            <p className="text-[10px] text-slate-500 font-medium">Occupied</p>
          </div>

          {/* Categories */}
          <div className="group bg-white rounded-xl p-4 border border-stone-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <MdCategory className="text-blue-600" size={20} />
            </div>
            <p className="text-xl font-bold text-slate-800">
              {categoriesCount}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Categories</p>
          </div>

          {/* Menu Items */}
          <div className="group bg-white rounded-xl p-4 border border-stone-100 hover:border-purple-200 hover:shadow-md transition-all duration-300 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <BiSolidDish className="text-purple-600" size={20} />
            </div>
            <p className="text-xl font-bold text-slate-800">{dishesCount}</p>
            <p className="text-[10px] text-slate-500 font-medium">Dishes</p>
          </div>

          {/* Orders */}
          <div className="group bg-white rounded-xl p-4 border border-stone-100 hover:border-rose-200 hover:shadow-md transition-all duration-300 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <MdRestaurantMenu className="text-rose-600" size={20} />
            </div>
            <p className="text-xl font-bold text-slate-800">
              {filteredOrders.length}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Orders</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
