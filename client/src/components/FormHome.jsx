import React from "react";
import { Link } from "react-router-dom";

const forms = [
  {
    name: "Patient Record Form",
    icon: "📋",
    desc: "Complete demographic and initial intake information.",
    newPath: "../record-sheet",
    previousPath: "../patient-records",
    progressPath: null,
    color: "blue",
  },
  {
    name: "Skill Assessment Flow",
    icon: "🧠",
    desc: "Detailed evaluation of core developmental skills.",
    newPath: "../skill-assessment",
    previousPath: "../therapy-assessments-list",
    progressPath: null,
    color: "teal",
  },
  {
    name: "Sensory Profile",
    icon: "👃",
    desc: "Assessing sensory processing patterns in daily life.",
    newPath: "../sensory-profile-fill-form",
    previousPath: "../sensory-profile-view",
    progressPath: null,
    color: "purple",
  },
  {
    name: "Autism Rating Form (CARS)",
    icon: "🧩",
    desc: "Childhood Autism Rating Scale for diagnostic aid.",
    newPath: "../forms/carsform",
    previousPath: "../carsformprevious-entries",
    progressPath: "../cars-progress",
    color: "indigo",
  },
  {
    name: "Mathavam Flowchart",
    icon: "📊",
    desc: "Follow-up developmental milestone tracking.",
    newPath: "../forms/mathavamflowchart",
    previousPath: "../mathavamflowchartprevious-entries",
    progressPath: null,
    color: "pink",
  },
  {
    name: "Behavioral Checklist (BC)",
    icon: "📝",
    desc: "Checklist for analyzing and tracking challenging behaviors.",
    newPath: "../forms/bc",
    previousPath: "../bcprevious-entries",
    progressPath: "../bc-progress",
    color: "green",
  },
];

const FormHome = () => {
  const getButtonClass = (baseColor) => {
    switch (baseColor) {
      case "blue":
        return "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:ring-blue-400";
      case "teal":
        return "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:ring-teal-400";
      case "purple":
        return "bg-gradient-to-r from-purple-600 to-fuchsia-700 hover:from-purple-700 hover:to-fuchsia-800 focus:ring-purple-400";
      case "indigo":
        return "bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 focus:ring-indigo-400";
      case "pink":
        return "bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 focus:ring-pink-400";
      case "green":
        return "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 focus:ring-green-400";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 focus:ring-gray-300";
    }
  };

  const getViewButtonClass = (baseColor) => {
    switch (baseColor) {
      case "blue":
        return "text-blue-700 border-blue-400 hover:bg-blue-50 focus:ring-blue-200";
      case "teal":
        return "text-teal-700 border-teal-400 hover:bg-teal-50 focus:ring-teal-200";
      case "purple":
        return "text-purple-700 border-purple-400 hover:bg-purple-50 focus:ring-purple-200";
      case "indigo":
        return "text-indigo-700 border-indigo-400 hover:bg-indigo-50 focus:ring-indigo-200";
      case "pink":
        return "text-pink-700 border-pink-400 hover:bg-pink-50 focus:ring-pink-200";
      case "green":
        return "text-green-700 border-green-400 hover:bg-green-50 focus:ring-green-200";
      default:
        return "text-gray-700 border-gray-400 hover:bg-gray-50 focus:ring-gray-200";
    }
  };

  const getProgressButtonClass = (baseColor, hasPath) => {
    if (!hasPath) {
      return "cursor-not-allowed text-gray-400 border-gray-300 bg-gray-50/50 shadow-inner";
    }
    switch (baseColor) {
      case "indigo":
        return "text-violet-700 border-violet-400 hover:bg-violet-50 focus:ring-violet-200";
      case "green":
        return "text-emerald-700 border-emerald-400 hover:bg-emerald-50 focus:ring-emerald-200";
      default:
        return "text-gray-700 border-gray-400 hover:bg-gray-50 focus:ring-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 lg:p-10 bg-white rounded-3xl shadow-2xl font-['Roboto',_sans-serif]">
      <h1 className="text-4xl font-extrabold text-center mb-12 text-indigo-800 tracking-tight leading-snug border-b pb-4">
        Assessment and Documentation Center 📝
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {forms.map((form, index) => (
          <div
            key={index}
            className={`bg-gray-50/80 backdrop-blur-sm p-7 rounded-2xl shadow-xl border-t-8 border-${form.color}-500 
                        hover:shadow-2xl hover:bg-white transition-all duration-300 ease-in-out 
                        flex flex-col justify-between transform hover:scale-[1.02]`}
          >
            <div>
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">{form.icon}</span>
                <h2 className={`text-2xl font-bold text-gray-900`}>
                  {form.name}
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">{form.desc}</p>
            </div>

            <div className="flex flex-col space-y-3 mt-auto pt-4 border-t border-gray-100">
              <Link
                to={form.newPath}
                className={`w-full text-center py-3 px-6 rounded-xl font-bold text-white shadow-lg 
                            transition-all duration-300 ease-in-out transform hover:scale-[1.01] active:scale-95 
                            focus:outline-none focus:ring-4 focus:ring-opacity-75 ${getButtonClass(
                              form.color
                            )}`}
              >
                Start New Assessment
              </Link>

              {form.previousPath && (
                <Link
                  to={form.previousPath}
                  className={`w-full text-center py-3 px-6 rounded-xl font-bold border-2 
                                bg-white/90 shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.01] active:scale-95 
                                focus:outline-none focus:ring-4 focus:ring-opacity-75 ${getViewButtonClass(
                                  form.color
                                )}`}
                >
                  View Previous Entries
                </Link>
              )}

              {form.progressPath && (
                <Link
                  to={form.progressPath}
                  className={`w-full text-center py-3 px-6 rounded-xl font-bold border-2 
                                bg-white/90 shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.01] active:scale-95 
                                focus:outline-none focus:ring-4 focus:ring-opacity-75 ${getProgressButtonClass(
                                  form.color,
                                  true
                                )}`}
                >
                  Track Progress 📈
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