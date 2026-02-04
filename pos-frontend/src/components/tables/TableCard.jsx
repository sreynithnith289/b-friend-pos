import React, { useMemo, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateTable } from "../../redux/slices/customerSlice";
import { FaLongArrowAltRight } from "react-icons/fa";

const TableCard = ({
  tableNo,
  status,
  customerName,
  initials,
  seats: propSeats,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🟢 TableCard received tableNo:", tableNo);
  }, [tableNo]);

  const isBooked = (status || "").toLowerCase() === "booked";

  const handleClick = () => {
    if (isBooked) return;
    dispatch(updateTable({ tableNo }));
    navigate("/menu");
  };

  const seats = useMemo(
    () => propSeats || Math.floor(Math.random() * 14) + 2,
    [propSeats]
  );

  const avatarColor = useMemo(
    () =>
      [
        "#FF6B6B", // Soft Coral Red
        "#6C63FF", // Neon Indigo
        "#deaf52ff", // Metallic Gold
        "#E94560", // Crimson Glow
        "#2D6A4F", // Deep Emerald
        "#0ca328ff", // Rich Royal Blue
        "#98186cff", // Mustard Yellow
        "#FF9F1C", // Sunset Orange
        "#7209B7", // Luxury Violet
        "#48CAE4", // Clear Sky Blue
      ][Math.floor(Math.random() * 10)],
    []
  );

  const getAvatarName = (name2) => {
    if (!name2) return null;
    if (typeof name2 !== "string") name2 = String(name2);
    return name2
      .split(" ")
      .map((n) => n[0].toUpperCase())
      .slice(0, 2)
      .join("");
  };

  const displayInitials =
    initials && typeof initials === "string"
      ? initials.slice(0, 2).toUpperCase()
      : getAvatarName(customerName) || "N/A";

  return (
    <div
      onClick={handleClick}
      className={`w-[220px] bg-[#1f1f1f] p-3 rounded-xl cursor-pointer border border-gray-800 
      shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
      hover:border-gray-600 hover:bg-[#272727] relative`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-gray-100 text-sm font-semibold flex items-center gap-1 min-w-0">
          <span className="text-gray-300">Table</span>
          <FaLongArrowAltRight className="text-[#ababab]" />
          <span className="text-gray-100">{tableNo ?? "?"}</span>
        </h2>

        <span
          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
            isBooked
              ? "bg-[#4a302e] text-[#f6b100]"
              : "bg-[#274a2e] text-green-400"
          }`}
        >
          {status || "N/A"}
        </span>
      </div>

      {/* Avatar */}
      <div className="flex justify-center items-center mt-3 mb-4">
        <div
          className="rounded-full flex items-center justify-center text-lg font-semibold text-white"
          style={{
            width: "50px",
            height: "50px",
            backgroundColor:
              displayInitials !== "N/A" ? avatarColor : "#1f1f1f",
          }}
        >
          {displayInitials}
        </div>
      </div>

      {/* Status Dot */}
      <div className="flex justify-center mb-3">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isBooked ? "bg-[#f6b100]" : "bg-green-500"
          }`}
        ></span>
      </div>

      {/* Seats */}
      <div className="absolute bottom-2 left-3 text-[12px] text-gray-300 font-medium">
        Seats: {seats}
      </div>
    </div>
  );
};

export default TableCard;
