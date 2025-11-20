import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    Stethoscope, 
    Calendar,
    AlertCircle, 
    CheckCircle,  
    XCircle,
    Archive,
    RefreshCw,
    Clock4
} from 'lucide-react';


const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full transform transition-all scale-100 opacity-100 border border-gray-100">
                <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-red-100 rounded-full mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">Confirm Action</h3>
                    <p className="text-gray-600 mt-2 mb-6 text-base">{message}</p>
                    <div className="flex w-full gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold shadow-md"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg shadow-red-200"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const statusStyles = {
        Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
        Confirmed: "bg-blue-100 text-blue-800 border-blue-300",
        Completed: "bg-green-100 text-green-800 border-green-300",
        Cancelled: "bg-red-100 text-red-800 border-red-300",
        Rescheduled: "bg-purple-100 text-purple-800 border-purple-300",
        Default: "bg-gray-100 text-gray-800 border-gray-300",
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
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style}`}
        >
            {icon}
            {status}
        </span>
    );
};

const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '?';
    return (names[0][0] + names[names.length - 1][0])?.toUpperCase() || '?';
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const ServiceBookingForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    patientId: '',
    practitionerId: '',
    serviceType: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  const [practitioners, setPractitioners] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null); 
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('book');

  const [listAppointments, setListAppointments] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [modalContent, setModalContent] = useState({ message: '', onConfirm: () => {} });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 

  const serviceTypes = [
    'Speech Therapy',
    'Occupational Therapy',
    'Physiotherapy',
    'Counseling Session',
    'Other',
  ];

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("Auth token missing, redirecting.");
        navigate('/?message=no_token');
        return null; 
    }
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
    };
  };

  const showConfirmation = (message, onConfirm) => {
    setModalContent({ message, onConfirm });
    setShowConfirmationModal(true);
  };

  const handleModalConfirm = () => {
    modalContent.onConfirm();
    setShowConfirmationModal(false);
  };

  const handleModalCancel = () => {
    setShowConfirmationModal(false);
  };

  const fetchAllAppointments = async (config) => {
    if (!isAdmin) return; 

    setListLoading(true);
    setListError(null);
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/appointments`, config);
        setListAppointments(res.data.data || res.data);
    } catch (err) {
        if (err.response && err.response.status === 401) {
            console.error('Session expired. Logging out.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/?message=session_expired');
        } else {
            console.error('Error fetching appointments:', err);
            setListError('Failed to fetch appointments. Please try again.');
        }
    } finally {
        setListLoading(false);
    }
  };


  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/?message=no_token'); 
        return;
      }

      let isUserAdmin = false;
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user ? (user.id || user._id) : null;
        if (!userId) {
          setError('User session invalid. Please log in again.');
        }
        setCurrentUserId(userId); 
        isUserAdmin = ['Admin', 'Super Admin'].includes(user?.userType);
        setIsAdmin(isUserAdmin);

      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        setError('Failed to load user session. Please log in again.');
        return;
      }

      const config = getAuthConfig();
      if (!config) return; 

      setLoading(true);
      try {
        const [usersResponse, patientsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/users`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/patientRecords`, config),
        ]);

        const filteredPractitioners = usersResponse.data.filter(
          (u) => u.userType === 'Doctor' || u.userType === 'Therapist'
        );
        setPractitioners(filteredPractitioners);
        setPatients(patientsResponse.data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
      
      if (isUserAdmin) {
          fetchAllAppointments(config);
      }
    };

    fetchInitialData();
  }, [navigate, isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setSuccess(false);
    setError(null);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const config = getAuthConfig();
    if (!config) {
        setError("Your session has expired or is invalid. Please log in again.");
        return;
    }
    if (!currentUserId) {
       setError('User session verification failed. Please log in again.');
       return;
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000/01/01 ${formData.startTime}`);
      const end = new Date(`2000/01/01 ${formData.endTime}`);
      if (end <= start) {
        setError('End time must be after start time.');
        setLoading(false);
        return;
      }
    }

    const dataToSend = {
      patient: formData.patientId,
      practitioner: formData.practitionerId,
      serviceType: formData.serviceType,
      appointmentDate: formData.appointmentDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes,
    };

    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/appointments`, dataToSend, config
      );
      setSuccess(true);
      setFormData({ patientId: '', practitionerId: '', serviceType: '', appointmentDate: '', startTime: '', endTime: '', notes: '', });
      if(isAdmin) {
          fetchAllAppointments(config);
      }
      
      window.dispatchEvent(new Event('BOOKING_SUCCESS_NOTIFICATION_TRIGGER'));

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred during booking. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleListStatusChange = async (id, newStatus) => {
    const config = getAuthConfig();
    if (!config) return;

    try {
        const res = await axios.put(
            `${import.meta.env.VITE_API_URL}/appointments/${id}/status`, 
            { status: newStatus }, 
            config
        );
        
        setListAppointments(prevAppointments => 
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
            setListError('Failed to update status. Please try again.');
        }
    }
  };
  
  const handleListDeleteAppointment = (id) => {
    showConfirmation('Are you sure you want to delete this appointment? This action cannot be undone.', async () => {
        const config = getAuthConfig();
        if (!config) return;

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/appointments/${id}`, config);
            setListAppointments(prevAppointments => prevAppointments.filter(appt => appt._id !== id));
            setCurrentPage(1); 
        } catch (err) {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/?message=session_expired');
            } else {
                console.error('Error deleting appointment:', err);
                setListError('Failed to delete appointment. Please try again.');
            }
        }
    });
  };
  
  const filteredAppointments = useMemo(() => {
    let filtered = [...listAppointments];

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
  }, [listAppointments, searchTerm, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const paginatedAppointments = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredAppointments.slice(startIndex, endIndex);
  }, [filteredAppointments, currentPage, itemsPerPage]);

  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, itemsPerPage]);

  const handleNextPage = () => {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
      setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="container mx-auto p-4 md:p-10 max-w-7xl bg-gray-50 rounded-3xl shadow-2xl font-['Inter',_sans-serif] min-h-[80vh]">
        
        {isAdmin && (
            <div className="flex border-b-2 border-gray-200 mb-8 bg-white/70 backdrop-blur-sm rounded-t-xl overflow-hidden shadow-md">
                <button
                    onClick={() => setActiveTab('book')}
                    className={`px-8 py-4 text-lg font-bold transition-all duration-300 ${
                        activeTab === 'book'
                            ? 'border-b-4 border-blue-600 text-blue-800 bg-white shadow-inner-t'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                >
                    Book Service
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-8 py-4 text-lg font-bold transition-all duration-300 ${
                        activeTab === 'list'
                            ? 'border-b-4 border-blue-600 text-blue-800 bg-white shadow-inner-t'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                >
                    All Appointments List
                </button>
            </div>
        )}

        {activeTab === 'book' && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border-t-4 border-blue-600 max-w-4xl mx-auto">
                {error && (
                    <p className="text-red-700 bg-red-100 p-4 rounded-xl text-center mb-6 border border-red-300 font-medium">
                        <AlertCircle className="inline w-5 h-5 mr-2" />
                        Error: {error}
                    </p>
                )}
                {success && (
                    <p className="text-green-700 bg-green-100 p-4 rounded-xl text-center mb-6 border border-green-300 font-medium">
                        <CheckCircle className="inline w-5 h-5 mr-2" />
                        Appointment booked successfully!
                    </p>
                )}

                <h2 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center gap-3 border-b-2 border-gray-100 pb-4">
                    <CalendarDays className="h-7 w-7 text-blue-600" />
                    Book New Service Appointment
                </h2>
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="patientId" className="block text-sm font-semibold text-gray-700 mb-1">
                                Patient (Child) <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="patientId"
                                name="patientId"
                                value={formData.patientId}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 border-2 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-base rounded-xl shadow-sm transition-all duration-200 hover:border-blue-300 appearance-none bg-white"
                            >
                                <option value="">Select Child</option>
                                {patients.map((patient) => {
                                    const regNo = patient.childRegNo || patient.childNo || 'N/A';
                                    const displayText = `${patient.name} [Reg No: ${regNo}]`;
                                    return (
                                        <option key={patient._id} value={patient._id}>
                                            {displayText}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="practitionerId" className="block text-sm font-semibold text-gray-700 mb-1">
                                Practitioner <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="practitionerId"
                                name="practitionerId"
                                value={formData.practitionerId}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 border-2 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-base rounded-xl shadow-sm transition-all duration-200 hover:border-blue-300 appearance-none bg-white"
                            >
                                <option value="">Select Practitioner</option>
                                {practitioners.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.firstName} {p.lastName} ({p.userType})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="serviceType" className="block text-sm font-semibold text-gray-700 mb-1">
                                Service Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="serviceType"
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 border-2 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-base rounded-xl shadow-sm transition-all duration-200 hover:border-blue-300 appearance-none bg-white"
                            >
                                <option value="">Select Service</option>
                                {serviceTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="appointmentDate" className="block text-sm font-semibold text-gray-700 mb-1">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="appointmentDate"
                                name="appointmentDate"
                                value={formData.appointmentDate}
                                onChange={handleChange}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="mt-1 block w-full py-3 px-3 border border-gray-300 border-2 rounded-xl shadow-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 hover:border-blue-300"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700 mb-1">
                                Start Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="startTime"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full py-3 px-3 border border-gray-300 border-2 rounded-xl shadow-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 hover:border-blue-300"
                            />
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700 mb-1">
                                End Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="endTime"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full py-3 px-3 border border-gray-300 border-2 rounded-xl shadow-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 hover:border-blue-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows="4"
                            value={formData.notes}
                            onChange={handleChange}
                            className="mt-1 block w-full p-4 border border-gray-300 border-2 rounded-xl shadow-sm focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 hover:border-blue-300"
                            placeholder="Any specific instructions or context for the practitioner..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-5">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center items-center py-3 px-8 border border-transparent shadow-lg text-lg font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Booking...
                                </>
                            ) : (
                                'Confirm Service Booking'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {activeTab === 'list' && isAdmin && (
            <div className="mt-8">
                <div className="p-6 mb-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-6 border-b pb-3 text-gray-700">
                        <Filter className="w-6 h-6 text-blue-600" />
                        <h2 className="text-2xl font-bold">Filter & Search Options</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div className="md:col-span-2 relative">
                            <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-1"> Search </label>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 mt-3.5 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                id="search" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                placeholder="Patient name, Reg No, Practitioner..." 
                                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-600 focus:border-blue-600 transition-all" 
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="statusFilter" className="block text-sm font-semibold text-gray-700 mb-1"> Status </label>
                            <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 mt-3.5 w-5 h-5 text-gray-400" />
                            <select 
                                id="statusFilter" 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)} 
                                className="block w-full appearance-none pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-600 focus:border-blue-600 transition-all bg-white" 
                            >
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Rescheduled">Rescheduled</option>
                            </select>
                        </div>
                        <div className="relative">
                            <label htmlFor="dateFilter" className="block text-sm font-semibold text-gray-700 mb-1"> Date </label>
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 mt-3.5 w-5 h-5 text-gray-400" />
                            <input 
                                type="date" 
                                id="dateFilter" 
                                value={dateFilter} 
                                onChange={(e) => setDateFilter(e.target.value)} 
                                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-600 focus:border-blue-600 transition-all" 
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
                    {listError && (
                        <div className="p-4 bg-red-100 text-red-700 text-center font-medium">Error: {listError}</div>
                    )}
                    {listLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="ml-3 text-lg text-gray-600">Loading Appointments...</span>
                        </div>
                    ) : paginatedAppointments.length === 0 ? (
                        <div className="p-10 text-center text-gray-500 text-xl font-medium">No appointments found matching your filters.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-blue-50 border-b border-blue-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Practitioner</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Service Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {paginatedAppointments.map((appt) => (
                                        <tr key={appt._id} className="hover:bg-blue-50/50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-base ring-2 ring-blue-300">
                                                        {getInitials(appt.patient?.name)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{appt.patient?.name || 'N/A'}</div>
                                                        <div className="text-xs text-gray-500 font-mono">Reg: {appt.patient?.childRegNo || appt.patient?.childNo || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-base ring-2 ring-green-300">
                                                        {getInitials(appt.practitioner?.firstName)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{appt.practitioner?.firstName} {appt.practitioner?.lastName}</div>
                                                        <div className="text-xs text-gray-500 italic">{appt.practitioner?.userType}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-700">{appt.serviceType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <Calendar className="w-4 h-4 text-blue-500" />
                                                    {formatDate(appt.appointmentDate)}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 text-xs">
                                                    <Clock className="w-4 h-4 text-blue-500" />
                                                    {appt.startTime} - {appt.endTime}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={appt.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-3 items-center">
                                                    <select
                                                        value={appt.status}
                                                        onChange={(e) => handleListStatusChange(appt._id, e.target.value)}
                                                        className="px-4 py-2 text-sm border border-gray-300 rounded-xl shadow-sm focus:ring-blue-600 focus:border-blue-600 cursor-pointer transition-all hover:border-blue-400 bg-white"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Confirmed">Confirmed</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                        <option value="Rescheduled">Rescheduled</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleListDeleteAppointment(appt._id)}
                                                        className="p-2 text-red-600 hover:text-white rounded-full hover:bg-red-600 transition-colors duration-150 ring-1 ring-red-300 hover:ring-red-600 shadow-sm"
                                                        title="Delete Appointment"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {(totalPages > 1 || paginatedAppointments.length > 0) && (
                        <div className="p-5 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                                Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredAppointments.length)}</span> of <span className="font-semibold">{filteredAppointments.length}</span> results
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        <ConfirmationModal
            isOpen={showConfirmationModal}
            message={modalContent.message}
            onConfirm={handleModalConfirm}
            onCancel={handleModalCancel}
        />
    </div>
  );
};

export default ServiceBookingForm;