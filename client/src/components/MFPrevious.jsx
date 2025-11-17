import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exportSingleMFEntryToPDF } from "../utills/exportMFEntriesToPDF";

const MFPrevious = () => {
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [allEntries, setAllEntries] = useState([]); // Store ALL entries for PDF export
  const [childNoFilter, setChildNoFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Combine all entries for a specific child
  const combineEntriesForChild = (childNo) => {
    const childEntries = allEntries.filter(entry => entry.childNo === childNo);
    
    if (childEntries.length === 0) return null;
    
    // Use the latest entry as base
    const latestEntry = childEntries.reduce((latest, current) => 
      new Date(current.date) > new Date(latest.date) ? current : latest
    );
    
    // Combine all sections from all entries
    const combinedSections = new Map();
    
    childEntries.forEach(entry => {
      if (entry.sections && Array.isArray(entry.sections)) {
        entry.sections.forEach(section => {
          if (section.name) {
            if (combinedSections.has(section.name)) {
              // Merge dates for existing section
              const existingSection = combinedSections.get(section.name);
              const allDates = [...existingSection.dates, ...(section.dates || [])];
              // Remove duplicates and empty values
              const uniqueDates = [...new Set(allDates.filter(date => 
                date && date.toString().trim() !== ''
              ))];
              combinedSections.set(section.name, {
                ...existingSection,
                dates: uniqueDates
              });
            } else {
              // Add new section
              combinedSections.set(section.name, {
                ...section,
                dates: (section.dates || []).filter(date => 
                  date && date.toString().trim() !== ''
                )
              });
            }
          }
        });
      }
    });
    
    return {
      ...latestEntry,
      allSections: Array.from(combinedSections.values()),
      entryCount: childEntries.length,
      entryDates: childEntries.map(entry => entry.date),
      entryIds: childEntries.map(entry => entry._id)
    };
  };

  const handleExportSingle = (entry) => {
    // Combine ALL entries for this child before exporting
    const combinedEntry = combineEntriesForChild(entry.childNo);
    if (combinedEntry) {
      console.log(`Exporting combined data for child ${entry.childNo}:`, {
        entryCount: combinedEntry.entryCount,
        sectionCount: combinedEntry.allSections.length,
        totalSessions: combinedEntry.allSections.reduce((total, section) => 
          total + (section.dates ? section.dates.length : 0), 0
        )
      });
      exportSingleMFEntryToPDF(combinedEntry);
    } else {
      alert("No data found for this child.");
    }
  };

  // Fetch all entries
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/mflow`);
        const data = await res.json();

        // Store ALL entries for PDF export
        setAllEntries(data);

        // Keep only the latest entry per childNo for table display
        const uniqueEntriesMap = new Map();

        data.forEach((entry) => {
          if (!uniqueEntriesMap.has(entry.childNo)) {
            uniqueEntriesMap.set(entry.childNo, entry);
          } else {
            // Compare dates, keep the latest
            const existing = uniqueEntriesMap.get(entry.childNo);
            if (new Date(entry.date) > new Date(existing.date)) {
              uniqueEntriesMap.set(entry.childNo, entry);
            }
          }
        });

        const uniqueEntries = Array.from(uniqueEntriesMap.values());

        setEntries(uniqueEntries);
        setFiltered(uniqueEntries);
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
    }

    setFiltered(results);
    setCurrentPage(1);
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
      const res = await fetch(`http://localhost:5000/api/mflow/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEntries(prev => prev.filter(e => e._id !== id));
        setFiltered(prev => prev.filter(e => e._id !== id));
        // Also update allEntries to keep them in sync
        setAllEntries(prev => prev.filter(e => e._id !== id));
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

    navigate(`/dashboard/editm/${entry.childNo}`, { state: { entry } });
  };

  const handleBack = () => {
    navigate(`/dashboard/forms`);
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded shadow">
     
        <button
          onClick={handleBack}
          className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      <h2 className="text-2xl font-bold mb-6">Previous Mathavam Flowchart Entries</h2>

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
        </select>
        <div className="flex gap-2">
          <button
            onClick={applyFiltersAndSort}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Apply
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 w-full"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border">Child No</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Age</th>
              <th className="p-3 border">Gender</th>
              <th className="p-3 border">Entries</th>
              <th className="p-3 border">Last Updated</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((entry) => {
                // Count how many entries this child has
                const entryCount = allEntries.filter(e => e.childNo === entry.childNo).length;
                
                return (
                  <tr key={entry._id} className="text-center">
                    <td className="p-3 border">{entry.childNo}</td>
                    <td className="p-3 border">{entry.name}</td>
                    <td className="p-3 border">{entry.age}</td>
                    <td className="p-3 border">{entry.gender}</td>
                    <td className="p-3 border">
                      {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                    </td>
                    <td className="p-3 border">{entry.date}</td>
                    <td className="p-3 border flex justify-center gap-2">
                      <button 
                        className="text-blue-600 hover:underline" 
                        onClick={() => handleEdit(entry)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-green-600 hover:underline" 
                        onClick={() => handleExportSingle(entry)}
                      >
                        Export All
                      </button>
                      <button
                        onClick={() => handleDelete(entry._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

export default MFPrevious;