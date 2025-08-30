import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Reusable Modal Component to replace alert()
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

const ServiceBookingForm = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    practitionerId: '',
    serviceType: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    notes: '',
    status: 'Pending',
  });
  const [practitioners, setPractitioners] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [currentAppointment, setCurrentAppointment] = useState(null);

  const serviceTypes = [
    'Speech Therapy',
    'Occupational Therapy',
    'Physiotherapy',
    'Counseling Session',
    'Other'
  ];

  // Fetch initial data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersResponse, patientsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/users'),
          axios.get('http://localhost:5000/api/patientRecords')
        ]);

        const filteredPractitioners = usersResponse.data.filter(
          (user) => user.userType === 'Doctor' || user.userType === 'Therapist'
        );
        setPractitioners(filteredPractitioners);

        setPatients(patientsResponse.data);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err.response ? err.response.data : err.message);
        setError('Failed to load data. Please check the backend server.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setSuccess(false);
    setError(null);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.serviceType) {
        setError('Please select a Service Type.');
        setLoading(false);
        return;
      }
      
      // Validation for start and end times
      if (formData.startTime && formData.endTime) {
        const start = new Date(`2000/01/01 ${formData.startTime}`);
        const end = new Date(`2000/01/01 ${formData.endTime}`);
        if (end <= start) {
          setError('End time must be after start time.');
          setLoading(false);
          return;
        }
      }

      const response = await axios.post('http://localhost:5000/api/appointments', formData);
      setSuccess(true);
      setLoading(false);
      console.log('Service appointment created:', response.data);
      setAppointments([...appointments, response.data.data]);
      setFormData({
        patientId: '', practitionerId: '', serviceType: '', appointmentDate: '',
        startTime: '', endTime: '', notes: '', status: 'Pending',
      });
    } catch (err) {
      console.error('Error booking service appointment:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to book service appointment. Please check your inputs.');
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const updatedAppointments = appointments.map(app =>
        app._id === appointmentId ? { ...app, status: 'Cancelled' } : app
      );
      setAppointments(updatedAppointments);
      setModalMessage('Appointment cancelled successfully!');
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setModalMessage('Failed to cancel appointment. Please try again.');
      setIsModalOpen(true);
    }
  };

  const handleRebookInitiate = (appointment) => {
    setCurrentAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleRebookSubmit = async (e) => {
    e.preventDefault();
    const newDate = e.target.newDate.value;
    const newTime = e.target.newTime.value;

    try {
      const updatedAppointments = appointments.map(app =>
        app._id === currentAppointment._id ? { ...app, appointmentDate: newDate, startTime: newTime, status: 'Rescheduled' } : app
      );
      setAppointments(updatedAppointments);
      setIsModalOpen(false);
      setModalMessage('Appointment rescheduled successfully!');
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setModalMessage('Failed to reschedule appointment. Please try again.');
      setIsModalOpen(true);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans antialiased">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">
          Appointment Management
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Manage all your child's therapy appointments in one place.
        </p>

        {loading && <p className="text-blue-500 text-center">දත්ත ලබාගනිමින් පවතී...</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">Booked successfully! A notification will be sent to the parent.</p>}

        {/* New Booking Form Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h.01M16 11h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Book a New Appointment
          </h2>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Selection */}
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Patient (Child)</label>
                <select id="patientId" name="patientId" value={formData.patientId} onChange={handleChange} required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} ({patient.childNo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Therapist Selection */}
              <div>
                <label htmlFor="practitionerId" className="block text-sm font-medium text-gray-700">Therapist</label>
                <select id="practitionerId" name="practitionerId" value={formData.practitionerId} onChange={handleChange} required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option value="">Select a therapist</option>
                  {practitioners.map((practitioner) => (
                    <option key={practitioner._id} value={practitioner._id}>
                      {practitioner.firstName} {practitioner.lastName} ({practitioner.userType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Type Selection */}
              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">Service Type</label>
                <select id="serviceType" name="serviceType" value={formData.serviceType} onChange={handleChange} required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option value="">Select a service type</option>
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Appointment Date */}
              <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700">Appointment Date</label>
                <input type="date" id="appointmentDate" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors" />
              </div>

              {/* Start Time */}
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleChange} required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors" />
              </div>

              {/* End Time */}
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleChange} required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors" />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
              <textarea id="notes" name="notes" rows="3" value={formData.notes} onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>

            <div className="flex justify-end space-x-3">
              <button type="submit" disabled={loading}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95 transition-transform">
                {loading ? 'Book කරමින්...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Appointments Section - This part needs to be updated to fetch data for the selected patient */}
        {/* For now, it will remain empty since the initial appointment fetching was removed to fix the error */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-9 11l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Your Appointments
          </h2>
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              කිසිදු appointment එකක් නොමැත.
            </p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment._id}
                  className="p-5 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {appointment.serviceType}
                    </h3>
                    <p className="text-gray-600">
                      <span className="font-semibold">Therapist:</span>{" "}
                      {appointment.practitioner?.firstName} {appointment.practitioner?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-semibold">Date & Time:</span>{" "}
                      {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.startTime}
                    </p>
                    <p className="text-sm font-semibold mt-1" style={{ color: appointment.status === 'Cancelled' ? 'red' : appointment.status === 'Rescheduled' ? 'orange' : 'green' }}>
                      Status: {appointment.status}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex gap-2">
                    <button onClick={() => handleRebookInitiate(appointment)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors active:scale-95"
                      title="Reschedule" disabled={appointment.status === 'Cancelled'}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-3L18 8m-5 5L18 8m-5 5h7m-7 0v7" />
                      </svg>
                    </button>
                    <button onClick={() => handleCancelAppointment(appointment._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors active:scale-95"
                      title="Cancel" disabled={appointment.status === 'Cancelled'}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rebooking Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Reschedule Appointment">
          <p className="text-gray-600 mb-4">
            Reschedule your appointment for
            <span className="font-semibold"> {currentAppointment?.serviceType}</span>
            with
            <span className="font-semibold"> {currentAppointment?.practitioner?.firstName}</span>.
          </p>
          <form onSubmit={handleRebookSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">New Date</label>
                <input type="date" name="newDate" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">New Time</label>
                <input type="time" name="newTime" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors active:scale-95">
                Cancel
              </button>
              <button type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-colors active:scale-95">
                Confirm Reschedule
              </button>
            </div>
          </form>
        </Modal>
        
        {/* Success/Error/Info Modal */}
        <Modal isOpen={!!modalMessage} onClose={() => setModalMessage('')} title="Status">
          <p className="text-gray-600">{modalMessage}</p>
          <div className="mt-4 flex justify-end">
            <button onClick={() => setModalMessage('')} className="px-4 py-2 bg-blue-500 text-white rounded-lg">OK</button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ServiceBookingForm;
