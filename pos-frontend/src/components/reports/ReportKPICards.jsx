import React from "react";
import {
  HiTrendingUp,
  HiTrendingDown,
  HiCurrencyDollar,
  HiShoppingCart,
  HiUsers,
} from "react-icons/hi";
import { FaChartLine } from "react-icons/fa";
import { MdPayments } from "react-icons/md";

const EXCHANGE_RATE = 4100;

const ReportKPICards = ({ kpis, dateRange }) => {
  const formatUSD = (khr) => ((khr || 0) / EXCHANGE_RATE).toFixed(2);
  const formatKHR = (amount) => (amount || 0).toLocaleString();

  const cards = [
    {
      title: "Total Revenue",
      value: `$${formatUSD(kpis.totalRevenue)}`,
      subValue: `៛ ${formatKHR(kpis.totalRevenue)}`,
      icon: MdPayments,
      growth: kpis.revenueGrowth,
      color: "emerald",
      bgGradient: "from-emerald-500 to-green-600",
      shadowColor: "shadow-emerald-500/20",
    },
    {
      title: "Total Orders",
      value: kpis.totalOrders.toLocaleString(),
      subValue: `${dateRange}`,
      icon: HiShoppingCart,
      growth: kpis.ordersGrowth,
      color: "blue",
      bgGradient: "from-blue-500 to-indigo-600",
      shadowColor: "shadow-blue-500/20",
    },
    {
      title: "Avg Order Value",
      value: `$${formatUSD(kpis.avgOrderValue)}`,
      subValue: `Per transaction`,
      icon: FaChartLine,
      color: "purple",
      bgGradient: "from-purple-500 to-violet-600",
      shadowColor: "shadow-purple-500/20",
    },
    {
      title: "Unique Customers",
      value: kpis.uniqueCustomers.toLocaleString(),
      subValue: `${dateRange}`,
      icon: HiUsers,
      color: "amber",
      bgGradient: "from-amber-500 to-orange-600",
      shadowColor: "shadow-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const hasGrowth = card.growth !== undefined && card.growth !== 0;
        const isPositive = card.growth > 0;

        return (
          <div
            key={index}
            className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} rounded-2xl p-5 text-white shadow-xl ${card.shadowColor}`}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Icon size={20} />
                </div>
                {hasGrowth && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                      isPositive
                        ? "bg-white/20 text-white"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    {isPositive ? (
                      <HiTrendingUp size={14} />
                    ) : (
                      <HiTrendingDown size={14} />
                    )}
                    {Math.abs(card.growth).toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Value */}
              <p className="text-3xl font-bold tracking-tight">{card.value}</p>

              {/* Title & Sub */}
              <div className="mt-2">
                <p className="text-white/90 text-sm font-medium">
                  {card.title}
                </p>
                <p className="text-white/60 text-xs mt-0.5">{card.subValue}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportKPICards;
