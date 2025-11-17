import React from "react";
import { Link } from "react-router-dom";

const forms = [
  { 
    name: "Patient Record Form", 
    newPath: "../record-sheet", 
    previousPath: "../patient-records",
    progressPath: null // No specific progress path provided
  },
  { 
    name: "Skill Assessment Flow", 
    newPath: "../skill-assessment", 
    previousPath: "../therapy-assessments-list", 
    progressPath: null 
  },
  { 
    name: "Sensory Profile", 
    newPath: "../sensory-profile-fill-form", 
    previousPath: "../sensory-profile-view", 
    progressPath: "../sensory-profile-progress" 
  },
  { 
    name: "Autism Rating Form (CARS)", 
    newPath: "../forms/carsform", 
    previousPath: "../carsformprevious-entries", 
    progressPath: "../cars-progress" 
  },
  { 
    name: "Mathavam Flowchart", 
    newPath: "../forms/mathavamflowchart", 
    previousPath: "../mathavamflowchartprevious-entries", 
    progressPath: null 
  },
  { 
    name: "Behavioral Checklist (BC)", 
    newPath: "../forms/bc", 
    previousPath: "../bcprevious-entries", 
    progressPath: "../bc-progress" 
  },
];

const FormHome = () => {
  return (
    <div className="max-w-6xl mx-auto mt-12 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl font-sans text-gray-800">
      <h1 className="text-3xl font-extrabold text-center mb-10 text-indigo-800 tracking-tight leading-tight">
        Available Assessment Forms
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {forms.map((form, index) => (
          <div 
            key={index} 
            className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-xl border-l-4 border-blue-400 
                       hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out 
                       flex flex-col justify-between"
          >
            <h2 className="text-xl font-bold text-blue-900 mb-4 border-b pb-3 border-blue-100">
              {form.name}
            </h2>
            <div className="flex flex-col space-y-4 mt-auto">
              <Link
                to={form.newPath}
                className={`w-full text-center py-3 px-6 rounded-full font-semibold text-white shadow-md 
                            transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 
                            focus:outline-none focus:ring-4 focus:ring-opacity-75
                            ${
                              form.newPath === "/forms/carsform" // Example of disabling if needed, though typically "Add" is always enabled
                                ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:ring-blue-400"
                                : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:ring-blue-400"
                            }`}
              >
                Add New
              </Link>
              {form.previousPath && (
                <Link
                  to={form.previousPath}
                  className={`w-full text-center py-3 px-6 rounded-full font-semibold text-blue-800 border-2 border-blue-400 
                              bg-white hover:bg-blue-50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 
                              shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 focus:ring-opacity-75
                              ${
                                form.previousPath === "/carsformprevious-entries" || form.previousPath === "/mathavamflowchartprevious-entries" || form.previousPath === "/bcprevious-entries"
                                  ? "" // Enable for these existing paths
                                  : "" // Default to enabled
                              }`}
                >
                  View Previous Entries
                </Link>
              )}
              {form.progressPath && (
                <Link
                  to={form.progressPath}
                  className={`w-full text-center py-3 px-6 rounded-full font-semibold text-purple-800 border-2 border-purple-400 
                              bg-white hover:bg-purple-50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 
                              shadow-md focus:outline-none focus:ring-4 focus:ring-purple-200 focus:ring-opacity-75`}
                >
                  View Progress
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormHome;
