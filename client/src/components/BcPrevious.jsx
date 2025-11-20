import React, { useEffect, useState } from "react";
import {exportSingleEntryToPDF  } from "../utills/exportBctopdf";
import { useNavigate } from "react-router-dom";

const BCPrevious = () => {
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [childNoFilter, setChildNoFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/bc/`);
        const data = await res.json();
        setEntries(data);
        setFiltered(data);
      } catch (err) {
        console.error("Failed to fetch entries:", err);
      }
    };

    fetchEntries();
  }, []);

  // Format time from createdAt or current time
  const formatTime = (entry) => {
    try {
      if (entry.createdAt) {
        return new Date(entry.createdAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      // If no createdAt, use a default or current time
      return new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return "N/A";
    }
  };

  // Format date with time for display
  const formatDateTime = (entry) => {
    try {
      const date = entry.date ? new Date(entry.date) : new Date();
      return {
        date: entry.date,
        time: formatTime(entry),
        fullDateTime: `${entry.date} ${formatTime(entry)}`
      };
    } catch (err) {
      return {
        date: "N/A",
        time: "N/A",
        fullDateTime: "N/A"
      };
    }
  };

  // Check if entry is editable (within 5 hours)
 

  // Calculate section scores
  const calculateSectionScore = (entry, sectionKey) => {
    try {
      if (!entry || !entry[sectionKey]) return 0;
      return entry[sectionKey].reduce((sum, score) => {
        if (score !== 'NA' && score !== '' && !isNaN(parseInt(score))) {
          return sum + parseInt(score);
        }
        return sum;
      }, 0);
    } catch (err) {
      console.error('Error calculating section score:', err);
      return 0;
    }
  };

  // Calculate total score
  const calculateTotalScore = (entry) => {
    try {
      if (!entry) return 0;
      const sections = ['social', 'restrictive', 'mood', 'selfRegulation', 'challenging', 'selfInjury'];
      return sections.reduce((total, section) => total + calculateSectionScore(entry, section), 0);
    } catch (err) {
      console.error('Error calculating total score:', err);
      return 0;
    }
  };

  const applyFiltersAndSort = () => {
    try {
      let results = [...entries];

      if (childNoFilter) {
        results = results.filter(entry =>
          entry && entry.childNo && entry.childNo.toLowerCase().includes(childNoFilter.toLowerCase())
        );
      }

      if (dateFilter) {
        results = results.filter(entry => entry && entry.date === dateFilter);
      }

      if (sortBy === "date-desc") {
        results.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.date);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.date);
          return dateB - dateA;
        });
      } else if (sortBy === "date-asc") {
        results.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.date);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.date);
          return dateA - dateB;
        });
      } else if (sortBy === "score-desc") {
        results.sort((a, b) => calculateTotalScore(b) - calculateTotalScore(a));
      } else if (sortBy === "score-asc") {
        results.sort((a, b) => calculateTotalScore(a) - calculateTotalScore(b));
      }

      setFiltered(results);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error applying filters:', err);
    }
  };

  const handleReset = () => {
    setChildNoFilter("");
    setDateFilter("");
    setSortBy("date-desc");
    setFiltered(entries);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bc/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEntries(prev => prev.filter(e => e && e._id !== id));
        setFiltered(prev => prev.filter(e => e && e._id !== id));
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
    
    navigate(`/dashboard/editb/${entry._id}`);
  };

  const handleBack = () => {
    navigate(`/dashboard/forms`);
  };

   const handleExportSingle = (entry) => {
    exportSingleEntryToPDF(entry);
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Previous BC Entries</h1>
          <p className="text-lg text-gray-600">Behavior Checklist Assessment Records</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search by Child No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Child No
              </label>
              <input
                type="text"
                placeholder="Enter child number..."
                value={childNoFilter}
                onChange={(e) => setChildNoFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date-desc">Date & Time (Newest)</option>
                <option value="date-asc">Date & Time (Oldest)</option>
                <option value="score-desc">Total Score (High to Low)</option>
                <option value="score-asc">Total Score (Low to High)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 items-end">
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors font-medium"
              >
                Reset
              </button>
              <button
                onClick={applyFiltersAndSort}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Child No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Age
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Social
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Restrictive
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Mood
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Self-Reg
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Challenging
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Self-Injury
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((entry) => {
                  if (!entry) return null;
                  
                  const socialScore = calculateSectionScore(entry, 'social');
                  const restrictiveScore = calculateSectionScore(entry, 'restrictive');
                  const moodScore = calculateSectionScore(entry, 'mood');
                  const selfRegulationScore = calculateSectionScore(entry, 'selfRegulation');
                  const challengingScore = calculateSectionScore(entry, 'challenging');
                  const selfInjuryScore = calculateSectionScore(entry, 'selfInjury');
                  const totalScore = calculateTotalScore(entry);
                  const dateTime = formatDateTime(entry);
                  
                  return (
                    <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {entry.childNo || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {entry.name || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {entry.age || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {dateTime.date}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                        {dateTime.time}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200 text-center">
                        {socialScore}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200 text-center">
                        {restrictiveScore}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200 text-center">
                        {moodScore}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200 text-center">
                        {selfRegulationScore}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200 text-center">
                        {challengingScore}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200 text-center">
                        {selfInjuryScore}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 text-center">
                        {totalScore}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                           <button className="text-blue-600 mr-2 hover:underline" onClick={() => handleEdit(entry)}>Edit</button>
                          {/* <button
                            onClick={() => handleDelete(entry._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button> */}
                           <button
                              className="text-green-600 hover:text-green-900 hover:underline"
                              onClick={() => handleExportSingle(entry)}
                            >
                              Export
                            </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* No Data State */}
          {currentItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No entries found</div>
              <div className="text-gray-400 text-sm mt-2">Try adjusting your search filters</div>
            </div>
          )}
        </div>

       

        {/* Pagination Controls */}
        {filtered.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BCPrevious;