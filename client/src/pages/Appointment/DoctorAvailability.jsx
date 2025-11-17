import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import axios from "axios";
import DoctorSelection from "../../components/appointmentAdmin/DoctorSelection";
import AvailabilityManager from "../../components/appointmentAdmin/AvailabilityManager";
import AppointmentsTab from "../../components/appointmentAdmin/AppointmentsTab";
import CancelConfirmation from "../../components/appointmentAdmin/CancelConfirmation";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DoctorsAvailability = () => {
  const [doctorList, setDoctorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real appointment data from doctorappointments database
  const [appointments, setAppointments] = useState([]);

  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [activeTab, setActiveTab] = useState("availability");
  const [cancelConfirmation, setCancelConfirmation] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('/api/doctors');

        if (response.data && response.data.success && response.data.data) {
          const transformedDoctors = response.data.data.map(doctor => ({
            _id: doctor._id,
            doctorId: doctor.doctorId,
            name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            doctorEmail: doctor.doctorEmail,
            doctorPhone: doctor.doctorPhone,
            qualification: doctor.qualification,
            experience: doctor.experience
          }));

          setDoctorList(transformedDoctors);
          setLoading(false);
        } else {
          console.log('Unexpected API response structure:', response.data);
          setError('Unexpected response from server');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/doctorappointments');
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  // Load appointments when component mounts
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter states for appointments
  const [filters, setFilters] = useState({
    doctorName: "",
    patientName: "",
    date: "",
    time: "",
    status: "all"
  });

  // Add loading state UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  const handleCancelAppointment = (appointmentId) => {
    setCancelConfirmation(appointmentId);
  };

  const handleConfirmCancel = async () => {
    try {
      const response = await axios.put(`/api/doctorappointments/${cancelConfirmation}/cancel`);

      if (response.data.success) {
        // Refresh appointments list
        await fetchAppointments();
        setCancelConfirmation(null);
      } else {
        alert(response.data.message || 'Failed to cancel appointment');
        setCancelConfirmation(null);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
      setCancelConfirmation(null);
    }
  };

  const handleCancelCancel = () => {
    setCancelConfirmation(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      doctorName: "",
      patientName: "",
      date: "",
      time: "",
      status: "all"
    });
  };

  const selectedDoctor = doctorList.find(d => d._id === selectedDoctorId);

  // Filter appointments for different tabs
  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const historyAppointments = appointments.filter(apt => apt.status === 'completed' || apt.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
              <Calendar className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Doctor Schedule Manager</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("availability")}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-all border-b-2 ${activeTab === "availability"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
            >
              Set Availability
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-all border-b-2 ${activeTab === "upcoming"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
            >
              Upcoming Appointments
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-all border-b-2 ${activeTab === "history"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
            >
              Appointment History
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          {activeTab === "availability" && (
            <>
              <DoctorSelection
                doctorList={doctorList}
                selectedDoctorId={selectedDoctorId}
                onSelectDoctor={setSelectedDoctorId}
              />

              {selectedDoctorId ? (
                <AvailabilityManager
                  selectedDoctor={selectedDoctor}
                  selectedDoctorId={selectedDoctorId}
                  doctorList={doctorList}
                  daysOfWeek={daysOfWeek}
                />
              ) : (
                <div className="p-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
                    <Calendar size={48} className="mx-auto text-blue-400 mb-4" />
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">Select a Doctor First</h3>
                    <p className="text-blue-600">Please select a doctor from the list above to set their availability schedule</p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "upcoming" && (
            <AppointmentsTab
              title="Upcoming Appointments"
              appointments={upcomingAppointments.map((apt, index) => ({
                id: apt._id,
                serialNo: index + 1,
                doctorName: apt.doctorName,
                patientName: apt.patientName,
                date: apt.appointmentDate,
                time: `${apt.timeSlot.startTime} - ${apt.timeSlot.endTime}`,
                status: apt.status
              }))}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              onCancelAppointment={handleCancelAppointment}
              showActions={true}
            />
          )}

          {activeTab === "history" && (
            <AppointmentsTab
              title="Appointment History"
              appointments={historyAppointments.map((apt, index) => ({
                id: apt._id,
                serialNo: index + 1,
                doctorName: apt.doctorName,
                patientName: apt.patientName,
                date: apt.appointmentDate,
                time: `${apt.timeSlot.startTime} - ${apt.timeSlot.endTime}`,
                status: apt.status
              }))}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              showActions={false}
            />
          )}
        </div>

        {/* Cancel Confirmation Dialog */}
        {cancelConfirmation && (
          <CancelConfirmation
            onConfirm={handleConfirmCancel}
            onCancel={handleCancelCancel}
          />
        )}
      </div>
    </div>
  );
};

export default DoctorsAvailability;