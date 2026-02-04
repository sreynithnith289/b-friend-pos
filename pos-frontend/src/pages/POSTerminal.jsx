import React from "react";
import BackButton from "../components/shared/BackButton";
import { FaUtensils } from "react-icons/fa";
import { MdTableBar } from "react-icons/md";
import { HiUsers } from "react-icons/hi2";
import MenuContainer from "../components/POS Terminal/MenuContainer";
import { useSelector } from "react-redux";
import POSDashboard from "../components/POS Terminal/POSDashboard";

const POSTerminal = () => {
  const customer = useSelector((state) => state.customer);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="bg-stone-100 h-full overflow-hidden flex">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Section - Menu */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <BackButton />
              <div className="h-5 w-px bg-stone-200"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                  <FaUtensils className="text-white" size={14} />
                </div>
                <div>
                  <h1 className="text-slate-800 text-base font-bold leading-tight">
                    Menu
                  </h1>
                  <p className="text-slate-400 text-[11px]">Select items</p>
                </div>
              </div>
            </div>

            {/* Customer Info Badge */}
            {customer?.customerName && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-[10px]">
                    {getInitials(customer.customerName)}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-slate-800 font-semibold text-xs leading-tight">
                    {customer.customerName}
                  </p>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    {customer.tableNo && (
                      <span className="flex items-center gap-0.5">
                        <MdTableBar size={9} />
                        T-{customer.tableNo}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <HiUsers size={9} />
                      {customer.guests || 1}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* Menu Content */}
          <div className="flex-1 overflow-hidden">
            <MenuContainer />
          </div>
        </div>

        {/* Right Section - POS Dashboard - Shorter Height */}
        <div className="w-[340px] xl:w-[360px] bg-white border-l border-stone-200 shadow-xl flex flex-col h-full flex-shrink-0">
          <POSDashboard />
        </div>
      </div>
    </section>
  );
};

export default POSTerminal;
