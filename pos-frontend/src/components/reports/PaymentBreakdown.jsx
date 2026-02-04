import React from "react";
import { FaMoneyBillWave, FaQrcode } from "react-icons/fa";
import { MdPayments } from "react-icons/md";
import { HiCreditCard } from "react-icons/hi";

const EXCHANGE_RATE = 4100;

const PaymentBreakdown = ({ cashRevenue, onlineRevenue, totalRevenue }) => {
  const formatUSD = (khr) => ((khr || 0) / EXCHANGE_RATE).toFixed(2);
  const formatKHR = (amount) => (amount || 0).toLocaleString();

  // Handle edge cases
  const safeTotal = totalRevenue || 0;
  const safeCash = cashRevenue || 0;
  const safeOnline = onlineRevenue || 0;

  const cashPercentage = safeTotal > 0 ? (safeCash / safeTotal) * 100 : 0;
  const onlinePercentage = safeTotal > 0 ? (safeOnline / safeTotal) * 100 : 0;

  // SVG Donut Chart calculations
  const size = 140;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dash arrays
  const cashDash = (cashPercentage / 100) * circumference;
  const onlineDash = (onlinePercentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 rounded-xl">
            <MdPayments className="text-purple-600" size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Payment Breakdown</h3>
            <p className="text-xs text-slate-500">Revenue by payment method</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Total Revenue Display */}
        <div className="text-center mb-5">
          <p className="text-3xl font-bold text-slate-800">
            ${formatUSD(safeTotal)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            ៛ {formatKHR(safeTotal)}
          </p>
          <p className="text-sm text-slate-500 mt-1">Total Revenue</p>
        </div>

        {/* Donut Chart */}
        <div className="relative flex items-center justify-center mb-5">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Online/QR Segment (Bottom layer - Indigo) */}
            {safeOnline > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#6366f1"
                strokeWidth={strokeWidth}
                strokeDasharray={`${onlineDash} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}

            {/* Cash Segment (Top layer - Amber) */}
            {safeCash > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={strokeWidth}
                strokeDasharray={`${cashDash} ${circumference}`}
                strokeDashoffset={-onlineDash}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="p-2.5 bg-slate-100 rounded-full mb-1">
              <HiCreditCard className="text-slate-500" size={20} />
            </div>
            <p className="text-xs text-slate-500">Methods</p>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="space-y-3">
          {/* Cash */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                <FaMoneyBillWave className="text-amber-600" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-slate-700 text-sm">Cash</p>
                  <p className="font-bold text-amber-600">
                    ${formatUSD(safeCash)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${cashPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-amber-600 w-12 text-right">
                    {cashPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Online/QR */}
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                <FaQrcode className="text-indigo-600" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-slate-700 text-sm">
                    Online / QR
                  </p>
                  <p className="font-bold text-indigo-600">
                    ${formatUSD(safeOnline)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-indigo-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${onlinePercentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 w-12 text-right">
                    {onlinePercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        {safeTotal > 0 && (
          <div className="mt-4 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-500">Cash</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-500">Online/QR</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {safeTotal === 0 && (
          <div className="text-center py-4">
            <p className="text-slate-400 text-sm">No payment data yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentBreakdown;
