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
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Appointment History</h2>

      {/* Compact Filter Section */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-700">Filters</h3>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded font-medium transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <input
              type="text"
              value={historyFilters.doctorName}
              onChange={(e) => handleFilterChange("doctorName", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Doctor name..."
            />
          </div>
          <div>
            <input
              type="date"
              value={historyFilters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="text"
              value={historyFilters.time}
              onChange={(e) => handleFilterChange("time", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Time..."
            />
          </div>
          <div>
            <select
              value={historyFilters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {filteredHistoryAppointments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b">Doctor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b">Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistoryAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-left align-middle border-b">
                    <span className="font-bold text-gray-900">{appointment.serialNo}</span>
                  </td>
                  <td className="px-4 py-3 text-left align-middle border-b">
                    <div className="font-semibold text-gray-900 text-sm">{appointment.doctorName}</div>
                  </td>
                  <td className="px-4 py-3 text-left align-middle border-b">
                    <div className="text-gray-900 font-medium text-sm">
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-left align-middle border-b">
                    <div className="text-gray-900 font-medium text-sm">{appointment.time}</div>
                  </td>
                  <td className="px-4 py-3 text-left align-middle border-b">
                    <StatusBadge status={appointment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock size={36} className="mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg font-bold text-gray-700 mb-1">No Appointments Found</h3>
          <p className="text-gray-500 text-sm">No appointments match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistoryTab;