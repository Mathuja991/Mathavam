import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ConfirmationModal = ({ show, onClose, onConfirm, message }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {message.title}
        </h3>
        <p className="text-gray-700 mb-6">{message.body}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            {message.cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-red-600 hover:bg-red-700 text-white shadow-md"
          >
            {message.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const SubmittedFormsList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [formToDeleteId, setFormToDeleteId] = useState(null);  
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dsm5forms");
      setForms(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setError("Failed to load forms. Please try again later.");
      toast.error("Failed to load forms. Please try again later.");
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setFormToDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false); 
    if (formToDeleteId) {
      try {
        await axios.delete(`http://localhost:5000/api/dsm5forms/${formToDeleteId}`);
        toast.success("Form deleted successfully!");
        fetchForms(); 
      } catch (err) {
        console.error("Error deleting form:", err);
        toast.error("Failed to delete form. Check console for error.");
      } finally {
        setFormToDeleteId(null); 
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setFormToDeleteId(null);
  };

  const handleView = (id) => {
    navigate(`/dashboard/view-dsm5-form/${id}`);
  };

  if (loading) {
    return <div className="text-center p-8">Loading forms...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-full border border-indigo-300 space-y-6">
        <h1 className="text-3xl font-bold text-indigo-700 text-center mb-6">
          Submitted DSM-5 Forms
        </h1>

        {forms.length === 0 ? (
          <p className="text-center text-gray-600">No forms submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto border-collapse">
              <thead>
                <tr className="bg-indigo-100 text-indigo-800">
                  <th className="px-4 py-2">Serial No.</th>
                  <th className="px-4 py-2">Patient ID</th>
                  <th className="px-4 py-2">Patient Name</th>
                  <th className="px-4 py-2">Submitted Date</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form, index) => (
                  <tr key={form._id} className="text-gray-700">
                    <td className="px-4 py-3 border-b border-gray-200">{index + 1}</td>
                    <td className="px-4 py-3 border-b border-gray-200">{form.patientInfo.id}</td>
                    <td className="px-4 py-3 border-b border-gray-200">{form.patientInfo.name}</td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      {new Date(form.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 flex gap-2">
                      <button
                        onClick={() => handleView(form._id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteClick(form._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <ConfirmationModal
        show={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        message={{
          title: "Confirm Deletion",
          body: "Are you sure you want to delete this form? This action cannot be undone.",
          cancelText: "Cancel",
          confirmText: "Delete",
        }}
      />
    </div>
  );
};

export default SubmittedFormsList;