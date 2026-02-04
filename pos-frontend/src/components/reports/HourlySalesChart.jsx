import React from "react";
import { HiClock } from "react-icons/hi";

const EXCHANGE_RATE = 4100;

const HourlySalesChart = ({ data }) => {
  const formatUSD = (khr) => ((khr || 0) / EXCHANGE_RATE).toFixed(2);

  const hourlyData = data || [];
  const totalOrders = hourlyData.reduce((sum, h) => sum + (h.orders || 0), 0);
  const totalRevenue = hourlyData.reduce((sum, h) => sum + (h.revenue || 0), 0);

  // Find peak hour
  const peakHour = hourlyData.reduce(
    (peak, hour) => ((hour.orders || 0) > (peak.orders || 0) ? hour : peak),
    { hour: 0, orders: 0, revenue: 0 }
  );

  // Group into simple time periods
  const getTimePeriods = () => {
    const periods = [
      {
        name: "Morning",
        range: "6-11AM",
        hours: [6, 7, 8, 9, 10],
        icon: "🌅",
        orders: 0,
        revenue: 0,
      },
      {
        name: "Lunch",
        range: "11AM-2PM",
        hours: [11, 12, 13],
        icon: "☀️",
        orders: 0,
        revenue: 0,
      },
      {
        name: "Afternoon",
        range: "2-5PM",
        hours: [14, 15, 16],
        icon: "🌤️",
        orders: 0,
        revenue: 0,
      },
      {
        name: "Dinner",
        range: "5-9PM",
        hours: [17, 18, 19, 20],
        icon: "🌙",
        orders: 0,
        revenue: 0,
      },
      {
        name: "Night",
        range: "9PM-12AM",
        hours: [21, 22, 23],
        icon: "🌃",
        orders: 0,
        revenue: 0,
      },
    ];

    hourlyData.forEach((h) => {
      periods.forEach((period) => {
        if (period.hours.includes(h.hour)) {
          period.orders += h.orders || 0;
          period.revenue += h.revenue || 0;
        }
      });
    });

    return periods;
  };

  const timePeriods = getTimePeriods();
  const maxPeriodOrders = Math.max(...timePeriods.map((p) => p.orders), 1);

  // Format hour to readable time
  const formatHour = (hour) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-3 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl">
              <HiClock className="text-rose-600" size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                Sales by Time
              </h3>
              <p className="text-xs text-slate-500">When do customers order?</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-600">
              ${formatUSD(totalRevenue)}
            </p>
            <p className="text-xs text-slate-500">{totalOrders} orders</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Peak Hour - Compact */}
        {peakHour.orders > 0 && (
          <div className="mb-3 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-medium text-amber-700">
                  Busiest:
                </span>
                <span className="font-bold text-slate-800">
                  {formatHour(peakHour.hour)}
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold text-emerald-600">
                  ${formatUSD(peakHour.revenue)}
                </span>
                <span className="text-slate-400 ml-1">({peakHour.orders})</span>
              </div>
            </div>
          </div>
        )}

        {/* Time Periods - Compact Grid */}
        {totalOrders > 0 ? (
          <div className="space-y-1.5">
            {timePeriods.map((period, index) => {
              const percentage =
                maxPeriodOrders > 0
                  ? (period.orders / maxPeriodOrders) * 100
                  : 0;
              const isPeak =
                period.orders === maxPeriodOrders && period.orders > 0;
              const hasOrders = period.orders > 0;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
                    isPeak
                      ? "bg-emerald-50"
                      : hasOrders
                      ? "bg-stone-50"
                      : "bg-stone-50 opacity-40"
                  }`}
                >
                  {/* Icon */}
                  <span className="text-base w-6">{period.icon}</span>

                  {/* Name & Range */}
                  <div className="w-20">
                    <p className="text-xs font-medium text-slate-700">
                      {period.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{period.range}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isPeak ? "bg-emerald-500" : "bg-blue-400"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Stats */}
                  <div className="text-right w-20">
                    <span
                      className={`text-xs font-bold ${
                        hasOrders ? "text-emerald-600" : "text-slate-300"
                      }`}
                    >
                      ${formatUSD(period.revenue)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({period.orders})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center">
            <HiClock className="text-slate-300 mx-auto mb-1" size={24} />
            <p className="text-slate-400 text-xs">No sales data yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HourlySalesChart;
