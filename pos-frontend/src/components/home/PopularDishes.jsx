import React, { useState, useEffect } from "react";
import { HiFire } from "react-icons/hi";
import { FaStar } from "react-icons/fa";
import { BiDish } from "react-icons/bi";
import { IoRefresh } from "react-icons/io5";
import { allFoods } from "../../constants";

// Helper function to detect if text contains Khmer characters
const containsKhmer = (text) => /[\u1780-\u17FF]/.test(text);

const khmerFontStyle = {
  fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
};

const getTextStyle = (text) => {
  return containsKhmer(text) ? khmerFontStyle : {};
};

const PopularDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularDishes();
  }, []);

  const fetchPopularDishes = async () => {
    try {
      setLoading(true);

      // Fetch top items from dashboard API
      const topItemsRes = await fetch(
        "http://localhost:8000/api/dashboard/top-items",
        { credentials: "include" }
      );
      const topItemsResult = await topItemsRes.json();

      if (topItemsResult.success && topItemsResult.data) {
        // Create a map of dish names to images from allFoods constant
        const dishImageMap = new Map();

        // First, add images from allFoods constant
        allFoods.forEach((food) => {
          if (food.name) {
            dishImageMap.set(food.name.toLowerCase().trim(), food.Image);
          }
        });

        // Then, check localStorage for menuData (new items added via dashboard)
        const savedMenuData = localStorage.getItem("menuData");
        if (savedMenuData) {
          try {
            const menuItems = JSON.parse(savedMenuData);
            menuItems.forEach((item) => {
              if (item.name) {
                // Use image from localStorage (could be item.image or item.Image)
                const itemImage = item.image || item.Image;
                if (itemImage) {
                  dishImageMap.set(item.name.toLowerCase().trim(), itemImage);
                }
              }
            });
          } catch (e) {
            console.error("Error parsing menuData from localStorage:", e);
          }
        }

        // Merge top items with images
        const topItemsWithImages = topItemsResult.data
          .slice(0, 6)
          .map((item) => {
            const itemName = item.name?.toLowerCase().trim();
            const image = dishImageMap.get(itemName) || null;

            return {
              ...item,
              image: image,
            };
          });

        setDishes(topItemsWithImages);
      } else {
        setDishes([]);
      }
    } catch (err) {
      console.error("Error fetching popular dishes:", err);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalOrders = dishes.reduce((acc, d) => acc + (d.quantity || 0), 0);
  const totalRevenue = dishes.reduce((acc, d) => acc + (d.revenue || 0), 0);

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <HiFire className="text-red-500" size={18} />
            </div>
            <div>
              <h2 className="text-slate-800 text-sm font-semibold">
                Popular Dishes
              </h2>
              <p className="text-slate-400 text-xs">Top selling items</p>
            </div>
          </div>
        </div>

        {/* Loading Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-stone-50 rounded-xl p-3 border border-stone-100 animate-pulse"
              >
                <div className="w-full h-24 bg-stone-200 rounded-lg mb-2"></div>
                <div className="h-4 w-3/4 bg-stone-200 rounded mb-2"></div>
                <div className="flex justify-between">
                  <div className="h-3 w-12 bg-stone-200 rounded"></div>
                  <div className="h-3 w-16 bg-stone-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (dishes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <HiFire className="text-red-500" size={18} />
            </div>
            <div>
              <h2 className="text-slate-800 text-sm font-semibold">
                Popular Dishes
              </h2>
              <p className="text-slate-400 text-xs">Top selling items</p>
            </div>
          </div>
          <button
            onClick={fetchPopularDishes}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <IoRefresh size={16} />
          </button>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <BiDish size={48} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No sales data yet</p>
          <p className="text-slate-400 text-sm">
            Complete some orders to see popular dishes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-100 rounded-lg">
            <HiFire className="text-red-500" size={18} />
          </div>
          <div>
            <h2 className="text-slate-800 text-sm font-semibold">
              Popular Dishes
            </h2>
            <p className="text-slate-400 text-xs">Top selling items</p>
          </div>
        </div>
        <button
          onClick={fetchPopularDishes}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-stone-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <IoRefresh size={16} />
        </button>
      </div>

      {/* Dishes Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {dishes.map((dish, index) => (
            <div
              key={dish._id || dish.name || index}
              className="group bg-stone-50 hover:bg-white rounded-xl p-3 border border-stone-100 hover:border-amber-200 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-lg mb-2 h-24 bg-gradient-to-br from-amber-50 to-orange-50">
                {dish.image ? (
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                {/* Fallback Icon */}
                <div
                  className={`w-full h-full flex items-center justify-center absolute inset-0 ${
                    dish.image ? "hidden" : ""
                  }`}
                  style={{ display: dish.image ? "none" : "flex" }}
                >
                  <BiDish size={32} className="text-amber-300" />
                </div>

                {/* Rank Badge */}
                {index < 3 && (
                  <div
                    className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${
                      index === 0
                        ? "bg-amber-500"
                        : index === 1
                        ? "bg-slate-400"
                        : "bg-amber-700"
                    }`}
                  >
                    #{index + 1}
                  </div>
                )}
              </div>

              {/* Info */}
              <h3
                className="text-slate-800 font-semibold text-xs truncate"
                style={getTextStyle(dish.name || "")}
              >
                {dish.name || "Unknown"}
              </h3>

              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1">
                  <FaStar className="text-amber-400" size={10} />
                  <span className="text-slate-500 text-[10px]">
                    ${dish.revenue?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <span className="text-amber-600 font-bold text-xs">
                  {dish.quantity || 0} sold
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-3 border-t border-stone-100 bg-stone-50">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-slate-800">{totalOrders}</p>
            <p className="text-[10px] text-slate-400">Total Sold</p>
          </div>
          <div className="w-px h-8 bg-stone-200" />
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-slate-800">{dishes.length}</p>
            <p className="text-[10px] text-slate-400">Top Dishes</p>
          </div>
          <div className="w-px h-8 bg-stone-200" />
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-emerald-600">
              ${totalRevenue.toFixed(0)}
            </p>
            <p className="text-[10px] text-slate-400">Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;
