import React, { useState } from 'react';
import axios from 'axios';

const MonthlyReturnForm = () => {
  const [formData, setFormData] = useState({
    month: 'April',
    year: '2025',
    entries: serviceList.map(service => ({
      service,
      beneficiaries: '',
      followUps: '',
      hours: '',
      comments: '',
    })),
    signature: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (index, field, value) => {
    const updatedEntries = [...formData.entries];
    updatedEntries[index][field] = value;
    setFormData({ ...formData, entries: updatedEntries });
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
const fetchNewChildrenCount = async () => {
  setLoadingCount(true);
  try {
    const response = await axios.get('http://localhost:5000/api/patientRecords');
    const patientRecords = response.data;

    // Filter by selected month and year
    const filtered = patientRecords.filter(record => {
      const recordDate = new Date(record.createdAt); // Use createdAt field
      const recordMonth = recordDate.toLocaleString('default', { month: 'long' });
      const recordYear = recordDate.getFullYear().toString();

      return recordMonth === formData.month && recordYear === formData.year;
    });

    const count = filtered.length;

    // Update 'New children registered' entry
    setFormData(prevFormData => {
      const updatedEntries = prevFormData.entries.map(entry =>
        entry.service === 'New children registered'
          ? { ...entry, beneficiaries: count }
          : entry
      );
      return { ...prevFormData, entries: updatedEntries };
    });

    setMessage('✅ New children count fetched successfully!');
  } catch (err) {
    console.error('Error fetching new children count:', err);
    setMessage('🚨 Error fetching new children count.');
  } finally {
    setLoadingCount(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.month || !formData.year || !formData.signature) {
      setMessage('🚨 Please fill in all required fields: Month, Year, and Signature.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/monthlyreturns/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Submission error: ${errorText}`);
      }

      await response.json();
      setMessage('✅ Form submitted successfully!');
    } catch (err) {
      console.error(err);
      setMessage('🚨 Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow rounded-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Monthly Return - Mathavam</h2>

      {message && (
        <div className={`mb-6 p-4 rounded text-white ${message.includes('successfully') ? 'bg-green-500' : 'bg-red-500'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Month & Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block font-semibold mb-2">Month</label>
             <select
            name="month"
            value={formData.month}
            onChange={handleHeaderChange}
            className="border p-3 rounded-lg w-full"
          >
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ].map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>

          </div>
          <div>
            <label className="block font-semibold mb-2">Year</label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleHeaderChange}
              className="border p-3 rounded-lg w-full"
            />
          </div>
        </div>

        {/* Fetch Count Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            onClick={fetchNewChildrenCount}
            disabled={loadingCount}
          >
            {loadingCount ? 'Loading...' : 'Fetch New Children Count'}
          </button>
        </div>

        {/* Services Table */}
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full table-auto border rounded-lg">
            <thead>
              <tr className="bg-blue-100 text-left">
                <th className="border p-3">Type of Services and Activities</th>
                <th className="border p-3">Number of Beneficiaries</th>
                <th className="border p-3">Follow-up</th>
                <th className="border p-3">Number of Hours</th>
                <th className="border p-3">Comments</th>
              </tr>
            </thead>
            <tbody>
              {formData.entries.map((entry, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border p-2">{entry.service}</td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={entry.beneficiaries}
                      onChange={(e) => handleInputChange(index, 'beneficiaries', e.target.value)}
                      className="border p-2 rounded w-24"
                      readOnly={entry.service === 'New children registered'} // Prevent manual input for auto-filled field
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={entry.followUps}
                      onChange={(e) => handleInputChange(index, 'followUps', e.target.value)}
                      className="border p-2 rounded w-24"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={entry.hours}
                      onChange={(e) => handleInputChange(index, 'hours', e.target.value)}
                      className="border p-2 rounded w-24"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={entry.comments}
                      onChange={(e) => handleInputChange(index, 'comments', e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature */}
        <div className="mb-8">
          <label className="block font-semibold mb-2">Signature (MO/Psy)</label>
          <input
            type="text"
            value={formData.signature}
            onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
            className="border p-3 rounded-lg w-full"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className={`px-6 py-3 text-white font-semibold rounded-xl ${loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'} transition`}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Monthly Return'}
          </button>
        </div>
      </form>
    </div>
  );
};

const serviceList = [
  'New children registered',
  'Initial medical assessment',
  'CARS assessment',
  'ABLLS assessment',
  'Sensory profile assessment',
  'Speech and language assessment',
  'OT assessment',
  'Physiotherapy assessment',
  'Behavioral assessment',
  'Psychiatry review (new + follow ups)',
  'Paediatric review (new + follow ups)',
  'Community Paediatric review (new + follow ups)',
  'Parental education sessions',
  'Play group therapy',
  'Music Therapy',
  'Early Intensive Behavior Therapy',
  'Advanced skills trainings',
  'Adolescent learning',
  'Online educational sessions',
  'Video monitoring and feedback',
  'Medical reports and letters given',
  'MDT meetings',
  'Staff meetings',
  'Meetings with Consultant Psychologist / RDHS / AO',
  'Training - Medical students',
  'Training - FHW',
  'Training - Special ed. teachers',
  'Training - Others',
  'Awareness programmes (Public / Media)',
  'Parent meetings',
  'Cultural events',
  'Staff empowerment programmes',
  'Research activities',
  'Structured Physical Activity',
  'Parents motivational session'
];

export default MonthlyReturnForm;
