import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar } from "@fortawesome/free-solid-svg-icons";

const StatCard = ({ icon, title, value, sub }) => (
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

export default StatCard;

