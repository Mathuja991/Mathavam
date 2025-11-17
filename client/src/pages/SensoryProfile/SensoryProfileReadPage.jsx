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
  const [filterPatientId, setFilterPatientId] = useState("");

  // Function to fetch all individual section documents
  const fetchAllSections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/assessments/sensory-profile", {
        params: {
          patientId: filterPatientId ? filterPatientId.trim() : undefined,
        },
      });
      // The API already sorts by testDate, but we can re-sort by updatedAt for most recent submissions
      const sortedSections = (response.data || []).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setSections(sortedSections);
    } catch (err) {
      setError("Failed to fetch assessment sections.");
      console.error("Error fetching sections:", err);
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when the component first loads
  useEffect(() => {
    fetchAllSections();
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

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Examiner ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                Section Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Submitted
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sections.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No sections have been submitted yet.
                </td>
              </tr>
            ) : (
              sections.map((section) => {
                const canEdit = section.updatedAt && isEditable(section.updatedAt);
                const assessmentId = section.assessmentId || section._id; // Use group ID if available, otherwise fall back to its own ID

                return (
                  <tr key={section._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {section.patientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {section.examinerId}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-semibold whitespace-normal break-words max-w-xs">
                      {section.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {section.updatedAt ? formatDisplayDateTime(section.updatedAt) : "N/A"}
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
