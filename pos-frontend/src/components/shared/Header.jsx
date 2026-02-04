import React from "react";
import { IoLogOut } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Greetings from "../home/Greetings";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-500/20 text-red-400";
      case "manager":
        return "bg-blue-500/20 text-blue-400";
      case "cashier":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <header className="flex justify-between items-center bg-gradient-to-r from-stone-50 to-slate-100 border-b border-slate-200">
      {/* Left: Greetings */}
      <Greetings />

      {/* Right Section: Actions & User Profile */}
      <div className="flex items-center gap-2 pr-4">
        {/* Divider */}
        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3 bg-slate-900 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-slate-800 transition-all duration-200 cursor-pointer shadow-lg">
          {/* Avatar */}
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-inner">
            <span className="text-white font-bold text-sm">
              {getInitials(userData?.name)}
            </span>
          </div>

          {/* User Info */}
          <div className="hidden md:flex flex-col">
            <h1 className="text-white font-semibold text-sm leading-tight">
              {userData?.name || "Guest User"}
            </h1>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full w-fit ${getRoleColor(
                userData?.role
              )}`}
            >
              {userData?.role || "Staff"}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-1 p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-200"
            title="Logout"
          >
            <IoLogOut
              className="text-slate-400 hover:text-red-400 transition-colors duration-200"
              size={18}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
