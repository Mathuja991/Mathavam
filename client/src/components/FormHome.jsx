import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Heroicons imports (assuming you have @heroicons/react installed)
import { 
  AcademicCapIcon, 
  SparklesIcon, 
  PuzzlePieceIcon, 
  ClipboardDocumentCheckIcon, 
  WrenchScrewdriverIcon, 
  NewspaperIcon 
} from '@heroicons/react/24/outline'; // 24/outline icons used for better visibility

// Access Permissions Key:
// C: Create (Start New Assessment)
// R: Read (View Previous Entries, Track Progress)
// U: Update (Implicit in CRUD/C access to update existing)
// D: Delete (Not explicitly handled in this UI, but covered by CRUD/C)

const forms = [
  {
    name: "Skill Assessment Flow",
    icon: AcademicCapIcon, // Replaced 🧠 with AcademicCapIcon (Learning/Skills)
    desc: "Detailed evaluation of core developmental skills.",
    newPath: "../skill-assessment",
    previousPath: "../therapy-assessments-list",
    progressPath: null,
    color: "teal",
    access: {
      Doctors: "View",
      Therapists: "CRUD", // යාවත්කාලීන කරන ලදී
      Admin: "View",
      SuperAdmin: "View",
      Parents: "No need",
    },
  },
  {
    name: "Sensory Profile",
    icon: SparklesIcon, // Replaced 👃 with SparklesIcon (Sensation/Profile)
    desc: "Assessing sensory processing patterns in daily life.",
    newPath: "../sensory-profile-fill-form",
    previousPath: "../sensory-profile-view",
    progressPath: "../sensory-profile-progress",
    color: "purple",
    access: {
      Doctors: "View",
      Therapists: "CRUD", // යාවත්කාලීන කරන ලදී
      Admin: "View",
      SuperAdmin: "View",
      Parents: "Restrict",
    },
  },
  {
    name: "Autism Rating Form (CARS)",
    icon: PuzzlePieceIcon, // Replaced 🧩 with PuzzlePieceIcon (Diagnosis/Complexity)
    desc: "Childhood Autism Rating Scale for diagnostic aid.",
    newPath: "../forms/Carsform",
    previousPath: "../forms/carsform-previous-entries",
    progressPath: "../forms/cars-progress",
    color: "indigo",
    access: {
      Doctors: "CRUD",
      Therapists: "No need",
      Admin: "View",
      SuperAdmin: "View",
      Parents: "No need",
    },
  },
  // {
  //    name: "Mathavam Flowchart",
  //    icon: "📊", // If Mathavam is added, I suggest using Flowchart/ChartBarIcon
  //    desc: "Follow-up developmental milestone tracking.",
  //    newPath: "../forms/mathavamflowchart",
  //    previousPath: "../forms/mathavamflowchart-previous-entries",
  //    progressPath: null,
  //    color: "pink",
  // },
  {
    name: "Behavioral Checklist (BC)",
    icon: ClipboardDocumentCheckIcon, // Replaced 📝 with ClipboardDocumentCheckIcon (Checklist/Behavior)
    desc: "Checklist for analyzing and tracking challenging behaviors.",
    newPath: "../forms/behavioral-checklist",
    previousPath: "../forms/bc-previous-entries",
    progressPath: "../forms/bc-progress",
    color: "green",
    access: {
      Doctors: "CRUD",
      Therapists: "CRUD",
      Admin: "View",
      SuperAdmin: "View",
      Parents: "No need",
    },
  },
  {
    name: "DSM5 Form",
    icon: WrenchScrewdriverIcon, // Replaced 📝 with WrenchScrewdriverIcon (Diagnostic Tool/Manual)
    desc: "Diagnostic tool based on DSM-5 criteria.", // Updated description to be more specific
    newPath: "../DSM5Form",
    previousPath: "../submitted-dsm5-forms",
    progressPath: null,
    color: "red", // Changed color for distinction from BC
    access: {
      Doctors: "CRUD",
      Therapists: "No need",
      Admin: "View",
      SuperAdmin: "View",
      Parents: "No need",
    },
  },
  {
    name: "SNAP Form",
    icon: NewspaperIcon, // Replaced 📝 with NewspaperIcon (Standard Form/Report)
    desc: "Standardized screening tool for ADHD.", // Updated description
    newPath: "../SnapForm",
    previousPath: "../snap-submitted-forms",
    progressPath: null,
    color: "orange", // Changed color for distinction
    access: {
      Doctors: "CRUD",
      Therapists: "No need",
      Admin: "View",
      SuperAdmin: "View",
      Parents: "CRUD",
    },
  },
];

// **********************************************
// FIX: User Role Naming Mismatch Fix
// **********************************************

