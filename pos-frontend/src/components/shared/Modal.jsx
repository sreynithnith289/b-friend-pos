import React from "react";

const Modal = ({ title, onClose, isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] shadow-xl w-full max-w-sm mx-4 rounded-xl p-5 transform transition-all duration-300 scale-95">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 border-b border-[#333] pb-2">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            className="text-gray-400 hover:text-white text-xl transition-colors"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
