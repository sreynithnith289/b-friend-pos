import React, { useState, useRef, useEffect } from "react";
import { IoSearch, IoCloudUpload, IoImage, IoClose } from "react-icons/io5";
import {
  HiPencil,
  HiTrash,
  HiCheck,
  HiX,
  HiPlus,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";
import {
  MdOutlineRestaurantMenu,
  MdFastfood,
  MdCategory,
} from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";
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
} from "../../constants";

const EXCHANGE_RATE = 4100;

const containsKhmer = (text) => /[\u1780-\u17FF]/.test(text);
const khmerFontStyle = {
  fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
};
const getTextStyle = (text) => (containsKhmer(text) ? khmerFontStyle : {});

const getCategoryInfo = (itemId) => {
  if (papaya.find((p) => p.id === itemId)) return { name: "បុកល្ហុង", id: 1 };
  if (cockle.find((p) => p.id === itemId)) return { name: "ងាវ", id: 2 };
  if (beverages.find((p) => p.id === itemId))
    return { name: "ភេសជ្ជៈ និងស្រា", id: 3 };
  if (crab.find((p) => p.id === itemId)) return { name: "ក្តាម", id: 4 };
  if (shrimp.find((p) => p.id === itemId)) return { name: "បង្គា", id: 5 };
  if (octopus.find((p) => p.id === itemId)) return { name: "មឹក", id: 6 };
  if (Beef.find((p) => p.id === itemId)) return { name: "សាច់គោ", id: 7 };
  if (chicken.find((p) => p.id === itemId)) return { name: "មាន់", id: 8 };
  if (Eel.find((p) => p.id === itemId)) return { name: "អន្ទង់ និងទា", id: 9 };
  if (Side.find((p) => p.id === itemId)) return { name: "គ្រឿងក្លែម", id: 10 };
  if (Fry.find((p) => p.id === itemId))
    return { name: "បាយឆា និងមីឆា", id: 11 };
  if (soup.find((p) => p.id === itemId))
    return { name: "សាច់អាំង និងស៊ុប", id: 12 };
  return { name: "Uncategorized", id: "all" };
};

