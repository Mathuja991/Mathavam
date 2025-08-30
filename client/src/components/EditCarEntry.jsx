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

const EditCarEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    date: new Date().toISOString().split('T')[0], // Default today's date
  });

  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/carsform/entries/${id}`);
        const data = await res.json();

        setEntry(data);
        setForm({
          name: data.name || "",
          age: data.age || "",
          gender: data.gender || "",
          date: data.date || new Date().toISOString().split('T')[0], // Load saved date
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

    // Automatically update date to today's date when a score is changed
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
    if (totalScore >= 30 && totalScore < 37) return { label: "Mild to Moderate symptoms of ASD", color: "bg-yellow-400 text-black" };
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
      const res = await fetch(`http://localhost:5000/api/carsform/entries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, date: form.date, scores }),
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Entry updated successfully!");
      navigate("/carsformprevious-entries");
    } catch (err) {
      console.error("Update error:", err);
      setErrorMessage("🚨 Failed to update entry.");
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!entry) return <div className="p-4 text-center">Entry not found.</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-xl space-y-6 ">
      <h2 className="text-2xl font-bold text-center">Edit Autism Rating Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Child Info - Read Only */}
        <div className="bg-blue-50 p-6 rounded-xl shadow-sm space-y-6 ">
          <div>
            <label className="font-semibold text-gray-700 whitespace-nowrap w-24 mr-5 text-right" >Name</label>
            <input
              type="text"
              value={entry.name}
              disabled
              className="border p-2 rounded w-48"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 whitespace-nowrap w-24 mr-5 text-right">Age</label>
            <input
              type="text"
              value={entry.age}
              disabled
              className="border p-2 rounded w-48"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 whitespace-nowrap w-24 mr-5 text-right">Gender</label>
            <input
              type="text"
              value={entry.gender}
              disabled
              className="border p-2 rounded w-48"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 whitespace-nowrap w-24 mr-5 text-right">Date</label>
            <input
              name="date"
              type="date"
              value={form.date}
              className="w-48 border p-2 rounded"
              readOnly // Optional: can be removed if you want manual editing
            />
          </div>
        </div>

        {/* Scores Table */}
        <div className="overflow-x-auto rounded-2xl max-h-[400px] overflow-y-auto">
          <table className="min-w-full border-separate border-spacing-1">
            <thead className="bg-gray-100 sticky top-0 z-20">
              <tr>
                <th rowSpan="2" className="border p-3 sticky left-0 bg-gray-100 z-30">#</th>
                <th rowSpan="2" className="border p-3 sticky left-[50px] bg-gray-100 z-30">Category</th>
                <th colSpan="7" className="border p-3 text-center">Score</th>
              </tr>
              <tr>
                {SCORES.map((score, idx) => {
                  const colors = [
                    "bg-green-300", "bg-green-200", "bg-yellow-100",
                    "bg-yellow-200", "bg-orange-200", "bg-red-200", "bg-red-400"
                  ];
                  return (
                    <th key={idx} className={`border p-3 ${colors[idx]}`}>{score.toFixed(1)}</th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((category, idx) => (
                <tr key={idx} className="hover:bg-blue-50">
                  <td className="border p-3 text-center sticky left-0 bg-white z-10">{idx + 1}</td>
                  <td className="border p-3 sticky left-[50px] bg-white z-10">{category}</td>
                  {SCORES.map((score) => (
                    <td key={score} className="border p-3 text-center">
                      <input
                        type="radio"
                        name={category}
                        value={score}
                        checked={scores[category] === score}
                        onChange={() => handleScoreChange(category, score)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Score and Severity */}
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg shadow-inner">
            Total Score: <span className="text-blue-600">{totalScore.toFixed(1)}</span>
          </div>
          <div className="flex items-center space-x-3">
            <p className="font-semibold text-gray-700">Severity:</p>
            <span className={`text-base font-medium px-4 py-2 rounded-full ${severity.color} shadow`}>{severity.label}</span>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-center p-4 mt-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            {errorMessage}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/carsformprevious-entries")}
            className="w-1/3 py-3 rounded-xl font-semibold bg-gray-300 hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`w-1/3 py-3 rounded-xl font-semibold transition-all ${allFilled && form.date ? "bg-green-600 text-white hover:bg-green-700 active:scale-95" : "bg-green-400 text-white cursor-not-allowed"}`}
            disabled={!(allFilled && form.date)}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCarEntry;
