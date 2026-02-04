import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/shared/Header";
import Sidebar from "../components/shared/BottomNav";
import useLoadData from "../hooks/useLoadData";
import FullScreenLoader from "../components/shared/FullScreenLoader";

const Layout = () => {
  const isLoading = useLoadData();

  if (isLoading) return <FullScreenLoader />;

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-100 via-stone-50 to-slate-100 overflow-hidden">
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* HEADER */}
        <Header />

        {/* MAIN AREA */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-stone-100">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
