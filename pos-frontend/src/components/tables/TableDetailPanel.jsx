import React from "react";
import { IoClose } from "react-icons/io5";
import { MdTableBar } from "react-icons/md";
import { FaUsers, FaCalendarAlt, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateTable } from "../../redux/slices/customerSlice";
import { updateTableStatus } from "../../https";
import { enqueueSnackbar } from "notistack";

const TableDetailPanel = ({ table, onClose, refetchTables }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const customer = useSelector((state) => state.customer);

  /* ================= STATUS LOGIC ================= */
  const status = table.status?.toLowerCase();
  const isBooked = status === "booked";
  const isInProgress = status === "in progress";
  const isOccupied = isBooked || isInProgress;

  /* ================= FORMAT DATE ================= */
  const formatDateTime = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ================= SELECT TABLE ================= */
  const handleSelectTable = async () => {
    if (isOccupied) return;

    if (!customer.customerName || customer.customerName.trim() === "") {
      enqueueSnackbar("Please fill customer information first!", {
        variant: "warning",
      });
      return;
    }

    try {
      // ✅ IMMEDIATE BACKEND UPDATE
      await updateTableStatus({
        tableId: table._id,
        status: "In Progress",
        customerName: customer.customerName,
      });

      // ✅ SAVE TABLE TO REDUX
      dispatch(
        updateTable({
          tableNo: table.tableNo,
          tableId: table._id,
        })
      );

      enqueueSnackbar(`Table ${table.tableNo} is now In Progress`, {
        variant: "success",
      });

      // ✅ REFRESH UI
      refetchTables?.();

      // ✅ GO TO MENU
      navigate("/pos");
    } catch (error) {
      console.error("Failed to update table:", error);
      enqueueSnackbar("Failed to select table", { variant: "error" });
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-stone-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <MdTableBar className="text-emerald-600" size={18} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Table Details</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-stone-200 rounded-lg"
        >
          <IoClose size={18} className="text-slate-500" />
        </button>
      </div>

      <div className="flex">
        {/* LEFT */}
        <div className="flex-1 p-4 border-r border-stone-100">
          <div className="flex justify-center mb-4">
            <div
              className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg ${
                isInProgress
                  ? "bg-gradient-to-br from-blue-500 to-indigo-500"
                  : isBooked
                  ? "bg-gradient-to-br from-amber-500 to-orange-500"
                  : "bg-gradient-to-br from-emerald-500 to-green-500"
              }`}
            >
              <MdTableBar size={32} />
              <p className="font-bold mt-1">T-{table.tableNo}</p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">
              Table Information
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                icon={<MdTableBar size={14} />}
                label="Table Number"
                value={`T-${table.tableNo}`}
              />
              <InfoItem
                icon={<FaUsers size={14} />}
                label="Seats"
                value={`${table.seats || "—"} people`}
              />
              <InfoItem
                icon={<FaCalendarAlt size={14} />}
                label="Created"
                value={formatDateTime(table.createdAt)}
              />
              <InfoItem
                icon={<FaClock size={14} />}
                label="Updated"
                value={formatDateTime(table.updatedAt)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-[280px] bg-stone-50 p-4">
          <div className="bg-white rounded-xl p-4 border mb-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">
              Current Status
            </h4>
            <p
              className={`text-center font-bold text-lg ${
                isInProgress
                  ? "text-blue-600"
                  : isBooked
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            >
              {table.status || "Available"}
            </p>
          </div>

          {isOccupied && table.customerName && (
            <div className="bg-white rounded-xl p-4 border mb-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">
                Customer
              </h4>
              <p className="font-semibold text-slate-700">
                {table.customerName}
              </p>
            </div>
          )}

          {!isOccupied && !customer.customerName && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-amber-700 text-center">
                ⚠️ Please fill customer info first
              </p>
            </div>
          )}

          <button
            onClick={handleSelectTable}
            disabled={isOccupied}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              isOccupied
                ? "bg-stone-200 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
            }`}
          >
            {isInProgress
              ? "Order In Progress"
              : isBooked
              ? "Table Booked"
              : "Select This Table"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= REUSABLE INFO ITEM ================= */
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">{icon}</div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value}</p>
    </div>
  </div>
);

export default TableDetailPanel;
