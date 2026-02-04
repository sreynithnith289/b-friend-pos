import React, { useState, useEffect, useCallback } from "react";
import { menus, allFoods } from "../../constants";
import { FaShoppingCart } from "react-icons/fa";
import { IoSearch, IoRefresh } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../../redux/slices/cartSlice";

// Helper function to detect if text contains Khmer characters
const containsKhmer = (text) => /[\u1780-\u17FF]/.test(text);

// Khmer font style - Kantumruy Pro for professional look
const khmerFontStyle = {
  fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
};

const MenuContainer = () => {
  const [selected, setSelected] = useState(menus[0]);
  const [products, setProducts] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [beverageStock, setBeverageStock] = useState({});
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [warning, setWarning] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const dispatch = useDispatch();
  const customer = useSelector((state) => state.customer);

  // Load beverage stock from localStorage
  const loadBeverageStock = useCallback(() => {
    const savedInventory = localStorage.getItem("inventoryData");
    if (savedInventory) {
      try {
        const inventoryItems = JSON.parse(savedInventory);
        // Filter only beverages (categoryId === 3)
        const beverages = inventoryItems.filter(
          (item) => item.categoryId === 3 || item.categoryId === "3"
        );
        // Create a map of beverage stock by name and id
        const stockMap = {};
        beverages.forEach((item) => {
          stockMap[item.name] = {
            quantity: item.quantity,
            stockStatus: item.stockStatus,
          };
          stockMap[item._id] = {
            quantity: item.quantity,
            stockStatus: item.stockStatus,
          };
          stockMap[item.id] = {
            quantity: item.quantity,
            stockStatus: item.stockStatus,
          };
        });
        return stockMap;
      } catch (e) {
        return {};
      }
    }
    return {};
  }, []);

  // Load menu items from localStorage or fall back to constants
  const loadMenuItems = useCallback(() => {
    const saved = localStorage.getItem("menuData");
    if (saved) {
      const parsedData = JSON.parse(saved);
      // Transform data to match expected format
      return parsedData.map((item) => ({
        id: item._id || item.id,
        name: item.name,
        priceKHR: item.price || item.priceKHR,
        priceUSD: item.price ? item.price / 4100 : item.priceUSD,
        Image: item.image || item.Image,
        categoryId: item.categoryId,
        isAvailable: item.isAvailable !== false,
      }));
    }
    return allFoods;
  }, []);

  // Initial load
  useEffect(() => {
    const items = loadMenuItems();
    setAllMenuItems(items);
    const stock = loadBeverageStock();
    setBeverageStock(stock);
  }, [loadMenuItems, loadBeverageStock]);

  // Listen for inventory changes (storage events)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "inventoryData") {
        const stock = loadBeverageStock();
        setBeverageStock(stock);
      }
      if (e.key === "menuData") {
        const items = loadMenuItems();
        setAllMenuItems(items);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadBeverageStock, loadMenuItems]);

  // Refresh function
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const items = loadMenuItems();
      setAllMenuItems(items);
      const stock = loadBeverageStock();
      setBeverageStock(stock);
      setIsRefreshing(false);
    }, 300);
  };

  // Check if item is a beverage (categoryId === 3)
  const isBeverage = (item) => {
    return item.categoryId === 3 || item.categoryId === "3";
  };

  // Get stock info for an item (only for beverages)
  const getStockInfo = (item) => {
    if (!isBeverage(item)) {
      return null; // No stock tracking for non-beverages
    }
    // Try to find stock by name or id
    return (
      beverageStock[item.name] ||
      beverageStock[item.id] ||
      beverageStock[item._id] ||
      null
    );
  };

  // Filter products based on selected category and search
  useEffect(() => {
    let items = [];

    if (selected.id === "all" || selected.id === "allFoods") {
      // Show all available items
      items = allMenuItems.filter((item) => item.isAvailable !== false);
    } else {
      // Filter by category
      items = allMenuItems.filter(
        (item) =>
          item.categoryId?.toString() === selected.id?.toString() &&
          item.isAvailable !== false
      );
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(query));
    }

    setProducts(items);
  }, [selected, searchQuery, allMenuItems]);

  // Handle direct quantity input
  const handleQuantityInput = (item, value) => {
    // Allow empty string for clearing
    if (value === "") {
      setQuantities((prev) => ({ ...prev, [item.id]: "" }));
      return;
    }

    const num = parseInt(value) || 0;
    const stockInfo = getStockInfo(item);

    // For beverages, check stock limit
    if (stockInfo) {
      const maxQty = stockInfo.quantity || 0;
      if (num > maxQty) {
        showWarning(`Only ${maxQty} in stock!`);
        setQuantities((prev) => ({ ...prev, [item.id]: maxQty }));
        return;
      }
    }

    // Limit to max 999 for any item
    const finalQty = Math.max(0, Math.min(num, 999));
    setQuantities((prev) => ({ ...prev, [item.id]: finalQty }));
  };

  const increment = (item) => {
    const stockInfo = getStockInfo(item);
    const currentQty = parseInt(quantities[item.id]) || 0;

    // For beverages, check stock limit
    if (stockInfo) {
      const maxQty = stockInfo.quantity || 0;

      if (stockInfo.quantity <= 0) {
        showWarning("Item is out of stock!");
        return;
      }

      if (currentQty >= maxQty) {
        showWarning(`Only ${stockInfo.quantity} in stock!`);
        return;
      }
    }

    // Limit to 999 for non-beverages
    if (currentQty >= 999) {
      return;
    }

    setQuantities((prev) => ({
      ...prev,
      [item.id]: currentQty + 1,
    }));
  };

  const decrement = (item) => {
    const currentQty = parseInt(quantities[item.id]) || 0;
    setQuantities((prev) => ({
      ...prev,
      [item.id]: Math.max(currentQty - 1, 0),
    }));
  };

  const showWarning = (message) => {
    setWarning(message);
    setTimeout(() => setWarning(""), 2000);
  };

  const handleCartButton = (item) => {
    if (!customer?.customerName || customer.customerName.trim() === "") {
      showWarning("Please input customer information first");
      return;
    }

    const count = parseInt(quantities[item.id]) || 0;
    if (count === 0) {
      showWarning("Please select quantity first");
      return;
    }

    // For beverages, check stock availability
    const stockInfo = getStockInfo(item);
    if (stockInfo) {
      if (stockInfo.stockStatus === "Out of Stock" || stockInfo.quantity <= 0) {
        showWarning("Item is out of stock!");
        return;
      }

      if (count > stockInfo.quantity) {
        showWarning(`Only ${stockInfo.quantity} available in stock!`);
        return;
      }
    }

    dispatch(
      addItem({
        id: item.id,
        name: item.name,
        quantity: count,
        priceKHR: item.priceKHR,
        priceUSD: item.priceUSD,
      })
    );

    setQuantities((prev) => ({ ...prev, [item.id]: 0 }));
  };

  // Function to get font style based on text content
  const getTextStyle = (text) => {
    return containsKhmer(text) ? khmerFontStyle : {};
  };

  // Get stock status badge (only for beverages)
  const getStockBadge = (item) => {
    const stockInfo = getStockInfo(item);

    // No badge for non-beverages
    if (!stockInfo) {
      return null;
    }

    if (stockInfo.stockStatus === "Out of Stock" || stockInfo.quantity <= 0) {
      return (
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-red-500 text-white shadow-lg">
          Out of Stock
        </span>
      );
    }
    if (stockInfo.stockStatus === "Low Stock" || stockInfo.quantity < 15) {
      return (
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500 text-white shadow-lg">
          {stockInfo.quantity} left
        </span>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-stone-50 to-stone-100">
      {/* Warning Toast */}
      {warning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-5 py-2.5 rounded-xl shadow-xl z-[999] font-medium text-sm flex items-center gap-2">
          <span className="animate-pulse">⚠</span> {warning}
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-20 px-4 py-3 border-b border-stone-200 shadow-sm space-y-3">
        {/* Search and Refresh */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <IoSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-slate-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200 hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 ${
              isRefreshing ? "opacity-70 cursor-not-allowed" : ""
            }`}
            title="Refresh menu"
          >
            <IoRefresh
              size={18}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span className="text-sm font-medium hidden sm:inline">
              Refresh
            </span>
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => {
                setSelected(menu);
                setQuantities({});
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                selected.id === menu.id
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {/* Apply Khmer font only if text contains Khmer characters */}
              <span style={getTextStyle(menu.name)}>{menu.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((item) => {
            const stockInfo = getStockInfo(item);
            const isOutOfStock =
              stockInfo &&
              (stockInfo.stockStatus === "Out of Stock" ||
                stockInfo.quantity <= 0);
            const currentQty = quantities[item.id];

            return (
              <div
                key={item.id}
                className={`group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 overflow-hidden ${
                  isOutOfStock ? "opacity-60" : ""
                }`}
              >
                {/* Image */}
                <div className="relative h-36 bg-gradient-to-br from-stone-100 to-stone-50 overflow-hidden">
                  {item.Image ? (
                    <img
                      src={item.Image}
                      alt={item.name}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        isOutOfStock ? "grayscale" : "group-hover:scale-105"
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">
                        {isBeverage(item) ? "🍺" : "🍴"}
                      </span>
                    </div>
                  )}

                  {/* Stock Badge (only for beverages) */}
                  {getStockBadge(item)}

                  {/* Cart Button */}
                  <button
                    onClick={() => handleCartButton(item)}
                    disabled={isOutOfStock}
                    className={`absolute top-2 right-2 p-2 rounded-lg shadow-lg transition-all duration-200 ${
                      isOutOfStock
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-amber-300 hover:scale-110"
                    }`}
                  >
                    <FaShoppingCart size={12} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3">
                  {/* Food name - Khmer font only if contains Khmer text */}
                  <h2
                    className="text-slate-800 font-semibold text-sm mb-2 line-clamp-1"
                    style={getTextStyle(item.name)}
                  >
                    {item.name}
                  </h2>

                  <div className="flex items-center justify-between">
                    <div>
                      {/* Prices - always use default font (no lang attribute) */}
                      <p className="text-amber-600 font-bold text-sm">
                        $
                        {typeof item.priceUSD === "number"
                          ? item.priceUSD.toFixed(2)
                          : "0.00"}
                      </p>
                      <p className="text-stone-400 text-xs">
                        {typeof item.priceKHR === "number"
                          ? item.priceKHR.toLocaleString()
                          : "0"}{" "}
                        <span style={khmerFontStyle}>៛</span>
                      </p>
                    </div>

                    {/* Quantity Controls with Input */}
                    <div
                      className={`flex items-center bg-stone-100 rounded-lg overflow-hidden ${
                        isOutOfStock ? "opacity-50" : ""
                      }`}
                    >
                      <button
                        onClick={() => decrement(item)}
                        disabled={isOutOfStock}
                        className="px-2 py-1.5 text-stone-500 hover:bg-stone-200 font-bold text-sm disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={stockInfo ? stockInfo.quantity : 999}
                        value={currentQty === "" ? "" : currentQty || 0}
                        onChange={(e) =>
                          handleQuantityInput(item, e.target.value)
                        }
                        disabled={isOutOfStock}
                        className="w-8 py-1.5 text-slate-800 font-semibold text-xs text-center bg-white border-x border-stone-200 focus:outline-none focus:bg-amber-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0"
                      />
                      <button
                        onClick={() => increment(item)}
                        disabled={isOutOfStock}
                        className="px-2 py-1.5 text-stone-500 hover:bg-stone-200 font-bold text-sm disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Stock indicator (only for beverages) */}
                  {stockInfo && !isOutOfStock && (
                    <div className="mt-2 flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          stockInfo.quantity < 15
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      ></span>
                      <span
                        className={`text-[10px] font-medium ${
                          stockInfo.quantity < 15
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {stockInfo.quantity} in stock
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {products.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-stone-400">
              <IoSearch size={40} className="mb-2 opacity-40" />
              <p className="font-medium">No items found</p>
              <button
                onClick={handleRefresh}
                className="mt-3 text-amber-500 text-sm font-medium hover:text-amber-600 flex items-center gap-1"
              >
                <IoRefresh size={14} />
                Try refreshing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuContainer;
