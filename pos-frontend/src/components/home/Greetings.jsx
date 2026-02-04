import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { IoSunny, IoMoon, IoPartlySunny, IoCloudyNight } from "react-icons/io5";
import { HiSparkles } from "react-icons/hi2";

const Greetings = () => {
  const userData = useSelector((state) => state.user);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreetingData = (date) => {
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) {
      return {
        text: "Good Morning",
        icon: <IoSunny className="text-yellow-500" size={22} />,
        gradient: "from-amber-500 to-orange-500",
      };
    }
    if (hour >= 12 && hour < 17) {
      return {
        text: "Good Afternoon",
        icon: <IoPartlySunny className="text-orange-500" size={22} />,
        gradient: "from-orange-500 to-red-500",
      };
    }
    if (hour >= 17 && hour < 21) {
      return {
        text: "Good Evening",
        icon: <IoCloudyNight className="text-indigo-500" size={22} />,
        gradient: "from-indigo-500 to-purple-500",
      };
    }
    return {
      text: "Good Night",
      icon: <IoMoon className="text-slate-400" size={22} />,
      gradient: "from-slate-600 to-slate-800",
    };
  };

  const formatDate = (date) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return {
      day: days[date.getDay()],
      date: `${
        months[date.getMonth()]
      } ${date.getDate()}, ${date.getFullYear()}`,
    };
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return {
      time: `${String(hours).padStart(2, "0")}:${minutes}`,
      seconds,
      ampm,
    };
  };

  const greeting = getGreetingData(dateTime);
  const { day, date } = formatDate(dateTime);
  const { time, seconds, ampm } = formatTime(dateTime);

  return (
    <div className="flex items-center justify-between pl-6 pr-3 py-2">
      {/* Left: Greeting Section */}
      <div className="flex items-center gap-4 flex-grow">
        {/* Icon with gradient background */}
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${greeting.gradient} shadow-lg`}
        >
          <span className="text-white">
            {React.cloneElement(greeting.icon, { className: "text-white" })}
          </span>
        </div>

        {/* Text */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800">
              {greeting.text},{" "}
              <span
                className={`bg-gradient-to-r ${greeting.gradient} bg-clip-text text-transparent`}
              >
                {userData?.name || "Guest"}
              </span>
              !
            </h1>
            <HiSparkles className="text-yellow-500" size={20} />
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Ready to deliver excellent service today
          </p>
        </div>
      </div>

      {/* Right: Date & Time Section */}
      <div className="flex items-center gap-9">
        {/* Date Card */}
        <div className="text-right">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {day}
          </p>
          <p className="text-sm font-semibold text-slate-700">{date}</p>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-slate-200"></div>

        {/* Time Card */}
        <div className="bg-slate-900 px-4 py-2 rounded-xl shadow-lg">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white font-mono tracking-tight">
              {time}
            </span>
            <span className="text-sm text-slate-400 font-mono">{seconds}</span>
            <span className="text-xs font-semibold text-yellow-400 ml-1">
              {ampm}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Greetings;