// Helper function to map the stored singular role to the plural/specific access key
const getAccessKeyForRole = (storedUserType) => {
    if (!storedUserType) return 'Guest'; // Default safe return

    const cleanRole = storedUserType.trim();

    // Map singular roles (likely from DB/localStorage) to plural/specific keys used in the 'forms' object
    switch (cleanRole) {
        case 'Doctor':
            return 'Doctors';
        case 'Therapist':
        case 'Resource Person': // Resource Person also maps to Therapist access
            return 'Therapists';
        case 'Parent':
            return 'Parents';
        case 'Super Admin': // Handle case where role might include a space
            return 'SuperAdmin';
        case 'Admin':
        case 'SuperAdmin':
            return cleanRole; // Already matches keys
        default:
            return cleanRole;
    }
};

const FormHome = () => {
  // FIX: Change default state to 'SuperAdmin' (no space) to match the access key.
  const [currentUserRole, setCurrentUserRole] = useState("SuperAdmin");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.userType) {
          // FIX: Map the stored role to the correct access key
          const accessKey = getAccessKeyForRole(parsedUser.userType);
          setCurrentUserRole(accessKey);
        }
      } catch (error) {
        console.error("Error parsing user data in FormHome:", error);
      }
    }
  }, []);

  // Utility function to check if the user has an access level that permits 'Create'
  const canCreate = (form) => {
    // Uses currentUserRole
    const accessLevel = form.access[currentUserRole];
    if (!accessLevel) return false;
    return accessLevel.includes("CRUD") || accessLevel.includes("C");
  };

  // Utility function to check if the user has an access level that permits 'Read' (View)
  const canRead = (form) => {
    // Uses currentUserRole
    const accessLevel = form.access[currentUserRole];
    if (!accessLevel) return false;
    return (
      accessLevel.includes("CRUD") ||
      accessLevel.includes("View") ||
      accessLevel.includes("R") ||
      accessLevel.includes("Y") ||
      accessLevel.includes("Restrict")
    );
  };

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
      case "red": // Added Red
        return "bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 focus:ring-red-400";
      case "orange": // Added Orange
        return "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 focus:ring-orange-400";
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
      case "red": // Added Red
        return "text-red-700 border-red-400 hover:bg-red-50 focus:ring-red-200";
      case "orange": // Added Orange
        return "text-orange-700 border-orange-400 hover:bg-orange-50 focus:ring-orange-200";
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
      case "red": // Added Red
        return "text-rose-700 border-rose-400 hover:bg-rose-50 focus:ring-rose-200";
      case "orange": // Added Orange
        return "text-amber-700 border-amber-400 hover:bg-amber-50 focus:ring-amber-200";
      default:
        return "text-gray-700 border-gray-400 hover:bg-gray-50 focus:ring-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 lg:p-10 bg-white rounded-3xl shadow-2xl font-['Roboto',_sans-serif]">
      <h1 className="text-4xl font-extrabold text-center mb-12 text-indigo-800 tracking-tight leading-snug border-b pb-4">
        Assessment and Documentation Center <ClipboardDocumentCheckIcon className="inline-block w-8 h-8 -mt-1 text-indigo-500" />
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {forms.map(
          (form, index) =>
            // Only render the form if the user has some level of 'Read' or 'Create' access
            (canCreate(form) || canRead(form)) && (
              <div
                key={index}
                className={`bg-gray-50/80 backdrop-blur-sm p-7 rounded-2xl shadow-xl border-t-8 border-${form.color}-500  
                  hover:shadow-2xl hover:bg-white transition-all duration-300 ease-in-out 
                  flex flex-col justify-between transform hover:scale-[1.02]`}
              >
                <div>
                  <div className="flex items-center mb-3">
                    {/* Render the Heroicon Component */}
                    <form.icon className="w-8 h-8 mr-3 text-gray-700" /> 
                    <h2 className={`text-2xl font-bold text-gray-900`}>
                      {form.name}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">{form.desc}</p>
                </div>

                <div className="flex flex-col space-y-3 mt-auto pt-4 border-t border-gray-100">
                  {/* 1. Start New Assessment (Create Access Check) */}
                  {canCreate(form) && (
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
                  )}
                  {!canCreate(form) && (
                    <button
                      disabled
                      className="w-full text-center py-3 px-6 rounded-xl font-bold text-white bg-gray-400/80 cursor-not-allowed"
                    >
                      No Creation Access
                    </button>
                  )}

                  {/* 2. View Previous Entries (Read Access Check and Path Check) */}
                  {form.previousPath && canRead(form) && (
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

                  {/* 3. Track Progress (Read Access Check and Path Check) */}
                  {form.progressPath && canRead(form) && (
                    <Link
                      to={form.progressPath}
                      className={`w-full text-center py-3 px-6 rounded-xl font-bold border-2 
                            bg-white/90 shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.01] active:scale-95 
                            focus:outline-none focus:ring-4 focus:ring-opacity-75 ${getProgressButtonClass(
                              form.color,
                              true
                            )}`}
                    >
                      Track Progress
                    </Link>
                  )}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default FormHome;