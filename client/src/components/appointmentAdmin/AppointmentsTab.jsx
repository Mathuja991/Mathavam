import React from "react";
import { Filter, Search, Clock } from "lucide-react";
import AppointmentsTable from "./AppointmentsTable";
import FilterSection from "./FilterSection";

const AppointmentsTab = ({
  title,
  appointments,
  filters,
  onFilterChange,
  onClearFilters,
  onCancelAppointment,
  showActions
}) => {
  const filterAppointments = (appointments) => {
    return appointments.filter(apt => {
      const matchesDoctor = filters.doctorName === "" ||
        apt.doctorName.toLowerCase().includes(filters.doctorName.toLowerCase());

      const matchesPatient = filters.patientName === "" ||
        apt.patientName.toLowerCase().includes(filters.patientName.toLowerCase());

      const matchesDate = filters.date === "" ||
        apt.date.includes(filters.date);

      const matchesStatus = filters.status === "all" ||
        apt.status === filters.status;

      // REMOVED: matchesTime filter
      return matchesDoctor && matchesPatient && matchesDate && matchesStatus;
    });
  };

  const filteredAppointments = filterAppointments(appointments);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{title}</h2>

      <FilterSection
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
      />

      {filteredAppointments.length > 0 ? (
        <AppointmentsTable
          appointments={filteredAppointments}
          onCancelAppointment={onCancelAppointment}
          showActions={showActions}
        />
      ) : (
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No {title} Found</h3>
          <p className="text-gray-500">No appointments match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentsTab;