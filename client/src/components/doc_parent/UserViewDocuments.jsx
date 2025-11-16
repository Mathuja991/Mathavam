import React, { useEffect, useState } from 'react';

const UserViewDocuments = () => {
   const API_URL = import.meta.env.VITE_API_URL;
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [titleFilter, setTitleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest", "title"

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/documents/`)
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        setFilteredDocuments(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
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
    if (!filename) return '📄';
    
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📕';
      case 'doc':
      case 'docx':
        return '📘';
      case 'xls':
      case 'xlsx':
        return '📗';
      case 'ppt':
      case 'pptx':
        return '📙';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📄';
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

  return (
    <div className="max-w-4xl mt-10 mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3 text-center">
        📚 Available Documents
      </h2>

      {/* Filter Section */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">🔍 Find Documents</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Title Filter */}
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

          {/* Date Filter */}
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

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Sort Documents
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="newest">🆕 Newest First</option>
              <option value="oldest">🕐 Oldest First</option>
              <option value="title">🔤 Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Results and Clear Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">
            📊 Showing {filteredDocuments.length} of {documents.length} documents
          </span>
          {(titleFilter || dateFilter) && (
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition font-medium text-sm"
            >
              🗑️ Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg font-medium mb-2">
            {documents.length === 0 
              ? 'No documents available yet.' 
              : 'No documents match your search criteria.'
            }
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
                  <div className="flex-1">
                    <a
                      href={`${API_URL}/documents/${doc._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-semibold text-blue-700 hover:text-blue-900 hover:underline block mb-2"
                    >
                      {doc.metadata?.title || doc.filename}
                    </a>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    
                      
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">📅 Uploaded:</span>
                        <span>{formatDate(doc.uploadDate || doc.createdAt)}</span>
                      </div>
                      
                      {doc.metadata?.title && doc.metadata.title !== doc.filename && (
                        <div className="flex items-center space-x-1 md:col-span-2">
                          <span className="font-medium">🏷️ Title:</span>
                          <span className="text-blue-600">{doc.metadata.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <a
                  href={`${API_URL}/documents/${doc._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm whitespace-nowrap"
                >
                  👁️ View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {documents.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            
           
          </div>
        </div>
      )}
    </div>
  );
};

export default UserViewDocuments;