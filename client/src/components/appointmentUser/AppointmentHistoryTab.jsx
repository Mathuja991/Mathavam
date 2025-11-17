import React from "react";
import { Clock, Filter } from "lucide-react";
import StatusBadge from "./StatusBadge";

const AppointmentHistoryTab = ({
  filteredHistoryAppointments,
  historyFilters,
  handleFilterChange,
  clearFilters
}) => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Appointment History</h2>

      {/* Filter Section */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-700">Filter Appointments</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
            <input
              type="text"
              value={historyFilters.doctorName}
              onChange={(e) => handleFilterChange("doctorName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search doctor..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={historyFilters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="text"
              value={historyFilters.time}
              onChange={(e) => handleFilterChange("time", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 10:00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={historyFilters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={clearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {filteredHistoryAppointments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Doctor Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistoryAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-left align-middle border-b">
                    <span className="font-bold text-gray-900 text-lg">{appointment.serialNo}</span>
                  </td>
                  <td className="px-6 py-4 text-left align-middle border-b">
                    <div className="font-semibold text-gray-900">{appointment.doctorName}</div>
                  </td>
                  <td className="px-6 py-4 text-left align-middle border-b">
                    <div className="text-gray-900 font-medium">
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-left align-middle border-b">
                    <div className="text-gray-900 font-medium">{appointment.time}</div>
                  </td>
                  <td className="px-6 py-4 text-left align-middle border-b">
                    <StatusBadge status={appointment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Appointments Found</h3>
          <p className="text-gray-500">No appointments match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistoryTab;