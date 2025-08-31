import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const QuickAction = ({ title, desc, onClick, icon }) => (
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

export default QuickAction;