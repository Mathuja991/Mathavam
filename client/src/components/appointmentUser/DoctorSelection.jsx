import React from "react";
import { CheckCircle } from "lucide-react";

const DoctorSelection = ({ doctors, selectedDoctorId, handleDoctorSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {doctors.map((doctor) => (
        <button
          key={doctor._id}
          onClick={() => handleDoctorSelect(doctor._id)}
          className={`p-6 rounded-xl border-2 text-left transition-all ${
            selectedDoctorId === doctor._id
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-2">{doctor.name}</h3>
              <p className="text-gray-600 text-sm">{doctor.specialization}</p>
            </div>
            {selectedDoctorId === doctor._id && (
              <CheckCircle className="text-blue-500 flex-shrink-0 ml-2" size={20} />
            )}
          </div>
        </button>
      ))}

      {doctors.length === 0 && (
        <div className="text-center py-8 text-gray-500 col-span-full">
          No doctors available at the moment.
        </div>
      )}
    </div>
  );
};

export default DoctorSelection;