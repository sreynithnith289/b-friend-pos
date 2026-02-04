import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IoClose } from "react-icons/io5";
import { MdTableBar } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { addTable } from "../../https";
import { enqueueSnackbar } from "notistack";

const TableModal = ({ setIsModalOpen }) => {
  const queryClient = useQueryClient();
  const [tableData, setTableData] = useState({
    tableNo: "",
    seats: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTableData((prev) => ({ ...prev, [name]: value }));
  };

  const tableMutation = useMutation({
    mutationFn: (reqData) => addTable(reqData),
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message || "Table added successfully!", {
        variant: "success",
      });
      queryClient.invalidateQueries(["tables"]);
      setIsModalOpen(false);
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to add table.";
      enqueueSnackbar(errorMessage, { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tableData.tableNo || !tableData.seats) {
      enqueueSnackbar("Please fill in all fields", { variant: "warning" });
      return;
    }
    tableMutation.mutate(tableData);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setIsModalOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <MdTableBar size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Add New Table</h2>
                  <p className="text-emerald-100 text-xs">
                    Create a new table for your restaurant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <IoClose size={20} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Table Number */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Table Number
              </label>
              <div className="relative">
                <MdTableBar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="number"
                  name="tableNo"
                  value={tableData.tableNo}
                  onChange={handleInputChange}
                  placeholder="Enter table number"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  required
                />
              </div>
            </div>

            {/* Number of Seats */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Number of Seats
              </label>
              <div className="relative">
                <FaUsers
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="number"
                  name="seats"
                  value={tableData.seats}
                  onChange={handleInputChange}
                  placeholder="Enter number of seats"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-stone-100 text-slate-600 font-semibold rounded-xl hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={tableMutation.isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
              >
                {tableMutation.isLoading ? "Adding..." : "Add Table"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TableModal;
