import React, { useState, useEffect } from "react";
import ChildInfoInputs from "./ChildInfoInputs"; 
import { Link } from "react-router-dom";
import CarsPrevious from "../components/CarsPrevious";
import { useNavigate } from "react-router-dom";

const AutismRatingForm = () => {
  const navigate = useNavigate();
  const categories = [
    "Relating people", "Imitation", "Emotional Response", "Body use", "Object use",
    "Adaptation to change", "Visual Response", "Listening Response",
    "Taste, smell & touch response", "Fear or Nervousness", "Verbal Communication",
    "Nonverbal Communication", "Activity level", "Consistency of intellectual response",
    "General Impression"
  ];

  const scores = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];

  const [selectedScores, setSelectedScores] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    childNo: "",
    age: "",
    date: new Date().toISOString().split("T")[0],
    gender: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previousEntries, setPreviousEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChildNoChange = async (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, childNo: value }));

    if (value.length < 2) return; // Only search if meaningful input

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/patientRecords`);
      if (!response.ok) throw new Error("Failed to fetch records");
      const data = await response.json();

      const matchedRecord = data.find(record => record.childNo === value);

      if (matchedRecord) {
        setFormData((prev) => ({
          ...prev,
          name: matchedRecord.name || '',
          age: matchedRecord.age || '',
          gender: matchedRecord.gender || '',
          address: matchedRecord.address || '',
          contactNo: matchedRecord.contactNo || '',
          dateOfBirth: matchedRecord.dateOfBirth ? new Date(matchedRecord.dateOfBirth).toISOString().split('T')[0] : '',
        }));
        setErrorMessage('');
      } else {
        setFormData((prev) => ({
          ...prev,
          name: '',
          age: '',
          gender: '',
          address: '',
          contactNo: '',
          dateOfBirth: '',
        }));
        setErrorMessage('Child record not found');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to fetch patient records');
      setFormData((prev) => ({
        ...prev,
        name: '',
        age: '',
        gender: '',
        address: '',
        contactNo: '',
        dateOfBirth: '',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrorMessage("");
  };

  const handleRadioChange = (category, value) => {
    setSelectedScores((prev) => ({
      ...prev,
      [category]: parseFloat(value),
    }));
    setErrorMessage("");
  };

  const totalScore = Object.values(selectedScores).reduce((acc, curr) => acc + curr, 0);
  const allFilled = Object.keys(selectedScores).length === categories.length;
  const allBasicInfoFilled = Object.values(formData).every(
    (field) => typeof field === 'string' ? field.trim() !== '' : field !== undefined && field !== null
  );

  const getSeverity = () => {
    if (!allFilled) return { label: "Pending", color: "bg-gray-400 text-white" };
    if (totalScore >= 15 && totalScore < 30) return { label: "Minimal to no symptoms of ASD", color: "bg-green-500 text-white" };
    if (totalScore >= 30 && totalScore < 37) return { label: "Mild to Moderate symptoms of ASD", color: "bg-yellow-500 text-white" };
    if (totalScore >= 37) return { label: "Severe symptoms of ASD", color: "bg-red-500 text-white" };
  };

  const severity = getSeverity();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allFilled || !allBasicInfoFilled) {
      setErrorMessage("⚠️ Please complete the form before submitting.");
      return;
    }

    const newEntry = { ...formData, scores: selectedScores, severity };
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/carsform/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) throw new Error("Failed to submit");

      const savedEntry = await response.json();
      setPreviousEntries((prev) => [...prev, savedEntry]);
      setIsSubmitted(true);
      
      alert("Form submitted successfully!");
      navigate("/dashboard/forms");

    } catch (err) {
      console.error(err);
      setErrorMessage("🚨 Submission failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (entryIndex) => {
    const entryToEdit = previousEntries[entryIndex];
    setFormData(entryToEdit);
    setSelectedScores(entryToEdit.scores);
    setIsSubmitted(false);
  };

  const progressPercentage = (Object.keys(selectedScores).length / categories.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Childhood Autism Rating Scale (CARS)
          </h1>
          <p className="text-lg text-gray-600 mb-4">Second Edition - Mathavam Centre</p>
          
          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Assessment Progress
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {Object.keys(selectedScores).length}/{categories.length} categories
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Child Information Card */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <ChildInfoInputs
                formData={formData}
                handleChildNoChange={handleChildNoChange}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Assessment Scoring Card */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">CARS Assessment Scoring</h2>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-600 text-center">
                Select the appropriate score for each category (1.0 - 4.0)
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-[500px] overflow-y-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="border border-gray-300 p-3 font-semibold text-gray-700 text-center sticky left-0 bg-gray-100 z-20 min-w-[60px]">
                      #
                    </th>
                    <th className="border border-gray-300 p-3 font-semibold text-gray-700 text-left sticky left-[60px] bg-gray-100 z-20 min-w-[250px]">
                      Category
                    </th>
                    {scores.map((score, idx) => {
                      const colors = [
                        "bg-green-100 border-green-200", 
                        "bg-green-50 border-green-100", 
                        "bg-yellow-50 border-yellow-100",
                        "bg-yellow-100 border-yellow-200", 
                        "bg-orange-100 border-orange-200", 
                        "bg-red-100 border-red-200", 
                        "bg-red-200 border-red-300"
                      ];
                      return (
                        <th 
                          key={idx} 
                          className={`border ${colors[idx]} p-3 font-semibold text-gray-700 text-center min-w-[80px]`}
                        >
                          {score.toFixed(1)}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((item, idx) => (
                    <tr 
                      key={idx} 
                      className={`hover:bg-blue-50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="border border-gray-300 p-3 text-center font-medium text-gray-600 sticky left-0 bg-white z-10">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 p-3 text-gray-700 sticky left-[60px] bg-white z-10 font-medium">
                        {item}
                      </td>
                      {scores.map((score) => (
                        <td key={score} className="border border-gray-300 p-3 text-center">
                          <label className="flex items-center justify-center cursor-pointer group">
                            <input
                              type="radio"
                              name={item}
                              value={score}
                              checked={selectedScores[item] === score}
                              onChange={() => handleRadioChange(item, score)}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Score */}
              <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">{totalScore.toFixed(1)}</div>
                <div className="text-sm text-gray-600 font-medium">Total Score</div>
              </div>

              {/* Severity */}
              <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-white font-semibold ${severity.color} mb-1`}>
                  {severity.label}
                </div>
                <div className="text-sm text-gray-600 font-medium">Severity Level</div>
              </div>

              {/* Completion Status */}
              <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {Object.keys(selectedScores).length}/{categories.length}
                </div>
                <div className="text-sm text-gray-600 font-medium">Categories Completed</div>
              </div>
            </div>
          </div>

          {/* Error Message & Submit Section */}
          <div className="p-6">
            {errorMessage && (
              <div className="flex items-center p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
                <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard/forms")}
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={!(allFilled && allBasicInfoFilled) || isLoading}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  allFilled && allBasicInfoFilled && !isLoading
                    ? "bg-green-600 text-white hover:bg-green-700 active:transform active:scale-95 shadow-lg" 
                    : "bg-green-400 text-white cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Assessment
                  </>
                )}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center mt-6 pt-6 border-t border-gray-200">
              <Link 
                to="/dashboard/forms"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                
                
                Back
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutismRatingForm;