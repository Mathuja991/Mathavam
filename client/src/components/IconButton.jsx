import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const IconButton = ({ icon, badge = false, title }) => (
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

export default IconButton;