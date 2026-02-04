import React from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="
        bg-blue-500 text-white 
        w-8 h-8 flex items-center justify-center 
        rounded-full shadow-md
        hover:bg-blue-600 hover:shadow-lg
        transition-all duration-200
      "
    >
      <IoMdArrowRoundBack className="text-lg" />
    </button>
  );
};

export default BackButton;
