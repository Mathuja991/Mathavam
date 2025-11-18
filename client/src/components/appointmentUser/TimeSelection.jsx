import React from "react";
import { Clock, CheckCircle, User, FileText } from "lucide-react";

const TimeSelection = ({
  selectedDate,
  selectedTime,
  availableTimeRanges,
  patientName,
  setPatientName,
  patientNote,
  setPatientNote,
  handleTimeSelect,
  handleConfirmBooking
}) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Select Time</h2>
      </div>

      {!selectedDate ? (
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Date First</h3>
          <p className="text-gray-500">Choose a date from the calendar to see available time slots</p>
        </div>
      ) : availableTimeRanges.length > 0 ? (
        <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6">
          {availableTimeRanges.map((timeRange, index) => (
            <button
              key={index}
              onClick={() => handleTimeSelect(timeRange)}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedTime === timeRange
                  ? 'border-blue-500 bg-blue-100 text-blue-700 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Clock size={24} className={selectedTime === timeRange ? "text-blue-600" : "text-gray-400"} />
                  <div className="text-left">
                    <div className="font-bold text-xl">
                      {timeRange.startTime} - {timeRange.endTime}
                    </div>
                    <div className="text-gray-500 text-sm">Time Slot</div>
                  </div>
                </div>
                {selectedTime === timeRange && (
                  <CheckCircle className="text-blue-500" size={20} />
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto mb-4 text-yellow-500" />
          <h3 className="text-xl font-bold text-yellow-800 mb-2">No Time Slots Available</h3>
          <p className="text-yellow-600">No available time slots for the selected date</p>
        </div>
      )}

      {/* Patient Name and Note Section - Only show when time is selected */}
      {selectedTime && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Patient Name *
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter patient name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Additional Notes (Optional)
            </label>
            <textarea
              value={patientNote}
              onChange={(e) => setPatientNote(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any additional information for the doctor..."
              rows="3"
            />
          </div>

          <button
            onClick={handleConfirmBooking}
            disabled={!patientName.trim()}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-colors shadow-lg ${
              patientName.trim()
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            Confirm & Book Appointment
          </button>
        </div>
      )}
    </div>
  );
};

export default TimeSelection;