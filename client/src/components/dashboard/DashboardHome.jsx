
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';

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
    fetchError: false, 
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  /**
   * Fetches the dashboard statistics from the API for staff roles.
   */
  useEffect(() => {
    const userRoleLower = (loggedInUser?.userType || '').trim().toLowerCase();

    if (loggedInUser && userRoleLower !== 'parent' && userRoleLower) {
      const fetchStats = async () => {
        setLoading(true);
        setStats(prev => ({ ...prev, fetchError: false })); 

        try {
          const res = await axios.get(`${API_BASE_URL}/users/dashboard/stats`, getAuthConfig());
          
          setStats({
            totalPatients: res.data.totalPatients,
            appointmentsToday: res.data.appointmentsToday,
            pendingTasks: res.data.pendingTasks,
            activeStaff: res.data.activeStaff,
            fetchError: false,
          });

        } catch (error) {
          console.error('Error fetching dashboard stats:', error);
          setStats({
            totalPatients: null,
            appointmentsToday: null,
            pendingTasks: null,
            activeStaff: null,
            fetchError: true,
          });
          
          
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [loggedInUser]);

  if (!loggedInUser) {
    return <div className="text-center p-8 text-gray-500">Loading user data...</div>;
  }

  const userRole = (loggedInUser.userType || 'Unknown').trim().toLowerCase();

  if (loading && userRole !== 'parent' && userRole !== 'unknown' && userRole) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-indigo-500" />
        <p className="ml-4 text-xl text-indigo-700">Loading Dashboard...</p>
      </div>
    );
  }

  switch (userRole) {
    case 'super admin':
    case 'admin':
    case 'doctor':
    case 'therapist':
    case 'therapists':
      return (
        <StaffDashboardContent
          stats={stats}
          handleNavigation={handleNavigation}
          loggedInUser={loggedInUser}
        />
      );
    case 'parent':
      return (
        <ParentDashboardContent
          handleNavigation={handleNavigation}
          loggedInUser={loggedInUser}
        />
      );
    default:
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