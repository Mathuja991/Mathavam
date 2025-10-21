import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faUser,
  faLock,
  faSpinner,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';

// Token එක අරගන්න helper function එක
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Auth token not found');
    // Handle redirect to login?
    return { headers: {} };
  }
  return {
    headers: {
      'x-auth-token': token,
    },
  };
};

// Message එකක් පෙන්වන පොඩි component එකක්
const AlertMessage = ({
  message,
  type,
}) => {
  if (!message) return null;
  const a = 'a';
  return (
    <div
      className={`p-3 rounded-md text-sm mb-4 ${
        type === 'success'
          ? 'bg-green-100 border border-green-300 text-green-800'
          : 'bg-red-100 border border-red-300 text-red-800'
      }`}
    >
      {message}
    </div>
  );
};

const AccountSettingsModal = ({
  isOpen,
  onClose,
  user,
  onUserUpdate,
}) => {
  // Username state
  const [username, setUsername] = useState(user?.username || '');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');

  // Password state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);

  // User prop එක වෙනස් වුණොත් username field එක update කරන්න
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  // Modal එක close කරද්දී messages clear කරන්න
  useEffect(() => {
    if (!isOpen) {
      setUsernameError('');
      setUsernameSuccess('');
      setPassError('');
      setPassSuccess('');
      setPassData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  }, [isOpen]);

  // --- Handlers ---

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameError('');
    setUsernameSuccess('');

    if (username === user.username) {
      setUsernameError('This is already your current username.');
      setUsernameLoading(false);
      return;
    }

    try {
      const res = await axios.put(
        '/api/users/update-username',
        { newUsername: username },
        getAuthConfig()
      );
      setUsernameSuccess(res.data.msg);
      // Parent component එකේ state සහ localStorage එක update කරන්න
      onUserUpdate(res.data.user);
    } catch (err) {
      setUsernameError(err.response?.data?.msg || 'An error occurred');
    } finally {
      setUsernameLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassError('');
    setPassSuccess('');

    try {
      const res = await axios.put(
        '/api/users/update-password',
        passData,
        getAuthConfig()
      );
      setPassSuccess(res.data.msg);
      // සාර්ථක වුණොත් form එක clear කරන්න
      setPassData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      setPassError(err.response?.data?.msg || 'An error occurred');
    } finally {
      setPassLoading(false);
    }
  };

  const handlePassChange = (e) => {
    setPassData({
      ...passData,
      [e.target.name]: e.target.value,
    });
  };

  // Modal එක පේන්නෙ නැත්නම් මොකුත් render කරන්න එපා
  if (!isOpen) {
    return null;
  }

  return (
    // Modal Overlay
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose} // Overlay එක click කරාම close වෙන්න
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Content එක click කරාම close නොවී ඉන්න
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            Account Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          {/* 1. Change Username Form */}
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <h4 className="font-semibold text-gray-700">Change Username</h4>
            <AlertMessage message={usernameError} type="error" />
            <AlertMessage message={usernameSuccess} type="success" />
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                New Username
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={usernameLoading}
              className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
            >
              {usernameLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                'Save Username'
              )}
            </button>
          </form>

          {/* Divider */}
          <hr />

          {/* 2. Change Password Form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <h4 className="font-semibold text-gray-700">Change Password</h4>
            <AlertMessage message={passError} type="error" />
            <AlertMessage message={passSuccess} type="success" />

            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Current Password
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={passData.currentPassword}
                  onChange={handlePassChange}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={passData.newPassword}
                  onChange={handlePassChange}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={passData.confirmNewPassword}
                  onChange={handlePassChange}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Show Password Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showPass"
                checked={showPass}
                onChange={() => setShowPass(!showPass)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="showPass"
                className="ml-2 block text-sm text-gray-700"
              >
                Show Passwords
              </label>
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
            >
              {passLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                'Save Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;