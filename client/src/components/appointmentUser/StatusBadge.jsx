import React from "react";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    upcoming: { color: "bg-blue-100 text-blue-800", text: "Upcoming" },
    completed: { color: "bg-green-100 text-green-800", text: "Completed" },
    cancelled: { color: "bg-red-100 text-red-800", text: "Cancelled" }
  };
  
  const config = statusConfig[status] || statusConfig.upcoming;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

export default StatusBadge;