import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Heroicons imports
import {
  AcademicCapIcon,
  SparklesIcon,
  PuzzlePieceIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';

// ----------------------------
// FORM LIST
// ----------------------------
const forms = [
  {
    name: "Skill Assessment Flow",
    icon: AcademicCapIcon,
    desc: "Detailed evaluation of core developmental skills.",
    newPath: "../skill-assessment",
    previousPath: "../therapy-assessments-list",
    progressPath: null,
    color: "teal",
    access: {
      Doctors: "View",
      Therapists: "CRUD",
      Admin: "View",
      SuperAdmin: "View",
      Parents: "No need",
    },
  },
  {
    name: "Sensory Profile",
    icon: SparklesIcon,
    desc: "Assessing sensory processing patterns in daily life.",
    newPath: "../sensory-profile-fill-form",
    previousPath: "../sensory-profile-view",
    progressPath: "../sensory-profile-progress",
    color: "purple",
    access: {
      Doctors: "View",
      Therapists: "CRUD",
      Admin: "View",
      SuperAdmin: "View",
      Parents: "No need",
    },
  },
  {
    name: "Autism Rating Form (CARS)",
    icon: PuzzlePieceIcon,
    desc: "Childhood Autism Rating Scale for diagnostic aid.",
    newPath: "../forms/Carsform",
    previousPath: "../forms/carsform-previous-entries",
    progressPath: "../forms/cars-progress",
    color: "indigo",
    access: {
      Doctors: "CRUD",
      Therapists: "View",
      Admin: "View",
      SuperAdmin: "View",
      Parents: "No need",
    },
  },
  {
    name: "Behavioral Checklist (BC)",
    icon: ClipboardDocumentCheckIcon,
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
    icon: WrenchScrewdriverIcon,
    desc: "Diagnostic tool based on DSM-5 criteria.",
    newPath: "../DSM5Form",
    previousPath: "../submitted-dsm5-forms",
    progressPath: null,
    color: "blue",
    access: {
      Doctors: "CRUD",
      Therapists: "View",
      Admin: "View",
      SuperAdmin: "View",
      Parents: "No need",
    },
  },
  {
    name: "SNAP Form",
    icon: NewspaperIcon,
    desc: "Standardized screening tool for ADHD.",
    newPath: "../SnapForm",
    previousPath: "../snap-submitted-forms",
    progressPath: null,
    color: "orange",
    access: {
      Doctors: "CRUD",
      Therapists: "View",
      Admin: "View",
      SuperAdmin: "View",
      Parents: "CRUD",
    },
  },
];

// -----------------------------------
// Role mapping
// -----------------------------------
const getAccessKeyForRole = (storedUserType) => {
  if (!storedUserType) return "Guest";
  const cleanRole = storedUserType.trim();

  switch (cleanRole) {
    case "Doctor":
      return "Doctors";
    case "Therapist":
    case "Resource Person":
      return "Therapists";
    case "Parent":
      return "Parents";
    case "Super Admin":
      return "SuperAdmin";
    default:
      return cleanRole;
  }
};

const FormHome = () => {
  const [currentUserRole, setCurrentUserRole] = useState("SuperAdmin");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.userType) {
          const roleKey = getAccessKeyForRole(parsedUser.userType);
          setCurrentUserRole(roleKey);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // -------------------------
  // Permission helpers
  // -------------------------
  const canCreate = (form) => {
    const level = form.access[currentUserRole];
    if (!level) return false;
    return level.includes("CRUD") || level.includes("C");
  };

  const canRead = (form) => {
    const level = form.access[currentUserRole];
    if (!level) return false;
    return (
      level.includes("CRUD") ||
      level.includes("View") ||
      level.includes("R")
    );
  };

  // -------------------------------
  // CALCULATE BUTTON COUNT
  // -------------------------------
  const getButtonCount = (form) => {
    let count = 0;
    if (canCreate(form)) count++;
    if (canRead(form) && form.previousPath) count++;
    if (canRead(form) && form.progressPath) count++;
    return count;
  };

  // --------------------------------
  // FINAL SORT (NEW IMPROVED LOGIC)
  // --------------------------------
  const sortedForms = [...forms].sort((a, b) => {
    const countA = getButtonCount(a);
    const countB = getButtonCount(b);

    if (countB !== countA) {
      return countB - countA; // sort by button count
    }

    // Same number of buttons → sort by "Start New Assessment" availability
    const aHasNew = canCreate(a) ? 1 : 0;
    const bHasNew = canCreate(b) ? 1 : 0;

    if (bHasNew !== aHasNew) {
      return bHasNew - aHasNew; // form with create button comes first
    }

    return 0; // keep original order if both are equal
  });

  // ---------------------------
  // COLOR FUNCTIONS
  // ---------------------------
  const getButtonClass = (color) => {
    switch (color) {
      case "blue":
        return "bg-blue-600 hover:bg-blue-700";
      case "teal":
        return "bg-teal-600 hover:bg-teal-700";
      case "purple":
        return "bg-purple-600 hover:bg-purple-700";
      case "indigo":
        return "bg-indigo-600 hover:bg-indigo-700";
      case "green":
        return "bg-green-600 hover:bg-green-700";
      case "orange":
        return "bg-orange-600 hover:bg-orange-700";
      default:
        return "bg-gray-600";
    }
  };

  const getBorderClass = (color) => `border-${color}-500`;

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 lg:p-10 bg-white rounded-3xl shadow-2xl">
      <h1 className="text-4xl font-bold text-center mb-10 text-indigo-800">
        Assessment & Documentation Center
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedForms.map((form, index) => {
          if (!canCreate(form) && !canRead(form)) return null;

          return (
            <div
              key={index}
              className={`p-7 bg-gray-50 rounded-2xl shadow-xl border-t-8 ${getBorderClass(form.color)}`}
            >
              <div className="flex items-center mb-3">
                <form.icon className="w-8 h-8 mr-3 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">{form.name}</h2>
              </div>

              <p className="text-gray-600 mb-6">{form.desc}</p>

              <div className="flex flex-col space-y-3">
                {canCreate(form) && (
                  <Link
                    to={form.newPath}
                    className={`py-3 w-full rounded-xl text-white font-bold text-center ${getButtonClass(form.color)}`}
                  >
                    Start New Assessment
                  </Link>
                )}

                {canRead(form) && form.previousPath && (
                  <Link
                    to={form.previousPath}
                    className="py-3 w-full rounded-xl text-center border font-bold bg-white"
                  >
                    View Previous Entries
                  </Link>
                )}

                {canRead(form) && form.progressPath && (
                  <Link
                    to={form.progressPath}
                    className="py-3 w-full rounded-xl text-center border font-bold bg-white"
                  >
                    Track Progress
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormHome;
