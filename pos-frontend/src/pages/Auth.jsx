import restaurant from "../assets/images/restaurant.jpg";
import logo from "../assets/images/logo.jpg";
import Login from "../components/auth/Login";
import { HiSparkles } from "react-icons/hi2";
import { IoRestaurant } from "react-icons/io5";
import { FaStar } from "react-icons/fa";

// Khmer font style - Kantumruy Pro for professional look
const khmerFontStyle = {
  fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
};

const Auth = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Section - Hero (Dark) */}
      <div className="hidden lg:flex relative w-1/2 items-center justify-center bg-slate-900">
        {/* Background Image */}
        <img
          src={restaurant}
          alt="Restaurant interior"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-amber-900/40" />

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg px-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-8">
            <IoRestaurant className="text-amber-500" size={18} />
            <span className="text-sm font-medium text-white/90">
              Restaurant POS System
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            <span style={khmerFontStyle} className="leading-relaxed">
              ភោជនីយដ្ឋាន ប៊ីហ្វ្រេន
            </span>
            <span
              className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mt-2"
              style={khmerFontStyle}
            >
              ជាជម្រើសទី១ សម្រាប់អ្នក
            </span>
          </h1>

          {/* Quote */}
          <p
            className="text-lg text-slate-300 leading-loose mb-8"
            style={khmerFontStyle}
          >
            "បម្រើអតិថិជននូវអាហារឆ្ងាញ់ និងល្អបំផុត។ នឹកឃើញដល់អាហារឆ្ងាញ់ៗ
            កុំភ្លេចនឹកឃើញដល់ ភោជនីយដ្ឋាន ប៊ីហ្វ្រេន។"
          </p>

          {/* Author */}
          <div className="flex items-center gap-4 pb-8 border-b border-white/10">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-white font-bold">BF</span>
            </div>
            <div>
              <p className="text-white font-semibold">B-Friend Restaurant</p>
              <p className="text-slate-400 text-sm" style={khmerFontStyle}>
                ម្ហូបឆ្ងាញ់ រសជាតិប្លែក
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8">
            {[
              { value: "50+", label: "Daily Orders", khLabel: "ការកម្ម៉ង់" },
              { value: "5+", label: "Staff Members", khLabel: "បុគ្គលិក" },
              {
                value: "4.5",
                label: "Rating",
                khLabel: "ការវាយតម្លៃ",
                icon: (
                  <FaStar className="inline text-amber-500 ml-1" size={12} />
                ),
              },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-white">
                  {stat.value}
                  {stat.icon}
                </p>
                <p
                  className="text-slate-400 text-xs mt-1"
                  style={khmerFontStyle}
                >
                  {stat.khLabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Form (Warm Light) */}
      <div className="flex flex-col w-full lg:w-1/2 bg-gradient-to-br from-amber-50/50 via-stone-50 to-orange-50/30">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-stone-200/80 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="B-Friend logo"
              className="h-12 w-12 rounded-xl object-cover border border-amber-200 shadow-sm"
            />
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">B-Friend</h2>
              <p className="text-slate-400 text-xs">Restaurant POS</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-slate-600 font-medium">Online</span>
          </div>
        </header>

        {/* Form Container */}
        <main className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-12">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-800">Welcome Back</h1>
              <HiSparkles className="text-amber-500" size={20} />
            </div>
            <p className="text-slate-500 text-sm">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Form */}
          <div className="w-full max-w-sm mx-auto bg-white/70 backdrop-blur-sm p-5 rounded-2xl border border-stone-200/60 shadow-lg shadow-stone-200/50">
            <Login />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-stone-200/80 bg-white/30">
          <p className="text-center text-xs text-slate-400">
            © 2026 B-Friend Restaurant. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Auth;
