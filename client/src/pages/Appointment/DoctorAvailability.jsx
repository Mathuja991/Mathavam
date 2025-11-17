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

  // Mock appointment data for admin view
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      serialNo: 1,
      doctorId: "1",
      doctorName: "Dr. John Smith",
      patientId: "P001",
      patientName: "John Doe",
      date: "2024-02-20",
      time: "10:00 - 11:00",
      status: "upcoming",
      createdAt: "2024-01-05"
    },
  ]);

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

  // Filter states for appointments
  const [filters, setFilters] = useState({
    doctorName: "",
    patientName: "",
    patientId: "",
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

  const handleConfirmCancel = () => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === cancelConfirmation 
          ? { ...apt, status: "cancelled" }
          : apt
      )
    );
    setCancelConfirmation(null);
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
      patientId: "",
      date: "",
      time: "",
      status: "all"
    });
  };

  const selectedDoctor = doctorList.find(d => d._id === selectedDoctorId);

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

         {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("availability")}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-all border-b-2 ${
                activeTab === "availability"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              Set Availability
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-all border-b-2 ${
                activeTab === "upcoming"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              Upcoming Appointments
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-all border-b-2 ${
                activeTab === "history"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              Appointment History
            </button>
          </div>
        </div>

        {/* Tab Content */}
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
              appointments={appointments.filter(apt => apt.status === "upcoming")}
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
              appointments={appointments}
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