import React from "react";
import {
  FaCheckCircle,
  FaCheckDouble,
  FaCircle,
  FaLongArrowAltRight,
} from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils";

const OrderCard = ({ order }) => {
  const tableNumber = order.table?.tableNo ?? "?";

  // Determine status, color, and badge
  let status = order.orderStatus;
  let statusColor = "";
  let statusBadge = "";
  let statusIcon = null;
  let badgeBg = "";
  let badgeText = "";

  if (status === "Ready") {
    statusColor = "text-green-400";
    statusBadge = "Ready to Serve";
    statusIcon = <FaCheckDouble className="text-[10px]" />;
    badgeBg = "bg-[#2e4a40] text-green-300";
    badgeText = statusBadge;
  } else if (status === "In Progress") {
    statusColor = "text-yellow-400";
    statusBadge = "Preparing Your Order";
    statusIcon = <FaCircle className="text-[10px]" />;
    badgeBg = "bg-[#2e4a40] text-yellow-300";
    badgeText = statusBadge;
  } else if (status === "Paid") {
    statusColor = "text-blue-400";
    statusBadge = "Payment Completed";
    statusIcon = <FaCheckCircle className="text-[10px]" />;
    badgeBg = "bg-[#1e3a8a] text-blue-300";
    badgeText = statusBadge;
  } else {
    statusColor = "text-gray-400";
    statusBadge = status;
    statusIcon = <FaCircle className="text-[10px]" />;
    badgeBg = "bg-gray-700 text-gray-300";
    badgeText = statusBadge;
  }

  return (
    <div
      className="w-[280px] min-h-[150px] bg-[#1f1f1f] p-5 rounded-xl mb-6 border border-gray-800 shadow-sm transition-all duration-300 flex flex-col justify-between
                    hover:bg-[#262626] hover:shadow-md hover:border-gray-700 cursor-pointer"
    >
      {/* Header: Avatar + Customer Info */}
      <div className="flex items-center gap-3">
        <span className="bg-[#f6b100] text-black font-semibold text-[11px] px-2 py-0.5 rounded-md shadow-sm">
          {getAvatarName(order.customerDetails?.name ?? "U")}
        </span>

        <div className="flex flex-1 justify-between items-center">
          {/* Customer Info */}
          <div className="flex flex-col leading-tight">
            <h1 className="text-white text-[14px] font-bold">
              {order.customerDetails?.name ?? "Unknown"}
            </h1>
            <p className="text-gray-400 text-[11px] font-medium">• Dine in</p>
            <p className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
              Table <FaLongArrowAltRight className="text-[#ababab]" />{" "}
              <span className="text-gray-100">{tableNumber}</span>
            </p>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1 text-right">
            <p
              className={`text-[11px] flex items-center justify-end gap-1 font-medium ${statusColor}`}
            >
              {statusIcon} {status}
            </p>
            <span
              className={`flex items-center justify-end gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold ${badgeBg}`}
            >
              {badgeText}
            </span>
          </div>
        </div>
      </div>

      {/* Order Meta */}
      <div className="flex justify-between items-center mt-3 text-gray-400 text-[11px]">
        <p>{formatDateAndTime(order.createdAt)}</p>
        <p>{order.items?.length ?? 0} Items</p>
      </div>

      <div className="border-t border-gray-700 my-3" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-gray-300 text-[12px] font-medium">Total</span>
        <p className="text-[#f6b100] text-[15px] font-bold">
          {order.bills?.totalWithTax?.toLocaleString() ?? 0}៛ /{" "}
          {((order.bills?.totalWithTax ?? 0) / 4100).toFixed(2)}$
        </p>
      </div>
    </div>
  );
};

export default OrderCard;
