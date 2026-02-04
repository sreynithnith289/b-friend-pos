import React, { useState, useEffect } from "react";
import { GrUpdate } from "react-icons/gr";
import { IoRefresh, IoSearch } from "react-icons/io5";
import { HiClipboardList } from "react-icons/hi";
import {
  FaCheck,
  FaClock,
  FaCreditCard,
  FaMoneyBillWave,
  FaQrcode,
} from "react-icons/fa";
import { MdTableBar } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, updateOrderStatus, getTables } from "../../https/index";
import { formatDateAndTime } from "../../utils";

const EXCHANGE_RATE = 4100;

const DashboardOrders = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: tablesRes, isLoading: tablesLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
  });

  const {
    data: resData,
    isError: ordersError,
    isLoading: ordersLoading,
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
    if (ordersError)
      enqueueSnackbar("Failed to load orders!", { variant: "error" });
  }, [ordersError]);

  const orders = resData || [];

  // Calculate statistics
  const stats = {
    total: orders.length,
    inProgress: orders.filter(
      (o) => o.orderStatus === "In Progress" || o.orderStatus === "Preparing"
    ).length,
    ready: orders.filter((o) => o.orderStatus === "Ready").length,
    paid: orders.filter((o) => o.orderStatus === "Paid").length,
  };

  // Filter orders
  const filteredOrders = orders
    .filter((order) => {
      if (filterStatus === "all") return true;
      if (filterStatus === "inProgress")
        return (
          order.orderStatus === "In Progress" ||
          order.orderStatus === "Preparing"
        );
      return order.orderStatus === filterStatus;
    })
    .filter((order) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        order.customerDetails?.name?.toLowerCase().includes(query) ||
        order._id?.toLowerCase().includes(query)
      );
    });

  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) =>
      updateOrderStatus({ orderId, orderStatus }),
    onSuccess: () => {
      enqueueSnackbar("Order status updated!", { variant: "success" });
      queryClient.invalidateQueries(["orders"]);
    },
    onError: () =>
      enqueueSnackbar("Failed to update order status!", { variant: "error" }),
  });

  const handleStatusChange = (orderId, orderStatus) => {
    orderStatusUpdateMutation.mutate({ orderId, orderStatus });
  };

  const getStatusConfig = (status) => {
    const configs = {
      "In Progress": {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
        icon: <FaClock size={10} />,
      },
      Preparing: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-200",
        icon: <FaClock size={10} />,
      },
      Ready: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-200",
        icon: <FaCheck size={10} />,
      },
      Paid: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-200",
        icon: <FaCreditCard size={10} />,
      },
    };
    return configs[status] || configs["In Progress"];
  };

  const formatUSD = (khr) => ((khr || 0) / EXCHANGE_RATE).toFixed(2);
  const formatKHR = (amount) => (amount || 0).toLocaleString();

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if ((ordersLoading && !orders.length) || tablesLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <IoRefresh className="animate-spin" size={20} />
          <span>Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden gap-3">
      {/* Statistics Cards - Compact */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        <button
          onClick={() => setFilterStatus("all")}
          className={`rounded-xl p-2.5 text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
            filterStatus === "all"
              ? "bg-gradient-to-br from-slate-700 to-slate-900 ring-2 ring-slate-400"
              : "bg-gradient-to-br from-slate-600 to-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.total}</p>
              <p className="text-white/80 text-[10px]">All Orders</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <HiClipboardList size={14} />
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilterStatus("inProgress")}
          className={`rounded-xl p-2.5 text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
            filterStatus === "inProgress"
              ? "bg-gradient-to-br from-blue-600 to-indigo-700 ring-2 ring-blue-300"
              : "bg-gradient-to-br from-blue-500 to-indigo-600"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.inProgress}</p>
              <p className="text-white/80 text-[10px]">In Progress</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaClock size={14} />
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilterStatus("Ready")}
          className={`rounded-xl p-2.5 text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
            filterStatus === "Ready"
              ? "bg-gradient-to-br from-emerald-600 to-green-700 ring-2 ring-emerald-300"
              : "bg-gradient-to-br from-emerald-500 to-green-600"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.ready}</p>
              <p className="text-white/80 text-[10px]">Ready</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaCheck size={14} />
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilterStatus("Paid")}
          className={`rounded-xl p-2.5 text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
            filterStatus === "Paid"
              ? "bg-gradient-to-br from-purple-600 to-violet-700 ring-2 ring-purple-300"
              : "bg-gradient-to-br from-purple-500 to-violet-600"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.paid}</p>
              <p className="text-white/80 text-[10px]">Paid</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaCreditCard size={14} />
            </div>
          </div>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col flex-1 overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <HiClipboardList className="text-amber-600" size={20} />
            </div>
            <div>
              <h2 className="text-slate-800 font-semibold">Order Management</h2>
              <p className="text-slate-400 text-xs">
                {filteredOrders.length}{" "}
                {filterStatus === "all" ? "total" : filterStatus.toLowerCase()}{" "}
                orders
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
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 w-44 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              <IoRefresh
                className={isFetching ? "animate-spin" : ""}
                size={14}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-slate-500 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-medium w-[5%]">No</th>
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date & Time</th>
                <th className="px-4 py-3 font-medium text-center">Items</th>
                <th className="px-4 py-3 font-medium text-center">Table</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium text-center">Payment</th>
                <th className="px-4 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => {
                  const tableNumber = order.table?.tableNo ?? null;
                  const customerName = order.customerDetails?.name ?? "Unknown";
                  const paymentMethod = order.paymentType || "—";
                  const statusConfig = getStatusConfig(order.orderStatus);
                  const total =
                    order.bills?.totalWithDiscount || order.bills?.total || 0;

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

                      {/* Order ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded font-medium">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-[10px] shadow-sm flex-shrink-0">
                            {getInitials(customerName)}
                          </div>
                          <span className="font-medium text-slate-700 text-sm">
                            {customerName}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <select
                          className={`${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-200 cursor-pointer`}
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {formatDateAndTime(order.createdAt)}
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3 text-center">
                        <span className="bg-stone-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-semibold">
                          {order.items?.length ?? 0}
                        </span>
                      </td>

                      {/* Table */}
                      <td className="px-4 py-3 text-center">
                        {tableNumber ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-semibold">
                            <MdTableBar size={12} />
                            T-{tableNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-amber-600">
                            ${formatUSD(total)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            ៛ {formatKHR(total)}
                          </p>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                            paymentMethod === "Cash"
                              ? "bg-emerald-50 text-emerald-600"
                              : paymentMethod === "Online"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-slate-50 text-slate-500"
                          }`}
                        >
                          {paymentMethod === "Cash" && (
                            <FaMoneyBillWave size={10} />
                          )}
                          {paymentMethod === "Online" && <FaQrcode size={10} />}
                          {paymentMethod}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            handleStatusChange(order._id, order.orderStatus)
                          }
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Refresh status"
                        >
                          <GrUpdate size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-16">
                    <HiClipboardList
                      size={48}
                      className="mx-auto text-slate-300 mb-3"
                    />
                    <p className="text-slate-500 font-medium">
                      No orders found
                    </p>
                    <p className="text-slate-400 text-sm">
                      {searchQuery
                        ? "Try a different search term"
                        : "Orders will appear here"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50 flex-shrink-0">
            <span className="text-xs text-slate-500">
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-blue-600">
                  <FaClock size={10} /> {stats.inProgress} active
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <FaCheck size={10} /> {stats.ready} ready
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1 text-purple-600">
                  <FaCreditCard size={10} /> {stats.paid} paid
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOrders;
