import React, { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";

const ChildProgress = () => {
  const [childNo, setChildNo] = useState("");
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");

  const fetchChildEntries = async () => {
    if (!childNo.trim()) {
      setError("Please enter a Child No");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/carsform/entries");
      const data = await res.json();
      const filtered = data.filter(entry => entry.childNo === childNo.trim());

      if (filtered.length === 0) {
        setError("No records found for this Child No.");
        setEntries([]);
        return;
      }

      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEntries(filtered);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch data.");
    }
  };

  const getTotalScore = (scores) =>
    Object.values(scores || {}).reduce((sum, val) => sum + val, 0);

  const chartData = entries.map(entry => ({
    date: entry.date,
    totalScore: getTotalScore(entry.scores),
  }));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Child Progress Report</h2>

      <div className="mb-6 flex gap-4 items-center">
        <input
          type="text"
          placeholder="Enter Child No"
          value={childNo}
          onChange={(e) => setChildNo(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button
          onClick={fetchChildEntries}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          View
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {entries.length > 0 && (
        <>
          <LineChart width={600} height={300} data={chartData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 60]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalScore" stroke="#8884d8" />
          </LineChart>

          <div className="mt-6 ml-5 text-left">
            <h3 className="text-lg font-semibold mb-2">Severity History</h3>
            <ul className="list-disc list-inside ">
              {entries.map((entry, i) => (
                <li key={i}>
                  {entry.date}: {entry.severity?.label}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ChildProgress;
