import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const TherapyAssessmentList = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/therapyAssessments`);
      setAssessments(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching therapy assessments:", err);
      setError("Failed to fetch therapy assessments. Please try again later.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this therapy assessment record?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/therapyAssessments/${id}`);
        alert("Therapy assessment record deleted successfully!");
        fetchAssessments(); // Refresh the list after deletion
      } catch (err) {
        console.error(`Error deleting assessment with ID ${id}:`, err);
        setError("Failed to delete record. Please try again.");
      }
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-lg">Loading therapy assessments...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl my-8">
      <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Therapy Assessment Records</h2>
      <Link
        to="../skill-assessment" // Assuming a route for adding new assessments
        className="mb-6 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300"
      >
        Add New Assessment
      </Link>

      {assessments.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No therapy assessment records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-blue-100">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-medium text-blue-700 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium text-blue-700 uppercase tracking-wider">
                  Registration No.
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium text-blue-700 uppercase tracking-wider">
                  Assessment Date
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium text-blue-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assessments.map((assessment) => (
                <tr key={assessment._id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                    {assessment.name}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                    {assessment.regNo}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                    {assessment.assessmentDate
                      ? new Date(assessment.assessmentDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/dashboard/therapy-assessments/${assessment._id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                    <Link
                      to={`dashboard/therapy-assessments/edit/${assessment._id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(assessment._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
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

export default TherapyAssessmentList;