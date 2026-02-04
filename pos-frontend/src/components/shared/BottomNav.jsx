import React, { useState, useEffect, useRef } from "react";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import {
  HiHome,
  HiSquares2X2,
  HiClipboardDocumentList,
  HiTableCells,
  HiCreditCard,
  HiBookOpen,
  HiChartBar,
  HiUserGroup,
  HiArchiveBox,
  HiSparkles,
  HiPlus,
  HiMinus,
  HiCheckCircle,
} from "react-icons/hi2";
import { BiSolidDish } from "react-icons/bi";
import { MdTableRestaurant, MdTakeoutDining } from "react-icons/md";
import { FaPhone, FaUser } from "react-icons/fa";
import logo from "../../assets/images/logo.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { enqueueSnackbar } from "notistack";
import { setCustomer } from "../../redux/slices/customerSlice";
import { getCustomers } from "../../https/index";

const BottomNav = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const customer = useSelector((state) => state.customer);
  const userData = useSelector((state) => state.user) || {};

  const [isOpen, setIsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("Dine-in");

  // Customer autocomplete states
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const nameInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Fetch customers when modal opens
  useEffect(() => {
    if (isModalOpen) {
      fetchCustomers();
    }
  }, [isModalOpen]);

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();
      const data = response?.data?.data || response?.data || [];
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
    }
  };

  // Filter customers based on input
  useEffect(() => {
    if (name.trim().length > 0) {
      const filtered = customers.filter(
        (c) =>
          c.name?.toLowerCase().includes(name.toLowerCase()) ||
          c.phone?.includes(name)
      );
      setFilteredCustomers(filtered.slice(0, 5)); // Show max 5 suggestions
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setFilteredCustomers([]);
      setShowSuggestions(false);
    }
  }, [name, customers]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        nameInputRef.current &&
        !nameInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredCustomers.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCustomers.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      selectCustomer(filteredCustomers[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Select customer from suggestions
  const selectCustomer = (selectedCustomer) => {
    setName(selectedCustomer.name || "");
    setPhone(selectedCustomer.phone || "");
    setShowSuggestions(false);
    setSelectedIndex(-1);
    enqueueSnackbar(`Selected: ${selectedCustomer.name}`, { variant: "info" });
  };

  // Navigation items with colorful icons (dark theme)
  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: HiHome,
      path: "/",
      color: "text-blue-400",
      bgColor: "bg-blue-500/15",
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: HiSquares2X2,
      path: "/dashboard",
      color: "text-purple-400",
      bgColor: "bg-purple-500/15",
    },
    {
      id: "orders",
      label: "Orders",
      icon: HiClipboardDocumentList,
      path: "/orders",
      color: "text-amber-400",
      bgColor: "bg-amber-500/15",
    },
    {
      id: "tables",
      label: "Tables",
      icon: HiTableCells,
      path: "/tables",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/15",
    },
    {
      id: "pos",
      label: "POS Terminal",
      icon: HiCreditCard,
      path: "/pos",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/15",
    },
    {
      id: "menus",
      label: "Menu",
      icon: HiBookOpen,
      path: "/menu",
      color: "text-orange-400",
      bgColor: "bg-orange-500/15",
    },
    {
      id: "customers",
      label: "Customers",
      icon: HiUserGroup,
      path: "/customer",
      color: "text-pink-400",
      bgColor: "bg-pink-500/15",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: HiArchiveBox,
      path: "/inventory",
      color: "text-teal-400",
      bgColor: "bg-teal-500/15",
    },
    {
      id: "report",
      label: "Reports",
      icon: HiChartBar,
      path: "/report",
      color: "text-rose-400",
      bgColor: "bg-rose-500/15",
    },
  ];

  // Filter nav items: only Admin sees Dashboard and Reports
  const filteredNavItems = navItems.filter((item) => {
    if (item.id === "dashboard") return userData.role === "Admin";
    if (item.id === "report") return userData.role === "Admin";
    return true;
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setName("");
    setPhone("");
    setGuestCount(1);
    setServiceType("Dine-in");
    setShowSuggestions(false);
    setFilteredCustomers([]);
  };

  const increment = () => setGuestCount((p) => Math.min(p + 1, 20));
  const decrement = () => setGuestCount((p) => Math.max(p - 1, 1));

  const handleServiceTypeChange = (type) => {
    setServiceType(type);
    if (type === "Takeaway") {
      setGuestCount(1);
    }
  };

  const handleCreateOrder = () => {
    if (!name.trim()) {
      enqueueSnackbar("Please enter customer name", { variant: "warning" });
      return;
    }

    dispatch(
      setCustomer({
        name,
        phone,
        guests: serviceType === "Takeaway" ? 1 : guestCount,
        serviceType,
      })
    );

    setName("");
    setPhone("");
    setGuestCount(1);
    setServiceType("Dine-in");

    closeModal();
    navigate(serviceType === "Takeaway" ? "/pos" : "/tables");
  };

  useEffect(() => {
    const restricted = ["/orders", "/tables"];
    document.body.style.overflow = restricted.includes(location.pathname)
      ? "hidden"
      : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [location.pathname]);

  return (
    <>
      {/* SIDEBAR */}
      <div
        className={`h-full text-white flex flex-col flex-shrink-0 transition-all duration-300 shadow-xl ${
          isOpen ? "w-64" : "w-20"
        }`}
        style={{
          backgroundColor: "#140A3D",
          borderRight: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* HEADER */}
        <div
          className="flex items-center p-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div
            onClick={() => navigate("/")}
            className={`flex items-center gap-3 cursor-pointer overflow-hidden transition-all duration-300 ${
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            <div className="relative">
              <img
                src={logo}
                alt="B-Friend Logo"
                className="h-10 w-10 rounded-xl object-cover border-2 border-white/20 flex-shrink-0 shadow-md"
              />
              <div
                className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full"
                style={{ borderWidth: "2px", borderColor: "#201164" }}
              ></div>
            </div>
            <div className="whitespace-nowrap">
              <div className="flex items-center gap-1">
                <h1 className="text-lg font-bold tracking-wide bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  B-Friend
                </h1>
                <HiSparkles className="text-amber-400" size={14} />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Restaurant POS
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 ${
              isOpen ? "ml-auto" : "mx-auto"
            }`}
          >
            {isOpen ? (
              <IoChevronBack size={18} className="text-white/70" />
            ) : (
              <IoChevronForward size={18} className="text-white/70" />
            )}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav
          className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isOpen && (
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3 px-3">
              Menu
            </p>
          )}
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                } ${!isOpen && "justify-center"}`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white/20"
                      : `${item.bgColor} group-hover:scale-110`
                  }`}
                >
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive ? "text-white" : item.color
                    }`}
                  />
                </div>

                {isOpen && (
                  <span
                    className={`font-medium text-sm ${
                      isActive ? "text-white" : "text-white/80"
                    }`}
                  >
                    {item.label}
                  </span>
                )}

                {isActive && isOpen && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-white/40"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* QUICK ACTION - New Order Button */}
        {!customer?.customerName && (
          <div
            className="p-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <button
              onClick={openModal}
              className={`group flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold shadow-md shadow-amber-500/25 transition-all duration-200 hover:scale-[1.01] ${
                !isOpen && "px-0"
              }`}
            >
              <BiSolidDish size={18} />
              {isOpen && <span className="text-sm">New Order</span>}
            </button>
          </div>
        )}

        {/* FOOTER - User & Version */}
        <div
          className={`p-2 ${!isOpen && "hidden"}`}
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          {userData?.name && (
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
                {userData.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {userData.name}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {userData.role || "Staff"}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-white/40 px-1">
            <span>v1.0.0</span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {children}

      {/* ==================== LANDSCAPE NEW ORDER MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <BiSolidDish size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    Create New Order
                  </h3>
                  <p className="text-amber-100 text-xs">
                    Fill in the details to start
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <IoClose size={20} />
              </button>
            </div>

            {/* Body - Landscape Layout */}
            <div className="p-5">
              <div className="flex gap-5">
                {/* Left Column - Service Type */}
                <div className="w-1/3 space-y-3">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Service Type
                  </label>
                  <div className="space-y-2">
                    {/* Dine-in */}
                    <button
                      onClick={() => handleServiceTypeChange("Dine-in")}
                      className={`relative w-full p-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ${
                        serviceType === "Dine-in"
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                          : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          serviceType === "Dine-in"
                            ? "bg-white/20"
                            : "bg-amber-100"
                        }`}
                      >
                        <MdTableRestaurant
                          size={20}
                          className={
                            serviceType === "Dine-in"
                              ? "text-white"
                              : "text-amber-600"
                          }
                        />
                      </div>
                      <div className="text-left flex-1">
                        <span className="font-semibold text-sm block">
                          Dine-in
                        </span>
                        <span
                          className={`text-[10px] ${
                            serviceType === "Dine-in"
                              ? "text-white/70"
                              : "text-slate-400"
                          }`}
                        >
                          Eat at restaurant
                        </span>
                      </div>
                      {serviceType === "Dine-in" && (
                        <HiCheckCircle size={20} className="text-white" />
                      )}
                    </button>

                    {/* Takeaway */}
                    <button
                      onClick={() => handleServiceTypeChange("Takeaway")}
                      className={`relative w-full p-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ${
                        serviceType === "Takeaway"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                          : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          serviceType === "Takeaway"
                            ? "bg-white/20"
                            : "bg-emerald-100"
                        }`}
                      >
                        <MdTakeoutDining
                          size={20}
                          className={
                            serviceType === "Takeaway"
                              ? "text-white"
                              : "text-emerald-600"
                          }
                        />
                      </div>
                      <div className="text-left flex-1">
                        <span className="font-semibold text-sm block">
                          Takeaway
                        </span>
                        <span
                          className={`text-[10px] ${
                            serviceType === "Takeaway"
                              ? "text-white/70"
                              : "text-slate-400"
                          }`}
                        >
                          Pack to go
                        </span>
                      </div>
                      {serviceType === "Takeaway" && (
                        <HiCheckCircle size={20} className="text-white" />
                      )}
                    </button>
                  </div>

                  {/* Guest Counter - Only for Dine-in */}
                  <div
                    className={`transition-all duration-300 ${
                      serviceType === "Dine-in"
                        ? "opacity-100"
                        : "opacity-30 pointer-events-none"
                    }`}
                  >
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Guests
                    </label>
                    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-2">
                      <button
                        onClick={decrement}
                        disabled={guestCount <= 1 || serviceType === "Takeaway"}
                        className="h-9 w-9 rounded-lg bg-white border border-slate-200 hover:bg-red-50 hover:border-red-300 hover:text-red-500 disabled:opacity-40 text-slate-600 font-bold transition-all flex items-center justify-center"
                      >
                        <HiMinus size={16} />
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-amber-600">
                          {guestCount}
                        </span>
                        <span className="text-xs text-slate-500">
                          {guestCount === 1 ? "guest" : "guests"}
                        </span>
                      </div>
                      <button
                        onClick={increment}
                        disabled={
                          guestCount >= 20 || serviceType === "Takeaway"
                        }
                        className="h-9 w-9 rounded-lg bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-500 disabled:opacity-40 text-slate-600 font-bold transition-all flex items-center justify-center"
                      >
                        <HiPlus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Customer Info */}
                <div className="flex-1 space-y-4">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Customer Information
                  </label>

                  {/* Name & Phone in Row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Name Input with Autocomplete */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={nameInputRef}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() =>
                          name.trim().length > 0 &&
                          filteredCustomers.length > 0 &&
                          setShowSuggestions(true)
                        }
                        onKeyDown={handleKeyDown}
                        placeholder="Type customer name..."
                        autoComplete="off"
                        className="w-full bg-slate-50 text-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-300 text-sm"
                      />

                      {/* Autocomplete Suggestions Dropdown */}
                      {showSuggestions && filteredCustomers.length > 0 && (
                        <div
                          ref={suggestionsRef}
                          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                        >
                          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase">
                              Existing Customers ({filteredCustomers.length})
                            </p>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredCustomers.map((c, index) => (
                              <button
                                key={c._id}
                                onClick={() => selectCustomer(c)}
                                className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-amber-50 transition-colors text-left ${
                                  index === selectedIndex ? "bg-amber-50" : ""
                                }`}
                              >
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                  {c.name?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-slate-800 text-sm truncate">
                                    {c.name}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    {c.phone && (
                                      <span className="flex items-center gap-1">
                                        <FaPhone size={8} />
                                        {c.phone}
                                      </span>
                                    )}
                                    {c.totalOrders > 0 && (
                                      <span className="text-amber-500">
                                        • {c.totalOrders} orders
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {index === selectedIndex && (
                                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                    Enter ↵
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400">
                              ↑↓ Navigate • Enter to select • Esc to close
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Phone <span className="text-slate-300">(Optional)</span>
                      </label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number"
                        className="w-full bg-slate-50 text-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-300 text-sm"
                      />
                    </div>
                  </div>

                  {/* Info Banner */}
                  <div
                    className={`rounded-xl p-3 flex items-center gap-3 transition-all ${
                      serviceType === "Takeaway"
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-amber-50 border border-amber-200"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        serviceType === "Takeaway"
                          ? "bg-emerald-100"
                          : "bg-amber-100"
                      }`}
                    >
                      {serviceType === "Takeaway" ? (
                        <MdTakeoutDining
                          size={18}
                          className="text-emerald-600"
                        />
                      ) : (
                        <MdTableRestaurant
                          size={18}
                          className="text-amber-600"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          serviceType === "Takeaway"
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        {serviceType === "Takeaway"
                          ? "Takeaway Order"
                          : `Dine-in for ${guestCount} ${
                              guestCount === 1 ? "guest" : "guests"
                            }`}
                      </p>
                      <p
                        className={`text-xs ${
                          serviceType === "Takeaway"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {serviceType === "Takeaway"
                          ? "Go directly to POS terminal"
                          : "Select a table in next step"}
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleCreateOrder}
                    disabled={!name.trim()}
                    className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                      name.trim()
                        ? serviceType === "Takeaway"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99]"
                          : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99]"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {serviceType === "Takeaway" ? (
                      <>
                        <MdTakeoutDining size={20} />
                        Start Takeaway Order
                      </>
                    ) : (
                      <>
                        <MdTableRestaurant size={20} />
                        Continue to Select Table
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </>
  );
};

export default BottomNav;
