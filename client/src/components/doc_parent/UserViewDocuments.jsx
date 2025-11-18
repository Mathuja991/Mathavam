import React, { useEffect, useState } from 'react';

// Helper function to set the Authorization header
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Auth token not found in localStorage. Cannot fetch documents.');
    return { headers: {} };
  }
  return {
    headers: {
      'x-auth-token': token,
    },
  };
};

const UserViewDocuments = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [titleFilter, setTitleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    setLoading(true);
    setFetchError(null);

    const config = getAuthConfig();

    fetch('http://localhost:5000/api/documents', config)
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Unauthorized: Please log in again.");
          }
          return res.json().then(error => { 
            throw new Error(error.error || `Server Error: ${res.status}`); 
          });
        }
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          console.error("API response is not an array:", data);
          setFetchError("Received unexpected data from the server. Try logging in again.");
          setDocuments([]);
          setFilteredDocuments([]);
        } else {
          setDocuments(data);
          setFilteredDocuments(data);
        }
      })
      .catch(err => {
        console.error("Error fetching documents:", err.message);
        setFetchError(err.message || "Failed to connect to the server.");
        setDocuments([]);
        setFilteredDocuments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    applyFilters();
  }, [titleFilter, dateFilter, sortBy, documents]);

  const applyFilters = () => {
    if (!Array.isArray(documents)) return;

    let filtered = [...documents];

    if (titleFilter) {
      filtered = filtered.filter(doc => 
        doc.filename?.toLowerCase().includes(titleFilter.toLowerCase()) ||
        doc.metadata?.title?.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(doc => {
        const uploadDate = new Date(doc.uploadDate || doc.createdAt);
        return uploadDate.toDateString() === filterDate.toDateString();
      });
    }

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
      day: 'numeric'
    });
  };

  const getFileIcon = (filename) => {
    if (!filename) return '';

    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '';
      case 'doc':
      case 'docx':
        return '';
      case 'xls':
      case 'xlsx':
        return '';
      case 'ppt':
      case 'pptx':
        return '';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '';
      case 'zip':
      case 'rar':
        return '';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mt-10 mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  const handleDownload = async (docId, filename) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/documents/${docId}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!res.ok) {
        alert("Download/View failed: Unauthorized or server error.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `Document_${docId}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Download/View failed");
    }
  };

  if (fetchError) {
    return (
      <div className="max-w-4xl mt-10 mx-auto p-6 bg-red-50 rounded-xl shadow-lg border border-red-300">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Resources</h2>
        <p className="text-red-600">{fetchError}</p>
        <p className="mt-4 text-sm text-red-500">
          If this is an "Unauthorized" error, please log out and log back in to refresh your session token.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mt-10 mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3 text-center">
        Available Documents
      </h2>

      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Find Documents</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Search by Title
            </label>
            <input
              type="text"
              placeholder="Type to search documents..."
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Filter by Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Sort Documents
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">
            Showing {Array.isArray(filteredDocuments) ? filteredDocuments.length : 0} of {Array.isArray(documents) ? documents.length : 0} documents
          </span>

          {(titleFilter || dateFilter) && (
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition font-medium text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {Array.isArray(filteredDocuments) && filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg font-medium mb-2">
            {documents.length === 0 
              ? 'No documents available yet.' 
              : 'No documents match your search criteria.'}
          </p>

          {documents.length > 0 && (titleFilter || dateFilter) && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 font-medium underline mt-2"
            >
              Show all documents
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map(doc => (
            <div
              key={doc._id}
              className="p-5 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-3xl mt-1">
                    {getFileIcon(doc.filename)}
                  </div>

                  <div className="flex-1 flex flex-col">
                    <span
                      onClick={() => handleDownload(doc._id, doc.filename)}
                      className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                    >
                      {doc.metadata?.title || doc.filename || `Document ${doc._id}`}
                    </span>

                    <div className="text-sm text-gray-600">
                      <p>Uploaded: {formatDate(doc.uploadDate || doc.createdAt)}</p>
                      {doc.metadata?.title && doc.metadata.title !== doc.filename && (
                        <p>Title: {doc.metadata.title}</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(doc._id, doc.filename)}
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm whitespace-nowrap"
                >
                  Download
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserViewDocuments;
