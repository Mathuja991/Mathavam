import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";

const ViewTherapyAssessment = () => {
  const { id } = useParams(); // Get the ID from the URL
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/therapyAssessments/${id}`);
        setAssessment(response.data);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching assessment with ID ${id}:`, err);
        setError("Failed to load therapy assessment record. It might not exist or there was a server error.");
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]); // Re-run effect if ID changes

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this therapy assessment record?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/therapyAssessments/${id}`);
        alert("Therapy assessment record deleted successfully!");
        navigate("/therapy-assessments"); // Redirect to the list after deletion
      } catch (err) {
        console.error(`Error deleting assessment with ID ${id}:`, err);
        setError("Failed to delete record. Please try again.");
      }
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-lg">Loading therapy assessment details...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-lg text-red-600">{error}</div>;
  }

  if (!assessment) {
    return <div className="text-center p-8 text-lg">No assessment data found.</div>;
  }

  // Helper function to render a field
  const renderField = (label, value) => {
    if (value === undefined || value === null || value === "") {
      return null; // Don't render if value is empty or null
    }
    return (
      <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-gray-700 font-medium">{label}:</span>
        <span className="text-gray-900 font-semibold">
          {label.includes("Date") && value ? new Date(value).toLocaleDateString() : value.toString()}
        </span>
      </div>
    );
  };

  // Helper function to render a section (e.g., nested objects like preRequisiteSkills)
  const renderSection = (title, data) => {
    if (!data || Object.keys(data).length === 0 || Object.values(data).every(val => val === null || val === undefined || val === "")) {
        return null;
    }

    return (
      <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
        <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2 border-blue-300">{title}</h3>
        {Object.entries(data).map(([key, value]) => {
          if (value === undefined || value === null || value === "") return null;
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // Convert camelCase to "Camel Case"
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Recursively render nested objects, skipping if all values are empty
            if (Object.values(value).every(val => val === null || val === undefined || val === "" || (typeof val === 'object' && Object.values(val).every(nestedVal => nestedVal === null || nestedVal === undefined || nestedVal === "")))) {
                return null;
            }
            return (
                <div key={key} className="pl-4 border-l-2 border-gray-200 ml-2 mt-2">
                  <p className="font-semibold text-gray-800">{formattedKey}:</p>
                  {Object.entries(value).map(([nestedKey, nestedValue]) => {
                    if (nestedValue === undefined || nestedValue === null || nestedValue === "") return null;
                    const formattedNestedKey = nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return renderField(`- ${formattedNestedKey}`, nestedValue);
                  })}
                </div>
              );
          }
          return renderField(formattedKey, value);
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl my-8">
      <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">
        Therapy Assessment Details: {assessment.name} ({assessment.regNo})
      </h2>

      <div className="flex justify-between mb-6">
        <Link
          to="/therapy-assessments"
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300"
        >
          ← Back to List
        </Link>
        <div>
          <Link
            to={`/therapy-assessments/edit/${assessment._id}`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 mr-4"
          >
            Edit Assessment
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300"
          >
            Delete Assessment
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Details */}
        <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-2xl font-semibold text-blue-700 mb-6 pb-2 border-b border-blue-200">
            Patient Information
          </h3>
          {renderField("Patient Name", assessment.name)}
          {renderField("Date of Birth", assessment.dob)}
          {renderField("Age", assessment.age)}
          {renderField("Gender", assessment.gender)}
          {renderField("Registration No.", assessment.regNo)}
          {renderField("Language Used", assessment.languageUsed)}
          {renderField("Primary Carer", assessment.primaryCarer)}
          {renderField("Medical Diagnosis", assessment.medicalDiagnosis)}
          {renderField("Communication Diagnosis", assessment.communicationDiagnosis)}
          {renderField("Family History", assessment.familyHistory)}
          {renderField("Hearing", assessment.hearing)}
          {renderField("Vision", assessment.vision)}
          {renderField("Siblings", assessment.siblings)}
          {renderField("Motor Development", assessment.motorDevelopment ? "Yes" : "No")}
          {renderField("Speech Regression", assessment.speechRegression ? "Yes" : "No")}
          {renderField("Assessment Date", assessment.assessmentDate)}
          {renderField("Accessed By", assessment.accessBy)}
        </div>

        {renderSection("Prerequisite Skills", assessment.prerequisiteSkills)}
        {renderSection("Communication Skills", assessment.communicationSkills)}
        {renderSection("Language Skills", assessment.languageSkills)}
        {renderSection("Speech Skills", assessment.speechSkills)}
        {renderSection("Oral Motor Assessment", assessment.oralMotorAssessment)}

      </div>
    </div>
  );
};

export default ViewTherapyAssessment;