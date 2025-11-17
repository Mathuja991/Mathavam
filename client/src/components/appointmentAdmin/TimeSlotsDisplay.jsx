import React from "react";
import { Clock, Edit, Trash2, X } from "lucide-react";

const TimeSlotsDisplay = ({
  selectedDay,
  slots,
  editingSlot,
  editTimeSlots,
  onEditTimeSlotsChange,
  onEditSlot,
  onUpdateSlot,
  onCancelEdit,
  onDeleteSlot
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {selectedDay} Schedule
        </h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {slots.length} slots
        </span>
      </div>
      
      <div className="grid gap-3">
        {slots.length > 0 ? (
          slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-6 py-4 rounded-xl"
            >
              {editingSlot === slot.id ? (
                <div className="flex-1 flex gap-4 items-center">
                  <div className="flex-1 flex gap-4">
                    <div className="flex-1">
                      <input
                        type="time"
                        value={editTimeSlots.startTime}
                        onChange={(e) => onEditTimeSlotsChange(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="time"
                        value={editTimeSlots.endTime}
                        onChange={(e) => onEditTimeSlotsChange(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={onUpdateSlot}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock size={20} className="text-green-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 text-lg">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditSlot(slot)}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDeleteSlot(slot.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <Clock size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 font-medium">No time slots added for {selectedDay}</p>
            <p className="text-gray-400 text-sm mt-1">Add your first time slot above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotsDisplay;