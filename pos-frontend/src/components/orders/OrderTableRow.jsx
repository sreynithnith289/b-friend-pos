import React from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { formatDateAndTime } from "../../utils";
import { loadOrderForEdit } from "../../redux/slices/customerSlice";
import { loadCartItems } from "../../redux/slices/cartSlice";

const OrderTableRow = ({
  order,
  isSelected,
  onRowClick,
  onStatusChange,
  onDelete,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getStatusConfig = (orderStatus) => {
    const configs = {
      "In Progress": {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      Preparing: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-200",
      },
      Ready: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-200",
      },
      Paid: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-200",
      },
    };
    return (
      configs[orderStatus] || {
        bg: "bg-slate-50",
        text: "text-slate-600",
        border: "border-slate-200",
      }
    );
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatUSD = (khr) => ((khr || 0) / 4100).toFixed(2);

  const statusConfig = getStatusConfig(order.orderStatus);

  // Get table number - check multiple possible locations
  const tableNumber = order.table?.tableNo || order.tableNo || null;

  const customerName = order.customerDetails?.name ?? "Unknown";
  const paymentMethod = order.paymentType || "—";

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(order._id);
  };

  // ✅ HANDLE EDIT - Load order data and navigate to POS
  const handleEdit = (e) => {
    e.stopPropagation();

    // 1. Load customer info into Redux
    dispatch(loadOrderForEdit({ order }));

    // 2. Load cart items into Redux
    dispatch(loadCartItems({ items: order.items || [] }));

    // 3. Navigate to POS Terminal
    navigate("/pos");
  };

  return (
    <tr
      onClick={() => onRowClick(order)}
      className={`cursor-pointer transition-colors ${
        isSelected ? "bg-amber-50" : "hover:bg-stone-50"
      }`}
    >
      {/* Order ID - 9% */}
      <td className="px-4 py-3 w-[9%]">
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded font-medium">
          #{order._id.slice(-6).toUpperCase()}
        </span>
      </td>

      {/* Customer - 16% */}
      <td className="px-4 py-3 w-[16%]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
            {getInitials(customerName)}
          </div>
          <p className="font-semibold text-slate-700 truncate text-sm">
            {customerName}
          </p>
        </div>
      </td>

      {/* Status - 11% */}
      <td className="px-4 py-3 w-[11%]">
        <select
          value={order.orderStatus}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onStatusChange(order._id, e.target.value)}
          className={`${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} px-2 py-1 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-200 cursor-pointer`}
        >
          <option value="In Progress">In Progress</option>
          {/* <option value="Preparing">Preparing</option>
          <option value="Ready">Ready</option> */}
          <option value="Paid">Paid</option>
        </select>
      </td>

      {/* Date & Time - 14% */}
      <td className="px-4 py-3 w-[14%] text-slate-500 text-xs whitespace-nowrap">
        {formatDateAndTime(order.createdAt)}
      </td>

      {/* Items - 7% */}
      <td className="px-4 py-3 w-[7%] text-center">
        <span className="bg-stone-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-semibold">
          {order.items?.length ?? 0}
        </span>
      </td>

      {/* Table - 7% */}
      <td className="px-4 py-3 w-[7%] text-center">
        {tableNumber ? (
          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-semibold">
            T-{tableNumber}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )}
      </td>

      {/* Total - 10% */}
      <td className="px-4 py-3 w-[10%]">
        <p className="font-bold text-amber-600 text-sm">
          ${formatUSD(order.bills?.totalWithDiscount || order.bills?.total)}
        </p>
      </td>

      {/* Payment - 9% */}
      <td className="px-4 py-3 w-[9%] text-center">
        <span
          className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${
            paymentMethod === "Cash"
              ? "bg-emerald-50 text-emerald-600"
              : paymentMethod === "Online"
              ? "bg-blue-50 text-blue-600"
              : "bg-slate-50 text-slate-500"
          }`}
        >
          {paymentMethod}
        </span>
      </td>

      {/* Action - Delete */}
      <td className="px-4 py-3 w-[7%] text-center">
        <button
          onClick={handleDelete}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete order"
        >
          <FaTrash size={14} />
        </button>
      </td>

      {/* Action - Edit */}
      <td className="px-4 py-3 w-[7%] text-center">
        <button
          onClick={handleEdit}
          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit order"
        >
          <FaEdit size={18} />
        </button>
      </td>
    </tr>
  );
};

export default OrderTableRow;
