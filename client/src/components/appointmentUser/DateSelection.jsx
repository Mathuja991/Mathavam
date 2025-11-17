import React from "react";

const DateSelection = ({
  selectedDoctor,
  selectedDate,
  currentMonth,
  handleMonthChange,
  calendarDays,
  handleDateSelect
}) => {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Get current date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Select Date</h2>
        <div className="text-lg text-gray-700">
          with <span className="font-semibold text-blue-600">{selectedDoctor?.name}</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-3 hover:bg-gray-200 rounded-lg text-gray-600 hover:text-gray-800 transition-colors"
            >
              ←
            </button>
            <span className="font-semibold text-gray-900 text-xl">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-3 hover:bg-gray-200 rounded-lg text-gray-600 hover:text-gray-800 transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => {
            const isToday = day.date.toDateString() === today.toDateString();
            const isSelected = selectedDate === day.dateString;
            
            return (
              <button
                key={index}
                onClick={() => day.isAvailable && handleDateSelect(day.dateString)}
                disabled={!day.isAvailable}
                className={`p-3 rounded-lg text-center transition-all relative ${
                  !day.isCurrentMonth
                    ? 'text-gray-300 cursor-not-allowed'
                    : !day.isAvailable
                    ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                    : isSelected
                    ? 'bg-blue-500 text-white border-2 border-blue-600 shadow-lg'
                    : isToday
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'text-gray-700 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-base font-medium">
                  {day.date.getDate()}
                </div>
                
                {/* Appointment Count Badge */}
                {day.isAvailable && day.isCurrentMonth && day.appointmentCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {day.appointmentCount}
                  </div>
                )}
                
                {/* Available Indicator */}
                {day.isAvailable && day.isCurrentMonth && day.appointmentCount === 0 && (
                  <div className="w-1 h-1 bg-green-400 rounded-full mx-auto mt-1"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend - Only Available and Unavailable */}
      <div className="flex justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default DateSelection;