import React from "react";
import { IoClose } from "react-icons/io5";
import { FaUser, FaPhone, FaUsers } from "react-icons/fa";
import { MdTableBar } from "react-icons/md";
import { formatDateAndTime } from "../../utils";
import OrderItemsList from "./OrderItemsList";
import PrintInvoiceButton from "./PrintInvoiceButton";

const OrderDetailPanel = ({ order, onClose }) => {
  const getStatusConfig = (orderStatus) => {
    const configs = {
      "In Progress": { bg: "bg-amber-50", text: "text-amber-600" },
      Preparing: { bg: "bg-amber-50", text: "text-amber-600" },
      Ready: { bg: "bg-emerald-50", text: "text-emerald-600" },
      Paid: { bg: "bg-blue-50", text: "text-blue-600" },
    };
    return (
      configs[orderStatus] || { bg: "bg-slate-50", text: "text-slate-600" }
    );
  };

  const formatUSD = (khr) => ((khr || 0) / 4100).toFixed(2);
  const roundRiel = (amount) => Math.round((amount || 0) / 100) * 100;

  const statusConfig = getStatusConfig(order.orderStatus);

  // Get table number from order
  const tableNo = order.table?.tableNo || order.tableNo || null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-stone-50">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-slate-800">Order Details</h3>
          {tableNo && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold">
              <MdTableBar size={12} />
              Table {tableNo}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <IoClose size={18} className="text-slate-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex">
        {/* Left Side - Customer & Order Info */}
        <div className="flex-1 p-4 border-r border-stone-100">
          {/* Customer Info */}
          <div className="bg-stone-50 rounded-xl p-4 mb-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">
              Customer Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <FaUser className="text-amber-600" size={14} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Name</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {order.customerDetails?.name || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaPhone className="text-blue-600" size={14} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {order.customerDetails?.phone || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaUsers className="text-purple-600" size={14} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Guests</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {order.customerDetails?.guests || 1} people
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <MdTableBar className="text-emerald-600" size={14} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Table</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {tableNo ? `T-${tableNo}` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-stone-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">
              Order Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Order ID</p>
                <p className="font-mono text-sm font-semibold text-slate-700">
                  #{order._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Date & Time</p>
                <p className="text-sm font-semibold text-slate-700">
                  {formatDateAndTime(order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                >
                  {order.orderStatus}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Payment</p>
                <p className="text-sm font-semibold text-slate-700">
                  {order.paymentType || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Items & Total */}
        <div className="w-[320px] bg-stone-50">
          {/* Items Header */}
          <div className="p-4 border-b border-stone-200">
            <h4 className="text-sm font-semibold text-slate-700">
              Order Items ({order.items?.length || 0})
            </h4>
          </div>

          {/* Items List */}
          <OrderItemsList items={order.items} />

          {/* Bill Summary */}
          <div className="p-4 border-t border-stone-200 bg-white">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-700">
                ${formatUSD(order.bills?.total)}
              </span>
            </div>
            {order.bills?.discount > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Discount</span>
                <span className="text-red-500">
                  -${formatUSD(order.bills?.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-stone-100">
              <span className="font-semibold text-slate-700">Total</span>
              <div className="text-right">
                <p className="text-xl font-bold text-amber-600">
                  $
                  {formatUSD(
                    order.bills?.totalWithDiscount || order.bills?.total
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  ៛{" "}
                  {roundRiel(
                    order.bills?.totalWithDiscount || order.bills?.total
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Print Button */}
            <PrintInvoiceButton order={order} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPanel;
