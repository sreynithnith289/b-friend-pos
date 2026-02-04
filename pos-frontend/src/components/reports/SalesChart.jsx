import React, { useState } from "react";
import { FaChartLine } from "react-icons/fa";
import { HiTrendingUp, HiTrendingDown } from "react-icons/hi";

const EXCHANGE_RATE = 4100;

const SalesChart = ({ data, title }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const formatUSD = (khr) => ((khr || 0) / EXCHANGE_RATE).toFixed(2);

  const chartData = data || [];
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue || 0), 1);
  const totalRevenue = chartData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalOrders = chartData.reduce((sum, d) => sum + (d.orders || 0), 0);
  const avgRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;

  // Calculate trend (compare last 2 days)
  const getTrend = () => {
    if (chartData.length < 2) return null;
    const latest = chartData[chartData.length - 1]?.revenue || 0;
    const previous = chartData[chartData.length - 2]?.revenue || 0;
    if (previous === 0) return null;
    const change = ((latest - previous) / previous) * 100;
    return { value: change, isUp: change >= 0 };
  };

  const trend = getTrend();

  // Find best day
  const bestDay = chartData.reduce(
    (best, day) => ((day.revenue || 0) > (best.revenue || 0) ? day : best),
    { date: "", revenue: 0, orders: 0 }
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20">
              <FaChartLine className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                {title || "Sales Trend"}
              </h3>
              <p className="text-xs text-slate-500">Daily revenue overview</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <p className="text-xl font-bold text-slate-800">
                ${formatUSD(totalRevenue)}
              </p>
              {trend && (
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
                    trend.isUp
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {trend.isUp ? (
                    <HiTrendingUp size={12} />
                  ) : (
                    <HiTrendingDown size={12} />
                  )}
                  {Math.abs(trend.value).toFixed(0)}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{totalOrders} orders</p>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-5">
        {chartData.length > 0 ? (
          <>
            {/* Hover Tooltip */}
            <div className="h-6 mb-3">
              {hoveredIndex !== null && chartData[hoveredIndex] && (
                <div className="flex items-center justify-center gap-3 text-sm">
                  <span className="font-semibold text-slate-700">
                    {chartData[hoveredIndex].date}
                  </span>
                  <span className="text-emerald-600 font-bold">
                    ${formatUSD(chartData[hoveredIndex].revenue)}
                  </span>
                  <span className="text-slate-400">
                    {chartData[hoveredIndex].orders} orders
                  </span>
                </div>
              )}
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-48 mb-4">
              {chartData.map((item, index) => {
                const height =
                  maxRevenue > 0 ? ((item.revenue || 0) / maxRevenue) * 100 : 0;
                const isAboveAvg = (item.revenue || 0) >= avgRevenue;
                const isBestDay =
                  item.revenue === bestDay.revenue && item.revenue > 0;
                const isHovered = hoveredIndex === index;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2 cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Best Day Star */}
                    {isBestDay && (
                      <span className="text-xs text-amber-500">⭐</span>
                    )}

                    {/* Bar */}
                    <div className="w-full flex flex-col items-center justify-end h-40">
                      <div
                        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 ${
                          isHovered ? "scale-105 shadow-lg" : ""
                        } ${
                          isBestDay
                            ? "bg-gradient-to-t from-amber-500 to-yellow-400"
                            : isAboveAvg
                            ? "bg-gradient-to-t from-emerald-500 to-emerald-400"
                            : "bg-gradient-to-t from-slate-400 to-slate-300"
                        }`}
                        style={{
                          height: `${Math.max(height, 4)}%`,
                          opacity:
                            hoveredIndex !== null && !isHovered ? 0.4 : 1,
                        }}
                      />
                    </div>

                    {/* Date Label */}
                    <span
                      className={`text-[10px] font-medium whitespace-nowrap transition-colors ${
                        isHovered ? "text-slate-800" : "text-slate-500"
                      }`}
                    >
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs text-slate-600">Best day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-600">Above avg</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-xs text-slate-600">Below avg</span>
              </div>
              <div className="flex items-center gap-2">
                <HiTrendingUp className="text-slate-400" size={14} />
                <span className="text-xs text-slate-600">
                  Avg: ${formatUSD(avgRevenue)}/day
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="h-48 flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-100 rounded-full mb-3">
              <FaChartLine className="text-slate-400" size={32} />
            </div>
            <p className="text-slate-500 font-medium">No sales data yet</p>
            <p className="text-slate-400 text-sm">
              Data will appear after orders are placed
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesChart;
