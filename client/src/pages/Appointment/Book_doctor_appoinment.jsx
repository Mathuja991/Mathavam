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
  const [appointmentData, setAppointmentData] = useState(null);

  // Appointment states
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeRanges, setAvailableTimeRanges] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [patientName, setPatientName] = useState("");
  const [patientNote, setPatientNote] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("book");
  const [cancelConfirmation, setCancelConfirmation] = useState(null);
  const [appointmentNumber, setAppointmentNumber] = useState("");

  // Filter states for appointment history
  const [historyFilters, setHistoryFilters] = useState({
    doctorName: "",
    date: "",
    time: "",
    status: "all",
  });

  // Simple day name helper
  const getDayName = (date) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  //  FETCH DOCTORS AND AVAILABILITY FROM DATABASE
  useEffect(() => {
    const fetchDoctorsAndAvailability = async () => {
      try {
        setLoading(true);

        // Fetch all doctors
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/availability/all/doctors`
        );
        console.log(" API RESPONSE RECEIVED:", response.data.data);

        if (response.data.success) {
          const availabilityData = response.data.data || [];

          // Map unique doctors
          const uniqueDoctorsMap = new Map();
          availabilityData.forEach((doc) => {
            if (!uniqueDoctorsMap.has(doc._id)) {
              uniqueDoctorsMap.set(doc._id, {
                _id: doc._id,
                name: doc.name,
                specialization: "General Practice",
              });
            }
          });

          const doctorsList = Array.from(uniqueDoctorsMap.values());
          setDoctors(doctorsList);

          // Fetch availability for all doctor IDs
          const doctorIds = doctorsList.map((d) => d._id);
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/availability/doctors`,
            { doctorIds }
          );

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
                endTime: slot.endTime,
              });
            }
          }

          console.log("🟢 Availability by Doctor:", availabilityByDoctor);
          setDoctorAvailability(availabilityByDoctor);
        }
      } catch (error) {
        console.error("Error fetching doctors and availability:", error);
        setDoctors([]);
        setDoctorAvailability({});
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorsAndAvailability();
  }, []);

  //  FETCH APPOINTMENTS FROM BACKEND
  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/doctorappointments`
      );
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // FETCH APPOINTMENTS BY DOCTOR AND DATE FOR AVAILABILITY CHECK
  const fetchAppointmentsByDoctorAndDate = async (doctorName, date) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/doctorappointments/${doctorName}/${date}`
      );
      if (response.data.success) {
        return response.data.appointments;
      }
      return [];
    } catch (error) {
      console.error("Error fetching appointments by doctor and date:", error);
      return [];
    }
  };
  // Load appointments when component mounts
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Generate dates for next 2 months based on available days
  const generateAvailableDates = () => {
    if (!selectedDoctorId) return [];

    const availability = doctorAvailability[selectedDoctorId] || [];
    const availableDays = [...new Set(availability.map((slot) => slot.day))];

    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 60; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      // Use simple local date format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      // Use simple getDay() method for consistency
      const dayName = getDayName(date);

      if (availableDays.includes(dayName)) {
        dates.push({
          date: dateString,
          day: dayName,
          appointmentCount: 0, // Will be updated when date is selected
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

      // Use same local date format as generateAvailableDates
      const yearPrev = date.getFullYear();
      const monthPrev = String(date.getMonth() + 1).padStart(2, "0");
      const dayPrev = String(date.getDate()).padStart(2, "0");
      const dateString = `${yearPrev}-${monthPrev}-${dayPrev}`;

      calendar.push({
        date,
        isCurrentMonth: false,
        isAvailable: false,
        appointmentCount: 0,
        dateString,
      });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);

      // Use same local date format as generateAvailableDates
      const yearCurr = date.getFullYear();
      const monthCurr = String(date.getMonth() + 1).padStart(2, "0");
      const dayCurr = String(date.getDate()).padStart(2, "0");
      const dateString = `${yearCurr}-${monthCurr}-${dayCurr}`;

      const availableDate = availableDatesList.find(
        (d) => d.date === dateString
      );
      const isAvailable = !!availableDate;
      const appointmentCount = availableDate
        ? availableDate.appointmentCount
        : 0;

      calendar.push({
        date,
        isCurrentMonth: true,
        isAvailable,
        appointmentCount,
        dateString,
      });
    }

    // Add next month's leading days
    const totalCells = 42;
    while (calendar.length < totalCells) {
      const date = new Date(
        year,
        month + 1,
        calendar.length - daysInMonth - firstDayOfWeek + 1
      );

      // Use same local date format as generateAvailableDates
      const yearNext = date.getFullYear();
      const monthNext = String(date.getMonth() + 1).padStart(2, "0");
      const dayNext = String(date.getDate()).padStart(2, "0");
      const dateString = `${yearNext}-${monthNext}-${dayNext}`;

      calendar.push({
        date,
        isCurrentMonth: false,
        isAvailable: false,
        appointmentCount: 0,
        dateString,
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
    const dayName = getDayName(dateObj);
    const availability = doctorAvailability[selectedDoctorId] || [];

    const timeRanges = availability.filter((slot) => slot.day === dayName);

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
    setPatientName("");
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
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + increment,
        1
      )
    );
  };

  const handleConfirmBooking = () => {
    if (!patientName.trim()) {
      alert("Please enter patient name");
      return;
    }
    setShowConfirmation(true);
  };

  // REAL BOOKING FUNCTION
  const handleYesConfirm = async () => {
    try {
      const selectedDoctor = doctors.find((d) => d._id === selectedDoctorId);

      const appointmentData = {
        doctorName: selectedDoctor?.name,
        patientName: patientName.trim(),
        appointmentDate: selectedDate,
        timeSlot: {
          startTime: selectedTime.startTime,
          endTime: selectedTime.endTime,
        },
        patientNote: patientNote.trim(),
      };

      console.log("📤 Sending appointment data:", appointmentData);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/doctorappointments/book`,
        appointmentData
      );

      if (response.data.success) {
        // Store the complete appointment data from backend
        setAppointmentData(response.data.appointment);
        setShowConfirmation(false);
        setShowSuccess(true);

        // Refresh appointments list
        await fetchAppointments();

        // Reset form fields only (don't reset selectedTime/selectedDate yet)
        setPatientName("");
        setPatientNote("");
      } else {
        alert(response.data.message || "Failed to book appointment");
        setShowConfirmation(false);
      }
    } catch (error) {
      console.error(" Error booking appointment:", error);
      if (error.response) {
        alert(`Failed to book appointment: ${error.response.data.message}`);
      } else {
        alert("Failed to book appointment. Please check your connection.");
      }
      setShowConfirmation(false);
    }
  };

  // Update the handleDone function
  const handleDone = () => {
    // Reset everything after success message is closed
    setSelectedDoctorId("");
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimeRanges([]);
    setPatientName("");
    setPatientNote("");
    setAppointmentData(null); // Reset appointment data
    setShowSuccess(false);
    setActiveTab("upcoming");
  };

  const handleNoConfirm = () => {
    setShowConfirmation(false);
  };

  //REAL CANCEL APPOINTMENT FUNCTION
  const handleCancelAppointment = (appointmentId) => {
    setCancelConfirmation(appointmentId);
  };

  const handleConfirmCancel = async () => {
    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_API_URL
        }/doctorappointments/${cancelConfirmation}/cancel`
      );

      if (response.data.success) {
        // Refresh appointments list
        await fetchAppointments();
        setCancelConfirmation(null);
      } else {
        alert(response.data.message || "Failed to cancel appointment");
        setCancelConfirmation(null);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel appointment. Please try again.");
      setCancelConfirmation(null);
    }
  };

  const handleCancelCancel = () => {
    setCancelConfirmation(null);
  };

  const handleFilterChange = (filterType, value) => {
    setHistoryFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setHistoryFilters({
      doctorName: "",
      date: "",
      time: "",
      status: "all",
    });
  };

  const selectedDoctor = doctors.find((d) => d._id === selectedDoctorId);
  const calendarDays = generateCalendar();

  // Filter appointments for different tabs
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "upcoming"
  );
  const historyAppointments = appointments.filter(
    (apt) => apt.status === "completed" || apt.status === "cancelled"
  );

  const filteredHistoryAppointments = historyAppointments.filter((apt) => {
    const matchesDoctor =
      historyFilters.doctorName === "" ||
      apt.doctorName
        .toLowerCase()
        .includes(historyFilters.doctorName.toLowerCase());
    const matchesDate =
      historyFilters.date === "" ||
      new Date(apt.appointmentDate)
        .toISOString()
        .split("T")[0]
        .includes(historyFilters.date);
    const matchesTime =
      historyFilters.time === "" ||
      apt.timeSlot.startTime
        .toLowerCase()
        .includes(historyFilters.time.toLowerCase());
    const matchesStatus =
      historyFilters.status === "all" || apt.status === historyFilters.status;
    return matchesDoctor && matchesDate && matchesTime && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading doctors and availability...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Book Doctor Appointment
            </h1>
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
              patientName={patientName}
              setPatientName={setPatientName}
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
              upcomingAppointments={upcomingAppointments.map((apt, index) => ({
                id: apt._id,
                serialNo: index + 1,
                doctorName: apt.doctorName,
                date: apt.appointmentDate,
                time: `${apt.timeSlot.startTime} - ${apt.timeSlot.endTime}`,
              }))}
              handleCancelAppointment={handleCancelAppointment}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "history" && (
            <AppointmentHistoryTab
              filteredHistoryAppointments={filteredHistoryAppointments.map(
                (apt, index) => ({
                  id: apt._id,
                  serialNo: index + 1,
                  doctorName: apt.doctorName,
                  date: apt.appointmentDate,
                  time: `${apt.timeSlot.startTime} - ${apt.timeSlot.endTime}`,
                  status: apt.status,
                })
              )}
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
            appointmentData={appointmentData} // Pass the complete appointment data
            handleDone={handleDone}
          />
        )}
      </div>
    </div>
  );
};

export default PatientAppointmentBooking;
