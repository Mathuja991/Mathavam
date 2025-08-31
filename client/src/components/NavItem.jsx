import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const NavItem = ({
  icon,
  label,
  isOpen,
  onClick,
  isActive,
  isLogout = false,
  color = "indigo",
}) => {
  const activeBg =
    {
      indigo: "bg-indigo-500",
      sky: "bg-sky-500",
      teal: "bg-teal-500",
      blue: "bg-blue-600",
    }[color] || "bg-indigo-500";

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full py-2.5 px-3 rounded-lg text-left text-sm font-medium
        transition-all duration-200 ease-in-out group
        ${
          isActive
            ? `${activeBg} text-white shadow-[0_6px_20px_-8px_rgba(255,255,255,0.6)]`
            : "text-white/85 hover:bg-white/10 hover:text-white"
        }
        ${isLogout ? "text-red-200 hover:bg-red-600/60 hover:text-white" : ""}
        focus:outline-none focus:ring-2 focus:ring-white/50`}
      title={label}
    >
      <FontAwesomeIcon
        icon={icon}
        className={`${isOpen ? "mr-3" : "mr-0"} text-[17px]`}
      />
      <span
        className={`${
          isOpen ? "opacity-100" : "opacity-0 absolute -left-96"
        } transition-opacity`}
      >
        {label}
      </span>
    </button>
  );
};

export default NavItem;