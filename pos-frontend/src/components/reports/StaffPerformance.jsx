import React from "react";
import { FaTrophy, FaMedal } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";

const EXCHANGE_RATE = 4100;

const StaffPerformance = ({ staff }) => {
  const formatUSD = (khr) => ((khr || 0) / EXCHANGE_RATE).toFixed(2);

  // Only show Top 5 staff
  const top5Staff = (staff || []).slice(0, 5);
  const maxSales = Math.max(...top5Staff.map((s) => s.totalSales || 0), 1);

  const getRankIcon = (index) => {
    if (index === 0) return <FaTrophy className="text-yellow-500" size={12} />;
    if (index === 1) return <FaMedal className="text-slate-400" size={12} />;
    if (index === 2) return <FaMedal className="text-amber-600" size={12} />;
    return null;
  };

  const getAvatarGradient = (index) => {
    const gradients = [
      "from-yellow-400 to-amber-500",
      "from-slate-400 to-slate-500",
      "from-amber-500 to-orange-500",
      "from-blue-500 to-indigo-500",
      "from-emerald-500 to-teal-500",
    ];
    return gradients[index] || gradients[3];
  };

  const getRoleBadge = (role) => {
    const roles = {
      Admin: { bg: "bg-red-100 text-red-600" },
      Cashier: { bg: "bg-blue-100 text-blue-600" },
      Waiter: { bg: "bg-amber-100 text-amber-600" },
    };
    return roles[role] || { bg: "bg-slate-100 text-slate-600" };
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <HiUsers className="text-blue-600" size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                Staff Performance
              </h3>
              <p className="text-xs text-slate-500">Top 5 performers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff List - Fixed 5 items */}
      <div className="flex-1 p-4 space-y-2">
        {top5Staff.length > 0 ? (
          top5Staff.map((member, index) => {
            const percentage =
              maxSales > 0 ? ((member.totalSales || 0) / maxSales) * 100 : 0;
            const roleBadge = getRoleBadge(member.role);
            const hasOrders = (member.totalOrders || 0) > 0;

            return (
              <div
                key={member._id || index}
                className={`p-3 rounded-xl transition-all ${
                  hasOrders
                    ? "bg-gradient-to-r from-stone-50 to-slate-50"
                    : "bg-stone-50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                        index
                      )} flex items-center justify-center text-white font-bold text-sm shadow-sm`}
                    >
                      {member.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "??"}
                    </div>
                    {index < 3 && hasOrders && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-stone-200">
                        {getRankIcon(index)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {member.name || "Unknown"}
                      </p>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${roleBadge.bg}`}
                      >
                        {member.role || "Staff"}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500">
                        {member.totalOrders || 0} orders
                      </span>
                      <span className="font-semibold text-emerald-600">
                        ${formatUSD(member.totalSales || 0)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {hasOrders && (
                      <div className="mt-2 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${getAvatarGradient(
                            index
                          )}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Percentage */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-700">
                      {hasOrders ? `${percentage.toFixed(0)}%` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center">
            <HiUsers className="text-slate-300 mx-auto mb-2" size={32} />
            <p className="text-slate-500 text-sm">No staff data available</p>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      {top5Staff.length > 0 && (
        <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex-shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Active: {top5Staff.filter((s) => (s.totalOrders || 0) > 0).length}{" "}
              / {top5Staff.length}
            </span>
            <span className="font-semibold text-emerald-600">
              $
              {formatUSD(
                top5Staff.reduce((sum, s) => sum + (s.totalSales || 0), 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPerformance;
