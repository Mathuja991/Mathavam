import React from "react";
import { CheckCircle } from "lucide-react";

const SuccessMessage = ({
  selectedDoctor,
  selectedDate,
  selectedTime,
  appointmentNumber,
  patientEmail,
  patientNote,
  handleDone
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Appointment Booked Successfully!</h3>
          <p className="text-gray-600 text-lg">Your appointment has been confirmed</p>
        </div>

        {/* Appointment Details Table */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <table className="w-full text-left">
            <tbody className="space-y-4">
              <tr className="border-b border-gray-200">
                <td className="py-3 font-semibold text-gray-700 pr-4">Doctor:</td>
                <td className="py-3 text-gray-900">{selectedDoctor?.name}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 font-semibold text-gray-700 pr-4">Specialization:</td>
                <td className="py-3 text-gray-900">{selectedDoctor?.specialization}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 font-semibold text-gray-700 pr-4">Date:</td>
                <td className="py-3 text-gray-900">
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 font-semibold text-gray-700 pr-4">Time:</td>
                <td className="py-3 text-gray-900">
                  {selectedTime.startTime} - {selectedTime.endTime}
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 font-semibold text-gray-700 pr-4">Appointment Number:</td>
                <td className="py-3 text-purple-600 font-bold text-xl">
                  #{appointmentNumber}
                </td>
              </tr>
              {patientEmail && (
                <tr className="border-b border-gray-200">
                  <td className="py-3 font-semibold text-gray-700 pr-4">Confirmation Email:</td>
                  <td className="py-3 text-gray-900">{patientEmail}</td>
                </tr>
              )}
              {patientNote && (
                <tr>
                  <td className="py-3 font-semibold text-gray-700 pr-4">Additional Notes:</td>
                  <td className="py-3 text-gray-900">{patientNote}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-center">
          <button
            onClick={handleDone}
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-12 rounded-xl font-bold text-lg transition-colors shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;