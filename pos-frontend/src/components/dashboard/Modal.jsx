import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { IoMdClose } from "react-icons/io";
import { addTable } from "../../https";
import { enqueueSnackbar } from "notistack";

// ✅ Reusable Input Field Component
const InputField = ({
  label,
  type,
  name,
  placeholder,
  required,
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={name}
        className="text-gray-300 text-sm font-medium mb-2 tracking-wide"
      >
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className="p-2.5 rounded-md bg-[#1f1f1f] border border-[#3a3a3a] text-[#f5f5f5] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#facc15] transition-all duration-200 text-sm"
      />
    </div>
  );
};

const Modal = ({ setIsTableModalOpen }) => {
  const [tableData, setTableData] = useState({
    tableNo: "",
    seats: "",
  });

  // ✅ Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTableData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Mutation setup
  const tableMutation = useMutation({
    mutationFn: (reqData) => addTable(reqData),
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message || "Table added successfully!", {
        variant: "success",
      });
      setIsTableModalOpen(false);
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to add table.";
      enqueueSnackbar(errorMessage, { variant: "error" });
      console.error(error);
    },
  });

  // ✅ Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tableData.tableNo || !tableData.seats) {
      enqueueSnackbar("Please fill in all fields", { variant: "warning" });
      return;
    }
    tableMutation.mutate(tableData);
  };

  // ✅ Close modal
  const handleCloseModal = () => setIsTableModalOpen(false);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-[#262626] border border-[#333] p-5 rounded-xl shadow-2xl w-[320px]"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#f5f5f5] text-xl font-semibold tracking-wide">
              Add Table
            </h2>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-yellow-400 transition-colors duration-200"
            >
              <IoMdClose size={22} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="text-[#f5f5f5]">
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <InputField
                label="Table Number"
                type="number"
                name="tableNo"
                value={tableData.tableNo}
                onChange={handleInputChange}
                placeholder="Enter table number"
                required
              />
              <InputField
                label="Number of Seats"
                type="number"
                name="seats"
                value={tableData.seats}
                onChange={handleInputChange}
                placeholder="Enter number of seats"
                required
              />

              <button
                type="submit"
                disabled={tableMutation.isLoading}
                className="w-full py-2 bg-[#facc15] hover:bg-[#fbbf24] text-black font-semibold rounded-md shadow-md hover:shadow-yellow-400/30 transition-all duration-300 text-sm disabled:opacity-60"
              >
                {tableMutation.isLoading ? "Adding..." : "Add Table"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
