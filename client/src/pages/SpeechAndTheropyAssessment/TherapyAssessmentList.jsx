import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

// --- Simple SVG Icons Components ---
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.82 2.82 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

const TherapyAssessmentList = () => {
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Filter logic when search term changes
  useEffect(() => {
    const filtered = assessments.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.regNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAssessments(filtered);
  }, [searchTerm, assessments]);

  const fetchAssessments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/therapyAssessments`);
      setAssessments(response.data);
      setFilteredAssessments(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching therapy assessments:", err);
      setError("Failed to fetch therapy assessments. Please try again later.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/therapyAssessments/${id}`);
        // Optimistic update for faster UI feel
        const updatedList = assessments.filter(item => item._id !== id);
        setAssessments(updatedList);
        setFilteredAssessments(updatedList);
      } catch (err) {
        console.error(`Error deleting assessment with ID ${id}:`, err);
        alert("Failed to delete record. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 lg:p-12 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Therapy Assessments</h2>
            <p className="text-gray-500 mt-1">Manage and view patient assessment records.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
             {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 group-focus-within:text-blue-500 transition-colors"><SearchIcon /></span>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
                placeholder="Search patient or reg no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Add New Button */}
            <Link
              to="/dashboard/therapy-assessments/new" 
              className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all hover:-translate-y-0.5"
            >
              <span className="mr-2"><PlusIcon /></span>
              New Assessment
            </Link>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-300"><SearchIcon /></span>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No assessments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "Try adjusting your search terms." : "Get started by creating a new assessment."}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Link
                    to="/dashboard/therapy-assessments/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="mr-2"><PlusIcon /></span>
                    Create Assessment
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Registration No.
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssessments.map((assessment) => (
                    <tr key={assessment._id} className="hover:bg-blue-50/50 transition duration-150 ease-in-out group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {assessment.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{assessment.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {assessment.regNo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assessment.assessmentDate
                          ? new Date(assessment.assessmentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                          : <span className="text-gray-400 italic">N/A</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-3">
                          {/* View Button */}
                          <Link
                            to={`/dashboard/therapy-assessments/${assessment._id}`}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon />
                          </Link>
                          
                          {/* Edit Button */}
                         
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(assessment._id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-right text-xs text-gray-400">
           Showing {filteredAssessments.length} records
        </div>
      </div>
    </div>
  );
};

export default TherapyAssessmentList;