// client/src/pages/Appointment/DoctorAppointmentBooking.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select"; // Import react-select

const DoctorAppointmentBooking = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    patientId: "",
    practitionerId: "",
    appointmentDate: "",
    startTime: "",
    endTime: "",
    serviceType: "General Consultation",
    notes: "",
    status: "Pending",
  });

  const [practitioners, setPractitioners] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDataForDropdowns = async () => {
      setLoading(true);
      setError(null);
      try {
        const practitionersResponse = await axios.get(
          "http://localhost:5000/api/users"
        );
        const filteredPractitioners = practitionersResponse.data.filter(
          (user) => user.userType === "Doctor" || user.userType === "Therapist"
        );
        // Format data for react-select
        const formattedPractitioners = filteredPractitioners.map((user) => ({
          value: user._id,
          label: `${user.firstName} ${user.lastName} (${user.userType})`,
        }));
        setPractitioners(formattedPractitioners);

        const patientsResponse = await axios.get(
          "http://localhost:5000/api/patientRecords"
        );
        // Format data for react-select
        const formattedPatients = patientsResponse.data.map((patient) => ({
          value: patient._id,
          label: `${patient.name} (${patient.childNo})`,
        }));
        setPatients(formattedPatients);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError(
          "Failed to load practitioners or patients. Please try again."
        );
        setLoading(false);
      }
    };
    fetchDataForDropdowns();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuccess(false);
    setError(null);
  };

  // Handle react-select changes
  const handleSelectChange = (selectedOption, { name }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
    setSuccess(false);
    setError(null);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post("http://localhost:5000/api/appointments", formData);
      setSuccess(true);
      setFormData({
        patientId: "",
        practitionerId: "",
        appointmentDate: "",
        startTime: "",
        endTime: "",
        serviceType: "General Consultation",
        notes: "",
        status: "Pending",
      });
    } catch (err) {
      console.error(
        "Appointment booking error:",
        err.response ? err.response.data : err.message
      );
      setError(
        err.response?.data?.message ||
        "Failed to book appointment. Please check your inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200 my-8 max-w-2xl">
      <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
        Book Doctor/Therapist Appointment
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Select the relevant child and practitioner to book an appointment.
      </p>

      {loading && (
        <div className="flex justify-center items-center">
          <p className="text-blue-500 font-medium">Loading data...</p>
        </div>
      )}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <p className="font-bold">Error!</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <p className="font-bold">Success!</p>
          <p className="text-sm">Appointment booked successfully.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection with Search */}
        <div>
          <label
            htmlFor="patientId"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Select Patient (Child)
          </label>
          <Select
            id="patientId"
            name="patientId"
            value={patients.find(option => option.value === formData.patientId)}
            onChange={handleSelectChange}
            options={patients}
            isClearable={true}
            placeholder="Search for a patient..."
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Practitioner Selection with Search */}
        <div>
          <label
            htmlFor="practitionerId"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Select Doctor or Therapist
          </label>
          <Select
            id="practitionerId"
            name="practitionerId"
            value={practitioners.find(option => option.value === formData.practitionerId)}
            onChange={handleSelectChange}
            options={practitioners}
            isClearable={true}
            placeholder="Search for a practitioner..."
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Appointment Date */}
        <div>
          <label
            htmlFor="appointmentDate"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Appointment Date
          </label>
          <input
            type="date"
            id="appointmentDate"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
            min={today}
            required
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Time Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Service Type */}
        <div>
          <label
            htmlFor="serviceType"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Service Type
          </label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="General Consultation">General Consultation</option>
            <option value="Speech Therapy">Speech Therapy</option>
            <option value="Occupational Therapy">Occupational Therapy</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any special notes..."
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 border rounded-lg text-gray-700 font-medium hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg text-white font-medium bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorAppointmentBooking;