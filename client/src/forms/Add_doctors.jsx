import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Mail, Phone, Calendar, Briefcase, DollarSign, User, Zap, CheckCircle, Loader, UserPlus, Users, AlertTriangle, Search, UserCheck, BookOpen, Star, Edit3, Trash2 } from 'lucide-react';

// --- Utility Functions ---
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
};

const formatSalary = (salary) => {
  if (salary === null || salary === undefined) return 'N/A';
  return `LKR ${Number(salary).toLocaleString('en-US')}`;
};
// -------------------------

// --- Nested Component: Add Staff Form ---
const AddStaffForm = ({ onStaffAdded, switchView }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    dateOfJoining: '',
    salary: '',
    qualification: '',
    experience: ''
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const staffRoles = [
    'Doctor',
    'Therapist',
    'Admin',
    'Super Admin',
    'Resource Person',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message) setMessage(null);
  };

  const isFormValid = useMemo(() => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phone &&
      formData.role &&
      formData.dateOfJoining &&
      formData.salary &&
      formData.qualification &&
      formData.experience
    );
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      doctorEmail: formData.email,
      doctorPhone: formData.phone,
      role: formData.role,
      dateOfJoining: formData.dateOfJoining,
      salary: formData.salary,
      qualification: formData.qualification,
      experience: formData.experience,
    };

    try {
      const response = await axios.post('/api/doctors', payload);

      if (response.data.success) {
        setMessage({ type: 'success', text: `Staff member ${formData.firstName} ${formData.lastName} added successfully!` });
        onStaffAdded(); // Notify parent to refresh staff list
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', role: '',
          dateOfJoining: '', salary: '', qualification: '', experience: ''
        });
        
        // Optional: Switch to view mode after a short delay
        setTimeout(() => switchView('view'), 1500);

      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to add staff member.' });
      }
    } catch (error) {
      console.error('Error saving staff data:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'An error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-200">
        <UserPlus className="w-10 h-10 text-blue-600" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Add New Staff Member</h2>
          <p className="text-md text-gray-500">Enter the details for the new staff personnel.</p>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center p-4 mb-6 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-1">
            <label className="block text-sm font-semibold text-gray-700">First Name *</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition duration-150"
                placeholder="e.g., Jane"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Last Name *</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition duration-150"
                placeholder="e.g., Doe"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Email Address *</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition duration-150"
                placeholder="e.g., jane.doe@example.com"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Phone Number *</label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition duration-150"
                placeholder="e.g., +94 77 123 4567"
              />
            </div>
          </div>
        </div>

        {/* Professional Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Role *</label>
            <div className="relative">
              <Briefcase className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition duration-150 appearance-none"
              >
                <option value="" disabled>Select a role</option>
                {staffRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Date of Joining *</label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition duration-150"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Qualification *</label>
            <div className="relative">
              <BookOpen className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition duration-150"
                placeholder="e.g., MBBS, SLMC Reg."
              />
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Experience (Yrs) *</label>
            <div className="relative">
              <Star className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                min="0"
                max="50"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition duration-150"
                placeholder="e.g., 5"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="block text-sm font-semibold text-gray-700">Salary (LKR) *</label>
          <div className="relative">
            <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
              min="0"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition duration-150"
              placeholder="e.g., 150000"
            />
          </div>
        </div>


        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader className="w-5 h-5 mr-3 animate-spin" /> Saving Staff Data...
            </span>
          ) : (
            'Save Staff Member'
          )}
        </button>
      </form>
    </div>
  );
};
// -------------------------

// --- Nested Component: View Staff List ---
const ViewStaffList = ({ staffList, loading, error, fetchStaff, searchQuery, setSearchQuery, handleDelete, handleEdit }) => {
  const filteredStaff = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return staffList;
    return staffList.filter((staff) => {
      const fullName = `${staff.firstName || ''} ${staff.lastName || ''}`.toLowerCase();
      return (
        fullName.includes(query) ||
        (staff.role && staff.role.toLowerCase().includes(query)) ||
        (staff.doctorId && staff.doctorId.toLowerCase().includes(query)) ||
        (staff.doctorEmail && staff.doctorEmail.toLowerCase().includes(query)) ||
        (staff.doctorPhone && staff.doctorPhone.includes(query)) ||
        (staff.qualification && staff.qualification.toLowerCase().includes(query))
      );
    });
  }, [staffList, searchQuery]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
      <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-200">
        <Users className="w-10 h-10 text-blue-600" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Staff Details</h2>
          <p className="text-md text-gray-500">View, edit, and manage staff member details.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, role, email, phone, or qualification..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition duration-150"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex items-center justify-center p-10">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-lg text-gray-600">Loading Staff Data...</span>
        </div>
      )}
      {error && (
        <div className="flex items-center p-4 mb-6 rounded-lg bg-red-50 text-red-700">
          <AlertTriangle className="w-5 h-5 mr-3" />
          <span className="font-medium">Error: {error}</span>
          <button onClick={fetchStaff} className="ml-auto text-sm font-semibold underline">Try Again</button>
        </div>
      )}
      {!loading && !error && filteredStaff.length === 0 && (
        <div className="flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-gray-200 rounded-lg">
          <UserCheck className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Staff Found</h3>
          <p className="text-gray-500">
            {searchQuery ? 'No staff members match your search query.' : 'There are no staff members in the system yet.'}
          </p>
        </div>
      )}

      {/* Staff Table */}
      {!loading && !error && filteredStaff.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Staff ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Joining Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Qualification</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Exp (Yrs)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Salary (LKR)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((staff) => (
                <tr key={staff._id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.doctorId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{staff.firstName} {staff.lastName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {staff.role || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="font-medium">{staff.doctorEmail || 'N/A'}</div>
                      <div className="text-gray-500">{staff.doctorPhone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(staff.dateOfJoining)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{staff.qualification || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{staff.experience ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-bold">{formatSalary(staff.salary)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                          <button
                              onClick={() => handleEdit(staff)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition duration-150"
                              title="Edit"
                          >
                              <Edit3 className="w-4 h-4"/>
                          </button>
                          <button
                              onClick={() => handleDelete(staff._id, staff.firstName + ' ' + staff.lastName)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition duration-150"
                              title="Delete"
                          >
                              <Trash2 className="w-4 h-4"/>
                          </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
// -------------------------


// --- Main Parent Component: ManageStaff ---
const ManageStaff = () => {
  const [currentView, setCurrentView] = useState('view'); // 'view' or 'add'
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data function (centralized)
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/doctors');
      if (response.data.success) {
        setStaffList(response.data.data);
      } else {
        setError('Failed to fetch staff data.');
      }
    } catch (err) {
      setError(err.message || 'Server error while fetching data.');
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleEdit = (staff) => {
    // Implement your edit logic here (e.g., open a modal or navigate)
    console.log('Editing staff:', staff);
    alert(`Editing ${staff.firstName} ${staff.lastName}`);
  };

  const handleDelete = async (staffId, staffName) => {
    if (window.confirm(`Are you sure you want to delete ${staffName}?`)) {
      try {
        const response = await axios.delete(`/api/doctors/${staffId}`);
        if (response.data.success) {
          alert('Staff member deleted successfully.');
          fetchStaff(); // Refresh the list
        } else {
          alert('Failed to delete staff member.');
        }
      } catch (err) {
        alert('An error occurred while deleting.');
      }
    }
  };

  const switchView = (view) => {
      setCurrentView(view);
      setSearchQuery(''); // Clear search when switching views
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl bg-gray-50 min-h-screen">
        {/* Toggle Buttons Section */}
        <div className="flex mb-6 space-x-4">
            <button
                onClick={() => switchView('view')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition duration-200 ${
                    currentView === 'view'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
            >
                <Users className="w-5 h-5" />
                <span>View Staff Details</span>
            </button>
            <button
                onClick={() => switchView('add')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition duration-200 ${
                    currentView === 'add'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
            >
                <UserPlus className="w-5 h-5" />
                <span>Add Staff Member</span>
            </button>
        </div>
        
        {/* Content Area */}
        {currentView === 'view' ? (
            <ViewStaffList
                staffList={staffList}
                loading={loading}
                error={error}
                fetchStaff={fetchStaff}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleDelete={handleDelete}
                handleEdit={handleEdit}
            />
        ) : (
            <AddStaffForm onStaffAdded={fetchStaff} switchView={switchView} />
        )}

    </div>
  );
};

export default ManageStaff;