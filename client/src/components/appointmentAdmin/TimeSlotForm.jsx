import React from "react";
import { PlusCircle } from "lucide-react";

const TimeSlotForm = ({ selectedDay, timeSlots, onTimeSlotsChange, onAddSlot }) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200/60">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Time Slot for {selectedDay}</h3>
      <form onSubmit={onAddSlot} className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <input
              type="time"
              value={timeSlots.startTime}
              onChange={(e) => onTimeSlotsChange(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <input
              type="time"
              value={timeSlots.endTime}
              onChange={(e) => onTimeSlotsChange(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="lg:w-auto w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
        >
          <PlusCircle size={20} />
          Add Time Slot
        </button>
      </form>
    </div>
  );
};

export default TimeSlotForm;