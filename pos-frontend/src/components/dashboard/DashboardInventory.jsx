import React, { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import { HiPencil, HiCheck, HiX, HiViewGrid, HiViewList } from "react-icons/hi";
import { MdInventory } from "react-icons/md";
import {
  FaBoxOpen,
  FaBoxes,
  FaExclamationTriangle,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { beverages } from "../../constants";

const EXCHANGE_RATE = 4100;

// Helper function to detect if text contains Khmer characters
const containsKhmer = (text) => /[\u1780-\u17FF]/.test(text);

// Khmer font style
const khmerFontStyle = {
  fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
};

// Function to get font style based on text content
const getTextStyle = (text) => {
  return containsKhmer(text) ? khmerFontStyle : {};
};

const DashboardInventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);

  // Initialize inventory from localStorage or generate new - ONLY BEVERAGES
  const [inventoryItems, setInventoryItems] = useState(() => {
    const saved = localStorage.getItem("inventoryData");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Filter to only show beverages
      return parsed.filter(
        (item) => item.categoryId === 3 || item.categoryId === "3"
      );
    }

    // Generate initial data for beverages only
    return beverages.map((item) => {
      const quantity = Math.floor(Math.random() * 50) + 5;
      let stockStatus = "In Stock";
      if (quantity === 0) stockStatus = "Out of Stock";
      else if (quantity < 15) stockStatus = "Low Stock";

      return {
        ...item,
        _id: item.id.toString(),
        price: item.priceKHR || item.price || 0,
        image: item.Image,
        categoryName: "ភេសជ្ជៈ និងស្រា",
        categoryId: 3,
        stockStatus,
        quantity,
        unit: "portions",
      };
    });
  });

  // Save to localStorage whenever inventory changes
  useEffect(() => {
    // Get existing inventory data
    const saved = localStorage.getItem("inventoryData");
    let allInventory = [];

    if (saved) {
      allInventory = JSON.parse(saved);
      // Update only beverage items
      inventoryItems.forEach((bevItem) => {
        const idx = allInventory.findIndex(
          (i) =>
            i._id === bevItem._id ||
            i.id === bevItem.id ||
            i.id?.toString() === bevItem._id
        );
        if (idx !== -1) {
          allInventory[idx] = {
            ...allInventory[idx],
            quantity: bevItem.quantity,
            stockStatus: bevItem.stockStatus,
          };
        } else {
          allInventory.push(bevItem);
        }
      });
    } else {
      allInventory = inventoryItems;
    }

    localStorage.setItem("inventoryData", JSON.stringify(allInventory));

    // Dispatch storage event for other components
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "inventoryData",
        newValue: JSON.stringify(allInventory),
      })
    );
  }, [inventoryItems]);

  // Listen for storage changes from other components (like POSDashboard)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "inventoryData" && e.newValue) {
        try {
          const allData = JSON.parse(e.newValue);
          // Filter to only beverages
          const beverageData = allData.filter(
            (item) => item.categoryId === 3 || item.categoryId === "3"
          );
          if (JSON.stringify(beverageData) !== JSON.stringify(inventoryItems)) {
            setInventoryItems(beverageData);
          }
        } catch (err) {
          console.error("Error parsing inventory data:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [inventoryItems]);

  // Update stock quantity
  const handleUpdateQuantity = () => {
    if (!editingItem) return;

    const newQuantity = parseInt(editQuantity) || 0;
    let newStatus = "In Stock";
    if (newQuantity === 0) newStatus = "Out of Stock";
    else if (newQuantity < 15) newStatus = "Low Stock";

    setInventoryItems((prev) =>
      prev.map((item) =>
        item._id === editingItem._id
          ? { ...item, quantity: newQuantity, stockStatus: newStatus }
          : item
      )
    );
    setEditingItem(null);
    setEditQuantity(0);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditQuantity(item.quantity);
  };

  // Quick stock adjustment
  const quickAdjustStock = (item, amount) => {
    const newQuantity = Math.max(0, item.quantity + amount);
    let newStatus = "In Stock";
    if (newQuantity === 0) newStatus = "Out of Stock";
    else if (newQuantity < 15) newStatus = "Low Stock";

    setInventoryItems((prev) =>
      prev.map((i) =>
        i._id === item._id
          ? { ...i, quantity: newQuantity, stockStatus: newStatus }
          : i
      )
    );
  };

  // Filter inventory items (beverages only)
  const filteredItems = inventoryItems.filter((item) => {
    if (filterStatus !== "all" && item.stockStatus !== filterStatus)
      return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return item.name?.toLowerCase().includes(query);
    }
    return true;
  });

  // Calculate statistics
  const stats = {
    totalItems: filteredItems.length,
    inStock: filteredItems.filter((i) => i.stockStatus === "In Stock").length,
    lowStock: filteredItems.filter((i) => i.stockStatus === "Low Stock").length,
    outOfStock: filteredItems.filter((i) => i.stockStatus === "Out of Stock")
      .length,
  };

  const formatPrice = (priceKHR) => {
    const price = Number(priceKHR) || 0;
    return {
      usd: (price / EXCHANGE_RATE).toFixed(2),
      khr: price.toLocaleString(),
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "In Stock":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-xs font-semibold">
            <HiCheck size={12} />
            In Stock
          </span>
        );
      case "Low Stock":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-xs font-semibold">
            <FaExclamationTriangle size={10} />
            Low Stock
          </span>
        );
      case "Out of Stock":
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-lg text-xs font-semibold">
            <HiX size={12} />
            Out of Stock
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0 pb-3">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2.5 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.totalItems}</p>
              <p className="text-blue-100 text-[10px]">Total Items</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaBoxes size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-2.5 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.inStock}</p>
              <p className="text-emerald-100 text-[10px]">In Stock</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <HiCheck size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-2.5 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.lowStock}</p>
              <p className="text-amber-100 text-[10px]">Low Stock</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaExclamationTriangle size={12} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-2.5 text-white shadow-lg shadow-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.outOfStock}</p>
              <p className="text-red-100 text-[10px]">Out of Stock</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaBoxOpen size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col flex-1 overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <MdInventory className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-slate-800 font-semibold">
                <span style={khmerFontStyle}>ភេសជ្ជៈ និងស្រា</span> - Beverages
                Inventory
              </h2>
              <p className="text-slate-400 text-xs">
                {filteredItems.length} items • Stock auto-updates on orders
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <IoSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search beverages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 w-40 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-blue-400"
            >
              <option value="all">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <HiViewList size={14} />
                Table
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <HiViewGrid size={14} />
                Grid
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-0">
          {viewMode === "table" ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium w-[5%]">No</th>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium text-center">
                    Quantity
                  </th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => {
                    const price = formatPrice(item.price);
                    return (
                      <tr
                        key={item._id}
                        className={`hover:bg-stone-50 transition-colors ${
                          item.stockStatus === "Out of Stock"
                            ? "opacity-60"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className="text-slate-500 font-medium">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover ring-1 ring-stone-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-lg">
                                🍺
                              </div>
                            )}
                            <p
                              className="font-medium text-slate-700 text-sm"
                              style={getTextStyle(item.name)}
                            >
                              {item.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-bold text-emerald-600">
                              ${price.usd}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              ៛ {price.khr}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => quickAdjustStock(item, -1)}
                              className="w-6 h-6 rounded bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
                            >
                              <FaMinus size={8} />
                            </button>
                            <span
                              className={`inline-flex items-center justify-center min-w-[60px] px-2 py-1 rounded-lg text-xs font-bold ${
                                item.stockStatus === "In Stock"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : item.stockStatus === "Low Stock"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.quantity} {item.unit}
                            </span>
                            <button
                              onClick={() => quickAdjustStock(item, 1)}
                              className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200 flex items-center justify-center"
                            >
                              <FaPlus size={8} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getStatusBadge(item.stockStatus)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Quantity"
                          >
                            <HiPencil size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <FaBoxes
                        size={48}
                        className="mx-auto text-slate-300 mb-3"
                      />
                      <p className="text-slate-500 font-medium">
                        No beverages found
                      </p>
                      <p className="text-slate-400 text-sm">
                        Try adjusting your search or filter
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-4">
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {filteredItems.map((item) => {
                    const price = formatPrice(item.price);
                    return (
                      <div
                        key={item._id}
                        className={`bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all group ${
                          item.stockStatus === "Out of Stock"
                            ? "opacity-60"
                            : ""
                        }`}
                      >
                        <div className="relative h-28 bg-gradient-to-br from-stone-100 to-stone-50 overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <span className="text-4xl group-hover:scale-110 transition-transform flex items-center justify-center h-full">
                              🍺
                            </span>
                          )}

                          <div
                            className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold shadow-lg ${
                              item.stockStatus === "In Stock"
                                ? "bg-emerald-500 text-white"
                                : item.stockStatus === "Low Stock"
                                ? "bg-amber-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {item.quantity} qty
                          </div>

                          <div className="absolute top-2 right-2">
                            {item.stockStatus === "In Stock" ? (
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white block shadow-sm"></span>
                            ) : item.stockStatus === "Low Stock" ? (
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white block shadow-sm"></span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[8px] font-bold">
                                OUT
                              </span>
                            )}
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => quickAdjustStock(item, -1)}
                                className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <FaMinus size={10} />
                              </button>
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1.5 rounded-lg bg-white/90 text-blue-600 hover:bg-white transition-colors shadow-lg backdrop-blur-sm"
                              >
                                <HiPencil size={12} />
                              </button>
                              <button
                                onClick={() => quickAdjustStock(item, 1)}
                                className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg"
                              >
                                <FaPlus size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="p-2.5">
                          <h3
                            className="font-semibold text-slate-800 text-xs line-clamp-1 mb-1"
                            style={getTextStyle(item.name)}
                          >
                            {item.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span
                              className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-blue-100 text-blue-600"
                              style={khmerFontStyle}
                            >
                              ភេសជ្ជៈ
                            </span>
                            <p className="font-bold text-blue-600 text-sm">
                              ${price.usd}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FaBoxes size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">
                    No beverages found
                  </p>
                  <p className="text-slate-400 text-sm">
                    Try adjusting your search or filter
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {filteredItems.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50 flex-shrink-0">
            <span className="text-xs text-slate-500">
              Showing {filteredItems.length} beverages
            </span>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {stats.inStock} In Stock
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {stats.lowStock} Low Stock
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {stats.outOfStock} Out of Stock
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Quantity Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4">
              <h3 className="text-white font-semibold text-lg">
                Update Stock Quantity
              </h3>
              <p className="text-blue-100 text-xs mt-0.5">
                Adjust beverage inventory
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 mb-4 p-3 bg-stone-50 rounded-xl">
                {editingItem.image ? (
                  <img
                    src={editingItem.image}
                    alt={editingItem.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl">
                    🍺
                  </div>
                )}
                <div>
                  <p
                    className="font-semibold text-slate-800 text-sm"
                    style={getTextStyle(editingItem.name)}
                  >
                    {editingItem.name}
                  </p>
                  <p
                    className="text-[10px] text-slate-400"
                    style={khmerFontStyle}
                  >
                    ភេសជ្ជៈ និងស្រា
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-slate-500 mb-1 block">
                  Current Stock
                </label>
                <div
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold ${
                    editingItem.stockStatus === "In Stock"
                      ? "bg-emerald-100 text-emerald-700"
                      : editingItem.stockStatus === "Low Stock"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {editingItem.quantity} {editingItem.unit}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-slate-500 mb-1 block">
                  New Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter new quantity"
                />
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() =>
                    setEditQuantity((prev) => Math.max(0, parseInt(prev) - 10))
                  }
                  className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                >
                  -10
                </button>
                <button
                  onClick={() =>
                    setEditQuantity((prev) => Math.max(0, parseInt(prev) - 5))
                  }
                  className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                >
                  -5
                </button>
                <button
                  onClick={() => setEditQuantity((prev) => parseInt(prev) + 5)}
                  className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                >
                  +5
                </button>
                <button
                  onClick={() => setEditQuantity((prev) => parseInt(prev) + 10)}
                  className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                >
                  +10
                </button>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-stone-100 bg-stone-50">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 py-2.5 border border-stone-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateQuantity}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardInventory;
