import React, { useState, useEffect } from "react";
import { HiViewGrid, HiViewList } from "react-icons/hi";
import { IoSearch, IoRefresh } from "react-icons/io5";
import { MdFastfood, MdOutlineRestaurantMenu } from "react-icons/md";
import {
  allFoods,
  menus,
  papaya,
  cockle,
  beverages,
  crab,
  shrimp,
  octopus,
  Beef,
  chicken,
  Eel,
  Side,
  Fry,
  soup,
} from "../constants";

const EXCHANGE_RATE = 4100;

const containsKhmer = (text) => /[\u1780-\u17FF]/.test(text);
const khmerFontStyle = {
  fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
};
const getTextStyle = (text) => (containsKhmer(text) ? khmerFontStyle : {});

// Helper function to generate initial menu data
const generateInitialMenuData = () => {
  return allFoods.map((item) => {
    let categoryName = "Uncategorized";
    let categoryId = "all";

    if (papaya.find((p) => p.id === item.id)) {
      categoryName = "\u1794\u17BB\u1780\u179B\u17D2\u17A0\u17BB\u1784";
      categoryId = 1;
    } else if (cockle.find((p) => p.id === item.id)) {
      categoryName = "\u1784\u17B6\u179C";
      categoryId = 2;
    } else if (beverages.find((p) => p.id === item.id)) {
      categoryName =
        "\u1797\u17C1\u179F\u1787\u17D2\u1787\u17C8 \u1793\u17B7\u1784\u179F\u17D2\u179A\u17B6";
      categoryId = 3;
    } else if (crab.find((p) => p.id === item.id)) {
      categoryName = "\u1780\u17D2\u178A\u17B6\u1798";
      categoryId = 4;
    } else if (shrimp.find((p) => p.id === item.id)) {
      categoryName = "\u1794\u1784\u17D2\u1782\u17B6";
      categoryId = 5;
    } else if (octopus.find((p) => p.id === item.id)) {
      categoryName = "\u1798\u17B9\u1780";
      categoryId = 6;
    } else if (Beef.find((p) => p.id === item.id)) {
      categoryName = "\u179F\u17B6\u1785\u17CB\u1782\u17C4";
      categoryId = 7;
    } else if (chicken.find((p) => p.id === item.id)) {
      categoryName = "\u1798\u17B6\u1793\u17CB";
      categoryId = 8;
    } else if (Eel.find((p) => p.id === item.id)) {
      categoryName =
        "\u17A2\u1793\u17D2\u1791\u1784\u17CB \u1793\u17B7\u1784\u1791\u17B6";
      categoryId = 9;
    } else if (Side.find((p) => p.id === item.id)) {
      categoryName =
        "\u1782\u17D2\u179A\u17BF\u1784\u1780\u17D2\u179B\u17C2\u1798";
      categoryId = 10;
    } else if (Fry.find((p) => p.id === item.id)) {
      categoryName =
        "\u1794\u17B6\u1799\u1786\u17B6 \u1793\u17B7\u1784\u1798\u17B8\u1786\u17B6";
      categoryId = 11;
    } else if (soup.find((p) => p.id === item.id)) {
      categoryName =
        "\u179F\u17B6\u1785\u17CB\u17A2\u17B6\u17C6\u1784 \u1793\u17B7\u1784\u179F\u17CA\u17BB\u1794";
      categoryId = 12;
    }

    return {
      ...item,
      _id: item.id.toString(),
      price: item.priceKHR || item.price || 0,
      image: item.Image,
      categoryName,
      categoryId,
      isAvailable: true,
    };
  });
};

