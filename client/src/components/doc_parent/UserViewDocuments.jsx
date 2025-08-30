import React, { useEffect, useState } from 'react';

const UserViewDocuments = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/documents')
      .then(res => res.json())
      .then(data => setDocuments(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-3xl mt-10 mx-auto p-6 bg-blue-100  rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        📄 Available Documents
      </h2>

      {documents.length === 0 ? (
        <p className="text-gray-500 text-center">No documents available.</p>
      ) : (
        <ul className="space-y-3">
          {documents.map(doc => (
            <li
              key={doc._id}
              className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <a
                href={`http://localhost:5000/api/documents/${doc._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {doc.metadata?.title || doc.filename}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserViewDocuments;
