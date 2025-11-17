import React, { useState } from "react";
import { Calendar, Clock, User, Filter, Search, X, Phone, Mail } from "lucide-react";


// Simplified mock data for appointments
const mockAppointments = [
  {
    id: 1,
    serialNo: 1,
    doctorId: "1",
    patientId: "P001",
    patientName: "John Doe",
    patientEmail: "john.doe@email.com",
    patientPhone: "+1-555-0101",
    date: "2024-02-20",
    time: "10:00",
    status: "upcoming",
    type: "Consultation"
  },
  {
    id: 2,
    serialNo: 2,
    doctorId: "1",
    patientId: "P002",
    patientName: "Jane Smith",
    patientEmail: "jane.smith@email.com",
    patientPhone: "+1-555-0102",
    date: "2024-02-20",
    time: "14:00",
    status: "upcoming",
    type: "Follow-up"
  },
   
];

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("today");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cancelConfirmation, setCancelConfirmation] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    date: ""
  });

  // Mock doctor data
  const currentDoctor = {
    _id: "1",
    name: "Dr. John Smith",
    specialization: "Cardiologist"
  };

  // Filter appointments for current doctor
  const doctorAppointments = mockAppointments.filter(apt => apt.doctorId === currentDoctor._id);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Calculate counts for the boxes
  const todayAppointmentsCount = doctorAppointments.filter(apt => 
    apt.date === today && apt.status === "upcoming"
  ).length;

  const upcomingAppointmentsCount = doctorAppointments.filter(apt => 
    apt.status === "upcoming"
  ).length;

  // Sort appointments based on tab
  const getSortedAppointments = (appointments, tab) => {
    const sorted = [...appointments];
    
    if (tab === "today") {
      // For today's appointments: order by appointment number (serialNo)
      return sorted.sort((a, b) => a.serialNo - b.serialNo);
    } else if (tab === "upcoming") {
      // For upcoming appointments: order by date (recent first), then by appointment number
      return sorted.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare === 0) {
          return a.serialNo - b.serialNo; // Same date, order by appointment number
        }
        return dateCompare; // Earlier dates first
      });
    } else if (tab === "history") {
      // For history: order by date (recent first)
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    return sorted;
  };

  // Filter appointments based on active tab and filters
  const getFilteredAppointments = () => {
    let filtered = doctorAppointments;

    // Apply tab filter
    if (activeTab === "today") {
      filtered = filtered.filter(apt => apt.date === today);
    } else if (activeTab === "upcoming") {
      filtered = filtered.filter(apt => apt.status === "upcoming");
    } else if (activeTab === "history") {
      filtered = filtered.filter(apt => apt.status !== "upcoming");
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    // Apply type filter
    if (filters.type !== "all") {
      filtered = filtered.filter(apt => apt.type === filters.type);
    }

    // Apply date filter
    if (filters.date) {
      filtered = filtered.filter(apt => apt.date === filters.date);
    }

    // Apply sorting based on active tab
    return getSortedAppointments(filtered, activeTab);
  };

  const filteredAppointments = getFilteredAppointments();

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseDetails = () => {
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = (appointmentId) => {
    setCancelConfirmation(appointmentId);
  };

  const handleConfirmCancel = () => {
    // In a real application, you would make an API call here
    console.log(`Appointment ${cancelConfirmation} cancelled`);
    setCancelConfirmation(null);
    
    // For demo purposes, we'll just show an alert
    alert("Appointment cancelled successfully!");
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
      status: "all",
      type: "all",
      date: ""
    });
    setSearchTerm("");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: { color: "bg-blue-100 text-blue-800 border border-blue-200", text: "Upcoming" },
      completed: { color: "bg-green-100 text-green-800 border border-green-200", text: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800 border border-red-200", text: "Cancelled" }
    };
    
    const config = statusConfig[status] || statusConfig.upcoming;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
        </div>

        {/* Big Boxes - Half page width, side by side */}
        <div className="flex mb-8">
          <div className="grid grid-cols-2 gap-6 w-1/2">
            {/* Today's Appointments Box */}
            <div 
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 cursor-pointer hover:shadow-xl transition-all duration-200 hover:border-blue-300"
              onClick={() => setActiveTab("today")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-blue-100 rounded-xl mb-3">
                  <Calendar className="text-blue-600" size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Today's</h3>
                <p className="text-2xl font-bold text-blue-600">{todayAppointmentsCount}</p>
                <p className="text-sm text-gray-500 mt-1">Appointments</p>
              </div>
            </div>

            {/* Upcoming Appointments Box */}
            <div 
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 cursor-pointer hover:shadow-xl transition-all duration-200 hover:border-green-300"
              onClick={() => setActiveTab("upcoming")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-green-100 rounded-xl mb-3">
                  <Clock className="text-green-600" size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Upcoming</h3>
                <p className="text-2xl font-bold text-green-600">{upcomingAppointmentsCount}</p>
                <p className="text-sm text-gray-500 mt-1">Appointments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("today")}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-all border-b-2 ${
                activeTab === "today"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              Today's Appointments
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

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter size={20} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filter Appointments</h3>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-64"
                />
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
                
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange("date", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === "today" && "Today's Appointments"}
              {activeTab === "upcoming" && "Upcoming Appointments"}
              {activeTab === "history" && "Appointment History"}
            </h2>
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Appt No.
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Patient ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Status
                    </th>
                    {activeTab !== "history" && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-left align-middle border-b">
                        <div className="text-gray-900 font-bold text-left">
                          #{appointment.serialNo}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left align-middle border-b">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <User className="text-blue-600" size={20} />
                          </div>
                          <div className="font-semibold text-gray-900 text-left">
                            {appointment.patientName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left align-middle border-b">
                        <div className="text-gray-900 font-medium text-left">
                          {appointment.patientId}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left align-middle border-b">
                        <div className="text-gray-900 font-semibold text-left">
                          {new Date(appointment.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left align-middle border-b">
                        <div className="text-gray-900 font-semibold text-left">
                          {appointment.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left align-middle border-b">
                        {getStatusBadge(appointment.status)}
                      </td>
                      {activeTab !== "history" && (
                        <td className="px-6 py-4 text-left align-middle border-b">
                          {activeTab === "today" && (
                            <button
                              onClick={() => handleViewDetails(appointment)}
                              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors text-sm"
                            >
                              View Details
                            </button>
                          )}
                          {activeTab === "upcoming" && (
                            <button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors text-sm"
                            >
                              Cancel Appointment
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Appointments Found</h3>
              <p className="text-gray-500">
                {activeTab === "today" 
                  ? "No appointments scheduled for today." 
                  : "No appointments match your current filters."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Appointment Details</h3>
                <button
                  onClick={handleCloseDetails}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 text-left block">Appointment No.</label>
                      <p className="text-gray-900 font-bold text-left">#{selectedAppointment.serialNo}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 text-left block">Full Name</label>
                      <p className="text-gray-900 font-semibold text-left">{selectedAppointment.patientName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 text-left block">Patient ID</label>
                      <p className="text-gray-900 font-semibold text-left">{selectedAppointment.patientId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <p className="text-gray-900 text-left">{selectedAppointment.patientEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <p className="text-gray-900 text-left">{selectedAppointment.patientPhone}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 text-left block">Date</label>
                      <p className="text-gray-900 font-semibold text-left">
                        {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 text-left block">Time</label>
                      <p className="text-gray-900 text-left">{selectedAppointment.time}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 text-left block">Status</label>
                      <div className="mt-1 text-left">{getStatusBadge(selectedAppointment.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 text-left block">Type</label>
                      <p className="text-gray-900 text-left">{selectedAppointment.type}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCloseDetails}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
                {selectedAppointment.status === "upcoming" && (
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
                    Start Consultation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Cancel Appointment</h3>
                <button
                  onClick={handleCancelCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="text-red-600" size={32} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Confirm Cancellation</h4>
                <p className="text-gray-600">
                  Are you sure you want to cancel this appointment? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleCancelCancel}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;