const Menu = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [menuItems, setMenuItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = menus;

  // Load menu data from localStorage or generate from constants
  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = () => {
    const saved = localStorage.getItem("menuData");
    if (saved) {
      try {
        setMenuItems(JSON.parse(saved));
      } catch (e) {
        const initialData = generateInitialMenuData();
        setMenuItems(initialData);
        localStorage.setItem("menuData", JSON.stringify(initialData));
      }
    } else {
      const initialData = generateInitialMenuData();
      setMenuItems(initialData);
      localStorage.setItem("menuData", JSON.stringify(initialData));
    }
  };

  // Listen for storage changes (when DashboardMenu adds new items)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "menuData" && e.newValue) {
        try {
          setMenuItems(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Error parsing menu data:", err);
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
      loadMenuData();
      setIsRefreshing(false);
    }, 500);
  };

  // Reset to default data
  const handleResetToDefault = () => {
    if (
      window.confirm(
        "Are you sure you want to reset menu to default? This will remove all custom items."
      )
    ) {
      setIsRefreshing(true);
      localStorage.removeItem("menuData");
      setTimeout(() => {
        const initialData = generateInitialMenuData();
        setMenuItems(initialData);
        localStorage.setItem("menuData", JSON.stringify(initialData));
        setIsRefreshing(false);
      }, 500);
    }
  };

  const categoryList = [
    {
      id: "all",
      name: "All",
      icon: "\uD83C\uDF7D\uFE0F",
      count: menuItems.length,
    },
    ...categories
      .filter((cat) => cat.id !== "allFoods")
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: "\uD83C\uDF74",
        count: menuItems.filter(
          (item) => item.categoryId?.toString() === cat.id?.toString()
        ).length,
      })),
  ];

  const formatPrice = (priceKHR) => {
    const price = Number(priceKHR) || 0;
    return {
      usd: (price / EXCHANGE_RATE).toFixed(2),
      khr: price.toLocaleString(),
    };
  };

  const filteredItems = menuItems.filter((item) => {
    if (
      selectedCategory !== "all" &&
      item.categoryId.toString() !== selectedCategory.toString()
    )
      return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return item.name?.toLowerCase().includes(query);
    }
    return true;
  });

  const stats = {
    total: menuItems.length,
    available: menuItems.filter((i) => i.isAvailable !== false).length,
    categories: categories.length - 1,
  };

  return (
    <section className="flex flex-col h-full bg-stone-100 overflow-hidden">
      <div className="flex-shrink-0 bg-white border-b border-stone-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/20">
                <MdOutlineRestaurantMenu className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Menu</h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-500">
                    {stats.total} items
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-xs text-emerald-600 font-medium">
                    {stats.available} available
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-xs text-slate-500">
                    {stats.categories} categories
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
                  ? "bg-amber-100 text-amber-600 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg"
              }`}
              title="Refresh menu data"
            >
              <IoRefresh
                size={18}
                className={isRefreshing ? "animate-spin" : ""}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="px-6 pb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <IoSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
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
          </div>
        </div>

        <div className="px-6 pb-3">
          <div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {categoryList.map((cat) => {
              const isActive =
                selectedCategory.toString() === cat.id.toString();
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-slate-800 text-white shadow-md"
                      : "bg-white text-slate-600 hover:bg-stone-50 border border-stone-200"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span style={getTextStyle(cat.name)}>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      isActive ? "bg-white/20" : "bg-stone-100"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

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
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Price (USD)
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Price (KHR)
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
                          className={`hover:bg-amber-50/30 transition-colors ${
                            item.isAvailable === false ? "opacity-60" : ""
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
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center text-xl ring-1 ring-stone-200/50">
                                  🍴
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
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-stone-100 text-slate-600"
                              style={getTextStyle(item.categoryName)}
                            >
                              {item.categoryName}
                            </span>
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
                            {item.isAvailable !== false ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-red-600 ring-1 ring-red-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Out of Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <MdFastfood
                          className="text-stone-300 mx-auto mb-3"
                          size={40}
                        />
                        <p className="text-slate-500 font-medium">
                          No items found
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
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {menuItems.length}
                  </span>{" "}
                  items
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {stats.available} Available
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {stats.categories} Categories
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
                      className={`bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-amber-200 transition-all group ${
                        item.isAvailable === false ? "opacity-60" : ""
                      }`}
                    >
                      <div className="relative h-28 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span className="text-5xl">🍴</span>
                        )}

                        <div className="absolute top-2 right-2">
                          {item.isAvailable !== false ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white block shadow-sm"></span>
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
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-stone-100 text-slate-500 truncate max-w-[55%]"
                            style={getTextStyle(item.categoryName)}
                          >
                            {item.categoryName}
                          </span>
                          <div className="text-right">
                            <p className="font-bold text-amber-600 text-sm">
                              ${price.usd}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full bg-white rounded-xl border border-stone-200 p-12 text-center">
                  <MdFastfood
                    className="text-stone-300 mx-auto mb-3"
                    size={40}
                  />
                  <p className="text-slate-500 font-medium">No items found</p>
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

export default Menu;
