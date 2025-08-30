import React, { useState } from 'react';

const AdminUploadDocument = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    const res = await fetch('http://localhost:5000/api/documents/upload', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      alert('File uploaded successfully!');
      setTitle('');
      setFile(null);
    } else {
      alert('Upload failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-blue-100  rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        📤 Admin: Upload Document
      </h2>
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
          className="w-full border p-2 rounded-lg bg-gray-50 cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-yellow-700"
        />
        <button
          type="submit"
          className="w-1/2 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default AdminUploadDocument;
