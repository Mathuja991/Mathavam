import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import sections  from './questionsData';
import { exportBctopdf } from "../utills/exportBctopdf";

const BehaviorPrevious = () => {
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [childNoFilter, setChildNoFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
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
        console.error("Error fetching behavior form entries:", err);
      }
    };

    fetchEntries();
  }, []);

  const handleFilter = () => {
    let filteredData = [...entries];

    if (childNoFilter) {
      filteredData = filteredData.filter((entry) =>
        entry.childNo?.toLowerCase().includes(childNoFilter.toLowerCase())
      );
    }

    if (dateFilter) {
      filteredData = filteredData.filter((entry) => entry.date === dateFilter);
    }

    setFiltered(filteredData);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setChildNoFilter("");
    setDateFilter("");
    setFiltered(entries);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bc/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEntries((prev) => prev.filter((entry) => entry._id !== id));
        setFiltered((prev) => prev.filter((entry) => entry._id !== id));
      } else {
        const err = await res.json();
        alert("Delete failed: " + err.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = (entry) => {
    navigate(`/editb/${entry._id}`);
  };

  const codeToLabel = (code) => {
  const map = {
    "1": "Never",
    "2": "Rarely",
    "3": "Sometimes",
    "4": "Often",
    "5": "Always",
    "NA": "Not Applicable"
  };
  return map[code] || code;
    };



const formatAnswer = (value) => {
  if (!value) return "";
  const arr = Array.isArray(value) ? value : value.toString().split("");
  return arr.map(codeToLabel).join(", ");
};


  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Behavior Checklist - Previous Entries</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Child No"
          className="border p-2 rounded"
          value={childNoFilter}
          onChange={(e) => setChildNoFilter(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <div className="flex gap-2">
          <button onClick={handleFilter} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Apply
          </button>
          <button onClick={handleReset} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Reset
          </button>
        </div>
      </div>

      {/* Entry List */}
      {currentItems.map((entry) => (
       <div key={entry._id} className="border p-4 mb-4 rounded bg-gray-50">
         <p><strong>Child No:</strong> {entry.childNo}</p>
  <p><strong>Name:</strong> {entry.name}</p>
  <p><strong>Age:</strong> {entry.age}</p>
  <p><strong>Gender:</strong> {entry.gender}</p>
  <p><strong>Date:</strong> {entry.date}</p>

   {sections.map(({ key, questions }) => (
        <div key={key} className="mb-4">
          <h4 className="text-lg font-semibold mb-2">{key.toUpperCase()}</h4>
          {questions.map((question, idx) => {
            const rawAnswer = entry[key]?.[idx] ?? '';
            const mappedAnswer = codeToLabel(rawAnswer);
            return (
              <div key={idx} className="mb-2">
                <p><strong>Q:</strong> {question}</p>
              
                <p><strong>Mapped Answer:</strong> {mappedAnswer}</p>
                <hr className="my-2"/>
              </div>
            );
          })}  
          </div>
      ))}

          <div className="mt-4">
            <button onClick={() => handleEdit(entry)} className="text-blue-600 mr-4">Edit</button>
            <button onClick={() => handleDelete(entry._id)} className="text-red-600">Delete</button>
          </div>
        </div>
      ))}

       <div className="flex gap-2 mb-4">
       <button onClick={() => exportBctopdf(entries)}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Export PDF</button>
          </div>
      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-4 py-2 font-semibold">
          {currentPage} / {totalPages}
        </span>
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

export default BehaviorPrevious;
