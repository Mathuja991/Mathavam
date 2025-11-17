// client/src/pages/Appointment/PractitionerCalendar.jsx (New Component)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PractitionerCalendar = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // To store logged-in user details

  useEffect(() => {
    // In a real application, get user info from a secure context/state (e.g., Redux, Auth Context)
    // For demonstration, we'll simulate getting user ID and userType from localStorage
    const user = JSON.parse(localStorage.getItem('user')); // Assuming you store user object upon login
    if (user && (user.userType === 'Doctor' || user.userType === 'Therapist')) {
      setCurrentUser(user);
      fetchPractitionerAppointments(user.id); // Fetch appointments for the logged-in practitioner
    } else {
      setError('You are not authorized to view this page. Please log in as a Doctor or Therapist.');
      setLoading(false);
      // Optionally redirect to login or dashboard if not authorized
      // navigate('/login');
    }
  }, []);

  const fetchPractitionerAppointments = async (practitionerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/appointments/practitioner/${practitionerId}`);
      // Group appointments by date for easier display
      const groupedAppointments = response.data.data.reduce((acc, appointment) => {
        const date = new Date(appointment.appointmentDate).toLocaleDateString('en-CA'); // 'en-CA' for YYYY-MM-DD
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(appointment);
        return acc;
      }, {});
      setAppointments(groupedAppointments);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching practitioner appointments:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to load appointments. Please try again.');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change this appointment status to "${newStatus}"?`)) {
        return;
    }
    try {
        await axios.put(`${import.meta.env.VITE_API_URL}/appointments/${appointmentId}/status`, { status: newStatus });
        alert('Appointment status updated successfully!');
        // Re-fetch appointments to update the view
        if (currentUser) {
            fetchPractitionerAppointments(currentUser.id);
        }
    } catch (err) {
        console.error('Error updating appointment status:', err.response ? err.response.data : err.message);
        alert(err.response?.data?.message || 'Failed to update appointment status.');
    }
  };

  if (loading) {
    return <div className="text-center text-blue-500 text-xl py-8">Loading schedule...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-xl py-8">{error}</div>;
  }

  const sortedDates = Object.keys(appointments).sort();

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        {currentUser?.userType} Schedule - {currentUser?.firstName} {currentUser?.lastName}
      </h2>

      {sortedDates.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No appointments scheduled for you.</p>
      ) : (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">{new Date(date).toDateString()}</h3>
              <div className="space-y-4">
                {appointments[date]
                  .sort((a, b) => a.startTime.localeCompare(b.startTime)) // Sort by time
                  .map(appt => (
                  <div key={appt._id} className="p-4 border border-gray-300 rounded-md bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <p className="text-lg font-medium text-indigo-700">
                        {appt.startTime} - {appt.endTime}
                      </p>
                      <p className="text-gray-900 mt-1">
                        Patient: **{appt.patient?.firstName} {appt.patient?.lastName}** ({appt.patient?.childRegNo})
                      </p>
                      {appt.serviceType && (
                        <p className="text-gray-700">Service: {appt.serviceType}</p>
                      )}
                      <p className={`mt-1 text-sm font-semibold ${
                        appt.status === 'Confirmed' ? 'text-green-600' :
                        appt.status === 'Cancelled' ? 'text-red-600' :
                        appt.status === 'Completed' ? 'text-blue-600' : 'text-yellow-600'
                      }`}>
                        Status: {appt.status}
                      </p>
                      {appt.notes && (
                        <p className="text-gray-500 text-sm mt-1">Notes: {appt.notes}</p>
                      )}
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4 flex flex-col space-y-2">
                        {appt.status === 'Pending' && (
                            <button
                                onClick={() => handleStatusUpdate(appt._id, 'Confirmed')}
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                            >
                                Confirm
                            </button>
                        )}
                        {appt.status !== 'Completed' && ( // Allow completion if not already completed
                            <button
                                onClick={() => handleStatusUpdate(appt._id, 'Completed')}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Mark Completed
                            </button>
                        )}
                        {appt.status !== 'Cancelled' && ( // Allow cancellation if not already cancelled
                            <button
                                onClick={() => handleStatusUpdate(appt._id, 'Cancelled')}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        {/* More options like Reschedule could be added here */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PractitionerCalendar;