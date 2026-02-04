import React from "react";
import { FaReceipt, FaMoneyBillWave, FaQrcode } from "react-icons/fa";
import { MdTableBar } from "react-icons/md";
import { HiClock } from "react-icons/hi";

const EXCHANGE_RATE = 4100;

const RecentTransactions = ({ orders }) => {
  const formatUSD = (khr) => ((khr || 0) / EXCHANGE_RATE).toFixed(2);
  const formatKHR = (amount) => (amount || 0).toLocaleString();

  // Only show 5 most recent
  const recent5Orders = (orders || []).slice(0, 5);

  const formatTime = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <FaReceipt className="text-emerald-600" size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                Recent Transactions
              </h3>
              <p className="text-xs text-slate-500">
                5 most recent completed orders
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Table
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {recent5Orders.length > 0 ? (
              recent5Orders.map((order) => {
                const customerName = order.customerDetails?.name || "Guest";
                const tableNo = order.table?.tableNo;
                const paymentType = order.paymentType || "Cash";
                const total =
                  order.bills?.totalWithDiscount || order.bills?.total || 0;

                return (
                  <tr
                    key={order._id}
                    className="hover:bg-stone-50 transition-colors"
                  >
                    {/* Order ID */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded font-medium text-slate-700">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                          {getInitials(customerName)}
                        </div>
                        <span className="font-medium text-slate-700 text-sm">
                          {customerName}
                        </span>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 bg-stone-100 rounded-md text-xs font-semibold text-slate-600">
                        {order.items?.length || 0}
                      </span>
                    </td>

                    {/* Table */}
                    <td className="px-4 py-3 text-center">
                      {tableNo ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-xs font-medium">
                          <MdTableBar size={12} />
                          T-{tableNo}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                          paymentType === "Cash"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        {paymentType === "Cash" ? (
                          <FaMoneyBillWave size={10} />
                        ) : (
                          <FaQrcode size={10} />
                        )}
                        {paymentType}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold text-emerald-600">
                        ${formatUSD(total)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        ៛{formatKHR(total)}
                      </p>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 text-xs text-slate-500">
                        <HiClock size={12} className="text-slate-400" />
                        {formatTime(order.createdAt)}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <FaReceipt
                    className="text-slate-300 mx-auto mb-3"
                    size={32}
                  />
                  <p className="text-slate-500 font-medium">
                    No transactions yet
                  </p>
                  <p className="text-slate-400 text-sm">
                    Completed orders will appear here
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {recent5Orders.length > 0 && (
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {recent5Orders.length} most recent
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <FaMoneyBillWave className="text-emerald-500" size={12} />
                {
                  recent5Orders.filter((o) => o.paymentType === "Cash").length
                }{" "}
                Cash
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <FaQrcode className="text-indigo-500" size={12} />
                {
                  recent5Orders.filter((o) => o.paymentType === "Online").length
                }{" "}
                Online
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
