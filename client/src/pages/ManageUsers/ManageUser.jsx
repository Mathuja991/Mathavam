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

    const getAuthConfig = useCallback(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error(
                "ManageUser: Auth token not found in localStorage. Navigating to login."
            );
            navigate("/?message=no_token");
            return null;
        }
        return {
            headers: {
                "x-auth-token": token,
            },
        };
    }, [navigate]);

    const fetchUsers = useCallback(async () => {
        const config = getAuthConfig();
        if (!config) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/users`,
                config
            );
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError("Your session may have expired. Please log in again.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/?message=session_expired");
            } else {
                setError("Failed to load users.");
                console.error(
                    "Error fetching users:",
                    err.response ? err.response.data : err.message
                );
            }
            setLoading(false);
        }
    }, [getAuthConfig, navigate]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (userId) => {
        const config = getAuthConfig();
        if (!config) {
            setError("Authentication required to delete users.");
            return;
        }

        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                setMessage("");
                setError("");
                await axios.delete(
                    `${import.meta.env.VITE_API_URL}/users/${userId}`,
                    config
                );
                setMessage("User deleted successfully.");
                setTimeout(() => {
                    fetchUsers();
                    setMessage("");
                }, 1500);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setError("Your session may have expired. Please log in again.");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/?message=session_expired");
                } else {
                    setError("Failed to delete user.");
                    console.error(
                        "Error deleting user:",
                        err.response ? err.response.data : err.message
                    );
                }
            }
        }
    };

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
        const searchInput = document.querySelector(
            'input[placeholder="Search users..."]'
        );
        if (searchInput) searchInput.value = "";
        
        setSearchTerm("");
        setFilterUserType("");
        setSortConfig({ key: "firstName", direction: "ascending" });
    };

    const getUserTypeBadgeClasses = (userType) => {
        switch (userType) {
            case "Super Admin":
                return "bg-pink-600 text-white font-bold";
            case "Admin":
                return "bg-indigo-500 text-white font-semibold";
            case "Doctor":
                return "bg-teal-500 text-white font-semibold";
            case "Therapist":
                return "bg-cyan-500 text-white";
            case "Resource Person":
                return "bg-yellow-500 text-gray-900";
            case "Parent":
                return "bg-gray-400 text-gray-800";
            default:
                return "bg-gray-200 text-gray-800";
        }
    };


    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl shadow-xl">
                <svg
                    className="animate-spin h-8 w-8 text-indigo-500 mb-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <p className="text-gray-600 text-lg font-medium">Loading user data...</p>
                <p className="text-sm text-gray-400 mt-1">Please wait a moment.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 border-2 border-red-400 rounded-xl shadow-xl text-red-800 text-center">
                <svg
                    className="w-10 h-10 mx-auto text-red-500 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                <p className="text-xl font-bold mb-2">Authentication Error</p>
                <p className="text-lg">{error}</p>
                <button
                    onClick={() => navigate("/")}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                >
                    Go to Login Page
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-8 bg-white rounded-3xl shadow-2xl font-['Inter',_sans-serif]">
            <div className="flex flex-col sm:flex-row justify-between items-center pb-6 mb-6 border-b border-gray-100 gap-4">
                <h1 className="text-4xl font-extrabold text-indigo-800 tracking-tight">
                    <i className="fas fa-users mr-2 text-indigo-600"></i> Manage Users
                </h1>
                <div className="flex gap-4">
                    <button
                        onClick={handleAddNewUserClick}
                        className="flex items-center px-6 py-2 bg-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-teal-400/50 hover:bg-teal-700 transition duration-300 transform hover:scale-[1.02]"
                    >
                        <span className="text-xl mr-2">+</span> Add New User
                    </button>
                    <button
                        onClick={resetFilters}
                        className="flex items-center px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-xl shadow-md hover:bg-gray-300 transition duration-300"
                    >
                        Reset Filters <i className="fas fa-sync-alt ml-2"></i>
                    </button>
                </div>
            </div>

            {message && (
                <div className="mb-6 p-4 text-center text-lg font-medium text-teal-800 bg-teal-100 border border-teal-300 rounded-xl shadow-md animate-fade-in-down">
                    {message}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6 p-6 mb-8 rounded-2xl bg-indigo-50/70 shadow-inner">
                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-indigo-800">
                        Search by Details
                    </label>
                    <input
                        type="text"
                        placeholder="Search users..."
                        onChange={handleSearchChange}
                        className="px-4 py-2 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition duration-200 shadow-sm"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-indigo-800">
                        Filter by User Type
                    </label>
                    <select
                        value={filterUserType}
                        onChange={(e) => setFilterUserType(e.target.value)}
                        className="px-4 py-2 border-2 border-indigo-200 rounded-xl appearance-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition duration-200 shadow-sm bg-white"
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
                    <label className="mb-2 text-sm font-semibold text-indigo-800">
                        Sort By
                    </label>
                    <div className="flex gap-3">
                        <select
                            value={sortConfig.key}
                            onChange={(e) => requestSort(e.target.value)}
                            className="flex-1 px-4 py-2 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition duration-200 shadow-sm bg-white"
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
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition duration-300 shadow-md"
                        >
                            {sortConfig.direction === "ascending" ? "Asc ▲" : "Desc ▼"}
                        </button>
                    </div>
                </div>
            </div>

            {loading && filteredAndSortedUsers.length > 0 && (
                <p className="text-center text-indigo-500 font-medium py-3 animate-pulse">
                    Updating user list...
                </p>
            )}
            {!loading && filteredAndSortedUsers.length === 0 ? (
                <div className="text-gray-600 text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <p className="text-2xl font-semibold mb-2">No Users Found</p>
                    <p>
                        The current search and filter criteria yielded no results. Try
                        resetting the filters.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl shadow-xl border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-indigo-500 to-indigo-600 sticky top-0 z-10 text-white shadow-lg">
                                <th
                                    className="p-4 font-bold text-lg cursor-pointer hover:bg-indigo-700 transition duration-150 rounded-tl-2xl"
                                    onClick={() => requestSort("firstName")}
                                >
                                    First Name {getSortIndicator("firstName")}
                                </th>
                                <th
                                    className="p-4 font-bold text-lg cursor-pointer hover:bg-indigo-700 transition duration-150"
                                    onClick={() => requestSort("lastName")}
                                >
                                    Last Name {getSortIndicator("lastName")}
                                </th>
                                <th
                                    className="p-4 font-bold text-lg cursor-pointer hover:bg-indigo-700 transition duration-150"
                                    onClick={() => requestSort("idNumber")}
                                >
                                    ID Number {getSortIndicator("idNumber")}
                                </th>
                                <th
                                    className="p-4 font-bold text-lg cursor-pointer hover:bg-indigo-700 transition duration-150"
                                    onClick={() => requestSort("userType")}
                                >
                                    User Type {getSortIndicator("userType")}
                                </th>
                                <th
                                    className="p-4 font-bold text-lg cursor-pointer hover:bg-indigo-700 transition duration-150"
                                    onClick={() => requestSort("username")}
                                >
                                    Username {getSortIndicator("username")}
                                </th>
                                <th
                                    className="p-4 font-bold text-lg cursor-pointer hover:bg-indigo-700 transition duration-150"
                                    onClick={() => requestSort("childRegNo")}
                                >
                                    Child Reg No. {getSortIndicator("childRegNo")}
                                </th>
                                <th className="p-4 font-bold text-lg text-center rounded-tr-2xl">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedUsers.map((user, idx) => (
                                <tr
                                    key={user._id}
                                    className={`border-b border-gray-100 text-gray-800 ${
                                        idx % 2 === 0
                                            ? "bg-white"
                                            : "bg-indigo-50/50" 
                                    } hover:bg-indigo-100/70 transition duration-300`}
                                >
                                    <td className="p-4 font-medium">{user.firstName}</td>
                                    <td className="p-4 font-medium">{user.lastName}</td>
                                    <td className="p-4 text-gray-600 font-mono text-sm">
                                        {user.idNumber}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-block px-3 py-1 text-xs rounded-full shadow-sm ${getUserTypeBadgeClasses(
                                                user.userType
                                            )}`}
                                        >
                                            {user.userType}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 italic">
                                        {user.username}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 font-mono">
                                        {user.childRegNo || (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 space-x-3 text-center">

                                    
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="px-4 py-1.5 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-200 transform hover:scale-[1.05]"
                                            aria-label={`Delete user ${user.username}`}
                                        >
                                            <i className="fas fa-trash-alt mr-1"></i> Delete
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