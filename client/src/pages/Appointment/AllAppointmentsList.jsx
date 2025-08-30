import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AllAppointmentsList = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    
    // State for the custom confirmation modal
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ message: '', onConfirm: () => {} });

    // Function to show the custom confirmation modal
    const showConfirmation = (message, onConfirm) => {
        setModalContent({ message, onConfirm });
        setShowModal(true);
    };

    // Function to handle the modal confirmation
    const handleModalConfirm = () => {
        modalContent.onConfirm();
        setShowModal(false);
    };

    // Function to handle the modal cancellation
    const handleModalCancel = () => {
        setShowModal(false);
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && (user.userType === 'Admin' || user.userType === 'Super Admin')) {
            setCurrentUser(user);
            // This nested function prevents the need for useCallback
            const fetchAllAppointments = async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/appointments`);
                    setAppointments(response.data.data);
                } catch (err) {
                    console.error('Error fetching all appointments:', err.response ? err.response.data : err.message);
                    setError(err.response?.data?.error || 'Failed to load all appointments. Please try again.');
                } finally {
                    setLoading(false);
                }
            };
            fetchAllAppointments();
        } else {
            setError('You are not authorized to view this page. Please log in as an Admin or Super Admin.');
            setLoading(false);
            // navigate('/login');
        }
    }, []);

    const fetchAllAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/appointments`);
            setAppointments(response.data.data);
        } catch (err) {
            console.error('Error fetching all appointments:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || 'Failed to load all appointments. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleStatusUpdate = async (appointmentId, newStatus) => {
        showConfirmation(
            `Are you sure you want to change this appointment status to "${newStatus}"?`,
            async () => {
                try {
                    await axios.put(`${import.meta.env.VITE_API_URL}/appointments/${appointmentId}/status`, { status: newStatus });
                    fetchAllAppointments();
                } catch (err) {
                    console.error('Error updating appointment status:', err.response ? err.response.data : err.message);
                    setError(err.response?.data?.error || 'Failed to update appointment status.');
                }
            }
        );
    };

    const handleDeleteAppointment = async (appointmentId) => {
        showConfirmation(
            'Are you sure you want to delete this appointment? This action cannot be undone.',
            async () => {
                try {
                    await axios.delete(`${import.meta.env.VITE_API_URL}/appointments/${appointmentId}`);
                    fetchAllAppointments();
                } catch (err) {
                    console.error('Error deleting appointment:', err.response ? err.response.data : err.message);
                    setError(err.response?.data?.error || 'Failed to delete appointment.');
                }
            }
        );
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100">
                    <p className="text-blue-500 text-xl font-semibold">Loading all appointments...</p>
                </div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                </div>;
    }

    const CustomModal = ({ message, onConfirm, onCancel }) => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-8 bg-white w-96 max-w-lg rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full">
                <div className="text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Confirmation</h3>
                    <p className="text-sm text-gray-500 mb-6">{message}</p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={onCancel}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
    

    return (
        <div className="min-h-screen bg-gray-100 py-10 font-sans">
            <div className="container mx-auto p-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">All System Appointments</h2>
                {showModal && <CustomModal message={modalContent.message} onConfirm={handleModalConfirm} onCancel={handleModalCancel} />}

                {appointments.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg py-8">No appointments found in the system.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Practitioner</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Service Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Booked By</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {appointments.map((appt) => (
                                    <tr key={appt._id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {appt.patient?.firstName} {appt.patient?.lastName} ({appt.patient?.childRegNo})
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {appt.practitioner?.firstName} {appt.practitioner?.lastName} ({appt.practitioner?.userType})
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.serviceType || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(appt.appointmentDate).toLocaleDateString()} {appt.startTime}-{appt.endTime}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full transition-colors duration-200 ${
                                                appt.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                appt.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                appt.status === 'Rescheduled' ? 'bg-indigo-100 text-indigo-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {appt.bookedBy?.username} ({appt.bookedBy?.userType})
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-center items-center space-x-2">
                                                <select
                                                    onChange={(e) => handleStatusUpdate(appt._id, e.target.value)}
                                                    value={appt.status}
                                                    className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                    <option value="Rescheduled">Rescheduled</option>
                                                </select>
                                                <button
                                                    onClick={() => handleDeleteAppointment(appt._id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors duration-200 ml-2"
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
        </div>
    );
};

export default AllAppointmentsList;
