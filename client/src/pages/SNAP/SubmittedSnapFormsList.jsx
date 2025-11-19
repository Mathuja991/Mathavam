import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
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

const SubmittedSnapFormsList = () => {
  const [previousForms, setPreviousForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [isTranslated, setIsTranslated] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formToDeleteId, setFormToDeleteId] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    dateFrom: "",
    dateTo: ""
  });
  const navigate = useNavigate();

  const fetchPreviousForms = async () => {
    try {
      const formsRes = await axios.get(`${import.meta.env.VITE_API_URL}/snapforms`);
      const sortedForms = formsRes.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPreviousForms(sortedForms);
      setFilteredForms(sortedForms);
    } 
    catch (err) {
      toast.error(isTranslated ? "Failed to load previous forms. Please try again." : "முந்தைய படிவங்களைப் பதிவிறக்கத் தவறிவிட்டது. மீண்டும் முயற்சிக்கவும்.");
    }
  };

  useEffect(() => {
    fetchPreviousForms();
  }, [isTranslated]);

  // Apply filters whenever filters or previousForms change
  useEffect(() => {
    applyFilters();
  }, [filters, previousForms]);

  const applyFilters = () => {
    let filtered = [...previousForms];

    // Filter by name
    if (filters.name) {
      filtered = filtered.filter(form => 
        form.studentInfo?.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(form => 
        new Date(form.createdAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      // Set to end of day for dateTo filter
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(form => 
        new Date(form.createdAt) <= endOfDay
      );
    }

    setFilteredForms(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  const toggleTranslation = () => {
    setIsTranslated(!isTranslated);
  };

  const handleViewDetails = (formId) => {
    navigate(`/dashboard/snapform/${formId}`);
  };

  const handleDeleteClick = (formId) => {
    setFormToDeleteId(formId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    if (formToDeleteId) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/snapforms/${formToDeleteId}`);
        toast.success(isTranslated ? "Form deleted successfully!" : "படிவம் வெற்றிகரமாக நீக்கப்பட்டது!");
        fetchPreviousForms();
      } catch (error) {
        toast.error(isTranslated ? "Failed to delete form." : "படிவத்தை நீக்கத் தவறிவிட்டது.");
      } finally {
        setFormToDeleteId(null);
      }
    }
  };

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

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-blue-700">
            {isTranslated ? "Submitted SNAP Forms" : "சமர்ப்பிக்கப்பட்ட SNAP படிவங்கள்"}
          </h2>
          <button
            onClick={toggleTranslation}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md font-semibold"
          >
            {isTranslated ? "Show Tamil (தமிழ்)" : "Translate to English"}
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-700 mb-4">
            {isTranslated ? "Filter Forms" : "படிவங்களை வடிகட்டு"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isTranslated ? "Child Name" : "பிள்ளையின் பெயர்"}
              </label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder={isTranslated ? "Search by name..." : "பெயரால் தேடு..."}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              />
            </div>

            {/* Date From Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isTranslated ? "From Date" : "தேதியிலிருந்து"}
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isTranslated ? "To Date" : "தேதி வரை"}
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              />
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-semibold"
              >
                {isTranslated ? "Clear Filters" : "வடிகட்டல்களை அகற்று"}
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            {isTranslated 
              ? `Showing ${filteredForms.length} of ${previousForms.length} forms`
              : `${previousForms.length} படிவங்களில் ${filteredForms.length} காட்டப்படுகிறது`
            }
          </div>
        </div>

        {filteredForms.length > 0 ? (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full text-left table-auto">
              <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
                <tr>
                  <th className="px-6 py-3 text-blue-800 font-semibold text-sm uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-blue-800 font-semibold text-sm uppercase tracking-wider">
                    {isTranslated ? "Child Name" : "பிள்ளையின் பெயர்"}
                  </th>
                  <th className="px-6 py-3 text-blue-800 font-semibold text-sm uppercase tracking-wider">
                    {isTranslated ? "Child ID" : "பிள்ளையின் அடையாள அட்டை"}
                  </th>
                  <th className="px-6 py-3 text-blue-800 font-semibold text-sm uppercase tracking-wider">
                    {isTranslated ? "Age" : "வயது"}
                  </th>
                  <th className="px-6 py-3 text-blue-800 font-semibold text-sm uppercase tracking-wider">
                    {isTranslated ? "Gender" : "பால்"}
                  </th>
                  <th className="px-6 py-3 text-blue-800 font-semibold text-sm uppercase tracking-wider">
                    {isTranslated ? "Submission Date" : "சமர்ப்பித்த தேதி"}
                  </th>
                  <th className="px-6 py-3 text-blue-800 font-semibold text-sm uppercase tracking-wider text-center">
                    {isTranslated ? "Actions" : "செயல்கள்"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.map((form, idx) => (
                  <tr
                    key={form._id || idx}
                    className="bg-white hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {filteredForms.length - idx}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {form.studentInfo?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {form.studentInfo?.id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {form.studentInfo?.age || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {form.studentInfo?.gender || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(form.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg mb-4">
              {isTranslated ? "No forms found matching your filters." : "உங்கள் வடிகட்டல்களுடன் பொருந்தும் படிவங்கள் எதுவும் கிடைக்கவில்லை."}
            </p>
            {(filters.name || filters.dateFrom || filters.dateTo) && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
              >
                {isTranslated ? "Clear filters to see all forms" : "அனைத்து படிவங்களையும் காண வடிகட்டல்களை அகற்று"}
              </button>
            )}
          </div>
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