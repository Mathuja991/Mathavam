// client/src/pages/Appointment/AllAppointmentsList.jsx (New Component)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AllAppointmentsList = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // To store logged-in user details

  useEffect(() => {
    // Authenticate user for this page (Admin/Super Admin only)
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && (user.userType === 'Admin' || user.userType === 'Super Admin')) {
      setCurrentUser(user);
      fetchAllAppointments();
    } else {
      setError('You are not authorized to view this page. Please log in as an Admin or Super Admin.');
      setLoading(false);
      // Optionally redirect
      // navigate('/login');
    }
  }, []);

  const fetchAllAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/appointments`);
      setAppointments(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching all appointments:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to load all appointments. Please try again.');
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
        fetchAllAppointments(); // Re-fetch to update list
    } catch (err) {
        console.error('Error updating appointment status:', err.response ? err.response.data : err.message);
        alert(err.response?.data?.message || 'Failed to update appointment status.');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
        return;
    }
    try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/appointments/${appointmentId}`);
        alert('Appointment deleted successfully!');
        fetchAllAppointments(); // Re-fetch to update list
    } catch (err) {
        console.error('Error deleting appointment:', err.response ? err.response.data : err.message);
        alert(err.response?.data?.message || 'Failed to delete appointment.');
    }
  };

  if (loading) {
    return <div className="text-center text-blue-500 text-xl py-8">Loading all appointments...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-xl py-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">All System Appointments</h2>

      {appointments.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No appointments found in the system.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Practitioner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appt) => (
                <tr key={appt._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appt.patient?.firstName} {appt.patient?.lastName} ({appt.patient?.childRegNo})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appt.practitioner?.firstName} {appt.practitioner?.lastName} ({appt.practitioner?.userType})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{appt.serviceType || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(appt.appointmentDate).toLocaleDateString()} {appt.startTime}-{appt.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appt.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      appt.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appt.bookedBy?.username} ({appt.bookedBy?.userType})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <select
                          onChange={(e) => handleStatusUpdate(appt._id, e.target.value)}
                          value={appt.status}
                          className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Rescheduled">Rescheduled</option>
                      </select>
                      <button
                        onClick={() => handleDeleteAppointment(appt._id)}
                        className="text-red-600 hover:text-red-900 ml-2"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllAppointmentsList;