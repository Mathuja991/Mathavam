import React, { useState, useEffect } from "react";
import axios from "axios";
import BookingTabs from "../../components/appointmentUser/BookingTabs";
import BookAppointmentTab from "../../components/appointmentUser/BookAppointmentTab";
import UpcomingAppointmentsTab from "../../components/appointmentUser/UpcomingAppointmentsTab";
import AppointmentHistoryTab from "../../components/appointmentUser/AppointmentHistoryTab";
import ConfirmationDialog from "../../components/appointmentUser/ConfirmationDialog";
import CancelConfirmationDialog from "../../components/appointmentUser/CancelConfirmationDialog";
import SuccessMessage from "../../components/appointmentUser/SuccessMessage";

const PatientAppointmentBooking = () => {
  // REAL doctors data from availability database
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // REAL availability data from database
  const [doctorAvailability, setDoctorAvailability] = useState({});

  // Mock existing appointments count for each date
  const [existingAppointments] = useState({
    "2024-01-15": 3,
    "2024-01-16": 1,
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

  // 🔥 FETCH DOCTORS AND AVAILABILITY FROM DATABASE
 useEffect(() => {
  const fetchDoctorsAndAvailability = async () => {
    try {
      setLoading(true);

      // Fetch all doctors
      const response = await axios.get('/api/availability/doctors/all');
      console.log('🟢 API RESPONSE RECEIVED:', response.data.data);

      if (response.data.success) {
        const availabilityData = response.data.data || [];

        // Map unique doctors
        const uniqueDoctorsMap = new Map();
        availabilityData.forEach(doc => {
          if (!uniqueDoctorsMap.has(doc._id)) {
            uniqueDoctorsMap.set(doc._id, {
              _id: doc._id,
              name: doc.name,
              specialization: "General Practice"
            });
          }
        });

        const doctorsList = Array.from(uniqueDoctorsMap.values());
        setDoctors(doctorsList);

        // Fetch availability for all doctor IDs
        const doctorIds = doctorsList.map(d => d._id);
        const res = await axios.post('/api/availability/doctors', { doctorIds });

        const availability = res.data.data || [];
        const availabilityByDoctor = {};

        for (const doctorDoc of availability) {
          const doctorId = doctorDoc.doctorId;

          if (!availabilityByDoctor[doctorId]) {
            availabilityByDoctor[doctorId] = [];
          }

          for (const slot of doctorDoc.availabilitySlots) {
            availabilityByDoctor[doctorId].push({
              day: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime
            });
          }
        }

        console.log('🟢 Availability by Doctor:', availabilityByDoctor);
        setDoctorAvailability(availabilityByDoctor);
      }
    } catch (error) {
      console.error('Error fetching doctors and availability:', error);
      setDoctors([]);
      setDoctorAvailability({});
    } finally {
      setLoading(false);
    }
  };

  fetchDoctorsAndAvailability();
}, []);


  // Generate dates for next 2 months based on available days
 const SL_OFFSET = 5.5 * 60; // 5 hours 30 minutes in minutes

const generateAvailableDates = () => {
  if (!selectedDoctorId) return [];

  const availability = doctorAvailability[selectedDoctorId] || [];
  const availableDays = [...new Set(availability.map(slot => slot.day))];
  
  const dates = [];
  const now = new Date();

  for (let i = 1; i <= 60; i++) {
    // Add i days
    const utcTime = now.getTime() + i * 24 * 60 * 60 * 1000;

    // Apply Sri Lanka offset
    const slTime = new Date(utcTime + SL_OFFSET * 60 * 1000);

    const year = slTime.getFullYear();
    const month = String(slTime.getMonth() + 1).padStart(2, '0');
    const day = String(slTime.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const dayName = slTime.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Colombo' });

    if (availableDays.includes(dayName)) {
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
    const totalCells = 42;
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
  
  const upcomingAppointments = appointmentHistory.filter(apt => apt.status === "upcoming");

  const filteredHistoryAppointments = appointmentHistory.filter(apt => {
    const matchesDoctor = historyFilters.doctorName === "" || 
      apt.doctorName.toLowerCase().includes(historyFilters.doctorName.toLowerCase());
    const matchesDate = historyFilters.date === "" || apt.date.includes(historyFilters.date);
    const matchesTime = historyFilters.time === "" || apt.time.toLowerCase().includes(historyFilters.time.toLowerCase());
    const matchesStatus = historyFilters.status === "all" || apt.status === historyFilters.status;
    return matchesDoctor && matchesDate && matchesTime && matchesStatus;
  });

  const appointmentNumber = (existingAppointments[selectedDate] || 0) + 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctors and availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">Book Doctor Appointment</h1>
          </div>
        </div>

        <BookingTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          {activeTab === "book" && (
            <BookAppointmentTab
              doctors={doctors}
              selectedDoctorId={selectedDoctorId}
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

        {showConfirmation && (
          <ConfirmationDialog
            handleNoConfirm={handleNoConfirm}
            handleYesConfirm={handleYesConfirm}
          />
        )}

        {cancelConfirmation && (
          <CancelConfirmationDialog
            handleCancelCancel={handleCancelCancel}
            handleConfirmCancel={handleConfirmCancel}
          />
        )}

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