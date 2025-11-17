import React from "react";

const DoctorSelection = ({ doctorList, selectedDoctorId, onSelectDoctor }) => {
  return (
    <div className="p-8 border-b border-gray-200">
      <p className="text-gray-600 mb-8 text-center">Choose a doctor to set availability</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctorList.map((doctor) => (
          <button
            key={doctor._id} 
            onClick={() => onSelectDoctor(doctor._id)} 
            className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedDoctorId === doctor._id
                ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-semibold text-lg ${
                selectedDoctorId === doctor._id ? "text-blue-700" : "text-gray-700"
              }`}>
                {doctor.name}
              </span>
              {selectedDoctorId === doctor._id && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
            {/* Optional: Show additional doctor details */}
            <div className="mt-2 text-sm text-gray-500">
              <div>{doctor.qualification}</div>
              <div>{doctor.experience} years experience</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DoctorSelection;