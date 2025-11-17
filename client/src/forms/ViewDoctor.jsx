import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Users, AlertTriangle, CheckCircle, Loader, X, Edit3, Trash2, Search, UserCheck, Calendar, BookOpen, Star } from 'lucide-react';

// Utility function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
};

// Utility function to format salary
const formatSalary = (salary) => {
  if (salary === null || salary === undefined) return 'N/A';
  return `LKR ${Number(salary).toLocaleString('en-US')}`;
};

const ViewDoctor = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data function (uses original /api/doctors endpoint)
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

  // Memoized filtered staff list
  const filteredStaff = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) {
      return staffList;
    }
    return staffList.filter((staff) => {
      const fullName = `${staff.firstName || ''} ${staff.lastName || ''}`.toLowerCase();
      return (
        fullName.includes(query) ||
        (staff.role && staff.role.toLowerCase().includes(query)) ||
        (staff.doctorId && staff.doctorId.toLowerCase().includes(query)) || // Search by Staff ID
        (staff.doctorEmail && staff.doctorEmail.toLowerCase().includes(query)) ||
        (staff.doctorPhone && staff.doctorPhone.includes(query)) ||
        (staff.qualification && staff.qualification.toLowerCase().includes(query))
      );
    });
  }, [staffList, searchQuery]);

  // TODO: Implement Edit and Delete handlers
  const handleEdit = (staff) => {
    console.log('Editing staff:', staff);
    // Placeholder: You would typically open a modal or navigate to an edit page
    alert(`Editing ${staff.firstName} ${staff.lastName}`);
  };

  const handleDelete = async (staffId, staffName) => {
    console.log('Deleting staff ID:', staffId);
    // Placeholder: Implement confirmation
    if (window.confirm(`Are you sure you want to delete ${staffName}?`)) {
      try {
        // Note: Using window.confirm is not ideal, replace with a modal
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

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-200">
          <Users className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Staff</h1>
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
    </div>
  );
};

export default ViewDoctor;