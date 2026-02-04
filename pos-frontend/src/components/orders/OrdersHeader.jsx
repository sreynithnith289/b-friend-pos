import React from "react";
import { IoRefresh, IoSearch } from "react-icons/io5";
import { HiClipboardList } from "react-icons/hi";

const OrdersHeader = ({
  searchQuery,
  setSearchQuery,
  status,
  setStatus,
  statusCounts,
  refetch,
  isFetching,
}) => {
  const statusOptions = [
    { id: "all", label: "All Orders" },
    { id: "In Progress", label: "In Progress" },
    { id: "Ready", label: "Ready" },
    { id: "Paid", label: "Paid" },
  ];

  return (
    <div className="bg-white border-b border-stone-200 px-6 py-4 shadow-sm flex-shrink-0">
      {/* Top Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 rounded-xl">
            <HiClipboardList className="text-amber-600" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Orders Management
            </h1>
            <p className="text-slate-500 text-sm">
              Click on a row to view details
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <IoSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 bg-stone-50 border border-stone-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            <IoRefresh className={isFetching ? "animate-spin" : ""} size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 mt-4">
        {statusOptions.map((item) => (
          <button
            key={item.id}
            onClick={() => setStatus(item.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              status === item.id
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                : "bg-stone-100 text-slate-600 hover:bg-stone-200"
            }`}
          >
            {item.label}
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs ${
                status === item.id ? "bg-white/20" : "bg-slate-200"
              }`}
            >
              {statusCounts[item.id]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrdersHeader;
