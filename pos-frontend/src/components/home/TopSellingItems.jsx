import React, { useState, useEffect } from "react";
import { FiAward, FiTrendingUp } from "react-icons/fi";
import { BiDish } from "react-icons/bi";

// Helper function to detect if text contains Khmer characters
const containsKhmer = (text) => /[\u1780-\u17FF]/.test(text);

// Khmer font style - Kantumruy Pro for professional look
const khmerFontStyle = {
  fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
};

// Function to get font style based on text content
const getTextStyle = (text) => {
  return containsKhmer(text) ? khmerFontStyle : {};
};

const TopSellingItems = () => {
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopItems();
  }, []);

  const fetchTopItems = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8000/api/dashboard/top-items",
        { credentials: "include" }
      );
      const result = await response.json();

      if (result.success && result.data) {
        setTopItems(result.data.slice(0, 4)); // Top 4 items only
      }
    } catch (error) {
      console.error("Error fetching top items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Medal colors for top 3
  const getMedalColor = (index) => {
    switch (index) {
      case 0:
        return "from-yellow-400 to-amber-500"; // Gold
      case 1:
        return "from-slate-300 to-slate-400"; // Silver
      case 2:
        return "from-amber-600 to-amber-700"; // Bronze
      default:
        return "from-stone-200 to-stone-300";
    }
  };

  const getMedalBg = (index) => {
    switch (index) {
      case 0:
        return "bg-yellow-50 border-yellow-200 hover:border-yellow-300";
      case 1:
        return "bg-slate-50 border-slate-200 hover:border-slate-300";
      case 2:
        return "bg-amber-50 border-amber-200 hover:border-amber-300";
      default:
        return "bg-white border-stone-100 hover:border-stone-200";
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-stone-200 rounded-lg animate-pulse"></div>
            <div className="h-4 w-28 bg-stone-200 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-16 bg-stone-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-stone-50 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-stone-200 rounded-full"></div>
                <div className="h-4 w-16 bg-stone-200 rounded"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-12 bg-stone-200 rounded"></div>
                <div className="h-3 w-10 bg-stone-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (topItems.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <FiAward className="text-amber-600" size={16} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            Top Selling Items
          </h3>
        </div>
        <div className="flex items-center justify-center py-6 text-slate-400">
          <BiDish size={28} className="mr-2 opacity-30" />
          <p className="text-sm">No sales data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <FiAward className="text-amber-600" size={16} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            Top Selling Items
          </h3>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
          <FiTrendingUp size={12} />
          <span>All time</span>
        </div>
      </div>

      {/* Items Grid - 4 columns */}
      <div className="grid grid-cols-4 gap-3">
        {topItems.map((item, index) => (
          <div
            key={index}
            className={`rounded-xl p-4 border transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-default ${getMedalBg(
              index
            )}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {/* Rank Badge */}
              <div
                className={`w-6 h-6 rounded-full bg-gradient-to-br ${getMedalColor(
                  index
                )} flex items-center justify-center text-white text-[10px] font-bold shadow-sm flex-shrink-0`}
              >
                {index + 1}
              </div>
              {/* Item Name */}
              <p
                className="text-sm font-semibold text-slate-700 truncate flex-1"
                style={getTextStyle(item.name)}
              >
                {item.name}
              </p>
            </div>
            {/* Quantity & Revenue */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-500">
                {item.quantity} sold
              </span>
              <span className="text-xs text-emerald-600 font-bold">
                ${item.revenue?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellingItems;
