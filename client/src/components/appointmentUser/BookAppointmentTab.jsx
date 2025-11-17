import React from "react";
import { Search, CheckCircle, Mail, FileText, Clock } from "lucide-react";
import DoctorSelection from "./DoctorSelection";
import DateSelection from "./DateSelection";
import TimeSelection from "./TimeSelection";

const BookAppointmentTab = ({
  filteredDoctors,
  selectedDoctorId,
  searchTerm,
  setSearchTerm,
  handleDoctorSelect,
  selectedDoctor,
  selectedDate,
  selectedTime,
  availableTimeRanges,
  patientEmail,
  setPatientEmail,
  patientNote,
  setPatientNote,
  handleDateSelect,
  handleTimeSelect,
  handleConfirmBooking,
  currentMonth,
  handleMonthChange,
  calendarDays,
  showSuccess
}) => {
  return (
    <div className="p-8">
      {/* Step 1: Select Doctor */}
      <div className="mb-8">
        <h2 className="text-gray-600 mb-8 text-center">Choose a doctor to book for an appointment</h2>
        
        {/* Search */}
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <DoctorSelection
          filteredDoctors={filteredDoctors}
          selectedDoctorId={selectedDoctorId}
          handleDoctorSelect={handleDoctorSelect}
        />
      </div>

      {/* Step 2 & 3: Date and Time Selection Side by Side */}
      {selectedDoctorId && !showSuccess && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Date Selection - Left Side */}
          <DateSelection
            selectedDoctor={selectedDoctor}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            handleMonthChange={handleMonthChange}
            calendarDays={calendarDays}
            handleDateSelect={handleDateSelect}
          />

          {/* Time Selection - Right Side */}
          <TimeSelection
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableTimeRanges={availableTimeRanges}
            patientEmail={patientEmail}
            setPatientEmail={setPatientEmail}
            patientNote={patientNote}
            setPatientNote={setPatientNote}
            handleTimeSelect={handleTimeSelect}
            handleConfirmBooking={handleConfirmBooking}
          />
        </div>
      )}
    </div>
  );
};

export default BookAppointmentTab;