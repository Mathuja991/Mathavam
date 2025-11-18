// Note: Please configure this base URL in your environment variables (.env)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Retrieves the authorization configuration with the token from local storage.
 * @returns {object} Auth headers config.
 */
export const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Auth token not found');
    return { headers: {} };
  }
  return {
    headers: {
      // This header is used by your existing utility/middleware
      'x-auth-token': token,
    },
  };
};