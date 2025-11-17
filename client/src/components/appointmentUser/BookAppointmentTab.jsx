import React from "react";
import { Mail, FileText } from "lucide-react";
import DoctorSelection from "./DoctorSelection";
import DateSelection from "./DateSelection";
import TimeSelection from "./TimeSelection";

const BookAppointmentTab = ({
  doctors,
  selectedDoctorId,
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

        <DoctorSelection
          doctors={doctors}
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