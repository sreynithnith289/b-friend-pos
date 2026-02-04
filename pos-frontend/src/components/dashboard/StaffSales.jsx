import React, { useState, useEffect } from "react";
import {
  IoRefresh,
  IoSearch,
  IoTrendingUp,
  IoTrendingDown,
} from "react-icons/io5";
import { HiUsers, HiUserCircle } from "react-icons/hi2";
import {
  FaUserTie,
  FaUserCog,
  FaUserShield,
  FaUtensils,
  FaConciergeBell,
  FaCalendarAlt,
  FaReceipt,
  FaChartLine,
  FaTrophy,
  FaMedal,
} from "react-icons/fa";
import { MdAdminPanelSettings, MdPayments, MdTableBar } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getAllUsers, getOrders } from "../../https/index";

const EXCHANGE_RATE = 4100;

const StaffSales = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterDate, setFilterDate] = useState("today");

  // Fetch all users/staff
  const {
    data: staffData,
    isError: staffError,
    isLoading: staffLoading,
    refetch: refetchStaff,
  } = useQuery({
    queryKey: ["staff-sales"],
    queryFn: async () => {
      const response = await getAllUsers();
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.data?.data)) return response.data.data;
      if (Array.isArray(response)) return response;
      return [];
    },
    refetchInterval: 30000,
  });

  // Fetch all orders
  const {
    data: ordersData,
    isError: ordersError,
    isLoading: ordersLoading,
    refetch: refetchOrders,
    isFetching,
  } = useQuery({
    queryKey: ["orders-sales"],
    queryFn: async () => {
      const response = await getOrders();
      return response || [];
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (staffError)
      enqueueSnackbar("Failed to load staff data!", { variant: "error" });
    if (ordersError)
      enqueueSnackbar("Failed to load orders data!", { variant: "error" });
  }, [staffError, ordersError]);

  const handleRefresh = () => {
    refetchStaff();
    refetchOrders();
  };

  // Date filter helper
  const filterByDate = (date) => {
    const orderDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    switch (filterDate) {
      case "today":
        const orderDay = new Date(orderDate);
        orderDay.setHours(0, 0, 0, 0);
        return orderDay.getTime() === today.getTime();
      case "yesterday":
        const orderYesterday = new Date(orderDate);
        orderYesterday.setHours(0, 0, 0, 0);
        return orderYesterday.getTime() === yesterday.getTime();
      case "week":
        return orderDate >= weekStart && orderDate <= new Date();
      case "month":
        return orderDate >= monthStart && orderDate <= new Date();
      case "lastMonth":
        return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
      case "all":
        return true;
      default:
        return true;
    }
  };

  // Get paid orders only
  const paidOrders = (ordersData || []).filter(
    (order) =>
      (order.orderStatus === "Paid" || order.status === "Paid") &&
      filterByDate(order.createdAt)
  );

  // Calculate sales per staff member
  const allStaff = staffData || [];

  const staffSalesData = allStaff.map((staff) => {
    // Filter orders created by this staff member using createdBy field
    const staffOrders = paidOrders.filter((order) => {
      // Check createdBy object (populated) or string ID
      const orderCreatorId = order.createdBy?._id || order.createdBy;
      return orderCreatorId?.toString() === staff._id?.toString();
    });

    const totalSales = staffOrders.reduce(
      (sum, order) =>
        sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
      0
    );

    const totalOrders = staffOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      ...staff,
      totalSales,
      totalOrders,
      avgOrderValue,
      orders: staffOrders,
    };
  });

  // Sort by total sales (highest first)
  const sortedStaffSales = [...staffSalesData].sort(
    (a, b) => b.totalSales - a.totalSales
  );

  // Calculate overall statistics
  const totalRevenue = paidOrders.reduce(
    (sum, order) =>
      sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
    0
  );
  const totalTransactions = paidOrders.length;
  const avgTransaction =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const topPerformer = sortedStaffSales.length > 0 ? sortedStaffSales[0] : null;

  // Filter staff
  const filteredStaff = sortedStaffSales.filter((staff) => {
    if (filterRole !== "all" && staff.role !== filterRole) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        staff.name?.toLowerCase().includes(query) ||
        staff.email?.toLowerCase().includes(query) ||
        staff.role?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Role icon helper
  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin":
        return <MdAdminPanelSettings size={12} />;
      case "Manager":
        return <FaUserTie size={12} />;
      case "Cashier":
        return <FaUserCog size={12} />;
      case "Waiter":
        return <FaConciergeBell size={12} />;
      case "Kitchen":
        return <FaUtensils size={12} />;
      default:
        return <HiUserCircle size={12} />;
    }
  };

  // Role color helper
  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-red-50 text-red-600";
      case "Manager":
        return "bg-purple-50 text-purple-600";
      case "Cashier":
        return "bg-blue-50 text-blue-600";
      case "Waiter":
        return "bg-amber-50 text-amber-600";
      case "Kitchen":
        return "bg-emerald-50 text-emerald-600";
      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  // Rank badge helper
  const getRankBadge = (index) => {
    if (index === 0) return <FaTrophy className="text-yellow-500" size={16} />;
    if (index === 1) return <FaMedal className="text-slate-400" size={16} />;
    if (index === 2) return <FaMedal className="text-amber-600" size={16} />;
    return (
      <span className="text-slate-400 font-medium text-sm">#{index + 1}</span>
    );
  };

  const formatKHR = (amount) => (amount || 0).toLocaleString();
  const formatUSD = (khr) => ((khr || 0) / EXCHANGE_RATE).toFixed(2);

  const getDateLabel = () => {
    switch (filterDate) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "lastMonth":
        return "Last Month";
      case "all":
        return "All Time";
      default:
        return "Today";
    }
  };

  if (staffLoading || ordersLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <IoRefresh className="animate-spin" size={20} />
          <span>Loading sales data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Statistics Cards - Compact */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0 pb-3">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-2.5 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">${formatUSD(totalRevenue)}</p>
              <p className="text-emerald-100 text-[10px]">Revenue</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <MdPayments size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2.5 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{totalTransactions}</p>
              <p className="text-blue-100 text-[10px]">Orders</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaReceipt size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-2.5 text-white shadow-lg shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">${formatUSD(avgTransaction)}</p>
              <p className="text-purple-100 text-[10px]">Avg Order</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaChartLine size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-2.5 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold truncate">
                {topPerformer?.name || "—"}
              </p>
              <p className="text-amber-100 text-[10px]">Top Seller</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaTrophy size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Sales Table - Scrollable */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col flex-1 overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <FaChartLine className="text-emerald-600" size={20} />
            </div>
            <div>
              <h2 className="text-slate-800 font-semibold">
                Staff Sales Performance
              </h2>
              <p className="text-slate-400 text-xs">
                {filteredStaff.length} staff members • {getDateLabel()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <IoSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 w-36 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Filter by Date */}
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-emerald-400"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="all">All Time</option>
            </select>

            {/* Filter by Role */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Cashier">Cashier</option>
              <option value="Waiter">Waiter</option>
              <option value="Kitchen">Kitchen</option>
            </select>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <IoRefresh
                className={isFetching ? "animate-spin" : ""}
                size={14}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Table - Scrollable rows */}
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-slate-500 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-medium w-[5%]">Rank</th>
                <th className="px-4 py-3 font-medium">Staff Member</th>
                <th className="px-4 py-3 font-medium text-center">Role</th>
                <th className="px-4 py-3 font-medium text-center">Orders</th>
                <th className="px-4 py-3 font-medium text-right">
                  Total Sales
                </th>
                <th className="px-4 py-3 font-medium text-right">Avg Order</th>
                <th className="px-4 py-3 font-medium text-center">
                  Performance
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff, index) => {
                  // Calculate performance percentage (relative to top performer)
                  const maxSales = sortedStaffSales[0]?.totalSales || 1;
                  const performancePercent =
                    maxSales > 0 ? (staff.totalSales / maxSales) * 100 : 0;

                  return (
                    <tr
                      key={staff._id}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      {/* Rank */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center w-8 h-8">
                          {getRankBadge(index)}
                        </div>
                      </td>

                      {/* Staff Member */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm ${
                              index === 0
                                ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                                : index === 1
                                ? "bg-gradient-to-br from-slate-300 to-slate-400"
                                : index === 2
                                ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                : "bg-gradient-to-br from-blue-500 to-indigo-600"
                            }`}
                          >
                            {staff.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) || "??"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {staff.name || "Unknown"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {staff.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${getRoleColor(
                            staff.role
                          )}`}
                        >
                          {getRoleIcon(staff.role)}
                          {staff.role || "—"}
                        </span>
                      </td>

                      {/* Orders */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          <FaReceipt size={10} />
                          {staff.totalOrders}
                        </span>
                      </td>

                      {/* Total Sales */}
                      <td className="px-4 py-3 text-right">
                        <div>
                          <p className="font-bold text-emerald-600">
                            ${formatUSD(staff.totalSales)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            ៛ {formatKHR(staff.totalSales)}
                          </p>
                        </div>
                      </td>

                      {/* Avg Order */}
                      <td className="px-4 py-3 text-right">
                        <p className="font-medium text-slate-700">
                          ${formatUSD(staff.avgOrderValue)}
                        </p>
                      </td>

                      {/* Performance Bar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                performancePercent >= 80
                                  ? "bg-emerald-500"
                                  : performancePercent >= 50
                                  ? "bg-amber-500"
                                  : performancePercent >= 20
                                  ? "bg-orange-500"
                                  : "bg-slate-300"
                              }`}
                              style={{
                                width: `${Math.max(performancePercent, 5)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-500 w-10 text-right">
                            {performancePercent.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <FaChartLine
                      size={48}
                      className="mx-auto text-slate-300 mb-3"
                    />
                    <p className="text-slate-500 font-medium">
                      No sales data found
                    </p>
                    <p className="text-slate-400 text-sm">
                      Sales will appear here when orders are completed
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        {filteredStaff.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50 flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">
                Showing {filteredStaff.length} of {allStaff.length} staff
                members
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-500">
                Total Orders:
                <span className="ml-1 font-semibold text-blue-600">
                  {totalTransactions}
                </span>
              </span>

              <span className="text-slate-500">
                Total Revenue ({getDateLabel()}):
                <span className="ml-1 font-semibold text-emerald-600">
                  ${formatUSD(totalRevenue)}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffSales;
