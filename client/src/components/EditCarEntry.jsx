// src/pages/EditCarEntry.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const CATEGORIES = [
  "Relating people",
  "Imitation",
  "Emotional Response",
  "Body use",
  "Object use",
  "Adaptation to change",
  "Visual Response",
  "Listening Response",
  "Taste, smell & touch response",
  "Fear or Nervousness",
  "Verbal Communication",
  "Nonverbal Communication",
  "Activity level",
  "Consistency of intellectual response",
  "General Impression",
];

const SCORES = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
const API_URL = import.meta.env.VITE_API_URL;
const EditCarEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    date: new Date().toISOString().split('T')[0],
  });

  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await fetch(`${API_URL}/carsform/entries/${id}`);
        const data = await res.json();

        setEntry(data);
        setForm({
          name: data.name || "",
          age: data.age || "",
          gender: data.gender || "",
          date: data.date || new Date().toISOString().split('T')[0],
        });
        setScores(data.scores || {});
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch entry:", err);
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  const handleScoreChange = (category, value) => {
    setScores((prev) => ({ ...prev, [category]: parseFloat(value) }));

    setForm((prev) => ({
      ...prev,
      date: new Date().toISOString().split('T')[0],
    }));

    setErrorMessage("");
  };

  const totalScore = Object.values(scores).reduce((acc, curr) => acc + curr, 0);
  const allFilled = Object.keys(scores).length === CATEGORIES.length;

  const getSeverity = () => {
    if (!allFilled) return { label: "Pending", color: "bg-gray-400 text-white" };
    if (totalScore >= 15 && totalScore < 30) return { label: "Minimal to no symptoms of ASD", color: "bg-green-500 text-white" };
    if (totalScore >= 30 && totalScore < 37) return { label: "Mild to Moderate symptoms of ASD", color: "bg-yellow-500 text-white" };
    if (totalScore >= 37) return { label: "Severe symptoms of ASD", color: "bg-red-500 text-white" };
  };

  const severity = getSeverity();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allFilled || !form.date) {
      setErrorMessage("⚠️ Please complete the date and all scores before submitting.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/carsform/entries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, date: form.date, scores }),
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Entry updated successfully!");
      navigate("/dashboard/forms/carsform-previous-entries");
    } catch (err) {
      console.error("Update error:", err);
      setErrorMessage("🚨 Failed to update entry.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading entry data...</p>
      </div>
    </div>
  );
  
  if (!entry) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Entry Not Found</h2>
        <p className="text-gray-600 mb-4">The requested entry could not be loaded.</p>
        <button
          onClick={() => navigate("/dashboard/carsformprevious-entries")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Entries
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/dashboard/carsformprevious-entries")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Entries
            </button>
            <h1 className="text-3xl font-bold text-gray-900 text-center">Edit CARS Assessment</h1>
            <div className="w-20"></div>
          </div>
          
          {/* Progress Indicator */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${allFilled ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {allFilled ? 'All categories scored' : `${Object.keys(scores).length}/${CATEGORIES.length} categories scored`}
                  </span>
                </div>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="text-sm text-gray-600">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
              <div className="text-lg font-semibold text-blue-600">
                Score: {totalScore.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-8 p-6">
            {/* Patient Information Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Patient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={entry.name}
                    disabled
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="text"
                    value={entry.age}
                    disabled
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <input
                    type="text"
                    value={entry.gender}
                    disabled
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Date</label>
                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    readOnly
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Scoring Section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  CARS Assessment Scoring
                </h3>
                <p className="text-sm text-gray-600 mt-1">Select the appropriate score for each category (1.0 - 4.0)</p>
              </div>

              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100 z-20 min-w-[60px]">
                        #
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 sticky left-[60px] bg-gray-100 z-20 min-w-[300px]">
                        Category
                      </th>
                      {SCORES.map((score, idx) => {
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
                            className={`border ${colors[idx]} px-4 py-3 text-center font-semibold text-gray-700 min-w-[80px]`}
                          >
                            {score.toFixed(1)}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORIES.map((category, idx) => (
                      <tr 
                        key={idx} 
                        className={`hover:bg-blue-50 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-600 sticky left-0 bg-white z-10">
                          {idx + 1}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700 sticky left-[60px] bg-white z-10 font-medium">
                          {category}
                        </td>
                        {SCORES.map((score) => (
                          <td key={score} className="border border-gray-300 px-4 py-3 text-center">
                            <label className="flex items-center justify-center cursor-pointer">
                              <input
                                type="radio"
                                name={category}
                                value={score}
                                checked={scores[category] === score}
                                onChange={() => handleScoreChange(category, score)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
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

            {/* Results Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{totalScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 font-medium">Total Score</div>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-white font-semibold ${severity.color} mb-2`}>
                    {severity.label}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Severity Level</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Object.keys(scores).length}/{CATEGORIES.length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Categories Completed</div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/dashboard/carsformprevious-entries")}
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                disabled={!(allFilled && form.date)}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  allFilled && form.date 
                    ? "bg-green-600 text-white hover:bg-green-700 active:transform active:scale-95" 
                    : "bg-green-400 text-white cursor-not-allowed"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCarEntry;