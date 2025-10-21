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

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Auth token not found');
    return { headers: {} };
  }
  return {
    headers: {
      'x-auth-token': token,
    },
  };
};

const AlertMessage = ({ message, type }) => {
  if (!message) return null;
  return (
    <div
      className={`p-3 rounded-lg border text-sm mb-4 font-medium ${
        type === 'success'
          ? 'bg-green-50 border-green-300 text-green-800'
          : 'bg-red-50 border-red-300 text-red-800'
      }`}
    >
      {message}
    </div>
  );
};

const AccountSettingsModal = ({ isOpen, onClose, user, onUserUpdate }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

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

  if (!isOpen) {
    return null;
  }

  return (
    // --- STYLE UPDATE: Added subtle animation ---
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 
                 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto
                   animate-[slideIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- STYLE UPDATE: Improved header padding and typography --- */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Account Settings
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        {/* --- STYLE UPDATE: Improved padding and spacing --- */}
        <div className="p-6 space-y-6">
          {/* 1. Change Username Form */}
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <h4 className="font-semibold text-slate-800">Change Username</h4>
            <AlertMessage message={usernameError} type="error" />
            <AlertMessage message={usernameSuccess} type="success" />
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-600 mb-1.5"
              >
                New Username
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                {/* --- STYLE UPDATE: Modern input styling --- */}
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg 
                             bg-slate-50 text-slate-900
                             focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             transition-all duration-150"
                  required
                />
              </div>
            </div>
            {/* --- STYLE UPDATE: Advanced interactive button style --- */}
            <button
              type="submit"
              disabled={usernameLoading}
              className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-blue-600 text-white 
                         font-semibold rounded-lg shadow-md shadow-blue-500/20 
                         hover:bg-blue-700 hover:-translate-y-0.5 
                         active:translate-y-0 active:bg-blue-800
                         disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none
                         transition-all duration-150"
            >
              {usernameLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                'Save Username'
              )}
            </button>
          </form>

          {/* --- STYLE UPDATE: Thinner divider --- */}
          <hr className="border-slate-200" />

          {/* 2. Change Password Form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <h4 className="font-semibold text-slate-800">Change Password</h4>
            <AlertMessage message={passError} type="error" />
            <AlertMessage message={passSuccess} type="success" />

            {/* --- STYLE UPDATE: Applied new input styles to all fields --- */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-slate-600 mb-1.5"
              >
                Current Password
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={passData.currentPassword}
                  onChange={handlePassChange}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg 
                             bg-slate-50 text-slate-900
                             focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             transition-all duration-150"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-600 mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={passData.newPassword}
                  onChange={handlePassChange}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg 
                             bg-slate-50 text-slate-900
                             focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             transition-all duration-150"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-slate-600 mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={passData.confirmNewPassword}
                  onChange={handlePassChange}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg 
                             bg-slate-50 text-slate-900
                             focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             transition-all duration-150"
                  required
                />
              </div>
            </div>

            {/* --- STYLE UPDATE: Improved checkbox styling --- */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showPass"
                checked={showPass}
                onChange={() => setShowPass(!showPass)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="showPass"
                className="ml-2 block text-sm text-slate-700"
              >
                Show Passwords
              </label>
            </div>

            {/* --- STYLE UPDATE: Applied advanced button style --- */}
            <button
              type="submit"
              disabled={passLoading}
              className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-blue-600 text-white 
                         font-semibold rounded-lg shadow-md shadow-blue-500/20 
                         hover:bg-blue-700 hover:-translate-y-0.5 
                         active:translate-y-0 active:bg-blue-800
                         disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none
                         transition-all duration-150"
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
      {/* --- CSS එකතු කිරීම (Animations සඳහා) --- */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-\\[fadeIn_0\\.2s_ease-out\\] { animation: fadeIn 0.2s ease-out; }
        .animate-\\[slideIn_0\\.3s_ease-out\\] { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default AccountSettingsModal;