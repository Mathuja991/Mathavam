import React from "react";

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

const AppointmentsTable = ({ appointments, onCancelAppointment, showActions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">#</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Doctor Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Patient Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Patient ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Time</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Status</th>
            {showActions && (
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-left align-middle border-b">
                <span className="font-bold text-gray-900 text-lg">{appointment.serialNo}</span>
              </td>
              <td className="px-6 py-4 text-left align-middle border-b">
                <div className="font-semibold text-gray-900">{appointment.doctorName}</div>
              </td>
              <td className="px-6 py-4 text-left align-middle border-b">
                <div className="font-semibold text-gray-900">{appointment.patientName}</div>
              </td>
              <td className="px-6 py-4 text-left align-middle border-b">
                <div className="text-gray-600 font-medium">{appointment.patientId}</div>
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
                {getStatusBadge(appointment.status)}
              </td>
              {showActions && (
                <td className="px-6 py-4 text-left align-middle border-b">
                  {appointment.status === "upcoming" && (
                    <button
                      onClick={() => onCancelAppointment(appointment.id)}
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
  );
};

export default AppointmentsTable;