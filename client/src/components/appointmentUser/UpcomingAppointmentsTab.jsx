import React from "react";
import { Clock } from "lucide-react";

const UpcomingAppointmentsTab = ({
  upcomingAppointments,
  handleCancelAppointment,
  setActiveTab
}) => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Upcoming Appointments</h2>

      {upcomingAppointments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Doctor Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingAppointments.map((appointment) => (
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
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors shadow-sm"
                    >
                      Cancel Appointment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Upcoming Appointments</h3>
          <p className="text-gray-500 mb-4">You don't have any upcoming appointments.</p>
          <button
            onClick={() => setActiveTab("book")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors shadow-lg"
          >
            Book New Appointment
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingAppointmentsTab;