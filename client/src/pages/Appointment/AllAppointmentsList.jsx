import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// --- LASSANA UI SANDAHAMA ICON IMPORTS ---
import { 
    Search, 
    Filter, 
    CalendarDays, 
    ListFilter, 
    ChevronLeft, 
    ChevronRight, 
    Trash2, 
    Clock, 
    User, 
    Stethoscope, // Doctor/Therapist icon
    Calendar,
    AlertCircle, // Modal icon
    CheckCircle,  // Status icons
    XCircle,
    Archive,
    RefreshCw,
    Clock4
} from 'lucide-react';

// --- HELPER COMPONENT: LASSANA STATUS BADGES ---
// Status eka anuwa wenas wana lassana badge ekak sadana component eka
const StatusBadge = ({ status }) => {
    const statusStyles = {
        Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
        Completed: "bg-green-100 text-green-800 border-green-200",
        Cancelled: "bg-red-100 text-red-800 border-red-200",
        Rescheduled: "bg-purple-100 text-purple-800 border-purple-200",
        Default: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const statusIcons = {
        Pending: <Clock4 className="w-3 h-3" />,
        Confirmed: <CheckCircle className="w-3 h-3" />,
        Completed: <Archive className="w-3 h-3" />,
        Cancelled: <XCircle className="w-3 h-3" />,
        Rescheduled: <RefreshCw className="w-3 h-3" />,
    };

    const style = statusStyles[status] || statusStyles.Default;
    const icon = statusIcons[status] || null;

    return (
        <span 
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
        >
            {icon}
            {status}
        </span>
    );
};

// --- HELPER FUNCTION: AVATAR EKA SANDAHAMA INITIALS ---
// Namakin akuru dekak laba gani (e.g., "Nimal Silva" -> "NS")
const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '?';
    return (names[0][0] + names[names.length - 1][0])?.toUpperCase() || '?';
};


