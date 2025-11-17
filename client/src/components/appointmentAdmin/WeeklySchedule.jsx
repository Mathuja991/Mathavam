import React, { useState, useEffect } from "react";
import { Calendar, Loader, RefreshCw } from "lucide-react";
import axios from "axios";

const WeeklySchedule = ({ doctorList, daysOfWeek }) => {
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch availability data from database for all doctors
  const fetchAvailabilityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Extract doctor IDs from doctorList
      const doctorIds = doctorList.map(doctor => doctor._id);
      
      if (doctorIds.length === 0) {
        setWeeklyAvailability([]);
        setLoading(false);
        return;
      }

      // Use the getMultipleDoctorsAvailability endpoint
      const response = await axios.post('/api/availability/doctors', {
        doctorIds: doctorIds
      });
      
      if (response.data.success) {
        setWeeklyAvailability(response.data.data || []);
      } else {
        setError('Failed to fetch availability data');
      }
    } catch (err) {
      console.error('Error fetching availability data:', err);
      setError('Error loading schedule data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailabilityData();
  }, [doctorList]); // Refetch when doctorList changes

  // Function to convert 24-hour time to AM/PM format
  const formatTimeToAMPM = (time24) => {
    if (!time24) return '';
    
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Refresh data handler
  const handleRefresh = () => {
    fetchAvailabilityData();
  };

  if (loading) {
    return (
      <div className="mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calendar size={24} />
              All Doctors Weekly Schedule Overview
            </h2>
          </div>
          <div className="flex justify-center items-center py-16">
            <Loader className="w-8 h-8 text-slate-400 animate-spin" />
            <span className="ml-3 text-slate-600">Loading schedule data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calendar size={24} />
              All Doctors Weekly Schedule Overview
            </h2>
          </div>
          <div className="flex flex-col justify-center items-center py-16">
            <div className="text-red-500 text-center mb-4">
              {error}
            </div>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calendar size={24} />
              All Doctors Weekly Schedule Overview
            </h2>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider border-r">
                  Doctor
                </th>
                {daysOfWeek.map(day => (
                  <th key={day} className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider border-r last:border-r-0">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
  {doctorList.length === 0 ? (
    <tr>
      <td colSpan={daysOfWeek.length + 1} className="px-8 py-12 text-center">
        <div className="text-slate-500">
          No doctors available
        </div>
      </td>
    </tr>
  ) : (
    doctorList.map((doctor) => {
      // Updated to match new DB structure
      const doctorData = weeklyAvailability.find(item => item.doctorId === doctor._id);
      const doctorSlots = doctorData ? doctorData.availabilitySlots : [];

      return (
        <tr key={doctor._id} className="hover:bg-slate-50/50 transition-colors">
          <td className="px-8 py-6 border-r">
            <div className="font-semibold text-slate-900">
              {doctor.name}
            </div>
          </td>

          {daysOfWeek.map(day => {
            const daySlots = doctorSlots.filter(slot => slot.day === day);

            return (
              <td key={day} className="px-6 py-6 border-r last:border-r-0 min-w-[180px]">
                {daySlots.length > 0 ? (
                  <div className="space-y-2">
                    {daySlots.map((slot, index) => (
                      <div 
                        key={slot._id || index}
                        className="text-sm bg-green-100 text-green-800 px-3 py-2 rounded-lg font-medium border border-green-200 text-center"
                      >
                        {formatTimeToAMPM(slot.startTime)} - {formatTimeToAMPM(slot.endTime)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-slate-400 text-sm">No slots</span>
                  </div>
                )}
              </td>
            );
          })}
        </tr>
      );
    })
  )}
</tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;