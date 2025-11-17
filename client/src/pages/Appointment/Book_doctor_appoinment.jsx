import React, { useState, useEffect } from "react";
import BookingTabs from "../../components/appointmentUser/BookingTabs";
import BookAppointmentTab from "../../components/appointmentUser/BookAppointmentTab";
import UpcomingAppointmentsTab from "../../components/appointmentUser/UpcomingAppointmentsTab";
import AppointmentHistoryTab from "../../components/appointmentUser/AppointmentHistoryTab";
import ConfirmationDialog from "../../components/appointmentUser/ConfirmationDialog";
import CancelConfirmationDialog from "../../components/appointmentUser/CancelConfirmationDialog";
import SuccessMessage from "../../components/appointmentUser/SuccessMessage";

const PatientAppointmentBooking = () => {
  // Mock doctors data
  const [doctors] = useState([
    { _id: "1", name: "Dr. John Smith", specialization: "Cardiology" },
  ]);

  // Mock availability data from admin - based on DAYS
  const [doctorAvailability] = useState({
    "1": [
      { day: "Monday", startTime: "09:00", endTime: "12:00" },
    ],
  });

  // Mock existing appointments count for each date
  const [existingAppointments] = useState({
    "2024-01-15": 3, // Monday
    "2024-01-16": 1, // Tuesday
  });

  // Mock appointment history data
  const [appointmentHistory, setAppointmentHistory] = useState([
    {
      id: 1,
      serialNo: 1,
      doctorId: "1",
      doctorName: "Dr. John Smith",
      date: "2024-02-20",
      time: "10:00 - 11:00",
      status: "upcoming",
      createdAt: "2024-01-05"
    },
  ]);

  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeRanges, setAvailableTimeRanges] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [patientEmail, setPatientEmail] = useState("");
  const [patientNote, setPatientNote] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("book");
  const [cancelConfirmation, setCancelConfirmation] = useState(null);
  
  // Filter states for appointment history
  const [historyFilters, setHistoryFilters] = useState({
    doctorName: "",
    date: "",
    time: "",
    status: "all"
  });

  // Filter doctors based on search
  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate dates for next 2 months based on available days
  const generateAvailableDates = () => {
    if (!selectedDoctorId) return [];

    const availability = doctorAvailability[selectedDoctorId] || [];
    const availableDays = [...new Set(availability.map(slot => slot.day))];
    
    const dates = [];
    const today = new Date();
    
    // Generate dates for next 2 months (60 days)
    for (let i = 1; i <= 60; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (availableDays.includes(dayName)) {
        const dateString = date.toISOString().split('T')[0];
        dates.push({
          date: dateString,
          day: dayName,
          appointmentCount: existingAppointments[dateString] || 0
        });
      }
    }
    
    return dates;
  };

  // Generate calendar for current month
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const calendar = [];
    const availableDatesList = generateAvailableDates();
    
    // Add previous month's trailing days
    const firstDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      calendar.push({
        date,
        isCurrentMonth: false,
        isAvailable: false,
        appointmentCount: 0,
        dateString: date.toISOString().split('T')[0]
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const availableDate = availableDatesList.find(d => d.date === dateString);
      const isAvailable = !!availableDate;
      const appointmentCount = availableDate ? availableDate.appointmentCount : 0;
      
      calendar.push({
        date,
        isCurrentMonth: true,
        isAvailable,
        appointmentCount,
        dateString
      });
    }
    
    // Add next month's leading days
    const totalCells = 42; // 6 weeks
    while (calendar.length < totalCells) {
      const date = new Date(year, month + 1, calendar.length - daysInMonth - firstDayOfWeek + 1);
      calendar.push({
        date,
        isCurrentMonth: false,
        isAvailable: false,
        appointmentCount: 0,
        dateString: date.toISOString().split('T')[0]
      });
    }
    
    return calendar;
  };

  // Update available dates when doctor changes
  useEffect(() => {
    if (!selectedDoctorId) {
      setAvailableDates([]);
      return;
    }

    const dates = generateAvailableDates();
    setAvailableDates(dates);
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimeRanges([]);
    setShowConfirmation(false);
    setShowSuccess(false);
  }, [selectedDoctorId]);

  // Generate time ranges for selected date
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setAvailableTimeRanges([]);
      return;
    }

    const dateObj = new Date(selectedDate);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const availability = doctorAvailability[selectedDoctorId] || [];
    
    const timeRanges = availability.filter(slot => slot.day === dayName);
    
    setAvailableTimeRanges(timeRanges);
    setSelectedTime("");
    setShowConfirmation(false);
    setShowSuccess(false);
  }, [selectedDate, selectedDoctorId, doctorAvailability]);

  const handleDoctorSelect = (doctorId) => {
    setSelectedDoctorId(doctorId);
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimeRanges([]);
    setPatientEmail("");
    setPatientNote("");
    setShowConfirmation(false);
    setShowSuccess(false);
  };

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
    setSelectedTime("");
    setShowConfirmation(false);
    setShowSuccess(false);
  };

  const handleTimeSelect = (timeRange) => {
    setSelectedTime(timeRange);
    setShowConfirmation(false);
    setShowSuccess(false);
  };

  const handleMonthChange = (increment) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
  };

  const handleConfirmBooking = () => {
    setShowConfirmation(true);
  };

  const handleYesConfirm = () => {
    const selectedDoctor = doctors.find(d => d._id === selectedDoctorId);
    
    // Add new appointment to history
    const newAppointment = {
      id: appointmentHistory.length + 1,
      serialNo: appointmentHistory.length + 1,
      doctorId: selectedDoctorId,
      doctorName: selectedDoctor?.name,
      date: selectedDate,
      time: `${selectedTime.startTime} - ${selectedTime.endTime}`,
      status: "upcoming",
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setAppointmentHistory(prev => [newAppointment, ...prev]);
    setShowConfirmation(false);
    setShowSuccess(true);
  };

  const handleNoConfirm = () => {
    setShowConfirmation(false);
  };

  const handleDone = () => {
    // Reset form
    setSelectedDoctorId("");
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimeRanges([]);
    setPatientEmail("");
    setPatientNote("");
    setShowSuccess(false);
    setActiveTab("upcoming");
  };

  const handleCancelAppointment = (appointmentId) => {
    setCancelConfirmation(appointmentId);
  };

  const handleConfirmCancel = () => {
    setAppointmentHistory(prev => 
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

  const handleFilterChange = (filterType, value) => {
    setHistoryFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setHistoryFilters({
      doctorName: "",
      date: "",
      time: "",
      status: "all"
    });
  };

  const selectedDoctor = doctors.find(d => d._id === selectedDoctorId);
  const calendarDays = generateCalendar();
  
  // Filter appointments for upcoming tab
  const upcomingAppointments = appointmentHistory.filter(apt => apt.status === "upcoming");

  // Filter appointments for history tab
  const filteredHistoryAppointments = appointmentHistory.filter(apt => {
    const matchesDoctor = historyFilters.doctorName === "" || 
      apt.doctorName.toLowerCase().includes(historyFilters.doctorName.toLowerCase());
    
    const matchesDate = historyFilters.date === "" || 
      apt.date.includes(historyFilters.date);
    
    const matchesTime = historyFilters.time === "" || 
      apt.time.toLowerCase().includes(historyFilters.time.toLowerCase());
    
    const matchesStatus = historyFilters.status === "all" || 
      apt.status === historyFilters.status;
    
    return matchesDoctor && matchesDate && matchesTime && matchesStatus;
  });

  // Calculate appointment number
  const appointmentNumber = (existingAppointments[selectedDate] || 0) + 1;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">Book Doctor Appointment</h1>
          </div>
        </div>

        <BookingTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          {activeTab === "book" && (
            <BookAppointmentTab
              filteredDoctors={filteredDoctors}
              selectedDoctorId={selectedDoctorId}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleDoctorSelect={handleDoctorSelect}
              selectedDoctor={selectedDoctor}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              availableTimeRanges={availableTimeRanges}
              patientEmail={patientEmail}
              setPatientEmail={setPatientEmail}
              patientNote={patientNote}
              setPatientNote={setPatientNote}
              handleDateSelect={handleDateSelect}
              handleTimeSelect={handleTimeSelect}
              handleConfirmBooking={handleConfirmBooking}
              currentMonth={currentMonth}
              handleMonthChange={handleMonthChange}
              calendarDays={calendarDays}
              showSuccess={showSuccess}
            />
          )}

          {activeTab === "upcoming" && (
            <UpcomingAppointmentsTab
              upcomingAppointments={upcomingAppointments}
              handleCancelAppointment={handleCancelAppointment}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "history" && (
            <AppointmentHistoryTab
              filteredHistoryAppointments={filteredHistoryAppointments}
              historyFilters={historyFilters}
              handleFilterChange={handleFilterChange}
              clearFilters={clearFilters}
            />
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <ConfirmationDialog
            handleNoConfirm={handleNoConfirm}
            handleYesConfirm={handleYesConfirm}
          />
        )}

        {/* Cancel Confirmation Dialog */}
        {cancelConfirmation && (
          <CancelConfirmationDialog
            handleCancelCancel={handleCancelCancel}
            handleConfirmCancel={handleConfirmCancel}
          />
        )}

        {/* Success Message */}
        {showSuccess && (
          <SuccessMessage
            selectedDoctor={selectedDoctor}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            appointmentNumber={appointmentNumber}
            patientEmail={patientEmail}
            patientNote={patientNote}
            handleDone={handleDone}
          />
        )}
      </div>
    </div>
  );
};

export default PatientAppointmentBooking;