import React, { useEffect, useState } from "react";
import {exportSingleEntryToPDF } from "../utills/exportUtillsfoecar"; 
import "jspdf-autotable";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

const CarsPrevious = () => {
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [childNoFilter, setChildNoFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const navigate = useNavigate();
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/carsform/entries");
        const data = await res.json();
        setEntries(data);
        setFiltered(data);
      } catch (err) {
        console.error("Failed to fetch entries:", err);
      }
    };

    fetchEntries();
  }, []);

  const applyFiltersAndSort = () => {
    let results = [...entries];

    if (childNoFilter) {
      results = results.filter(entry =>
        entry.childNo.toLowerCase().includes(childNoFilter.toLowerCase())
      );
    }

    if (dateFilter) {
      results = results.filter(entry => entry.date === dateFilter);
    }

    if (sortBy === "date-desc") {
      results.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "date-asc") {
      results.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "score-desc") {
      results.sort((a, b) => getTotalScore(b.scores) - getTotalScore(a.scores));
    } else if (sortBy === "score-asc") {
      results.sort((a, b) => getTotalScore(a.scores) - getTotalScore(b.scores));
    }

    setFiltered(results);
    setCurrentPage(1); // Reset to first page
  };

  const getTotalScore = (scoresObj) => {
    return Object.values(scoresObj || {}).reduce((acc, val) => acc + val, 0);
  };

  const handleReset = () => {
    setChildNoFilter("");
    setDateFilter("");
    setSortBy("date-desc");
    setFiltered(entries);
    setCurrentPage(1);
  };

  const handleBack = () => {
    navigate(`/dashboard/forms`);
  };

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleDelete = async (id) => {
    if (!confirm("Delete this entry?")) return;
    console.log("Deleting entry with ID:", id);

    try {
      const res = await fetch(`http://localhost:5000/api/carsform/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e._id !== id));
        setFiltered((prev) => prev.filter((e) => e._id !== id));
      } else {
        const error = await res.json();
        alert(`Delete failed: ${error.message}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = (entry) => {
    console.log("Edit entry:", entry);
    
    // Use createdAt timestamp if available, otherwise use date
    const entryTime = entry.createdAt ? new Date(entry.createdAt) : new Date(entry.date);
    const currentTime = new Date();
    const timeDifference = currentTime - entryTime;
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference > 5) {
      alert("Edit not available. Entries can only be edited within 5 hours of creation.");
      return;
    }

    console.log("Navigating to:", `editcar/${entry._id}`);
    navigate(`/dashboard/editcar/${entry._id}`);
  };

  // Function to export single entry
  const handleExportSingle = (entry) => {
    exportSingleEntryToPDF(entry);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded shadow">
      {/* Header with Back Button and Title */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <h2 className="text-2xl font-bold text-center flex-1">Previous CARS Entries</h2>
        <div className="w-24"></div> {/* Spacer for balance */}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Child No"
          value={childNoFilter}
          onChange={(e) => setChildNoFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="date-desc">Sort by Date (Newest)</option>
          <option value="date-asc">Sort by Date (Oldest)</option>
          <option value="score-desc">Sort by Score (High → Low)</option>
          <option value="score-asc">Sort by Score (Low → High)</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 w-full"
          >
            Reset
          </button>
          <button
            onClick={applyFiltersAndSort}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Entry List */}
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Child No</th>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Age</th>
            <th className="border border-gray-300 px-4 py-2">Gender</th>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Severity</th>
            <th className="border border-gray-300 px-4 py-2">Total Score</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((entry) => (
            <tr key={entry._id} className="text-center">
              <td className="border border-gray-300 px-4 py-2">{entry.childNo}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.name}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.age}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.gender}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.date}</td>
              <td className="border border-gray-300 px-4 py-2">
                <span className={`inline-block px-3 py-1 rounded-full ${entry.severity?.color}`}>
                  {entry.severity?.label || "N/A"}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-2">{getTotalScore(entry.scores).toFixed(1)}</td>
              <td className="border border-gray-300 px-4 py-2 space-x-2">
                <button 
                  className="text-blue-600 hover:underline" 
                  onClick={() => handleEdit(entry)}
                >
                  Edit
                </button>
              
                <button 
                  className="text-red-600 hover:underline" 
                  onClick={() => handleDelete(entry._id)}
                >
                  Delete
                </button>
                  <button 
                  className="text-green-600 hover:underline" 
                  onClick={() => handleExportSingle(entry)}
                >
                  Export
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    

      {/* Pagination Controls */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-4 py-2 font-semibold">{currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CarsPrevious;