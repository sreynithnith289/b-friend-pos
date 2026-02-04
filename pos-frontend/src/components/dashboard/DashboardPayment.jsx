import React, { useState, useEffect } from "react";
import { IoRefresh, IoSearch } from "react-icons/io5";
import { HiCreditCard } from "react-icons/hi";
import {
  FaMoneyBillWave,
  FaQrcode,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { MdPayments, MdTableBar } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https/index";
import { formatDateAndTime } from "../../utils";

const EXCHANGE_RATE = 4100;

const DashboardPayment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterDate, setFilterDate] = useState("all");

  // Fetch orders (payments are tied to orders)
  const {
    data: ordersData,
    isError,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await getOrders();
      return response || [];
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (isError)
      enqueueSnackbar("Failed to load payments!", { variant: "error" });
  }, [isError]);

  // Filter only paid orders
  const paidOrders = (ordersData || []).filter(
    (order) => order.orderStatus === "Paid" || order.status === "Paid"
  );

  // Calculate statistics
  const stats = {
    totalRevenue: paidOrders.reduce(
      (sum, order) =>
        sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
      0
    ),
    totalTransactions: paidOrders.length,
    cashPayments: paidOrders.filter((o) => o.paymentType === "Cash").length,
    onlinePayments: paidOrders.filter((o) => o.paymentType === "Online").length,
    cashRevenue: paidOrders
      .filter((o) => o.paymentType === "Cash")
      .reduce(
        (sum, order) =>
          sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
        0
      ),
    onlineRevenue: paidOrders
      .filter((o) => o.paymentType === "Online")
      .reduce(
        (sum, order) =>
          sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
        0
      ),
  };

  // Filter payments
  const filteredPayments = paidOrders.filter((order) => {
    // Filter by payment method
    if (filterMethod !== "all" && order.paymentType !== filterMethod)
      return false;

    // Filter by date
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

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.customerDetails?.name?.toLowerCase().includes(query) ||
        order._id?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const formatKHR = (amount) => (amount || 0).toLocaleString();
  const formatUSD = (khr) => ((khr || 0) / EXCHANGE_RATE).toFixed(2);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <IoRefresh className="animate-spin" size={20} />
          <span>Loading payments...</span>
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
              <p className="text-xl font-bold">
                ${formatUSD(stats.totalRevenue)}
              </p>
              <p className="text-emerald-100 text-[10px]">Total Revenue</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <MdPayments size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2.5 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.totalTransactions}</p>
              <p className="text-blue-100 text-[10px]">Transactions</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <HiCreditCard size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-2.5 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">
                ${formatUSD(stats.cashRevenue)}
              </p>
              <p className="text-amber-100 text-[10px]">Cash</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaMoneyBillWave size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-2.5 text-white shadow-lg shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">
                ${formatUSD(stats.onlineRevenue)}
              </p>
              <p className="text-purple-100 text-[10px]">Online/QR</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaQrcode size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Table - Scrollable */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col flex-1 overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <MdPayments className="text-emerald-600" size={20} />
            </div>
            <div>
              <h2 className="text-slate-800 font-semibold">Payment History</h2>
              <p className="text-slate-400 text-xs">
                {filteredPayments.length} payments found
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
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 w-40 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Filter by Method */}
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Online">Online/QR</option>
            </select>

            {/* Filter by Date */}
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
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
                <th className="px-4 py-3 font-medium w-[5%]">No</th>
                <th className="px-4 py-3 font-medium">Trans. ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date & Time</th>
                <th className="px-4 py-3 font-medium">Table</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Subtotal</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium text-center">Method</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((order, index) => {
                  const tableNumber = order.table?.tableNo ?? null;
                  const customerName = order.customerDetails?.name ?? "Unknown";
                  const paymentMethod = order.paymentType || "—";
                  const subtotal = order.bills?.total || 0;
                  const discount = order.bills?.discount || 0;
                  const total = order.bills?.totalWithDiscount || subtotal;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      {/* No */}
                      <td className="px-4 py-3">
                        <span className="text-slate-500 font-medium">
                          {index + 1}
                        </span>
                      </td>

                      {/* Transaction ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded font-medium">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                            {customerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <span className="font-medium text-slate-700 text-sm">
                            {customerName}
                          </span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {formatDateAndTime(order.createdAt)}
                      </td>

                      {/* Table */}
                      <td className="px-4 py-3">
                        {tableNumber ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium">
                            <MdTableBar size={12} />
                            T-{tableNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3">
                        <span className="bg-stone-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                          {order.items?.length ?? 0} items
                        </span>
                      </td>

                      {/* Subtotal */}
                      <td className="px-4 py-3 text-slate-600 text-sm">
                        ${formatUSD(subtotal)}
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3">
                        {discount > 0 ? (
                          <span className="text-red-500 text-sm flex items-center gap-1">
                            <FaArrowDown size={10} />${formatUSD(discount)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-emerald-600">
                            ${formatUSD(total)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            ៛ {formatKHR(total)}
                          </p>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                            paymentMethod === "Cash"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {paymentMethod === "Cash" ? (
                            <FaMoneyBillWave size={10} />
                          ) : (
                            <FaQrcode size={10} />
                          )}
                          {paymentMethod}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-xs font-semibold">
                          <FaArrowUp size={10} />
                          Paid
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="text-center py-16">
                    <HiCreditCard
                      size={48}
                      className="mx-auto text-slate-300 mb-3"
                    />
                    <p className="text-slate-500 font-medium">
                      No payments found
                    </p>
                    <p className="text-slate-400 text-sm">
                      Payments will appear here after orders are paid
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        {filteredPayments.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50 flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">
                Showing {filteredPayments.length} of {paidOrders.length}{" "}
                payments
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>
                Total Filtered:
                <span className="ml-1 font-semibold text-emerald-600">
                  $
                  {formatUSD(
                    filteredPayments.reduce(
                      (sum, order) =>
                        sum +
                        (order.bills?.totalWithDiscount ||
                          order.bills?.total ||
                          0),
                      0
                    )
                  )}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPayment;
