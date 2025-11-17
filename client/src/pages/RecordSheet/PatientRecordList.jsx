// PatientRecordList.jsx (RBAC Updated)

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

// --- Token eka ganna helper function eka ---
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Auth token not found in localStorage');
    return { headers: {} };
  }
  return {
    headers: {
      'x-auth-token': token,
    },
  };
};

// --- MEKA ALUTHIN ADD KALE (USER ROLE EKA GANNA) ---
const getLoggedInUser = () => {
  const userString = localStorage.getItem('user'); // 'user' object eka localStorage eken gannawa
  if (!userString) {
    console.error('Logged in user object not found in localStorage');
    return null;
  }
  try {
    return JSON.parse(userString); // JSON string eka object ekak karanawa
  } catch (e) {
    console.error('Error parsing user from localStorage', e);
    return null;
  }
};
// --- END OF ALUTH FUNCTION ---

const PatientRecordList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- MEKA ALUTHIN ADD KALE (PERMISSION STATE) ---
  const [canCRUD, setCanCRUD] = useState(false); // CRUD (Add, Edit, Delete) puluwanda?

  useEffect(() => {
    // --- ME KOTASA ALUTHIN ADD KALE ---
    const loggedInUser = getLoggedInUser();

    if (loggedInUser && loggedInUser.userType === 'Super Admin') {
      setCanCRUD(true); // Super Admin nam CRUD puluwan
    }
    // --- END OF ALUTH KOTASA ---

    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const config = getAuthConfig(); 
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/patientRecords`,
        config 
      );
      
      // Rule: "View (Their child only)"
      // Parent kenek nam, data filter kirima.
      const loggedInUser = getLoggedInUser();
      if (loggedInUser && loggedInUser.userType === 'Parent' && loggedInUser.childRegNo) {
        const filteredRecords = response.data.filter(
          record => record.childNo === loggedInUser.childRegNo
        );
        setRecords(filteredRecords);
      } else {
        // Anith ayata okkoma pennanawa
        setRecords(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patient records:", err);
      if (err.response && err.response.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Failed to fetch patient records. Please try again later.");
      }
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // --- ME CHECK EKA ALUTHIN ADD KALE ---
    if (!canCRUD) {
      alert("You do not have permission to delete this record.");
      return;
    }
    // --- END OF ALUTH CHECK EKA ---

    if (
      window.confirm("Are you sure you want to delete this patient record?")
    ) {
      try {
        const config = getAuthConfig(); 
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/patientRecords/${id}`,
          config 
        );
        
        alert("Patient record deleted successfully!");
        fetchRecords();
      } catch (err) {
        console.error(`Error deleting record with ID ${id}:`, err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          alert("You do not have permission to delete this record.");
        } else {
          alert("Failed to delete patient record. Please try again.");
        }
      }
    }
  };

  if (loading) {
    // Loading UI eka wenas kara natha
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl shadow-xl font-['Roboto',_sans-serif]">
        <svg /* ... loading svg ... */ >
        </svg>
        <p className="text-gray-600 text-lg font-medium">
          Loading patient records...
        </p>
      </div>
    );
  }

  if (error) {
    // Error UI eka wenas kara natha
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 border-2 border-red-400 rounded-xl shadow-xl text-red-800 text-center font-['Roboto',_sans-serif]">
        <p className="text-xl font-bold mb-2">Data Error</p>
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  // --- JSX (UI) EKE WENASKAM ---
  return (
    <div className="p-8 bg-white rounded-3xl shadow-2xl max-w-7xl mx-auto my-8 font-['Roboto',_sans-serif]">
      <div className="flex flex-col sm:flex-row justify-between items-center pb-6 mb-6 border-b border-gray-100 gap-4">
        <h1 className="text-4xl font-extrabold text-indigo-800 tracking-tight">
          Patient Records List 🧑‍⚕️
        </h1>

        {/* --- ME THAMAI WENASA (Add New Record Button) --- */}
        {/* 'canCRUD' true nam (Super Admin) witharak me link eka pennanna */}
        {canCRUD && (
          <Link
            to="../../dashboard/record-sheet"
            className="flex items-center px-6 py-2 bg-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-teal-400/50 hover:bg-teal-700 transition duration-300 transform hover:scale-[1.02]"
          >
            <span className="text-xl mr-2">+</span> Add New Record
          </Link>
        )}
        {/* --- END OF WENASA --- */}
      </div>

      {records.length === 0 ? (
        <div className="text-gray-600 text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <p className="text-2xl font-semibold mb-2">No Records Found</p>
          <p>No patient records found. Start by adding a new one!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Table Header eka wenas kara natha */}
              <tr className="bg-gradient-to-r from-indigo-500 to-indigo-600 sticky top-0 z-10 text-white shadow-lg">
                <th className="py-4 px-6 font-bold text-lg rounded-tl-2xl">
                  Child No
                </th>
                <th className="py-4 px-6 font-bold text-lg">Name</th>
                <th className="py-4 px-6 font-bold text-lg">Contact No</th>
                <th className="py-4 px-6 font-bold text-lg">
                  Date of Assessment
                </th>
                <th className="py-4 px-6 font-bold text-lg rounded-tr-2xl text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, idx) => (
                <tr
                  key={record._id}
                  className={`border-b border-gray-100 text-gray-800 ${
                    idx % 2 === 0 ? "bg-white" : "bg-indigo-50/50"
                  } hover:bg-indigo-100/70 transition duration-300`}
                >
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.childNo}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {record.name}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600">
                    {record.contactNo}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600">
                    {record.dateOfInitialAssessment
                      ? new Date(
                          record.dateOfInitialAssessment
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-center space-x-3">
                    
                    {/* View Button (Okkotama pennanawa) */}
                    <Link
                      to={`../patient-records/${record._id}`}
                      className="px-4 py-1.5 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200 transform hover:scale-[1.05] text-sm"
                    >
                      View 👁️
                    </Link>

                    {/* --- ME THAMAI WENASA (Edit & Delete Buttons) --- */}
                    {/* 'canCRUD' true nam (Super Admin) witharak me buttons pennanna */}
                    {canCRUD && (
                      <>
                        <Link
                          to={`../patient-records/edit/${record._id}`}
                          className="px-4 py-1.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition duration-200 transform hover:scale-[1.05] text-sm"
                        >
                          Edit ✏️
                        </Link>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="px-4 py-1.5 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-200 transform hover:scale-[1.05] text-sm"
                        >
                          Delete 🗑️
                        </button>
                      </>
                    )}
                    {/* --- END OF WENASA --- */}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientRecordList;