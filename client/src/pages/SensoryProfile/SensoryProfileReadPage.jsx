// SensoryProfileReadPage.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaPencilAlt, FaLock, FaPrint } from "react-icons/fa";
import { printSensorySection } from "../../utills/printSensorySection";
// ADDED IMPORTS: Import the centralized API config
import { API_BASE_URL, getAuthConfig } from "../../utills/apiUtils"; 

// Helper function to check if a section is still editable (within 5 hours)
const isEditable = (timestamp) => {
  if (!timestamp) return false;
  const FIVE_HOURS_IN_MS = 5 * 60 * 60 * 1000;
  const submissionTime = new Date(timestamp).getTime();
  const now = new Date().getTime();
  return now - submissionTime < FIVE_HOURS_IN_MS;
};

// Normalize possible timestamp shapes (string, Date, Mongo {$date})
const normalizeTimestamp = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object" && value.$date) {
    return value.$date;
  }

  return null;
};

const formatDisplayDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const timePart = date.toLocaleTimeString();
  return `${day}-${month}-${year} ${timePart}`;
};

function SensoryProfileReadPage() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPatientId, setFilterPatientId] = useState("");

  // Fetch all section documents (with token in header + optional patient filter)
  const fetchAllSections = async () => {
    setIsLoading(true);
    setError(null);
    
    // Check for token *before* the API call
    if (!localStorage.getItem("token")) {
        setError("Authentication token missing. Please log in again.");
        setIsLoading(false);
        return;
    }

    try {
      // FIX 3: Use API_BASE_URL and getAuthConfig()
      const response = await axios.get(
        `${API_BASE_URL}/assessments/sensory-profile`, 
        {
          params: {
            patientId: filterPatientId ? filterPatientId.trim() : undefined,
          },
          // Merge params with auth config
          ...getAuthConfig() 
        }
      );

      const sortedSections = (response.data || []).sort((a, b) => {
        const aTs =
          normalizeTimestamp(a.submittedAt) ||
          normalizeTimestamp(a.updatedAt) ||
          normalizeTimestamp(a.createdAt);
        const bTs =
          normalizeTimestamp(b.submittedAt) ||
          normalizeTimestamp(b.updatedAt) ||
          normalizeTimestamp(b.createdAt);

        return new Date(bTs || 0) - new Date(aTs || 0);
      });

      setSections(sortedSections);
    } catch (err) {
      console.error("Error fetching sections:", err);
      // Display a friendly error message, especially for 401
      const isAuthError = axios.isAxiosError(err) && err.response?.status === 401;
      const errorMessage = isAuthError 
        ? "Token is invalid or expired. Please re-login."
        : err.response?.data?.msg || err.message || "Failed to fetch assessment sections.";
      setError(errorMessage);
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when the component first loads
  useEffect(() => {
    fetchAllSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAllSections();
  };

  const handlePrintSection = (section) => {
    if (!section) return;
    printSensorySection({
      baseInfo: {
        patientId: section.patientId,
        examinerId: section.examinerId,
        testDate: section.testDate,
        ageGroup: section.ageGroup,
      },
      sectionData: {
        category: section.category,
        responses: section.responses,
        rawScore: section.rawScore,
        comments: section.comments,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="text-center p-10 text-lg font-medium">
        Loading Submitted Sections...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 text-red-600 font-bold">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Submitted Sensory Profile Sections
        </h1>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="mb-6 flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
      >
        <input
          type="text"
          value={filterPatientId}
          onChange={(e) => setFilterPatientId(e.target.value)}
          placeholder="Search by Patient ID..."
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Patient ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Examiner ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Submission Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Raw Score
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sections.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-10 text-center text-gray-500"
                >
                  {filterPatientId
                    ? `No sections found for patient ID: ${filterPatientId}`
                    : "No submitted Sensory Profile sections found."}
                </td>
              </tr>
            ) : (
              sections.map((section) => {
                const assessmentId = section._id;
                const latestTimestamp =
                  normalizeTimestamp(section.submittedAt) ||
                  normalizeTimestamp(section.updatedAt) ||
                  normalizeTimestamp(section.createdAt);
                const canEdit = isEditable(latestTimestamp);

                return (
                  <tr key={assessmentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {section.category || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {section.patientId || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {section.examinerId || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDisplayDateTime(latestTimestamp) || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {section.rawScore !== undefined
                        ? section.rawScore
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                      <button
                        onClick={() => handlePrintSection(section)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        title="Print section"
                      >
                        <FaPrint />
                        Print
                      </button>
                      {canEdit ? (
                        <Link
                          to={`/dashboard/sensory-profile/edit/${assessmentId}`}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors"
                          title="Edit this assessment"
                        >
                          <FaPencilAlt />
                          Edit
                        </Link>
                      ) : (
                        <div
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-md cursor-not-allowed"
                          title="Editing window has expired (5 hours)"
                        >
                          <FaLock />
                          Locked
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SensoryProfileReadPage;