import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaPencilAlt, FaLock, FaPrint } from "react-icons/fa"; // Import icons
import { printSensorySection } from "../../utills/printSensorySection";

// Helper function to check if a section is still editable (within 5 hours)
const isEditable = (timestamp) => {
  if (!timestamp) return false;
  const FIVE_HOURS_IN_MS = 5 * 60 * 60 * 1000;
  const submissionTime = new Date(timestamp).getTime();
  const now = new Date().getTime();
  return now - submissionTime < FIVE_HOURS_IN_MS;
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

  // ******************************************************************
  // FIX: Token එක Header එකට ඇතුළත් කිරීමට යාවත්කාලීන කරන ලද ශ්‍රිතය
  // ******************************************************************
  const fetchAllSections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. localStorage වෙතින් Token එක ලබා ගැනීම
      const token = localStorage.getItem("token");

      if (!token) {
        // Token එකක් නොමැති නම් දෝෂය පෙන්වා නවත්වන්න
        throw new Error(
          "Authentication token missing. Please ensure you are logged in."
        );
      }

      // 2. Token එක Header එකට ඇතුළත් කර API call එක යැවීම
      const response = await axios.get("/api/assessments/sensory-profile", {
        headers: {
          "x-auth-token": token, // ⬅️ මෙතැනදී Token එක එකතු කර ඇත
        },
      });

      setSections(response.data);
    } catch (err) {
      console.error("Error fetching sections:", err);
      // දෝෂ පණිවිඩය සකස් කිරීම
      const errorMessage =
        err.response?.data?.msg ||
        err.message ||
        "Failed to load previous entries.";
      setError(`Error fetching sections: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSections();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-lg text-indigo-700">Loading previous entries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-xl mx-auto mt-10">
        <h2 className="text-xl font-bold mb-2">Data Fetch Error</h2>
        <p>{error}</p>
        <p className="mt-4 text-sm">Please try logging out and logging back in.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-3">
        Sensory Profile Assessment Entries
      </h1>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Test Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Submitted By
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sections.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No previous Sensory Profile entries found.
                </td>
              </tr>
            ) : (
              sections.map((section) => {
                const assessmentId = section._id;
                const canEdit = isEditable(section.createdAt);

                return (
                  <tr key={assessmentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {section.patientId || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        section.category === 'Child' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {section.category || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDisplayDateTime(section.testDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {section.examinerId || "Unknown"}
                      <div className="text-xs text-gray-400">
                        {formatDisplayDateTime(section.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      <button
                        onClick={() => printSensorySection(section)}
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