import React, { useState } from "react";
import axios from "axios";
import { Trash2, PlusCircle, Edit, X, Clock, Calendar } from "lucide-react";
import TimeSlotForm from "./TimeSlotForm";
import TimeSlotsDisplay from "./TimeSlotsDisplay";
import WeeklySchedule from "./WeeklySchedule";

const AvailabilityManager = ({
  selectedDoctor,
  selectedDoctorId,
  weeklyAvailability,
  dispatch,
  doctorList,
  daysOfWeek
}) => {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [timeSlots, setTimeSlots] = useState({ startTime: "09:00", endTime: "17:00" });
  const [editingSlot, setEditingSlot] = useState(null);
  const [editTimeSlots, setEditTimeSlots] = useState({ startTime: "", endTime: "" });

  const getSlotsForDay = (day) => {
    return weeklyAvailability.filter((slot) => slot.day === day && slot.doctorId === selectedDoctorId);
  };

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!timeSlots.startTime || !timeSlots.endTime) return;
    
    // Check if end time is after start time
    if (timeSlots.startTime >= timeSlots.endTime) {
      alert('End time must be after start time');
      return;
    }
    
    dispatch({ 
      type: "ADD_TIME_SLOT", 
      day: selectedDay, 
      startTime: timeSlots.startTime, 
      endTime: timeSlots.endTime,
      doctorId: selectedDoctorId
    });
    
    setTimeSlots({ startTime: "09:00", endTime: "17:00" });
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot.id);
    setEditTimeSlots({ startTime: slot.startTime, endTime: slot.endTime });
  };

  const handleUpdateSlot = () => {
    if (!editTimeSlots.startTime || !editTimeSlots.endTime) return;
    
    // Check if end time is after start time
    if (editTimeSlots.startTime >= editTimeSlots.endTime) {
      alert('End time must be after start time');
      return;
    }
    
    dispatch({
      type: "UPDATE_TIME_SLOT",
      id: editingSlot,
      startTime: editTimeSlots.startTime,
      endTime: editTimeSlots.endTime
    });
    
    setEditingSlot(null);
    setEditTimeSlots({ startTime: "", endTime: "" });
  };

  const handleDeleteSlot = (slotId) => {
    dispatch({ type: "REMOVE_TIME_SLOT", id: slotId });
  };

  const handleDeleteAllAvailability = () => {
    if (!selectedDoctorId) return;
    
    if (!window.confirm("Clear all availability for this doctor?")) {
      return;
    }

    const updatedSlots = weeklyAvailability.filter(slot => slot.doctorId !== selectedDoctorId);
    dispatch({ type: "SET_INITIAL_STATE", payload: updatedSlots });
  };

  const handleSaveAvailability = async () => {
  if (!selectedDoctorId) return;
  
  const doctorSlots = weeklyAvailability.filter(slot => slot.doctorId === selectedDoctorId);
  
  if (doctorSlots.length === 0) {
    alert('Please add at least one time slot before saving.');
    return;
  }

  try {
    // First, check if doctor already has existing availability
    const existingResponse = await axios.get(`/api/availability/doctor/${selectedDoctorId}`);
    const hasExistingSlots = existingResponse.data.data && existingResponse.data.data.length > 0;

    let response;
    
    if (hasExistingSlots) {
      // If doctor has existing slots, use the ADD endpoint to only add new slots
      response = await axios.post('/api/availability/add', {
        doctorId: selectedDoctorId,
        doctorName: selectedDoctor.name,
        availabilitySlots: doctorSlots.map(slot => ({
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime
        }))
      });
    } else {
      // If no existing slots, use the regular endpoint
      response = await axios.post('/api/availability', {
        doctorId: selectedDoctorId,
        doctorName: selectedDoctor.name,
        availabilitySlots: doctorSlots.map(slot => ({
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime
        }))
      });
    }

    if (response.data.success) {
      alert('Availability saved successfully!');
      // Clear the local state after successful save
      const updatedSlots = weeklyAvailability.filter(slot => slot.doctorId !== selectedDoctorId);
      dispatch({ type: "SET_INITIAL_STATE", payload: updatedSlots });
    }
  } catch (error) {
    console.error('Error saving availability:', error);
    alert('Error saving availability: ' + (error.response?.data?.message || error.message));
  }
};

  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        {/* Doctor Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Set Availability for {selectedDoctor?.name}</h2>
            <button
              onClick={handleDeleteAllAvailability}
              disabled={weeklyAvailability.filter(slot => slot.doctorId === selectedDoctorId).length === 0}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Day Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Day</h3>
            <div className="flex flex-wrap gap-3">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedDay === day
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Form */}
          <TimeSlotForm
            selectedDay={selectedDay}
            timeSlots={timeSlots}
            onTimeSlotsChange={setTimeSlots}
            onAddSlot={handleAddSlot}
          />

          {/* Time Slots Display */}
          <TimeSlotsDisplay
            selectedDay={selectedDay}
            slots={getSlotsForDay(selectedDay)}
            editingSlot={editingSlot}
            editTimeSlots={editTimeSlots}
            onEditTimeSlotsChange={setEditTimeSlots}
            onEditSlot={handleEditSlot}
            onUpdateSlot={handleUpdateSlot}
            onCancelEdit={() => {
              setEditingSlot(null);
              setEditTimeSlots({ startTime: "", endTime: "" });
            }}
            onDeleteSlot={handleDeleteSlot}
          />
        </div>
      </div>

      {/* Save Availability Button */}
      <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleSaveAvailability}
          disabled={weeklyAvailability.filter(slot => slot.doctorId === selectedDoctorId).length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-8 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-500/25 flex items-center gap-3"
        >
          Save Availability 
        </button>
      </div>

      {/* Weekly Schedule Overview */}
      <WeeklySchedule
        doctorList={doctorList}
        weeklyAvailability={weeklyAvailability}
        daysOfWeek={daysOfWeek}
      />
    </div>
  );
};

export default AvailabilityManager;