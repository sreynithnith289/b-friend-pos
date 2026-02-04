import React from "react";
import { IoRefresh } from "react-icons/io5";
import { MdTableBar } from "react-icons/md";
import TableTableRow from "./TableTableRow";

const TablesTable = ({
  tables,
  isLoading,
  selectedTable,
  onRowClick,
  onStatusChange,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
      {/* Table Container with fixed height for ~4 rows */}
      <div className="h-[270px] overflow-y-auto">
        <table className="w-full text-left text-sm table-fixed">
          {/* Sticky Header */}
          <thead className="bg-stone-50 text-slate-500 sticky top-0 z-10">
            <tr className="border-b border-stone-200">
              <th className="px-4 py-3 font-semibold w-[12%]">Table No</th>
              <th className="px-4 py-3 font-semibold w-[15%]">Status</th>
              <th className="px-4 py-3 font-semibold w-[20%]">Customer</th>
              <th className="px-4 py-3 font-semibold text-center w-[12%]">
                Seats
              </th>
              <th className="px-4 py-3 font-semibold w-[18%]">Created At</th>
              <th className="px-4 py-3 font-semibold w-[15%]">Updated At</th>
              <th className="px-4 py-3 font-semibold text-center w-[8%]">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-stone-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <IoRefresh className="animate-spin" size={20} />
                    <span>Loading tables...</span>
                  </div>
                </td>
              </tr>
            ) : tables.length > 0 ? (
              tables.map((table) => (
                <TableTableRow
                  key={table._id}
                  table={table}
                  isSelected={selectedTable?._id === table._id}
                  onRowClick={onRowClick}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <MdTableBar
                    size={48}
                    className="mx-auto text-slate-300 mb-3"
                  />
                  <p className="text-slate-500 font-medium">No tables found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablesTable;
