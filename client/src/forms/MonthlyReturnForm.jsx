import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MonthlyReturnForm = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [view, setView] = useState('main');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    period: 'January-June',
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
  const [submittedReturns, setSubmittedReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  // Filter states
  const [yearFilter, setYearFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Clear message when changing views
  const handleViewChange = (newView) => {
    setMessage('');
    setView(newView);
  };

  // Fetch submitted monthly returns with proper error handling
  const fetchSubmittedReturns = async () => {
    setLoadingReturns(true);
    try {
      //const response = await axios.get(`${API_URL}/monthlyreturns`);
      const token = localStorage.getItem("token");


const res = await fetch(`${API_URL}/monthlyreturns`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "x-auth-token": token
  }
});

const responseData = await res.json();

let returnsData = [];

if (Array.isArray(responseData)) {
  returnsData = responseData;
} else if (responseData && Array.isArray(responseData.data)) {
  returnsData = responseData.data;
} else if (responseData && responseData.returns) {
  returnsData = responseData.returns;
} else {
  console.warn('Unexpected API response structure:', responseData);
  returnsData = [];
}

setSubmittedReturns(returnsData);
setFilteredReturns(returnsData);

    } finally {
      setLoadingReturns(false);
    }
  };

  useEffect(() => {
    if (view === 'manage') {
      fetchSubmittedReturns();
    }
  }, [view]);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [yearFilter, periodFilter, searchFilter, submittedReturns]);

  const applyFilters = () => {
    let filtered = [...submittedReturns];

    // Filter by year
    if (yearFilter) {
      filtered = filtered.filter(returnItem => 
        returnItem.year?.toString() === yearFilter
      );
    }

    // Filter by period
    if (periodFilter) {
      filtered = filtered.filter(returnItem => 
        returnItem.period?.toLowerCase() === periodFilter.toLowerCase()
      );
    }

    // Filter by search term (signature or comments)
    if (searchFilter) {
      const searchTerm = searchFilter.toLowerCase();
      filtered = filtered.filter(returnItem => 
        returnItem.signature?.toLowerCase().includes(searchTerm) ||
        returnItem.entries?.some(entry => 
          entry.comments?.toLowerCase().includes(searchTerm)
        )
      );
    }

    setFilteredReturns(filtered);
  };

  const clearFilters = () => {
    setYearFilter('');
    setPeriodFilter('');
    setSearchFilter('');
  };

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (message && message.includes('✅')) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Get unique years and periods for filter dropdowns
  const getUniqueYears = () => {
    const years = submittedReturns
      .map(returnItem => returnItem.year)
      .filter(year => year)
      .sort((a, b) => b - a); // Sort descending (newest first)
    return [...new Set(years)];
  };

  const getUniquePeriods = () => {
    const periods = submittedReturns
      .map(returnItem => returnItem.period)
      .filter(period => period);
    return [...new Set(periods)].sort((a, b) => {
      const periodOrder = ['January-June', 'July-December'];
      return periodOrder.indexOf(a) - periodOrder.indexOf(b);
    });
  };

  // Check if a date falls within the selected period
  const isDateInPeriod = (date, period, year) => {
    const recordDate = new Date(date);
    const recordYear = recordDate.getFullYear().toString();
    
    if (recordYear !== year) return false;
    
    const recordMonth = recordDate.getMonth() + 1; // January = 1
    
    if (period === 'January-June') {
      return recordMonth >= 1 && recordMonth <= 6;
    } else if (period === 'July-December') {
      return recordMonth >= 7 && recordMonth <= 12;
    }
    
    return false;
  };

  // Prevent negative numbers in input
  const handleNumberInput = (index, field, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const finalValue = numericValue === '' ? '' : Math.max(0, parseInt(numericValue) || 0);
    
    const updatedEntries = [...formData.entries];
    updatedEntries[index][field] = finalValue;
    setFormData({ ...formData, entries: updatedEntries });
  };

  const handleInputChange = (index, field, value) => {
    if (field === 'beneficiaries' || field === 'followUps') {
      handleNumberInput(index, field, value);
    } else {
      const updatedEntries = [...formData.entries];
      updatedEntries[index][field] = value;
      setFormData({ ...formData, entries: updatedEntries });
    }
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Fetch all assessment counts automatically for the 6-month period
  const fetchAllAssessmentCounts = async () => {
    setLoadingCount(true);
    setMessage('🔄 Fetching assessment data for the 6-month period...');
    
    try {
     const token = localStorage.getItem("token");
const response = await axios.get(`${API_URL}/patientRecords`, {
  headers: { "x-auth-token": token }
});

      const patientRecords = response.data;

      // Filter records for the selected 6-month period
      const filteredRecords = patientRecords.filter(record => 
        isDateInPeriod(record.createdAt, formData.period, formData.year)
      );
      
      const newChildrenCount = filteredRecords.length;
      
      // Fetch CARS assessments
      // const token = localStorage.getItem("token");
      const response2 = await axios.get(`${API_URL}/carsform/entries`,
         {
  headers: { "x-auth-token": token }
         }
      );
      const carsAssessment = response2.data;

      const filteredcarsAssessment = carsAssessment.filter(record => 
        isDateInPeriod(record.createdAt, formData.period, formData.year)
      );
      const carsCount = filteredcarsAssessment.length;
      
      // Fetch behavioral assessments
      const response3 = await axios.get(`${API_URL}/bc/`,
         {
  headers: { "x-auth-token": token }
}
      );
      const bcAssessment = response3.data;

      const filteredbcAssessment = bcAssessment.filter(record => 
        isDateInPeriod(record.createdAt, formData.period, formData.year)
      );
      const behavioralCount = filteredbcAssessment.length;

     
       // Fetch behavioral assessments
      const response5 = await axios.get(`${API_URL}/bc/`,
         {
  headers: { "x-auth-token": token }
}
      );
      const sensoryAssessment = response5.data;
 const sensoryCount = filteredRecords.filter(record => 
        record.assessments?.sensory || record.sensoryAssessment
      ).length;
      setFormData(prevFormData => {
        const updatedEntries = prevFormData.entries.map(entry => {
          switch (entry.service) {
            case 'New children registered':
              return { ...entry, beneficiaries: newChildrenCount };
            case 'CARS assessment':
              return { ...entry, beneficiaries: carsCount };
            case 'Sensory profile assessment':
              return { ...entry, beneficiaries: sensoryCount };
            case 'Behavioral assessment':
              return { ...entry, beneficiaries: behavioralCount };
            default:
              return entry;
          }
        });
        return { ...prevFormData, entries: updatedEntries };
      });

      setMessage(`✅ All assessment counts fetched successfully for ${formData.period} ${formData.year}!`);
    } catch (err) {
      console.error('Error fetching assessment counts:', err);
      setMessage('🚨 Error fetching assessment data. Please check your data structure.');
    } finally {
      setLoadingCount(false);
    }
  };

  const fetchNewChildrenCount = async () => {
    setLoadingCount(true);
    try {
      const response = await axios.get(`${API_URL}/patientRecords`, {
  headers: { "x-auth-token": token }
});
      const patientRecords = response.data;

      const filtered = patientRecords.filter(record => 
        isDateInPeriod(record.createdAt, formData.period, formData.year)
      );

      const count = filtered.length;

      setFormData(prevFormData => {
        const updatedEntries = prevFormData.entries.map(entry =>
          entry.service === 'New children registered'
            ? { ...entry, beneficiaries: count }
            : entry
        );
        return { ...prevFormData, entries: updatedEntries };
      });

      setMessage(`✅ New children count fetched successfully for ${formData.period} ${formData.year}!`);
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
  setMessage('');

  if (!formData.period || !formData.year || !formData.signature) {
    setMessage('🚨 Please fill in all required fields: Period, Year, and Signature.');
    setLoading(false);
    return;
  }

  try {
    console.log('Submitting data:', formData); // Debug log

   const token = localStorage.getItem("token");
const response = await fetch(`${API_URL}/monthlyreturns/submit`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-auth-token": token
  },
  body: JSON.stringify({
    period: formData.period,
    year: formData.year.toString(),
    entries: formData.entries,
    signature: formData.signature
  }),
});


    const result = await response.json();
    console.log('Server response:', result); // Debug log

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

  
  // Redirect to /returns or any route you want
 
if (response.ok) {
    setMessage('✅ Six-month return submitted successfully!');
     navigate('/dashboard/monreturn'); 
     }
    // Reset form and redirect
    setTimeout(() => {
      setFormData({
        period: 'January-June',
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
      handleViewChange('manage');
    }, 2000);

  } catch (err) {
    console.error('Submission error:', err);
    setMessage(`🚨 Submission failed: ${err.message}`);
  } finally {
    setLoading(false);
  }
};
  const getAutoFilledValue = (serviceName) => {
    const entry = formData.entries.find(entry => entry.service === serviceName);
    return entry ? entry.beneficiaries : 0;
  };

  const handleDeleteReturn = async (id) => {
  if (!window.confirm('Are you sure you want to delete this six-month return?')) return;

  try {
    const token = localStorage.getItem("token");

    // Assign the axios response to a variable
    const response = await axios.delete(`${API_URL}/monthlyreturns/${id}`, {
      headers: { "x-auth-token": token }
    });

    if (response.status === 200) {
      setMessage('✅ Six-month return deleted successfully!');
      fetchSubmittedReturns();
    }
  } catch (err) {
    console.error('Error deleting six-month return:', err);
    setMessage('🚨 Error deleting six-month return.');
  }
};


  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalBeneficiaries = (entries) => {
    if (!Array.isArray(entries)) return 0;
    return entries.reduce((total, entry) => total + (parseInt(entry.beneficiaries) || 0), 0);
  };

  // Main Dashboard View
  if (view === 'main') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
        <h2 className="text-3xl font-bold text-blue-700 mb-10">
          📊 Six-Month Return System - Mathavam
        </h2>

        {message && (
          <div className={`mb-6 p-4 rounded text-white max-w-2xl w-full ${message.includes('✅') ? 'bg-green-500' : 'bg-red-500'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <div className="bg-white shadow-lg rounded-2xl p-6 w-80 text-center border border-green-200 hover:shadow-xl transition">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-green-800 mb-4 border-b pb-2">
              New Six-Month Return
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Create a new six-month return form with automatic data fetching
            </p>
            <button
              onClick={() => handleViewChange('new')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              Create New Return
            </button>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6 w-80 text-center border border-blue-200 hover:shadow-xl transition">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-blue-800 mb-4 border-b pb-2">
              Manage Returns
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              View, edit, and manage previously submitted six-month returns
            </p>
            <button
              onClick={() => handleViewChange('manage')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              View Submissions
            </button>
          </div>
        </div>
      </div>
    );
  }

  // New Form View
  if (view === 'new') {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white shadow rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-700">Six-Month Return - Mathavam</h2>
          <button
            onClick={() => handleViewChange('main')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded text-white ${message.includes('✅') ? 'bg-green-500' : 'bg-red-500'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Period & Year Selection */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Six-Month Period</label>
                <select
                  name="period"
                  value={formData.period}
                  onChange={handleHeaderChange}
                  className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="January-June">January - June</option>
                  <option value="July-December">July - December</option>
                </select>
              </div>
              
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Year</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleHeaderChange}
                  className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter year"
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="px-4 py-3  bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold"
                  onClick={fetchAllAssessmentCounts}
                  disabled={loadingCount}
                >
                  {loadingCount ? '🔄 Loading...' : '📊 Auto-Fill All'}
                </button>
                <span className="text-xs text-gray-600 text-center">Fills all assessment counts</span>
              </div>

              {/* <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
                  onClick={fetchNewChildrenCount}
                  disabled={loadingCount}
                >
                  {loadingCount ? '🔄 Loading...' : '👶 Children Only'}
                </button>
                <span className="text-xs text-gray-600 text-center">Fills only new registrations</span>
              </div> */}
            </div>

            {/* Auto-filled Values Summary */}
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <h3 className="font-semibold text-gray-700 mb-3">
                Auto-filled Values for {formData.period} {formData.year}:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex justify-between">
                  <span>New Children:</span>
                  <span className="font-bold text-green-600">{getAutoFilledValue('New children registered')}</span>
                </div>
                <div className="flex justify-between">
                  <span>CARS Assessment:</span>
                  <span className="font-bold text-green-600">{getAutoFilledValue('CARS assessment')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sensory Profile:</span>
                  <span className="font-bold text-green-600">{getAutoFilledValue('Sensory profile assessment')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Behavioral Assessment:</span>
                  <span className="font-bold text-green-600">{getAutoFilledValue('Behavioral assessment')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services Table */}
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full table-auto border rounded-lg">
              <thead>
                <tr className="bg-blue-100 text-left">
                  <th className="border p-3 font-semibold">Type of Services and Activities</th>
                  <th className="border p-3 font-semibold">Number of Beneficiaries</th>
                  <th className="border p-3 font-semibold">Follow-up</th>
                  <th className="border p-3 font-semibold">Number of Hours</th>
                  <th className="border p-3 font-semibold">Comments</th>
                </tr>
              </thead>
              <tbody>
                {formData.entries.map((entry, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                    <td className="border p-3 font-medium">
                      {entry.service}
                      {[
                        'New children registered',
                        'CARS assessment', 
                        'Sensory profile assessment',
                        'Behavioral assessment',
                      ].includes(entry.service) && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Auto-filled</span>
                      )}
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        min="0"
                        value={entry.beneficiaries}
                        onChange={(e) => handleInputChange(index, 'beneficiaries', e.target.value)}
                        className={`border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500 ${
                          [
                            'New children registered',
                            'CARS assessment',
                            'Sensory profile assessment',
                            'Behavioral assessment',
                          ].includes(entry.service) 
                            ? 'bg-green-50 border-green-300' 
                            : ''
                        }`}
                        readOnly={[
                          'New children registered',
                          'CARS assessment',
                          'Sensory profile assessment', 
                          'Behavioral assessment',
                        ].includes(entry.service)}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                            e.preventDefault();
                          }
                        }}
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        min="0"
                        value={entry.followUps}
                        onChange={(e) => handleInputChange(index, 'followUps', e.target.value)}
                        className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                            e.preventDefault();
                          }
                        }}
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={entry.hours}
                        onChange={(e) => handleInputChange(index, 'hours', e.target.value)}
                        className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={entry.comments}
                        onChange={(e) => handleInputChange(index, 'comments', e.target.value)}
                        className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                        placeholder="Add comments..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature */}
          <div className="mb-8">
            <label className="block font-semibold mb-2 text-gray-700">Signature (MO/Psy)</label>
            <input
              type="text"
              value={formData.signature}
              onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your signature"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => handleViewChange('main')}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-8 py-3 text-white font-semibold rounded-xl text-lg ${
                loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
              } transition shadow-md`}
              disabled={loading}
            >
              {loading ? '🔄 Submitting...' : '📤 Submit Six-Month Return'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Manage View with Filters
  if (view === 'manage') {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white shadow rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-700">Manage Six-Month Returns</h2>
          <div className="flex gap-4">
            <button
              onClick={fetchSubmittedReturns}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => handleViewChange('main')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded text-white ${message.includes('✅') ? 'bg-green-500' : 'bg-red-500'}`}>
            {message}
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">🔍 Filter Six-Month Returns</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Filter by Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Years</option>
                {getUniqueYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Filter by Period</label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Periods</option>
                <option value="January-June">January - June</option>
                <option value="July-December">July - December</option>
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by signature or comments..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition font-medium"
              >
                🗑️ Clear Filters
              </button>
            </div>
          </div>

          {/* Filter Results Summary */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredReturns.length} of {submittedReturns.length} six-month returns
              {(yearFilter || periodFilter || searchFilter) && ' (filtered)'}
            </span>
            {(yearFilter || periodFilter || searchFilter) && (
              <span className="font-medium">
                Active filters: 
                {yearFilter && ` Year: ${yearFilter}`}
                {periodFilter && ` Period: ${periodFilter}`}
                {searchFilter && ` Search: "${searchFilter}"`}
              </span>
            )}
          </div>
        </div>

        {loadingReturns ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading submitted returns...</p>
          </div>
        ) : !Array.isArray(filteredReturns) || filteredReturns.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              {submittedReturns.length === 0 ? 'No Six-Month Returns Found' : 'No Matching Returns'}
            </h3>
            <p className="text-gray-500 mb-6">
              {submittedReturns.length === 0 
                ? 'No six-month returns have been submitted yet. Create your first return to get started.'
                : 'No six-month returns match your current filters. Try adjusting your search criteria.'
              }
            </p>
            <div className="flex gap-4 justify-center">
              {(yearFilter || periodFilter || searchFilter) && (
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => handleViewChange('new')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Create New Return
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">
                📊 Summary: {filteredReturns.length} Six-Month Return(s) 
                {(yearFilter || periodFilter || searchFilter) && ' (Filtered)'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Latest Return: </span>
                  {formatDate(filteredReturns[0]?.createdAt)}
                </div>
                <div>
                  <span className="font-medium">Period Covered: </span>
                  {Array.from(new Set(filteredReturns.map(ret => `${ret.period} ${ret.year}`))).join(', ')}
                </div>
                <div>
                  <span className="font-medium">Total Records: </span>
                  {filteredReturns.length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredReturns.map((monthlyReturn, index) => (
                <div key={monthlyReturn._id || index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {monthlyReturn.period} {monthlyReturn.year}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Submitted on {formatDate(monthlyReturn.createdAt)}
                        {monthlyReturn.signature && ` • Signed by: ${monthlyReturn.signature}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedReturn(selectedReturn?._id === monthlyReturn._id ? null : monthlyReturn)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                      >
                        {selectedReturn?._id === monthlyReturn._id ? '▲ Hide' : '▼ View'}
                      </button>
                      <button
                        onClick={() => handleDeleteReturn(monthlyReturn._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-bold text-green-700 text-lg">
                        {monthlyReturn.entries?.find(e => e.service === 'New children registered')?.beneficiaries || 0}
                      </div>
                      <div className="text-gray-600">New Children</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="font-bold text-blue-700 text-lg">
                        {monthlyReturn.entries?.find(e => e.service === 'CARS assessment')?.beneficiaries || 0}
                      </div>
                      <div className="text-gray-600">CARS Assessments</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="font-bold text-purple-700 text-lg">
                        {calculateTotalBeneficiaries(monthlyReturn.entries)}
                      </div>
                      <div className="text-gray-600">Total Beneficiaries</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="font-bold text-orange-700 text-lg">
                        {monthlyReturn.entries?.filter(e => parseInt(e.followUps) > 0).length || 0}
                      </div>
                      <div className="text-gray-600">Services with Follow-ups</div>
                    </div>
                  </div>

                  {/* Detailed View */}
                  {selectedReturn?._id === monthlyReturn._id && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-3">Detailed Breakdown:</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border p-2 text-left">Service</th>
                              <th className="border p-2 text-center">Beneficiaries</th>
                              <th className="border p-2 text-center">Follow-ups</th>
                              <th className="border p-2 text-center">Hours</th>
                              <th className="border p-2 text-left">Comments</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthlyReturn.entries
                              ?.filter(entry => entry.beneficiaries || entry.followUps || entry.hours || entry.comments)
                              .map((entry, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="border p-2">{entry.service}</td>
                                  <td className="border p-2 text-center">{entry.beneficiaries || '-'}</td>
                                  <td className="border p-2 text-center">{entry.followUps || '-'}</td>
                                  <td className="border p-2 text-center">{entry.hours || '-'}</td>
                                  <td className="border p-2">{entry.comments || '-'}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
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