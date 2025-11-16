import React, { useState, useEffect } from "react";

const AdminUploadDocument = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(null); // "upload" | "manage" | null
  const API_URL = import.meta.env.VITE_API_URL;
  // Filter states
  const [titleFilter, setTitleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest", "title"

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
        setFilteredDocuments(data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    if (view === "manage") fetchDocuments();
  }, [view]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [titleFilter, dateFilter, sortBy, documents]);

  const applyFilters = () => {
    let filtered = [...documents];

    // Filter by title
    if (titleFilter) {
      filtered = filtered.filter(doc => 
        doc.filename?.toLowerCase().includes(titleFilter.toLowerCase()) ||
        doc.metadata?.title?.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(doc => {
        const uploadDate = new Date(doc.uploadDate || doc.createdAt);
        return uploadDate.toDateString() === filterDate.toDateString();
      });
    }

    // Apply sorting
    filtered = sortDocuments(filtered);

    setFilteredDocuments(filtered);
  };

  const sortDocuments = (docs) => {
    const sorted = [...docs];
    
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => new Date(b.uploadDate || b.createdAt) - new Date(a.uploadDate || a.createdAt));
      case "oldest":
        return sorted.sort((a, b) => new Date(a.uploadDate || a.createdAt) - new Date(b.uploadDate || b.createdAt));
      case "title":
        return sorted.sort((a, b) => {
          const titleA = a.metadata?.title || a.filename || '';
          const titleB = b.metadata?.title || b.filename || '';
          return titleA.localeCompare(titleB);
        });
      default:
        return sorted;
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("File uploaded successfully!");
        setTitle("");
        setFile(null);
        fetchDocuments();
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed.");
    }
    setLoading(false);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    
    try {
      const res = await fetch(`${API_URL}/documents/${fileId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        alert("File deleted!");
        setDocuments(documents.filter((doc) => doc._id !== fileId));
      } else {
        const errorData = await res.json();
        alert(`Delete failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed.");
    }
  };

  const clearFilters = () => {
    setTitleFilter("");
    setDateFilter("");
    setSortBy("newest");
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <h2 className="text-3xl font-bold text-blue-700 mb-10">
        📂 Document Management Panel
      </h2>

      {/* When no view is selected */}
      {!view && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Card */}
          <div className="bg-white shadow-lg rounded-2xl p-6 w-80 text-center border border-blue-200 hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-blue-800 mb-4 border-b pb-2">
              Upload Documents
            </h3>
            <button
              onClick={() => setView("upload")}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition"
            >
              Add New
            </button>
          </div>

          {/* Manage Card */}
          <div className="bg-white shadow-lg rounded-2xl p-6 w-80 text-center border border-blue-200 hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-blue-800 mb-4 border-b pb-2">
              Manage Documents
            </h3>
            <button
              onClick={() => setView("manage")}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition"
            >
              View Uploaded
            </button>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {view === "upload" && (
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg mt-8 border border-blue-200">
          <h3 className="text-2xl font-bold mb-4 text-blue-800 border-b pb-2">
            Upload New Document
          </h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <input
              type="text"
              placeholder="Document Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="w-full border p-2 rounded-lg bg-gray-50 cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setView(null)}
                className="bg-gray-400 text-white py-2 px-5 rounded-lg hover:bg-gray-500 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white py-2 px-5 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manage Section */}
      {view === "manage" && (
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl mt-8 border border-blue-200">
          <h3 className="text-2xl font-bold mb-6 text-blue-800 border-b pb-2">
            Uploaded Documents
          </h3>

          {/* Filter Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Filter & Sort Documents</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              {/* Title Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Filter by Title/Filename
                </label>
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Filter by Date
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>

            {/* Results and Clear Filters */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Showing {filteredDocuments.length} of {documents.length} documents
              </span>
              <button
                onClick={clearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Documents List */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                {documents.length === 0 ? 'No documents available.' : 'No documents match your filters.'}
              </p>
              {(titleFilter || dateFilter) && documents.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filters to see all documents
                </button>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredDocuments.map(doc => (
                <li
                  key={doc._id}
                  className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <a
                        href={`http://localhost:5000/api/documents/${doc._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium block mb-1"
                      >
                        {doc.metadata?.title || doc.filename || `Document ${doc._id}`}
                      </a>
                      <div className="text-sm text-gray-600 space-y-1">
                       
                        <p>Uploaded: {formatDate(doc.uploadDate || doc.uploadDate || doc.createdAt)}</p>
                        {doc.metadata?.title && doc.metadata.title !== doc.filename && (
                          <p>Title: {doc.metadata.title}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition ml-4 flex-shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          <button
            onClick={() => setView(null)}
            className="bg-gray-400 text-white py-2 px-5 rounded-lg hover:bg-gray-500 mb-4 mt-6 transition"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUploadDocument;