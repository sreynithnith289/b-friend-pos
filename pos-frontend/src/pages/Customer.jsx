import React, { useState, useEffect } from "react";
import { HiMagnifyingGlass, HiUsers } from "react-icons/hi2";
import { IoRefresh } from "react-icons/io5";
import {
  FaPhone,
  FaCalendarAlt,
  FaReceipt,
  FaMoneyBillWave,
} from "react-icons/fa";
import { MdStar, MdNewReleases } from "react-icons/md";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomers } from "../https/index";

const EXCHANGE_RATE = 4100;
const VIP_THRESHOLD = 5;

const Customer = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const queryClient = useQueryClient();

  const {
    data: customersData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await getCustomers();
      if (Array.isArray(response?.data?.data)) return response.data.data;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response)) return response;
      return [];
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    const handleCustomerUpdated = () => {
      queryClient.invalidateQueries(["customers"]);
      refetch();
    };
    window.addEventListener("customerUpdated", handleCustomerUpdated);
    return () =>
      window.removeEventListener("customerUpdated", handleCustomerUpdated);
  }, [queryClient, refetch]);

  const allCustomers = customersData || [];

  const getCustomerStatus = (customer) => {
    if (customer.totalOrders >= VIP_THRESHOLD) {
      return {
        label: "VIP",
        color: "bg-amber-100 text-amber-700",
        icon: "⭐",
        gradient: "from-amber-500 to-orange-600",
      };
    }
    const now = new Date();
    const diffDays = Math.floor(
      (now - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 30) {
      return {
        label: "New",
        color: "bg-emerald-100 text-emerald-700",
        icon: "🆕",
        gradient: "from-emerald-500 to-green-600",
      };
    }
    return {
      label: "Regular",
      color: "bg-blue-100 text-blue-700",
      icon: "👤",
      gradient: "from-blue-500 to-indigo-600",
    };
  };

  const stats = {
    totalCustomers: allCustomers.length,
    vipCustomers: allCustomers.filter((c) => c.totalOrders >= VIP_THRESHOLD)
      .length,
    newCustomers: allCustomers.filter((c) => {
      const diffDays = Math.floor(
        (new Date() - new Date(c.createdAt)) / (1000 * 60 * 60 * 24)
      );
      return diffDays <= 30;
    }).length,
    totalRevenue: allCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
  };

  const filteredCustomers = allCustomers.filter((customer) => {
    const status = getCustomerStatus(customer);
    if (filterStatus === "vip" && status.label !== "VIP") return false;
    if (filterStatus === "new" && status.label !== "New") return false;
    if (filterStatus === "regular" && status.label !== "Regular") return false;
    if (search) {
      const query = search.toLowerCase();
      return (
        customer.name?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const sortedCustomers = [...filteredCustomers].sort(
    (a, b) => (b.totalOrders || 0) - (a.totalOrders || 0)
  );

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-stone-50 to-slate-100 overflow-hidden">
      <div className="flex-shrink-0 px-5 pt-4 pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
              <HiUsers className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Customer Management
              </h1>
              <p className="text-xs text-slate-500">
                {allCustomers.length} customers • VIP at {VIP_THRESHOLD}+ orders
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl transition disabled:opacity-50"
          >
            <IoRefresh size={16} className={isFetching ? "animate-spin" : ""} />
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HiUsers className="text-blue-600" size={16} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">
                  {stats.totalCustomers}
                </p>
                <p className="text-[10px] text-slate-500">Total Customers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 rounded-lg">
                <MdStar className="text-amber-600" size={16} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">
                  {stats.vipCustomers}
                </p>
                <p className="text-[10px] text-slate-500">VIP Customers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <MdNewReleases className="text-emerald-600" size={16} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">
                  {stats.newCustomers}
                </p>
                <p className="text-[10px] text-slate-500">New (30 days)</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaMoneyBillWave className="text-purple-600" size={16} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">
                  ${(stats.totalRevenue / EXCHANGE_RATE).toFixed(0)}
                </p>
                <p className="text-[10px] text-slate-500">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
            />
            <HiMagnifyingGlass
              className="absolute left-3 top-2.5 text-slate-400"
              size={16}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Customers</option>
            <option value="vip">⭐ VIP ({VIP_THRESHOLD}+ orders)</option>
            <option value="new">🆕 New (30 days)</option>
            <option value="regular">👤 Regular</option>
          </select>
        </div>
      </div>

      <div className="px-5 pb-4 flex-1 min-h-0">
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col h-full overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <IoRefresh className="animate-spin text-slate-400" size={24} />
              <span className="ml-2 text-slate-500">Loading customers...</span>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto min-h-0">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 border-b border-stone-100 sticky top-0 z-10">
                    <tr className="text-slate-500 text-xs uppercase">
                      <th className="py-2.5 px-4 font-semibold">Rank</th>
                      <th className="py-2.5 px-4 font-semibold">Customer</th>
                      <th className="py-2.5 px-4 font-semibold">Contact</th>
                      <th className="py-2.5 px-4 font-semibold text-center">
                        Orders
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-right">
                        Total Spent
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-center">
                        Status
                      </th>
                      <th className="py-2.5 px-4 font-semibold">
                        Member Since
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {sortedCustomers.length > 0 ? (
                      sortedCustomers.map((customer, index) => {
                        const status = getCustomerStatus(customer);
                        const isTopCustomer =
                          index < 3 && filterStatus === "all";
                        return (
                          <tr
                            key={customer._id}
                            className="hover:bg-stone-50 transition-colors"
                          >
                            <td className="py-2.5 px-4">
                              {isTopCustomer ? (
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                                    index === 0
                                      ? "bg-amber-500"
                                      : index === 1
                                      ? "bg-slate-400"
                                      : "bg-amber-700"
                                  }`}
                                >
                                  {index + 1}
                                </span>
                              ) : (
                                <span className="text-slate-500 font-medium pl-2">
                                  {index + 1}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm bg-gradient-to-br ${status.gradient}`}
                                >
                                  {customer.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2) || "??"}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                                    {customer.name}
                                    {status.label === "VIP" && (
                                      <MdStar
                                        className="text-amber-500"
                                        size={12}
                                      />
                                    )}
                                  </p>
                                  {customer.totalOrders > 0 && (
                                    <p className="text-[10px] text-slate-400">
                                      Avg: $
                                      {(
                                        (customer.totalSpent || 0) /
                                        customer.totalOrders /
                                        EXCHANGE_RATE
                                      ).toFixed(2)}
                                      /order
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-4">
                              {customer.phone ? (
                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                  <FaPhone
                                    size={10}
                                    className="text-slate-400"
                                  />
                                  {customer.phone}
                                </div>
                              ) : (
                                <span className="text-slate-300 text-sm">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <div className="flex flex-col items-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                                    (customer.totalOrders || 0) >= VIP_THRESHOLD
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  <FaReceipt size={9} />
                                  {customer.totalOrders || 0}
                                </span>
                                {(customer.totalOrders || 0) <
                                  VIP_THRESHOLD && (
                                  <span className="text-[9px] text-slate-400 mt-0.5">
                                    {VIP_THRESHOLD -
                                      (customer.totalOrders || 0)}{" "}
                                    to VIP
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <p className="font-bold text-emerald-600 text-sm">
                                $
                                {(
                                  (customer.totalSpent || 0) / EXCHANGE_RATE
                                ).toFixed(2)}
                              </p>
                              <p className="text-[9px] text-slate-400">
                                ៛ {(customer.totalSpent || 0).toLocaleString()}
                              </p>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${status.color}`}
                              >
                                {status.icon} {status.label}
                              </span>
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <FaCalendarAlt
                                  size={10}
                                  className="text-slate-400"
                                />
                                {formatDate(customer.createdAt)}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-16">
                          <HiUsers
                            size={48}
                            className="mx-auto text-slate-300 mb-3"
                          />
                          <p className="text-slate-500 font-medium">
                            No customers found
                          </p>
                          <p className="text-slate-400 text-sm">
                            {search || filterStatus !== "all"
                              ? "Try different search or filter"
                              : "Add customers to see them here"}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {sortedCustomers.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-stone-100 bg-stone-50 flex-shrink-0">
                  <span className="text-xs text-slate-500">
                    Showing {sortedCustomers.length} of {allCustomers.length}{" "}
                    customers
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      {stats.vipCustomers} VIP
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {stats.newCustomers} New
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customer;
