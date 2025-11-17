import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader } from "lucide-react";
import TimeSlotForm from "./TimeSlotForm";
import TimeSlotsDisplay from "./TimeSlotsDisplay";
import WeeklySchedule from "./WeeklySchedule";

const AvailabilityManager = ({
  selectedDoctor,
  selectedDoctorId,
  doctorList,
  daysOfWeek
}) => {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [timeSlots, setTimeSlots] = useState({ startTime: "", endTime: "" });
  const [editingSlot, setEditingSlot] = useState(null);
  const [editTimeSlots, setEditTimeSlots] = useState({ startTime: "", endTime: "" });
  const [existingSlots, setExistingSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);

  // Fetch existing slots when doctor or day changes
  useEffect(() => {
    if (selectedDoctorId) {
      fetchExistingSlots();
    }
  }, [selectedDoctorId, selectedDay]);

  const fetchExistingSlots = async () => {
  try {
    setSlotLoading(true);
    const response = await axios.post('/api/availability/doctors', {
      doctorIds: [selectedDoctorId]
    });

    if (response.data.success) {
      const allAvailability = response.data.data || [];

      const doctorAvailability = allAvailability.find(
        doc => doc.doctorId === selectedDoctorId
      );

      const daySlots = doctorAvailability?.availabilitySlots?.filter(
        slot => slot.day === selectedDay
      ) || [];

      setExistingSlots(daySlots);
    }
  } catch (error) {
    console.error('Error fetching existing slots:', error);
    alert('Error loading existing time slots');
  } finally {
    setSlotLoading(false);
  }
};


  // Add slot directly to database
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!timeSlots.startTime || !timeSlots.endTime) {
      alert('Please enter both start and end time');
      return;
    }
    
    // Check if end time is after start time
    if (timeSlots.startTime >= timeSlots.endTime) {
      alert('End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('/api/availability/add', {
        doctorId: selectedDoctorId,
        doctorName: selectedDoctor.name,
        availabilitySlots: [{
          day: selectedDay,
          startTime: timeSlots.startTime,
          endTime: timeSlots.endTime
        }]
      });

      if (response.data.success) {
        // Clear form
        setTimeSlots({ startTime: "", endTime: "" });
        // Refresh the slots list
        fetchExistingSlots();
        alert('Time slot added successfully!');
      }
    } catch (error) {
      console.error('Error adding time slot:', error);
      alert('Error adding time slot: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Update slot directly in database
  const handleUpdateSlot = async () => {
    if (!editTimeSlots.startTime || !editTimeSlots.endTime) return;
    
    // Check if end time is after start time
    if (editTimeSlots.startTime >= editTimeSlots.endTime) {
      alert('End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      
      // Update the slot in database - FIXED: using params instead of body for slotId
      const response = await axios.put(`/api/availability/${editingSlot}`, {
        startTime: editTimeSlots.startTime,
        endTime: editTimeSlots.endTime
      });

      if (response.data.success) {
        setEditingSlot(null);
        setEditTimeSlots({ startTime: "", endTime: "" });
        // Refresh the slots list
        fetchExistingSlots();
        alert('Time slot updated successfully!');
      }
    } catch (error) {
      console.error('Error updating time slot:', error);
      alert('Error updating time slot: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Delete slot directly from database
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to delete this time slot?")) {
      return;
    }

    try {
      setLoading(true);
      
      // FIXED: Using params instead of body for DELETE
      const response = await axios.delete(`/api/availability/${slotId}`);

      if (response.data.success) {
        // Refresh the slots list
        fetchExistingSlots();
        alert('Time slot deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting time slot:', error);
      alert('Error deleting time slot: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Delete all availability for this doctor
  const handleDeleteAllAvailability = async () => {
    if (!selectedDoctorId) return;
    
    if (!window.confirm("Are you sure you want to clear ALL availability for this doctor?")) {
      return;
    }

    try {
      setLoading(true);
      
      // FIXED: Using params instead of body
      const response = await axios.delete(`/api/availability/doctor/${selectedDoctorId}`);

      if (response.data.success) {
        setExistingSlots([]);
        alert('All availability cleared successfully!');
      }
    } catch (error) {
      console.error('Error clearing availability:', error);
      alert('Error clearing availability: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Added missing handleEditSlot function
  const handleEditSlot = (slot) => {
    setEditingSlot(slot._id); // Use _id from database
    setEditTimeSlots({ startTime: slot.startTime, endTime: slot.endTime });
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
              disabled={loading || existingSlots.length === 0}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {loading ? "Processing..." : "Clear All"}
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
                  disabled={loading}
                  className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedDay === day
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            loading={loading}
          />

          {/* Time Slots Display */}
          {slotLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-600">Loading time slots...</span>
            </div>
          ) : (
            <TimeSlotsDisplay
              selectedDay={selectedDay}
              slots={existingSlots}
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
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Weekly Schedule Overview */}
      <WeeklySchedule
        doctorList={doctorList}
        daysOfWeek={daysOfWeek}
      />
    </div>
  );
};

export default AvailabilityManager;