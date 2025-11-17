import React from "react";

const BookingTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("book")}
          className={`flex-1 px-6 py-4 text-lg font-semibold transition-all border-b-2  ${
            activeTab === "book"
            ? "border-blue-600 text-blue-600 bg-blue-50"
            : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
        >
          Book Appointment
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 px-6 py-4 text-lg font-semibold transition-all border-b-2  ${
            activeTab === "upcoming"
              ? "border-blue-600 text-blue-600 bg-blue-50"
              : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
        >
          Upcoming Appointments
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 px-6 py-4 text-lg font-semibold transition-all border-b-2  ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600 bg-blue-50"
              : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
        >
          Appointment History
        </button>
      </div>
    </div>
  );
};

export default BookingTabs;