const AllAppointmentsList = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]); // Original full list
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    
    // Confirmation modal state
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ message: '', onConfirm: () => {} });

    // Filters & Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); 

    // Show confirmation modal
    const showConfirmation = (message, onConfirm) => {
        setModalContent({ message, onConfirm });
        setShowModal(true);
    };

    const handleModalConfirm = () => {
        modalContent.onConfirm();
        setShowModal(false);
    };

    const handleModalCancel = () => {
        setShowModal(false);
    };

    // Get auth config helper
    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, redirecting to login.');
            navigate('/?message=session_expired');
            return null;
        }
        return {
            headers: { 'x-auth-token': token }
        };
    };

    // 1. Fetch data ONCE
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && (user.userType === 'Admin' || user.userType === 'Super Admin')) {
            setCurrentUser(user);
            
            const fetchAllAppointments = async () => {
                const config = getAuthConfig();
                if (!config) return; 

                try {
                    // This will now get the correct patient fields ('name', 'childNo')
                    const res = await axios.get('http://localhost:5000/api/appointments', config);
                    setAppointments(res.data.data || res.data);
                } catch (err) {
                    if (err.response && err.response.status === 401) {
                        console.error('Session expired. Logging out.');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/?message=session_expired');
                    } else {
                        console.error('Error fetching appointments:', err);
                        setError('Failed to fetch appointments. Please try again.');
                    }
                } finally {
                    setLoading(false);
                }
            };
            
            fetchAllAppointments();
        } else {
            setError('Access Denied. You do not have permission to view this page.');
            setLoading(false);
        }
    }, [navigate]);

    // 2. Memoized filtering logic
    const filteredAppointments = useMemo(() => {
        let filtered = [...appointments];

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(appt => 
                (appt.patient?.name && appt.patient.name.toLowerCase().includes(lowerSearchTerm)) ||
                (appt.patient?.childRegNo && appt.patient.childRegNo.toLowerCase().includes(lowerSearchTerm)) ||
                (appt.patient?.childNo && appt.patient.childNo.toLowerCase().includes(lowerSearchTerm)) ||
                (appt.practitioner?.firstName && appt.practitioner.firstName.toLowerCase().includes(lowerSearchTerm)) ||
                (appt.practitioner?.lastName && appt.practitioner.lastName.toLowerCase().includes(lowerSearchTerm)) ||
                (appt.serviceType && appt.serviceType.toLowerCase().includes(lowerSearchTerm))
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(appt => appt.status === statusFilter);
        }

        if (dateFilter) {
            filtered = filtered.filter(appt => {
                const apptDate = new Date(appt.appointmentDate).toISOString().split('T')[0];
                return apptDate === dateFilter;
            });
        }

        return filtered;
    }, [appointments, searchTerm, statusFilter, dateFilter]);

    // 3. Memoized pagination logic
    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

    const paginatedAppointments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAppointments.slice(startIndex, endIndex);
    }, [filteredAppointments, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, dateFilter, itemsPerPage]);

    // Pagination handlers
    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    // API call handlers (status change, delete)
    const handleStatusChange = async (id, newStatus) => {
        const config = getAuthConfig();
        if (!config) return;

        try {
            const res = await axios.put(
                `http://localhost:5000/api/appointments/${id}/status`, 
                { status: newStatus }, 
                config
            );
            
            setAppointments(prevAppointments => 
                prevAppointments.map(appt => 
                    appt._id === id ? { ...appt, status: res.data.data.status } : appt
                )
            );
        } catch (err) {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/?message=session_expired'); 
            } else {
                console.error('Error updating status:', err);
                setError('Failed to update status. Please try again.');
            }
        }
    };

    const handleDeleteAppointment = (id) => {
        showConfirmation('Are you sure you want to delete this appointment?', async () => {
            const config = getAuthConfig();
            if (!config) return;
            
            try {
                await axios.delete(`http://localhost:5000/api/appointments/${id}`, config);
                setAppointments(prevAppointments => 
                    prevAppointments.filter(appt => appt._id !== id)
                );
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/?message=session_expired');
                } else {
                    console.error('Error deleting appointment:', err);
                    setError('Failed to delete appointment. Please try again.');
                }
            }
        });
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    // --- LASSANA UI: MODIFIED MODAL ---
    const Modal = ({ isOpen, message, onConfirm, onCancel }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all scale-100 opacity-100">
                    <div className="flex flex-col items-center text-center">
                        <div className="p-3 bg-red-100 rounded-full">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Confirm Action</h3>
                        <p className="text-gray-600 mb-6">{message}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium shadow-md shadow-red-500/20 hover:bg-red-700 transition-colors"
                        >
                            Confirm Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-lg font-medium text-gray-600">Loading appointments...</div>
        </div>
    );
    
    if (error) return (
        <div className="p-6 text-center text-red-700 bg-red-50 rounded-lg max-w-3xl mx-auto mt-10 border border-red-200">
            <h3 className="font-semibold text-lg">Error</h3>
            <p>{error}</p>
        </div>
    );

    // --- LASSANA UI WENASKAM ARABHE WE ---
    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <Modal
                isOpen={showModal}
                message={modalContent.message}
                onConfirm={handleModalConfirm}
                onCancel={handleModalCancel}
            />
            <div className="container mx-auto max-w-8xl"> {/* Made wider */}
                
                {/* --- LASSANA HEADER EKA --- */}
                <div className="mb-6">
                    <h1 className="text-4xl font-extrabold text-gray-800">All Appointments</h1>
                    <p className="text-lg text-gray-500 mt-1">
                        Manage, filter, and search all appointments in the system.
                    </p>
                </div>
                
                {/* --- LASSANA SEARCH HA FILTER KOTUWA --- */}
                <div className="mb-6 p-5 bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-700">Filter & Search</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-2 relative">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            {/* --- ICON EKA INPUT EKA ATHULE --- */}
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 mt-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by patient, practitioner, service..."
                                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 mt-3 w-5 h-5 text-gray-400" />
                            <select
                                id="statusFilter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="block w-full appearance-none pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Rescheduled">Rescheduled</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="relative">
                            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 mt-3 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                id="dateFilter"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* --- LASSANA TABLE EKA --- */}
                <div className="bg-white shadow-xl shadow-gray-200/50 rounded-xl overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        {filteredAppointments.length === 0 ? (
                            <p className="p-10 text-center text-gray-500 text-lg">
                                {searchTerm || statusFilter || dateFilter ? 'No appointments match your filters.' : 'No appointments found.'}
                            </p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Practitioner</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedAppointments.map((appt) => (
                                        <tr key={appt._id} className="hover:bg-gray-50/50 transition-colors">
                                            
                                            {/* --- PATIENT AVATAR EKA HA NAMA (NIWERADI KARA ATH) --- */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                                        {getInitials(appt.patient?.name)}
                                                    </div>
                                                    <div>
                                                        {/* This now correctly displays 'name' */}
                                                        <div className="text-sm font-semibold text-gray-900">{appt.patient?.name}</div>
                                                        {/* This displays 'childRegNo' or 'childNo' */}
                                                        <div className="text-xs text-gray-500">{appt.patient?.childRegNo || appt.patient?.childNo}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            {/* --- PRACTITIONER AVATAR EKA HA NAMA --- */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-semibold text-sm">
                                                        {getInitials(appt.practitioner?.firstName)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{appt.practitioner?.firstName} {appt.practitioner?.lastName}</div>
                                                        <div className="text-xs text-gray-500">{appt.practitioner?.userType}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{appt.serviceType}</td>
                                            
                                            {/* --- ICONS SAHITHA DATE/TIME --- */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>{formatDate(appt.appointmentDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span>{appt.startTime} - {appt.endTime}</span>
                                                </div>
                                            </td>
                                            
                                            {/* --- LASSANA STATUS BADGES --- */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={appt.status} />
                                            </td>
                                            
                                            {/* --- WENAS KALA ACTIONS --- */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {/* --- STATUS WENAS KIREEMA --- */}
                                                    <select
                                                        value={appt.status}
                                                        onChange={(e) => handleStatusChange(appt._id, e.target.value)}
                                                        className="w-full max-w-[130px] px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Confirmed">Confirmed</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                        <option value="Rescheduled">Rescheduled</option>
                                                    </select>
                                                    
                                                    {/* --- DELETE ICON BUTTON EKA --- */}
                                                    <button
                                                        onClick={() => handleDeleteAppointment(appt._id)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-100"
                                                        title="Delete Appointment"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* --- LASSANA PAGINATION CONTROLS --- */}
                    {filteredAppointments.length > itemsPerPage && (
                        <div className="flex items-center justify-between py-4 px-6 bg-white border-t border-gray-200 rounded-b-xl">
                            {/* Items per page selector */}
                            <div>
                                <label htmlFor="itemsPerPage" className="text-sm text-gray-600 mr-2">Show:</label>
                                <select
                                    id="itemsPerPage"
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            {/* Page info */}
                            <span className="text-sm text-gray-700">
                                Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                                {' '}
                                (<span className="font-semibold">{filteredAppointments.length}</span> results)
                            </span>

                            {/* Pagination buttons */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllAppointmentsList;