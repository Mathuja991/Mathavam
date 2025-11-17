import React, { useState } from 'react';
import axios from 'axios';

const AddDoctor = () => {
  const [formData, setFormData] = useState({
    doctorId: '',
    firstName: '',
    lastName: '',
    doctorEmail: '',
    doctorPhone: '',
    qualification: '',
    experience: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingId, setValidatingId] = useState(false);
  const [idValidationMessage, setIdValidationMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear validation message when user starts typing again
    if (name === 'doctorId' && idValidationMessage) {
      setIdValidationMessage('');
    }
  };

  const validateDoctorId = async (idNumber) => {
    if (!idNumber.trim()) {
      setIdValidationMessage('');
      return false;
    }

    setValidatingId(true);
    setIdValidationMessage('');

    try {
      const response = await axios.get(`/api/users/check-doctor/${idNumber}`);
      
      if (response.data.isDoctor && response.data.user) {
        const user = response.data.user;
        setFormData(prev => ({
          ...prev,
          firstName: user.firstName,
          lastName: user.lastName
        }));
        setIdValidationMessage('✓ Valid doctor ID - Name auto-filled');
        return true;
      } else {
        setFormData(prev => ({
          ...prev,
          firstName: '',
          lastName: ''
        }));
        setIdValidationMessage('❌ This ID does not belong to a doctor');
        return false;
      }
    } catch (error) {
      console.error('Error validating doctor ID:', error);
      if (error.response?.status === 404) {
        setIdValidationMessage('❌ User with this ID not found');
      } else {
        setIdValidationMessage('❌ Error validating ID');
      }
      setFormData(prev => ({
        ...prev,
        firstName: '',
        lastName: ''
      }));
      return false;
    } finally {
      setValidatingId(false);
    }
  };

  const handleIdBlur = (e) => {
    validateDoctorId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate doctor ID before submission
    const isValidDoctor = await validateDoctorId(formData.doctorId);
    if (!isValidDoctor) {
      setMessage('Please enter a valid doctor ID');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/doctors', formData);
      setMessage('Doctor added successfully to database!');
      // Reset form
      setFormData({
        doctorId: '',
        firstName: '',
        lastName: '',
        doctorEmail: '',
        doctorPhone: '',
        qualification: '',
        experience: ''
      });
      setIdValidationMessage('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding doctor to database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Add Doctor to Database
      </h2>
      
      {message && (
        <div className={`p-3 rounded-md mb-4 text-center ${
          message.includes('Error') 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : 'bg-green-100 text-green-700 border border-green-300'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor ID *
          </label>
          <input
            type="text"
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            onBlur={handleIdBlur}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter doctor's ID number"
            disabled={validatingId}
          />
          {validatingId && (
            <p className="text-sm text-blue-600 mt-1">Validating ID...</p>
          )}
          {idValidationMessage && (
            <p className={`text-sm mt-1 ${
              idValidationMessage.includes('✓') 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {idValidationMessage}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              placeholder="First name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              placeholder="Last name"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 -mt-2">
          Name fields are auto-filled from the user database after ID validation
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            name="doctorEmail"
            value={formData.doctorEmail}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="doctor@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="doctorPhone"
            value={formData.doctorPhone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Qualification *
          </label>
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="MBBS, MD, MS, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience (Years) *
          </label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            required
            min="0"
            max="50"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="5"
          />
        </div>

        <button
          type="submit"
          disabled={loading || validatingId || !formData.firstName || !formData.lastName}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          {loading ? 'Saving to Database...' : 'Save Doctor'}
        </button>
      </form>
    </div>
  );
};

export default AddDoctor;