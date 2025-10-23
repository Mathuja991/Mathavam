import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Make sure this is imported

// Simple Modal component (kept for potential future use, e.g., error messages)
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-2xl transform transition-all sm:my-8">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

const ServiceBookingForm = () => {
  const navigate = useNavigate(); // Initialize navigate
  
  // --- State for the form data ---
  const [formData, setFormData] = useState({
    patientId: '',
    practitionerId: '',
    serviceType: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    notes: '',
    // 'status' is set by the backend, no need to keep it in frontend state
  });

  // --- State for dropdown options ---
  const [practitioners, setPractitioners] = useState([]);
  const [patients, setPatients] = useState([]);

  // --- State for loading, errors, and success messages ---
  const [loading, setLoading] = useState(false); // Combined loading state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // --- State to verify user session ---
  const [currentUserId, setCurrentUserId] = useState(null); 

  // --- Available service types ---
  const serviceTypes = [
    'Speech Therapy',
    'Occupational Therapy',
    'Physiotherapy',
    'Counseling Session',
    'Other',
  ];

  // --- Helper to get authorization token ---
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        // If token is missing early, redirect immediately
        console.error("Auth token missing, redirecting.");
        navigate('/?message=no_token');
        return null; // Indicate failure
    }
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
    };
  };

  // --- useEffect to load initial data (Patients, Practitioners) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // setError('Authentication required. Please log in again.');
        navigate('/?message=no_token'); 
        return;
      }

      // Verify user ID from localStorage just for frontend check
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user ? (user.id || user._id) : null;
        if (!userId) {
          setError('User session invalid. Please log in again.');
          // Optionally redirect immediately if user data is corrupt/missing
          // localStorage.removeItem('token');
          // localStorage.removeItem('user');
          // navigate('/?message=session_invalid');
          // return;
        }
        setCurrentUserId(userId); // Store user ID if found
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        setError('Failed to load user session. Please log in again.');
        // Optionally redirect on parse error
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');
        // navigate('/?message=session_error');
        // return;
      }

      setLoading(true);
      setError(null); // Clear previous errors
      
      const config = getAuthConfig();
      // If getAuthConfig returned null (no token), stop execution
      if (!config) { 
          setLoading(false);
          return; 
      }

      try {
        // Fetch only practitioners and patients
        const [usersResponse, patientsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/users`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/patientRecords`, config),
          // REMOVED: Fetching all appointments is not needed for booking
          // axios.get('http://localhost:5000/api/appointments', config), 
        ]);

        const filteredPractitioners = usersResponse.data.filter(
          (u) => u.userType === 'Doctor' || u.userType === 'Therapist'
        );
        setPractitioners(filteredPractitioners);
        setPatients(patientsResponse.data);
        // REMOVED: setAppointments(...)

      } catch (err) {
        if (err.response && err.response.status === 401) {
          console.error('Session expired during data fetch. Logging out.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/?message=session_expired');
        } else {
          console.error('Error fetching dropdown data:', err.response ? err.response.data : err.message);
          setError('Failed to load necessary data. Please check connection or log in again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate]); // navigate is a dependency

  // --- Handle changes in form inputs ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear success/error messages when user types again
    setSuccess(false);
    setError(null);
  };

  // --- Handle form submission for booking ---
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Double-check token and user ID before submitting
    const config = getAuthConfig();
    if (!config) {
        setError("Your session has expired or is invalid. Please log in again.");
        return; // Stop if no token
    }
    if (!currentUserId) {
       setError('User session verification failed. Please log in again.');
       return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    // Basic frontend validation
    if (!formData.patientId || !formData.practitionerId || !formData.serviceType || !formData.appointmentDate || !formData.startTime || !formData.endTime) {
         setError('Please fill in all required fields.');
         setLoading(false);
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

    // Prepare data to send (match backend controller expectations)
    const dataToSend = {
      patient: formData.patientId,
      practitioner: formData.practitionerId,
      serviceType: formData.serviceType,
      appointmentDate: formData.appointmentDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/appointments`,
        dataToSend,
        config // Send with auth token
      );

      setSuccess(true); // Show success message
      // Clear the form after successful booking
      setFormData({
        patientId: '',
        practitionerId: '',
        serviceType: '',
        appointmentDate: '',
        startTime: '',
        endTime: '',
        notes: '',
      });
      // REMOVED: Adding to local 'appointments' state is not needed here

    } catch (err) {
      console.error(
        'Error booking service appointment:',
        err.response ? err.response.data : err.message
      );
      
      // Handle 401 Unauthorized specifically (e.g., token expired mid-session)
      if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/?message=session_expired');
          // Setting an error message might not be seen if redirect happens fast
          // setError("Your session expired. Please log in again."); 
          return; 
      }

      // Extract a user-friendly error message from the backend response
      const responseData = err.response?.data;
      let errorMessage = 'Failed to book service appointment. Please check your inputs or try again later.'; // Default error

      if (responseData) {
        errorMessage = 
          responseData.message || // Preferred key
          responseData.error ||   // Common key for validation errors
          responseData.msg ||     // Another possible key
          (typeof responseData === 'string' ? responseData : errorMessage); // If backend just sends a string
      } else if (err.message) { // Handle network errors etc.
        errorMessage = `Network Error: ${err.message}`;
      }
        
      setError(errorMessage); // Display the extracted or default error message
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  // --- REMOVED: handleCancelAppointment ---
  // --- REMOVED: handleRebookInitiate ---
  // --- REMOVED: handleRebookSubmit ---

  // --- JSX for the form ---
  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans antialiased">
      <div className="container mx-auto max-w-4xl">
        {/* --- Page Header --- */}
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">
          Book New Appointment
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Schedule therapy appointments for children.
        </p>

        {/* --- Loading / Error / Success Messages --- */}
        {loading && <p className="text-blue-600 text-center mb-4 animate-pulse">Processing...</p>}
        {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-center mb-4 border border-red-200">{error}</p>}
        {success && (
          <p className="text-green-600 bg-green-50 p-3 rounded-lg text-center mb-4 border border-green-200">
            Appointment booked successfully!
          </p>
        )}

        {/* --- Main Booking Form --- */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2 border-b pb-3">
            <svg /* Calendar Icon */ xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h.01M16 11h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Appointment Details
          </h2>
          <form onSubmit={handleBookingSubmit} className="space-y-5"> {/* Increased spacing */}
            
            {/* --- Row 1: Patient & Practitioner --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5"> 
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient (Child) <span className="text-red-500">*</span>
                </label>
                <select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="" disabled>Select a patient</option>
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name} ({patient.childNo || patient.childRegNo || 'No ID'})
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading patients...</option>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="practitionerId" className="block text-sm font-medium text-gray-700 mb-1">
                  Therapist <span className="text-red-500">*</span>
                </label>
                <select
                  id="practitionerId"
                  name="practitionerId"
                  value={formData.practitionerId}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="" disabled>Select a therapist</option>
                  {practitioners.length > 0 ? (
                     practitioners.map((practitioner) => (
                      <option key={practitioner._id} value={practitioner._id}>
                        {practitioner.firstName} {practitioner.lastName} ({practitioner.userType})
                      </option>
                    ))
                  ) : (
                     <option disabled>Loading therapists...</option>
                  )}
                </select>
              </div>
            </div>

            {/* --- Row 2: Service Type --- */}
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                Service Type <span className="text-red-500">*</span>
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="" disabled>Select a service type</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* --- Row 3: Date & Times --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label> 
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* --- Row 4: Notes --- */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any relevant notes for the appointment..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* --- Submit Button --- */}
            <div className="flex justify-end pt-3"> {/* Added padding top */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                   'Book Appointment'
                  )}
              </button>
            </div>
          </form>
        </div>

        {/* --- REMOVED: Reschedule Modal --- */}
        {/* --- REMOVED: Simple Status Modal (using error/success states instead) --- */}
        
      </div>
    </div>
  );
};

export default ServiceBookingForm;