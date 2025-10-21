import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";

export default function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUserType, setFilterUserType] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "firstName",
    direction: "ascending",
  });

  const navigate = useNavigate();

  // --- 1. Token එක ලබාගෙන Header එක සෑදීමේ Function එක ---
  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    
    // --- DEBUG LOG ---
    console.log("ManageUser - Token from localStorage:", token ? `Token found (length: ${token.length})` : "Token NOT FOUND"); 
    
    if (!token) {
      console.error("ManageUser: Auth token not found in localStorage. Navigating to login.");
      // Token එක නැත්නම් Login එකට යැවීම
      navigate('/?message=no_token'); 
      return null;
    }
    // Token එක header එකට දමා return කිරීම
    return {
      headers: {
        'x-auth-token': token, 
      },
    };
  }, [navigate]); 

  // --- 2. Users ලැයිස්තුව ලබාගැනීමේ Function එක ---
  const fetchUsers = useCallback(async () => { 
    // මුලින්ම Auth Config එක ලබාගැනීම
    const config = getAuthConfig(); 
    // Config එක null නම් (Token නැත්නම්), function එක නතර කිරීම
    if (!config) { 
      setLoading(false); 
      return; 
    }

    try {
      setLoading(true); 
      setError("");
      // --- axios GET request එකට config එක (Header සහිතව) යැවීම ---
      const response = await axios.get("http://localhost:5000/api/users", config); 
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      // 401 Unauthorized error එක handle කිරීම
      if (err.response && err.response.status === 401) {
          setError("Your session may have expired. Please log in again.");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/?message=session_expired');
      } else {
         setError("Failed to load users.");
         console.error("Error fetching users:", err.response ? err.response.data : err.message);
      }
      setLoading(false);
    }
  }, [getAuthConfig, navigate]); 

  // Component එක load වූ විට fetchUsers call කිරීම
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); 

  // --- 3. User ව Delete කිරීමේ Function එක ---
  const handleDelete = async (userId) => {
    // Auth Config එක ලබාගැනීම
    const config = getAuthConfig(); 
    if (!config) {
        setError("Authentication required to delete users.");
        return; 
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setMessage("");
        setError(""); 
        // --- axios DELETE request එකට config එක (Header සහිතව) යැවීම ---
        await axios.delete(`http://localhost:5000/api/users/${userId}`, config); 
        setMessage("User deleted successfully.");
        // Delete කළ පසු නැවත list එක load කිරීම
        setTimeout(() => {
          fetchUsers(); 
        }, 1500); 
      } catch (err) {
        // 401 Unauthorized error එක handle කිරීම
         if (err.response && err.response.status === 401) {
             setError("Your session may have expired. Please log in again.");
             localStorage.removeItem('token');
             localStorage.removeItem('user');
             navigate('/?message=session_expired');
         } else {
             setError("Failed to delete user.");
             console.error("Error deleting user:", err.response ? err.response.data : err.message);
         }
      }
    }
  };

  // --- අනෙකුත් Functions (වෙනස් කර නැත) ---
  const handleEdit = (userId) => {
    navigate(`/dashboard/manage-users/edit/${userId}`);
  };

  const handleAddNewUserClick = () => {
    navigate("/dashboard/manage-users/add");
  };

  const userTypeOptions = [
    "Super Admin",
    "Admin",
    "Doctor",
    "Therapist",
    "Resource Person",
    "Parent",
  ];

  const debouncedSearch = useCallback(
    debounce((val) => setSearchTerm(val), 400),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const filteredAndSortedUsers = useMemo(() => {
    let currentUsers = [...users];
    if (filterUserType) {
      currentUsers = currentUsers.filter(
        (user) => user.userType === filterUserType
      );
    }
    if (searchTerm) {
      const lowercased = searchTerm.toLowerCase();
      currentUsers = currentUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(lowercased) ||
          user.lastName.toLowerCase().includes(lowercased) ||
          user.idNumber.toLowerCase().includes(lowercased) ||
          user.userType.toLowerCase().includes(lowercased) ||
          user.username.toLowerCase().includes(lowercased) ||
          (user.childRegNo &&
            user.childRegNo.toLowerCase().includes(lowercased))
      );
    }
    if (sortConfig.key) {
      currentUsers.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return currentUsers;
  }, [users, searchTerm, filterUserType, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " ▲" : " ▼";
    }
    return "";
  };

  const resetFilters = () => {
    const searchInput = document.querySelector('input[placeholder="Search users..."]');
    if (searchInput) searchInput.value = ""; 
    setSearchTerm("");
    setFilterUserType("");
    setSortConfig({ key: "firstName", direction: "ascending" });
  };

  // --- Render Logic (වෙනස් කර නැත) ---
  if (loading && users.length === 0) { 
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 text-lg animate-pulse">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center">
        <p className="font-semibold">Error:</p>
        <p>{error}</p>
         <button 
           onClick={() => navigate('/')} 
           className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
         >
           Go to Login
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
        <div className="flex gap-3">
          <button
            onClick={handleAddNewUserClick}
            className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:scale-105 hover:bg-green-700 transition"
          >
            + Add New User
          </button>
          <button
            onClick={resetFilters}
            className="px-5 py-2 bg-gray-500 text-white rounded-lg shadow hover:scale-105 hover:bg-gray-600 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Success Message */}
      {message && (
        <div className="mb-5 p-3 text-green-800 bg-green-100 border border-green-300 rounded-md text-center animate-fade-in">
          {message}
        </div>
      )}

      {/* Filter Section */}
      <div className="grid md:grid-cols-3 gap-5 p-5 mb-6 border rounded-xl bg-gray-50 shadow-sm">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            type="text"
            placeholder="Search users..."
            onChange={handleSearchChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">
            Filter by User Type
          </label>
          <select
            value={filterUserType}
            onChange={(e) => setFilterUserType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            <option value="">All User Types</option>
            {userTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              value={sortConfig.key}
              onChange={(e) => requestSort(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="firstName">First Name</option>
              <option value="lastName">Last Name</option>
              <option value="idNumber">ID Number</option>
              <option value="userType">User Type</option>
              <option value="username">Username</option>
              <option value="childRegNo">Child Reg No.</option>
            </select>
            <button
              onClick={() =>
                setSortConfig((prev) => ({
                  ...prev,
                  direction:
                    prev.direction === "ascending" ? "descending" : "ascending",
                }))
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:scale-105 hover:bg-blue-700 transition"
            >
              {sortConfig.direction === "ascending" ? "Asc ▲" : "Desc ▼"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading && <p className="text-center text-gray-500 py-4">Updating user list...</p>} 
      {!loading && filteredAndSortedUsers.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No users found matching your criteria.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-blue-200 sticky top-0 z-10"> 
                 <th
                  className="p-4 font-semibold text-gray-800 cursor-pointer"
                  onClick={() => requestSort("firstName")}
                >
                  First Name {getSortIndicator("firstName")}
                </th>
                <th
                  className="p-4 font-semibold text-gray-800 cursor-pointer"
                  onClick={() => requestSort("lastName")}
                >
                  Last Name {getSortIndicator("lastName")}
                </th>
                <th
                  className="p-4 font-semibold text-gray-800 cursor-pointer"
                  onClick={() => requestSort("idNumber")}
                >
                  ID Number {getSortIndicator("idNumber")}
                </th>
                <th
                  className="p-4 font-semibold text-gray-800 cursor-pointer"
                  onClick={() => requestSort("userType")}
                >
                  User Type {getSortIndicator("userType")}
                </th>
                <th
                  className="p-4 font-semibold text-gray-800 cursor-pointer"
                  onClick={() => requestSort("username")}
                >
                  Username {getSortIndicator("username")}
                </th>
                <th
                  className="p-4 font-semibold text-gray-800 cursor-pointer"
                  onClick={() => requestSort("childRegNo")}
                >
                  Child Reg No. {getSortIndicator("childRegNo")}
                </th>
                <th className="p-4 font-semibold text-gray-800 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map((user, idx) => (
                <tr
                  key={user._id}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="p-4">{user.firstName}</td>
                  <td className="p-4">{user.lastName}</td>
                  <td className="p-4">{user.idNumber}</td>
                  <td className="p-4">{user.userType}</td>
                  <td className="p-4">{user.username}</td>
                  <td className="p-4">{user.childRegNo || "N/A"}</td>
                  <td className="p-4 space-x-2 text-center">
                    <button
                      onClick={() => handleEdit(user._id)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:scale-105 hover:bg-yellow-600 transition"
                      aria-label={`Edit user ${user.username}`} 
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:scale-105 hover:bg-red-700 transition"
                      aria-label={`Delete user ${user.username}`} 
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
  );
}