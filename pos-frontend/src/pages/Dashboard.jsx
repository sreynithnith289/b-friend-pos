import React, { useState, useEffect } from "react";
import { MdTableBar, MdInventory } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import {
  HiViewGrid,
  HiClipboardList,
  HiCreditCard,
  HiUsers,
  HiChartBar,
  HiUserGroup,
  HiCalendar,
  HiRefresh,
} from "react-icons/hi";
import Metrics from "../components/dashboard/Metrics";
import TableModal from "../components/dashboard/TableModal";
import DashboardOrders from "../components/dashboard/DashboardOrders";
import DashboardPayment from "../components/dashboard/DashboardPayment";
import StaffInformation from "../components/dashboard/StaffInformation";
import StaffSales from "../components/dashboard/StaffSales";
import CustomerInformation from "../components/dashboard/CustomerInformation";
import DashboardMenu from "../components/dashboard/DashboardMenu";
import DashboardInventory from "../components/dashboard/DashboardInventory";

const Dashboard = () => {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Metrics");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 500);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const tabs = [
    {
      id: "Metrics",
      label: "Overview",
      icon: <HiViewGrid size={18} />,
      color: "from-violet-500 to-purple-600",
    },
    {
      id: "Orders",
      label: "Orders",
      icon: <HiClipboardList size={18} />,
      color: "from-blue-500 to-cyan-600",
    },
    {
      id: "Payment",
      label: "Payments",
      icon: <HiCreditCard size={18} />,
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "Menus",
      label: "Menu",
      icon: <BiSolidDish size={18} />,
      color: "from-amber-500 to-orange-600",
    },
    {
      id: "Inventory",
      label: "Inventory",
      icon: <MdInventory size={18} />,
      color: "from-pink-500 to-rose-600",
    },
    {
      id: "Staff",
      label: "Staff",
      icon: <HiUsers size={18} />,
      color: "from-indigo-500 to-blue-600",
    },
    {
      id: "Customers",
      label: "Customers",
      icon: <HiUserGroup size={18} />,
      color: "from-cyan-500 to-blue-600",
    },
    {
      id: "Sales",
      label: "Analytics",
      icon: <HiChartBar size={18} />,
      color: "from-green-500 to-emerald-600",
    },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <section className="bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 flex flex-col flex-1 h-full overflow-hidden">
      {/* Professional Header */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200/80 shadow-sm">
        {/* Top Bar */}
        <div className="px-6 py-2.5">
          <div className="flex items-center justify-between">
            {/* Left: Title & Date */}
            <div className="flex items-center gap-4">
              <div
                className={`p-3 bg-gradient-to-br ${
                  activeTabData?.color || "from-violet-500 to-purple-600"
                } rounded-2xl shadow-lg`}
              >
                {activeTabData?.icon || (
                  <HiViewGrid size={24} className="text-white" />
                )}
                <span className="sr-only">{activeTab}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {activeTabData?.label || "Dashboard"}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <HiCalendar size={14} className="text-slate-400" />
                    {formatDate(currentTime)}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span className="text-sm text-slate-500 font-medium">
                    {formatTime(currentTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isRefreshing
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                }`}
              >
                <HiRefresh
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>

              {/* Add Table Button */}
              <button
                onClick={() => setIsTableModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200 text-sm"
              >
                <MdTableBar size={18} />
                Add Table
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pb-0">
          <div
            className="flex gap-1 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all duration-200 whitespace-nowrap rounded-t-xl ${
                    isActive
                      ? "text-slate-800 bg-slate-50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                  }`}
                >
                  <span
                    className={`transition-colors ${
                      isActive ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                  {isActive && (
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tab.color} rounded-full`}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 w-full p-5 overflow-hidden min-h-0">
        <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          {/* Metrics */}
          {activeTab === "Metrics" && (
            <div className="h-full overflow-y-auto p-5">
              <Metrics />
            </div>
          )}

          {/* Orders */}
          {activeTab === "Orders" && (
            <div className="h-full">
              <DashboardOrders />
            </div>
          )}

          {/* Payment */}
          {activeTab === "Payment" && (
            <div className="h-full">
              <DashboardPayment />
            </div>
          )}

          {/* Staff */}
          {activeTab === "Staff" && (
            <div className="h-full">
              <StaffInformation />
            </div>
          )}

          {/* Customers */}
          {activeTab === "Customers" && (
            <div className="h-full">
              <CustomerInformation />
            </div>
          )}

          {/* Sales/Analytics */}
          {activeTab === "Sales" && (
            <div className="h-full">
              <StaffSales />
            </div>
          )}

          {/* Menu */}
          {activeTab === "Menus" && (
            <div className="h-full">
              <DashboardMenu />
            </div>
          )}

          {/* Inventory */}
          {activeTab === "Inventory" && (
            <div className="h-full">
              <DashboardInventory />
            </div>
          )}
        </div>
      </div>

      {/* Table Modal */}
      {isTableModalOpen && <TableModal setIsModalOpen={setIsTableModalOpen} />}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default Dashboard;
