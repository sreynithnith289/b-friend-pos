import React from "react";
import { IoRefresh } from "react-icons/io5";
import { HiClipboardList } from "react-icons/hi";
import OrderTableRow from "./OrderTableRow";

const OrdersTable = ({
  orders,
  isLoading,
  selectedOrder,
  onRowClick,
  onStatusChange,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
      {/* Table Container with fixed height for ~4 rows */}
      <div className="h-[280px] overflow-y-auto">
        <table className="w-full text-left text-sm table-fixed">
          {/* Sticky Header */}
          <thead className="bg-stone-50 text-slate-500 sticky top-0 z-10">
            <tr className="border-b border-stone-200">
              <th className="px-4 py-3 font-semibold w-[9%]">Order ID</th>
              <th className="px-4 py-3 font-semibold w-[14%]">Customer</th>
              <th className="px-4 py-3 font-semibold w-[12%]">Status</th>
              <th className="px-4 py-3 font-semibold w-[22%]">Date & Time</th>
              <th className="px-4 py-3 font-semibold text-center w-[6%]">
                Items
              </th>
              <th className="px-4 py-3 font-semibold text-center w-[8%]">
                Table
              </th>
              <th className="px-4 py-3 font-semibold w-[8%]">Total</th>
              <th className="px-4 py-3 font-semibold text-center w-[9%]">
                Payment
              </th>
              <th className="px-4 py-3 font-semibold text-center w-[7%]">
                Action
              </th>
              <th className="px-4 py-3 font-semibold text-center w-[7%]">
                Edit
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-stone-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="text-center py-16">
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <IoRefresh className="animate-spin" size={20} />
                    <span>Loading orders...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <OrderTableRow
                  key={order._id}
                  order={order}
                  isSelected={selectedOrder?._id === order._id}
                  onRowClick={onRowClick}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-16">
                  <HiClipboardList
                    size={48}
                    className="mx-auto text-slate-300 mb-3"
                  />
                  <p className="text-slate-500 font-medium">No orders found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
