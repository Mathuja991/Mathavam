// src/components/SubmittedSnapFormsList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom Confirmation Modal Component
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

const SubmittedSnapFormsList = () => {
  const [previousForms, setPreviousForms] = useState([]);
  const [isTranslated, setIsTranslated] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formToDeleteId, setFormToDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetchPreviousForms = async () => {
    try {
      const formsRes = await axios.get(`${import.meta.env.VITE_API_URL}/snapforms`);
      const sortedForms = formsRes.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPreviousForms(sortedForms);
    } 
    catch (err) {
      toast.error(isTranslated ? "Failed to load previous forms. Please try again." : "முந்தைய படிவங்களைப் பதிவிறக்கத் தவறிவிட்டது. மீண்டும் முயற்சிக்கவும்.");
    }
  };

  useEffect(() => {
    fetchPreviousForms();
  }, [isTranslated]); // Dependency on isTranslated to re-fetch if translation changes

  const toggleTranslation = () => {
    setIsTranslated(!isTranslated);
  };

  const handleViewDetails = (formId) => {
    navigate(`/dashboard/SnapForm/${formId}`);
  };

  // Function to show the custom delete confirmation modal
  const handleDeleteClick = (formId) => {
    setFormToDeleteId(formId);
    setShowDeleteModal(true);
  };

  // Function to handle the actual deletion after confirmation
  const handleConfirmDelete = async () => {
    setShowDeleteModal(false); // Close the modal
    if (formToDeleteId) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/snapforms/${formToDeleteId}`);
        toast.success(isTranslated ? "Form deleted successfully!" : "படிவம் வெற்றிகரமாக நீக்கப்பட்டது!");
        fetchPreviousForms(); // Refresh the list
      } catch (error) {
        toast.error(isTranslated ? "Failed to delete form." : "படிவத்தை நீக்கத் தவறிவிட்டது.");
      } finally {
        setFormToDeleteId(null); // Clear the ID after operation
      }
    }
  };

  // Function to cancel deletion and close the modal
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setFormToDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 py-10 px-4 flex justify-center">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="w-full max-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">
          {isTranslated ? "Submitted SNAP Forms" : "சமர்ப்பிக்கப்பட்ட SNAP படிவங்கள்"}
        </h2>

        {previousForms.length > 0 ? (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full text-left table-auto">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-6 py-3 text-blue-800 font-semibold text-sm uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-blue-800 font-semibold text-sm uppercase tracking-wider">
                    {isTranslated ? "Patient Name" : "நோயாளியின் பெயர்"}
                  </th>
                  <th className="px-6 py-3 text-blue-800 font-semibold text-sm uppercase tracking-wider">
                    {isTranslated ? "Submission Date" : "சமர்ப்பித்த தேதி"}
                  </th>
                  <th className="px-6 py-3 text-blue-800 font-semibold text-sm uppercase tracking-wider">
                    {isTranslated ? "Total Score" : "மொத்த மதிப்பெண்"}
                  </th>
                  <th className="px-6 py-3 text-blue-800 font-semibold text-sm uppercase tracking-wider text-center">
                    {isTranslated ? "Actions" : "செயல்கள்"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {previousForms.map((form, idx) => (
                  <tr
                    key={form._id || idx}
                    className="bg-white hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {previousForms.length - idx}{" "}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {form.studentInfo?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(form.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="font-bold text-lg text-blue-600">
                        {form.totalScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewDetails(form._id)}
                        className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-md mr-2"
                      >
                        {isTranslated ? "View Details" : "விவரங்களைப் பார்"}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(form._id)}
                        className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 bg-red-600 hover:bg-red-700 text-white shadow-md"
                      >
                        {isTranslated ? "Delete" : "அழி"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 mt-6 text-lg text-center">
            {isTranslated ? "No previous submissions found yet." : "இதுவரை எந்த முந்தைய சமர்ப்பிப்புகளும் கண்டறியப்படவில்லை."}
          </p>
        )}
      </div>

      <ConfirmationModal
        show={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        message={{
          title: isTranslated ? "Confirm Deletion" : "நீக்குதலை உறுதிப்படுத்தவும்",
          body: isTranslated ? "Are you sure you want to delete this form? This action cannot be undone." : "இந்த படிவத்தை நீக்க விரும்புகிறீர்களா? இந்தச் செயலைத் திரும்பப் பெற முடியாது.",
          cancelText: isTranslated ? "Cancel" : "ரத்துசெய்",
          confirmText: isTranslated ? "Delete" : "அழி",
        }}
      />
    </div>
  );
};

export default SubmittedSnapFormsList;