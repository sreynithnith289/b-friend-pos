import React from "react";
import { FaTrash } from "react-icons/fa";
import { MdTableBar } from "react-icons/md";

const TableTableRow = ({
  table,
  isSelected,
  onRowClick,
  onStatusChange,
  onDelete,
}) => {
  const getStatusConfig = (status) => {
    const configs = {
      available: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-200",
      },
      Available: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-200",
      },
      booked: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-200",
      },
      Booked: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-200",
      },
      "in progress": {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      "In Progress": {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
      },
    };
    return (
      configs[status] || {
        bg: "bg-slate-50",
        text: "text-slate-600",
        border: "border-slate-200",
      }
    );
  };

  const getInitials = (name) => {
    if (!name) return "—";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(table._id);
  };

  const handleStatusChange = (e) => {
    e.stopPropagation();
    const newStatus = e.target.value;

    // If changing to Available, clear customer name
    if (newStatus === "Available") {
      onStatusChange(table._id, newStatus, "");
    } else {
      onStatusChange(table._id, newStatus, table.customerName);
    }
  };

  const statusConfig = getStatusConfig(table.status);

  return (
    <tr
      onClick={() => onRowClick(table)}
      className={`cursor-pointer transition-colors ${
        isSelected ? "bg-emerald-50" : "hover:bg-stone-50"
      }`}
    >
      {/* Table No */}
      <td className="px-4 py-3 w-[12%]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white shadow-sm">
            <MdTableBar size={16} />
          </div>
          <span className="font-bold text-slate-700">T-{table.tableNo}</span>
        </div>
      </td>

      {/* Status Dropdown */}
      <td className="px-4 py-3 w-[15%]">
        <select
          value={table.status}
          onClick={(e) => e.stopPropagation()}
          onChange={handleStatusChange}
          className={`${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer`}
        >
          <option value="Available">Available</option>
          <option value="Booked">Booked</option>
          <option value="In Progress">In Progress</option>
        </select>
      </td>

      {/* Customer */}
      <td className="px-4 py-3 w-[20%]">
        {table.customerName ? (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {getInitials(table.customerName)}
            </div>
            <span className="font-medium text-slate-700 truncate">
              {table.customerName}
            </span>
          </div>
        ) : (
          <span className="text-slate-400 text-sm">No customer</span>
        )}
      </td>

      {/* Seats */}
      <td className="px-4 py-3 w-[12%] text-center">
        <span className="bg-stone-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-semibold">
          {table.seats || "—"} seats
        </span>
      </td>

      {/* Created At */}
      <td className="px-4 py-3 w-[18%] text-slate-500 text-xs">
        {formatDate(table.createdAt)}
      </td>

      {/* Updated At */}
      <td className="px-4 py-3 w-[15%] text-slate-500 text-xs">
        {formatDate(table.updatedAt)}
      </td>

      {/* Action */}
      <td className="px-4 py-3 w-[8%] text-center">
        <button
          onClick={handleDelete}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete table"
        >
          <FaTrash size={14} />
        </button>
      </td>
    </tr>
  );
};

export default TableTableRow;
