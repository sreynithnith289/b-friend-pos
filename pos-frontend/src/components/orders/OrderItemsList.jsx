import React from "react";

const OrderItemsList = ({ items }) => {
  const formatUSD = (khr) => ((khr || 0) / 4100).toFixed(2);

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-slate-400 text-sm">No items</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-white rounded-lg p-2.5 shadow-sm border border-stone-100"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
              ×{item.quantity}
            </span>
            <span className="text-xs text-slate-700 truncate">{item.name}</span>
          </div>
          <span className="text-xs font-bold text-slate-700 flex-shrink-0 ml-2">
            ${formatUSD(item.price * item.quantity)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default OrderItemsList;
