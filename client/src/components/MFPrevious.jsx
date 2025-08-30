import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exportMFEntriesToPDF } from "../utills/exportMFEntriesToPDF";

const MFPrevious = () => {
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [childNoFilter, setChildNoFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Fetch all entries and keep only the latest per childNo
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/mflow`);
        const data = await res.json();

        // Keep only the latest entry per childNo
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
      } else {
        const error = await res.json();
        alert(`Delete failed: ${error.message}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

 const handleEdit = (entry) => {
  navigate(`/editm/${entry.childNo}`, { state: { entry } });
};


  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded shadow">
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
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((entry) => (
                <tr key={entry._id} className="text-center">
                  <td className="p-3 border">{entry.childNo}</td>
                  <td className="p-3 border">{entry.name}</td>
                  <td className="p-3 border">{entry.age}</td>
                  <td className="p-3 border">{entry.gender}</td>
                  <td className="p-3 border">{entry.date}</td>
                  <td className="p-3 border flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PDF Export */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => exportMFEntriesToPDF(entries)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Export PDF
        </button>
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