const DashboardMenu = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    priceKHR: 0,
    priceUSD: 0,
    categoryId: "",
    isAvailable: true,
  });

  // Add Item modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    priceKHR: 0,
    priceUSD: "0.00",
    categoryId: "1",
    imagePreview: null,
    isAvailable: true,
  });
  const [dragActive, setDragActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);

  const categories = menus;

  // Load menu items from localStorage or generate initial data
  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem("menuData");
    if (saved) {
      return JSON.parse(saved);
    }
    // Generate initial data from constants
    return allFoods.map((item) => {
      const catInfo = getCategoryInfo(item.id);
      return {
        ...item,
        _id: item.id.toString(),
        price: item.priceKHR || item.price || 0,
        image: item.Image,
        categoryName: catInfo.name,
        categoryId: catInfo.id,
        isAvailable: true,
      };
    });
  });

  // Save menu items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("menuData", JSON.stringify(menuItems));
  }, [menuItems]);

  // Sync new item to inventory with default 10 quantity
  const syncToInventory = (newItem) => {
    const inventoryData = localStorage.getItem("inventoryData");
    let inventory = inventoryData ? JSON.parse(inventoryData) : [];

    const exists = inventory.find((item) => item._id === newItem._id);
    if (!exists) {
      const inventoryItem = {
        ...newItem,
        quantity: 10,
        stockStatus: "In Stock",
        unit: "portions",
      };
      inventory = [inventoryItem, ...inventory];
      localStorage.setItem("inventoryData", JSON.stringify(inventory));
    }
  };

  // Remove from inventory when deleted
  const removeFromInventory = (itemId) => {
    const inventoryData = localStorage.getItem("inventoryData");
    if (inventoryData) {
      let inventory = JSON.parse(inventoryData);
      inventory = inventory.filter((item) => item._id !== itemId);
      localStorage.setItem("inventoryData", JSON.stringify(inventory));
    }
  };

  // Update inventory when menu item is edited
  const updateInventoryItem = (updatedItem) => {
    const inventoryData = localStorage.getItem("inventoryData");
    if (inventoryData) {
      let inventory = JSON.parse(inventoryData);
      inventory = inventory.map((item) =>
        item._id === updatedItem._id
          ? {
              ...item,
              name: updatedItem.name,
              price: updatedItem.price,
              categoryName: updatedItem.categoryName,
              categoryId: updatedItem.categoryId,
              image: updatedItem.image,
            }
          : item
      );
      localStorage.setItem("inventoryData", JSON.stringify(inventory));
    }
  };

  const stats = {
    totalItems: menuItems.length,
    availableItems: menuItems.filter((i) => i.isAvailable !== false).length,
    outOfStock: menuItems.filter((i) => i.isAvailable === false).length,
    totalCategories: categories.length - 1,
  };

  const filteredItems = menuItems.filter((item) => {
    if (
      filterCategory !== "all" &&
      item.categoryId.toString() !== filterCategory
    )
      return false;
    if (filterStatus === "available" && item.isAvailable === false)
      return false;
    if (filterStatus === "outofstock" && item.isAvailable !== false)
      return false;
    if (searchQuery)
      return item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  const formatPrice = (priceKHR) => {
    const price = Number(priceKHR) || 0;
    return {
      usd: (price / EXCHANGE_RATE).toFixed(2),
      khr: price.toLocaleString(),
    };
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name || "",
      priceKHR: item.price || 0,
      priceUSD: (item.price / EXCHANGE_RATE).toFixed(2),
      categoryId: item.categoryId?.toString() || "",
      isAvailable: item.isAvailable !== false,
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "priceKHR")
        updated.priceUSD = (Number(value) / EXCHANGE_RATE).toFixed(2);
      else if (field === "priceUSD")
        updated.priceKHR = Math.round(Number(value) * EXCHANGE_RATE);
      return updated;
    });
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    const selectedCategory = categories.find(
      (c) => c.id.toString() === editForm.categoryId
    );
    setMenuItems((prev) =>
      prev.map((item) =>
        item._id === editingItem._id
          ? {
              ...item,
              name: editForm.name,
              price: Number(editForm.priceKHR),
              categoryId: editForm.categoryId,
              categoryName: selectedCategory?.name || item.categoryName,
              isAvailable: editForm.isAvailable,
            }
          : item
      )
    );
    const updatedItem = {
      ...editingItem,
      name: editForm.name,
      price: Number(editForm.priceKHR),
      categoryId: editForm.categoryId,
      categoryName: selectedCategory?.name || editingItem.categoryName,
    };
    updateInventoryItem(updatedItem);
    setEditingItem(null);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    setMenuItems((prev) =>
      prev.filter((item) => item._id !== deletingItem._id)
    );
    removeFromInventory(deletingItem._id); // Add this line
    setDeletingItem(null);
  };
  // Add Item handlers
  const openAddModal = () => {
    setAddForm({
      name: "",
      priceKHR: 0,
      priceUSD: "0.00",
      categoryId: "1",
      imagePreview: null,
      isAvailable: true,
    });
    setDragActive(false);
    setIsAddModalOpen(true);
  };

  const handleAddChange = (field, value) => {
    setAddForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "priceKHR") {
        updated.priceUSD = (Number(value) / EXCHANGE_RATE).toFixed(2);
      } else if (field === "priceUSD") {
        updated.priceKHR = Math.round(Number(value) * EXCHANGE_RATE);
      }
      return updated;
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAddForm((prev) => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setAddForm((prev) => ({ ...prev, imagePreview: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddItem = () => {
    if (!addForm.name.trim()) {
      alert("Please enter a dish name");
      return;
    }
    if (addForm.priceKHR <= 0) {
      alert("Please enter a valid price");
      return;
    }

    const selectedCategory = categories.find(
      (c) => c.id.toString() === addForm.categoryId
    );
    const newId = Date.now().toString();

    const newItem = {
      _id: newId,
      id: newId,
      name: addForm.name.trim(),
      price: Number(addForm.priceKHR),
      priceKHR: Number(addForm.priceKHR),
      image: addForm.imagePreview || null,
      categoryId: addForm.categoryId,
      categoryName: selectedCategory?.name || "Uncategorized",
      isAvailable: addForm.isAvailable,
    };

    setMenuItems((prev) => [newItem, ...prev]);
    syncToInventory(newItem); // Add this line
    setIsAddModalOpen(false);

    // Show success message
    setSuccessMessage({
      name: addForm.name.trim(),
      image: addForm.imagePreview,
    });

    // Auto hide after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
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
              <MdFastfood size={14} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-2.5 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.availableItems}</p>
              <p className="text-emerald-100 text-[10px]">Available</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <HiCheck size={14} />
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
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-2.5 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.totalCategories}</p>
              <p className="text-amber-100 text-[10px]">Categories</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <MdCategory size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col flex-1 overflow-hidden min-h-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <MdOutlineRestaurantMenu className="text-amber-600" size={20} />
            </div>
            <div>
              <h2 className="text-slate-800 font-semibold">Menu Items</h2>
              <p className="text-slate-400 text-xs">
                {filteredItems.length} items found
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <IoSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 w-40 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-slate-600"
              style={khmerFontStyle}
            >
              <option value="all">All Categories</option>
              {categories
                .filter((cat) => cat.id !== "allFoods")
                .map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id.toString()}
                    style={getTextStyle(cat.name)}
                  >
                    {cat.name}
                  </option>
                ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-slate-600"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="outofstock">Out of Stock</option>
            </select>
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500"
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
                    : "text-slate-500"
                }`}
              >
                <HiViewGrid size={14} />
                Grid
              </button>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 transition-all duration-200"
            >
              <HiPlus size={14} />
              Add Item
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          {viewMode === "table" ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium w-[5%]">No</th>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price (USD)</th>
                  <th className="px-4 py-3 font-medium">Price (KHR)</th>
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
                          item.isAvailable === false ? "opacity-60" : ""
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
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-lg">
                                🍴
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
                          <span
                            className="bg-stone-100 text-slate-600 px-2 py-1 rounded text-xs font-medium"
                            style={getTextStyle(item.categoryName)}
                          >
                            {item.categoryName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-emerald-600">
                            ${price.usd}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          ៛ {price.khr}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.isAvailable !== false ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-xs font-semibold">
                              <HiCheck size={12} />
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-lg text-xs font-semibold">
                              <HiX size={12} />
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <HiPencil size={16} />
                            </button>
                            <button
                              onClick={() => setDeletingItem(item)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <HiTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <MdFastfood
                        size={48}
                        className="mx-auto text-slate-300 mb-3"
                      />
                      <p className="text-slate-500 font-medium">
                        No menu items found
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
                        className={`bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-amber-300 transition-all group ${
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
                            <span className="text-4xl">🍴</span>
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3 gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2 rounded-lg bg-white/90 text-blue-600 hover:bg-white transition-colors shadow-lg"
                            >
                              <HiPencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeletingItem(item)}
                              className="p-2 rounded-lg bg-white/90 text-red-600 hover:bg-white transition-colors shadow-lg"
                            >
                              <HiTrash size={14} />
                            </button>
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
                              className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-stone-100 text-slate-500 truncate max-w-[60%]"
                              style={getTextStyle(item.categoryName)}
                            >
                              {item.categoryName}
                            </span>
                            <p className="font-bold text-amber-600 text-sm">
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
                  <MdFastfood
                    size={48}
                    className="mx-auto text-slate-300 mb-3"
                  />
                  <p className="text-slate-500 font-medium">
                    No menu items found
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {filteredItems.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50 flex-shrink-0">
            <span className="text-xs text-slate-500">
              Showing {filteredItems.length} of {menuItems.length} items
            </span>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {stats.availableItems} Available
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {stats.outOfStock} Out of Stock
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {stats.totalCategories} Categories
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ==================== ADD ITEM MODAL ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"></div>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
              </div>
              <div className="relative px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <HiPlus size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">
                      Add New Item
                    </h3>
                    <p className="text-amber-100 text-sm">
                      Create a new dish for your menu
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90 duration-300"
              >
                <IoClose size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Image Upload - Left Side */}
                <div className="lg:col-span-2 space-y-3">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <IoImage className="text-amber-500" />
                    Dish Photo
                  </label>

                  <div
                    className={`relative rounded-2xl transition-all duration-300 overflow-hidden ${
                      dragActive
                        ? "ring-2 ring-amber-500 ring-offset-2"
                        : addForm.imagePreview
                        ? "ring-2 ring-emerald-500 ring-offset-2"
                        : "ring-1 ring-stone-200 hover:ring-amber-300"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {addForm.imagePreview ? (
                      <div className="relative aspect-square">
                        <img
                          src={addForm.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-300">
                          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex-1 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-slate-700 text-sm font-medium hover:bg-white transition-colors flex items-center justify-center gap-1.5"
                            >
                              <IoImage size={16} />
                              Change
                            </button>
                            <button
                              onClick={removeImage}
                              className="px-3 py-2 bg-red-500/90 backdrop-blur-sm rounded-lg text-white hover:bg-red-500 transition-colors"
                            >
                              <HiTrash size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-lg">
                            <HiCheck size={12} />
                            Uploaded
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          dragActive
                            ? "bg-amber-50"
                            : "bg-stone-50 hover:bg-amber-50/50"
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div
                          className={`p-4 rounded-2xl mb-3 transition-all ${
                            dragActive
                              ? "bg-amber-100 scale-110"
                              : "bg-white shadow-sm"
                          }`}
                        >
                          <IoCloudUpload
                            size={36}
                            className={
                              dragActive ? "text-amber-600" : "text-slate-400"
                            }
                          />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                          {dragActive ? "Drop your image here" : "Upload Image"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Drag & drop or click to browse
                        </p>
                        <p className="text-[10px] text-slate-300 mt-2">
                          PNG, JPG, WEBP • Max 5MB
                        </p>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                {/* Form Fields - Right Side */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Dish Name */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                      Dish Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addForm.name}
                      onChange={(e) => handleAddChange("name", e.target.value)}
                      placeholder="e.g. Grilled Salmon with Herbs"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addForm.categoryId}
                      onChange={(e) =>
                        handleAddChange("categoryId", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
                      style={khmerFontStyle}
                    >
                      {categories
                        .filter((cat) => cat.id !== "allFoods")
                        .map((cat) => (
                          <option
                            key={cat.id}
                            value={cat.id.toString()}
                            style={getTextStyle(cat.name)}
                          >
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-600 font-bold text-sm">
                            $
                          </span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={addForm.priceUSD}
                          onChange={(e) =>
                            handleAddChange("priceUSD", e.target.value)
                          }
                          placeholder="0.00"
                          className="w-full pl-14 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <span className="text-amber-600 font-bold text-sm">
                            ៛
                          </span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={addForm.priceKHR}
                          onChange={(e) =>
                            handleAddChange("priceKHR", e.target.value)
                          }
                          placeholder="0"
                          className="w-full pl-14 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      Auto-converts: $1 = ៛{EXCHANGE_RATE.toLocaleString()}
                    </p>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-stone-50 rounded-xl border border-stone-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Availability
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Is this item ready to serve?
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium transition-colors ${
                          !addForm.isAvailable
                            ? "text-red-500"
                            : "text-slate-400"
                        }`}
                      >
                        Off
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleAddChange("isAvailable", !addForm.isAvailable)
                        }
                        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                          addForm.isAvailable
                            ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                            : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                            addForm.isAvailable ? "left-8" : "left-1"
                          }`}
                        ></span>
                      </button>
                      <span
                        className={`text-xs font-medium transition-colors ${
                          addForm.isAvailable
                            ? "text-emerald-500"
                            : "text-slate-400"
                        }`}
                      >
                        On
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 bg-stone-50/50">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="text-red-500">*</span> Required fields
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 border border-stone-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-white hover:border-stone-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] transition-all flex items-center gap-2"
                >
                  <HiPlus size={16} />
                  Add to Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-4">
              <h3 className="text-white font-semibold text-lg">
                Edit Menu Item
              </h3>
              <p className="text-amber-100 text-xs mt-0.5">
                Update dish information
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                {editingItem.image ? (
                  <img
                    src={editingItem.image}
                    alt={editingItem.name}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-2xl">
                    🍴
                  </div>
                )}
                <div>
                  <p
                    className="font-semibold text-slate-800"
                    style={getTextStyle(editingItem.name)}
                  >
                    {editingItem.name}
                  </p>
                  <p
                    className="text-[10px] text-slate-400"
                    style={getTextStyle(editingItem.categoryName)}
                  >
                    {editingItem.categoryName}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Dish Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  style={getTextStyle(editForm.name)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    Price (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.priceUSD}
                      onChange={(e) =>
                        handleEditChange("priceUSD", e.target.value)
                      }
                      className="w-full pl-7 pr-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    Price (KHR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      ៛
                    </span>
                    <input
                      type="number"
                      value={editForm.priceKHR}
                      onChange={(e) =>
                        handleEditChange("priceKHR", e.target.value)
                      }
                      className="w-full pl-7 pr-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Category
                </label>
                <select
                  value={editForm.categoryId}
                  onChange={(e) =>
                    handleEditChange("categoryId", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  style={khmerFontStyle}
                >
                  {categories
                    .filter((cat) => cat.id !== "allFoods")
                    .map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.id.toString()}
                        style={getTextStyle(cat.name)}
                      >
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Availability
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Is this item available?
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleEditChange("isAvailable", !editForm.isAvailable)
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    editForm.isAvailable ? "bg-emerald-500" : "bg-stone-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      editForm.isAvailable ? "left-7" : "left-1"
                    }`}
                  ></span>
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
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4">
              <h3 className="text-white font-semibold text-lg">
                Delete Menu Item
              </h3>
              <p className="text-red-100 text-xs mt-0.5">
                This action cannot be undone
              </p>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl mb-4">
                {deletingItem.image ? (
                  <img
                    src={deletingItem.image}
                    alt={deletingItem.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-xl">
                    🍴
                  </div>
                )}
                <div>
                  <p
                    className="font-semibold text-slate-800 text-sm"
                    style={getTextStyle(deletingItem.name)}
                  >
                    {deletingItem.name}
                  </p>
                  <p
                    className="text-[10px] text-slate-400"
                    style={getTextStyle(deletingItem.categoryName)}
                  >
                    {deletingItem.categoryName}
                  </p>
                </div>
              </div>
              <p className="text-slate-600 text-sm text-center">
                Are you sure you want to delete this menu item?
              </p>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-stone-100 bg-stone-50">
              <button
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2.5 border border-stone-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 flex items-center gap-4 min-w-[320px]">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center overflow-hidden">
                {successMessage.image ? (
                  <img
                    src={successMessage.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">🍴</span>
                )}
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <HiCheck size={12} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Item Added Successfully!
              </p>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">
                {successMessage.name}
              </p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <IoClose size={18} />
            </button>
          </div>
          {/* Progress bar */}
          <div className="absolute bottom-0 left-4 right-4 h-1 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-shrink"></div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.4s ease-out; }
        .animate-shrink { animation: shrink 3s linear forwards; }
      `}</style>
    </div>
  );
};

export default DashboardMenu;




