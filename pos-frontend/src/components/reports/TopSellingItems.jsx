import React from "react";
import { FaTrophy, FaMedal } from "react-icons/fa";
import { MdFastfood } from "react-icons/md";

const EXCHANGE_RATE = 4100;

// Khmer font style
const khmerFontStyle = {
  fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
};

// Helper to detect Khmer text
const containsKhmer = (text) => /[\u1780-\u17FF]/.test(text || "");

const TopSellingItems = ({ items }) => {
  const formatUSD = (khr) => ((khr || 0) / EXCHANGE_RATE).toFixed(2);

  // Only show Top 5
  const top5Items = (items || []).slice(0, 5);
  const maxRevenue = Math.max(...top5Items.map((i) => i.revenue || 0), 1);

  const getRankIcon = (index) => {
    if (index === 0) return <FaTrophy className="text-yellow-500" size={16} />;
    if (index === 1) return <FaMedal className="text-slate-400" size={16} />;
    if (index === 2) return <FaMedal className="text-amber-600" size={16} />;
    return (
      <span className="text-slate-400 font-bold text-xs">#{index + 1}</span>
    );
  };

  const getRankBg = (index) => {
    if (index === 0)
      return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
    if (index === 1)
      return "bg-gradient-to-r from-slate-50 to-stone-50 border-slate-200";
    if (index === 2)
      return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200";
    return "bg-white border-stone-100 hover:border-stone-200";
  };

  const getProgressColor = (index) => {
    if (index === 0) return "from-yellow-400 to-amber-500";
    if (index === 1) return "from-slate-300 to-slate-400";
    if (index === 2) return "from-amber-400 to-orange-500";
    return "from-indigo-400 to-indigo-500";
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <FaTrophy className="text-amber-600" size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                Top Selling Items
              </h3>
              <p className="text-xs text-slate-500">Top 5 best performers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items List - Fixed 5 items */}
      <div className="flex-1 p-4 space-y-2">
        {top5Items.length > 0 ? (
          top5Items.map((item, index) => {
            const percentage =
              maxRevenue > 0 ? ((item.revenue || 0) / maxRevenue) * 100 : 0;
            const isKhmer = containsKhmer(item.name);

            return (
              <div
                key={index}
                className={`p-3 rounded-xl border transition-all ${getRankBg(
                  index
                )}`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {getRankIcon(index)}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <p
                      className="font-semibold text-slate-800 text-sm truncate"
                      style={isKhmer ? khmerFontStyle : {}}
                      title={item.name}
                    >
                      {item.name || "Unknown Item"}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-0.5 text-xs">
                      <span className="text-slate-500">
                        {item.quantity || 0} sold
                      </span>
                      <span className="font-semibold text-emerald-600">
                        ${formatUSD(item.revenue || 0)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${getProgressColor(
                          index
                        )}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center">
            <MdFastfood className="text-slate-300 mx-auto mb-2" size={32} />
            <p className="text-slate-500 text-sm">No sales data yet</p>
            <p className="text-slate-400 text-xs mt-1">
              Items will appear after orders
            </p>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      {top5Items.length > 0 && (
        <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex-shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Total: {top5Items.reduce((sum, i) => sum + (i.quantity || 0), 0)}{" "}
              items sold
            </span>
            <span className="font-semibold text-emerald-600">
              $
              {formatUSD(
                top5Items.reduce((sum, i) => sum + (i.revenue || 0), 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopSellingItems;
