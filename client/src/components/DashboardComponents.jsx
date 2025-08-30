import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar } from "@fortawesome/free-solid-svg-icons";

// Reusable component for sidebar sections
export const SectionLabel = ({ isOpen, text }) => (
  <div
    className={`${
      isOpen ? "px-3" : "px-0"
    } text-[11px] uppercase tracking-wider text-white/70 mt-3 mb-1`}
  >
    {isOpen ? text : <span className="sr-only">{text}</span>}
  </div>
);

// Reusable component for sidebar navigation items
export const NavItem = ({
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

// Reusable component for icon buttons
export const IconButton = ({ icon, badge = false, title }) => (
  <button
    className="relative text-gray-500 hover:text-blue-700 focus:outline-none transition-colors text-xl p-2.5 rounded-full hover:bg-blue-50 focus:ring-2 focus:ring-blue-300 active:scale-95"
    title={title}
  >
    {badge && (
      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
    )}
    <FontAwesomeIcon icon={icon} />
  </button>
);

// Reusable component for statistic cards on the dashboard
export const StatCard = ({ icon, title, value, sub }) => (
  <div className="group rounded-2xl border border-blue-100 bg-white p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="rounded-xl bg-blue-50 p-3">
        <FontAwesomeIcon icon={icon} className="text-blue-700 text-lg" />
      </div>
      <FontAwesomeIcon icon={faChartBar} className="text-blue-100" />
    </div>
    <div className="mt-3">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
    <div className="mt-3 h-1 rounded-full bg-gradient-to-r from-blue-200 to-blue-100 group-hover:from-blue-300 group-hover:to-blue-200"></div>
  </div>
);

// Reusable component for quick action buttons
export const QuickAction = ({ title, desc, onClick, icon }) => (
  <button
    onClick={onClick}
    className="w-full text-left rounded-2xl border border-blue-100 bg-white p-4 hover:shadow-md active:scale-[0.99] transition-all"
  >
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-blue-50 p-3">
        <FontAwesomeIcon icon={icon} className="text-blue-700" />
      </div>
      <div>
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  </button>
);