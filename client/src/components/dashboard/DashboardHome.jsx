import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';

// Imports from the newly created files
import { API_BASE_URL, getAuthConfig } from '../util/apiUtils';
import StaffDashboardContent from '../dashboard/StaffDashboardContent';
import ParentDashboardContent from '../dashboard/ParentDashboardContent';

/**
 * Main component to handle dashboard logic, API calls, and role-based content switching.
 * @param {object} loggedInUser - The user object containing userType, firstName, etc.
 */
const DashboardHome = ({ loggedInUser }) => {
  const [stats, setStats] = useState({
    totalPatients: null,
    appointmentsToday: null,
    pendingTasks: null,
    activeStaff: null,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Navigation handler to pass down to child components
  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  /**
   * Fetches the dashboard statistics from the API for staff roles.
   */
  useEffect(() => {
    // Only fetch stats for staff members
    if (loggedInUser && loggedInUser.userType !== 'Parent') {
      const fetchStats = async () => {
        setLoading(true);
        try {
          // Backend route: /api/users/dashboard/stats
          const res = await axios.get(`${API_BASE_URL}/users/dashboard/stats`, getAuthConfig());
          
          setStats({
            totalPatients: res.data.totalPatients,
            appointmentsToday: res.data.appointmentsToday,
            pendingTasks: res.data.pendingTasks,
            activeStaff: res.data.activeStaff,
          });

        } catch (error) {
          console.error('Error fetching dashboard stats:', error);
          setStats({
            totalPatients: 'Error',
            appointmentsToday: 'Error',
            pendingTasks: 'Error',
            activeStaff: 'Error',
          });
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    } else {
      // For Parents, no stats needed, just set loading to false
      setLoading(false);
    }
  }, [loggedInUser]);

  if (!loggedInUser) {
    return <div className="text-center p-8 text-gray-500">Loading user data...</div>;
  }

  // --- Role-Based Content Rendering ---
  const userRole = loggedInUser.userType || 'Unknown';

  if (loading && userRole !== 'Parent' && userRole !== 'Unknown') {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-indigo-500" />
        <p className="ml-4 text-xl text-indigo-700">Loading Dashboard...</p>
      </div>
    );
  }

  // Determine which dashboard content to render
  switch (userRole) {
    case 'Super Admin':
    case 'Admin':
    case 'Doctor':
    case 'Therapist':
      // All staff roles use the same administrative/clinical dashboard view
      return (
        <StaffDashboardContent
          stats={stats}
          handleNavigation={handleNavigation}
          loggedInUser={loggedInUser}
        />
      );
    case 'Parent':
      // The Parent role uses a tailored dashboard view
      return (
        <ParentDashboardContent
          handleNavigation={handleNavigation}
          loggedInUser={loggedInUser}
        />
      );
    default:
      // If the user role is not matched (e.g., 'Unknown' or an unrecognized role)
      return (
        <div className="p-8 bg-red-50 rounded-lg shadow-lg border border-red-300 mx-auto max-w-xl mt-10 text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-600 mb-4" />
          <h1 className="text-2xl font-bold text-red-800">Access Error</h1>
          <p className="mt-4 text-lg text-red-700">
            Error: No specific dashboard found for user type: <span className="font-extrabold">{userRole}</span>.
          </p>
          <p className="mt-4 text-gray-600">
            Please contact the Super Admin to configure access.
          </p>
        </div>
      );
  }
};

export default DashboardHome;