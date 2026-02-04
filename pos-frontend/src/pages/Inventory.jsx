import React, { useState, useEffect } from "react";
import { IoSearch, IoRefresh } from "react-icons/io5";
import { HiViewGrid, HiViewList } from "react-icons/hi";
import { MdInventory } from "react-icons/md";
import { FaBoxes } from "react-icons/fa";
import { beverages } from "../constants";

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

// Helper function to generate initial beverage inventory data
const generateInitialBeverageData = () => {
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
};

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load inventory data - ONLY BEVERAGES
  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = () => {
    const saved = localStorage.getItem("inventoryData");
    if (saved) {
      try {
        const allData = JSON.parse(saved);
        // Filter to only show beverages (categoryId === 3)
        const beverageData = allData.filter(
          (item) => item.categoryId === 3 || item.categoryId === "3"
        );
        if (beverageData.length > 0) {
          setInventoryItems(beverageData);
        } else {
          // If no beverages found, generate initial data
          const initialData = generateInitialBeverageData();
          setInventoryItems(initialData);
          // Save to localStorage
          const existingData = JSON.parse(saved);
          localStorage.setItem(
            "inventoryData",
            JSON.stringify([...existingData, ...initialData])
          );
        }
      } catch (e) {
        const initialData = generateInitialBeverageData();
        setInventoryItems(initialData);
        localStorage.setItem("inventoryData", JSON.stringify(initialData));
      }
    } else {
      const initialData = generateInitialBeverageData();
      setInventoryItems(initialData);
      localStorage.setItem("inventoryData", JSON.stringify(initialData));
    }
  };

  // Listen for storage changes (when DashboardInventory or POS updates)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "inventoryData" && e.newValue) {
        try {
          const allData = JSON.parse(e.newValue);
          // Filter to only show beverages
          const beverageData = allData.filter(
            (item) => item.categoryId === 3 || item.categoryId === "3"
          );
          setInventoryItems(beverageData);
        } catch (err) {
          console.error("Error parsing inventory data:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Refresh function - reload from localStorage
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadInventoryData();
      setIsRefreshing(false);
    }, 500);
  };

  // Filter inventory items (beverages only)
  const filteredItems = inventoryItems.filter((item) => {
    if (filterStatus !== "all" && item.stockStatus !== filterStatus)
      return false;
    if (searchQuery) {
      return item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Calculate statistics
  const stats = {
    total: filteredItems.length,
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            In Stock
          </span>
        );
      case "Low Stock":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-600 ring-1 ring-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Low Stock
          </span>
        );
      case "Out of Stock":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-red-600 ring-1 ring-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Out of Stock
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section className="flex flex-col h-full bg-stone-100 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-stone-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
                <MdInventory className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  <span style={khmerFontStyle}>ភេសជ្ជៈ និងស្រា</span> -
                  Beverages
                </h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-500">
                    {stats.total} items
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-xs text-emerald-600 font-medium">
                    {stats.inStock} in stock
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-xs text-amber-600 font-medium">
                    {stats.lowStock} low
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-xs text-red-600 font-medium">
                    {stats.outOfStock} out
                  </span>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isRefreshing
                  ? "bg-indigo-100 text-indigo-600 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg"
              }`}
              title="Refresh inventory data"
            >
              <IoRefresh
                size={18}
                className={isRefreshing ? "animate-spin" : ""}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="px-6 pb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <IoSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search beverages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

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

          <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "table"
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <HiViewList size={14} />
              Table
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-slate-800"
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
      <div className="flex-1 overflow-hidden p-6 flex flex-col min-h-0">
        {viewMode === "table" && (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm flex flex-col h-full">
            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full">
                <thead className="bg-stone-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-[5%]">
                      No
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Price (USD)
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Price (KHR)
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => {
                      const price = formatPrice(item.price);
                      return (
                        <tr
                          key={item._id}
                          className={`hover:bg-blue-50/30 transition-colors ${
                            item.stockStatus === "Out of Stock"
                              ? "opacity-60"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <span className="text-slate-500 font-medium text-sm">
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
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-xl">
                                  🍺
                                </div>
                              )}
                              <p
                                className="font-semibold text-slate-800 text-sm"
                                style={getTextStyle(item.name)}
                              >
                                {item.name}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-emerald-600 text-sm">
                              ${price.usd}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-slate-500 text-xs">
                              ៛ {price.khr}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center min-w-[50px] px-2 py-1 rounded-lg text-xs font-bold ${
                                item.stockStatus === "In Stock"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : item.stockStatus === "Low Stock"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(item.stockStatus)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <FaBoxes
                          className="text-stone-300 mx-auto mb-3"
                          size={40}
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
            </div>

            {filteredItems.length > 0 && (
              <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between bg-stone-50 flex-shrink-0">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredItems.length}
                  </span>{" "}
                  beverages
                </p>
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
        )}

        {viewMode === "grid" && (
          <div className="flex-1 overflow-auto min-h-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const price = formatPrice(item.price);
                  return (
                    <div
                      key={item._id}
                      className={`bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all group ${
                        item.stockStatus === "Out of Stock" ? "opacity-60" : ""
                      }`}
                    >
                      <div className="relative h-28 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span className="text-5xl">🍺</span>
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
                      </div>
                      <div className="p-3">
                        <h3
                          className="font-semibold text-slate-800 text-sm line-clamp-1 mb-1"
                          style={getTextStyle(item.name)}
                        >
                          {item.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-100 text-blue-600"
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
                })
              ) : (
                <div className="col-span-full bg-white rounded-xl border border-stone-200 p-12 text-center">
                  <FaBoxes className="text-stone-300 mx-auto mb-3" size={40} />
                  <p className="text-slate-500 font-medium">
                    No beverages found
                  </p>
                  <p className="text-slate-400 text-sm">
                    Try adjusting your search or filter
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
};

export default Inventory;
