import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes,
    faUser,
    faLock,
    faSpinner,
    faEye,
    faEyeSlash,
    faCheckCircle,
    faCog,
} from '@fortawesome/free-solid-svg-icons';
import { getAuthConfig, API_BASE_URL } from '../util/apiUtils'; 

// --- Utility Components and Functions ---

const AlertMessage = ({ message, type }) => {
    if (!message) return null;
    const baseClasses = "p-3 rounded-lg flex items-center gap-3 font-medium text-sm break-words";
    const typeClasses = type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
    const icon = type === 'error' ? faTimes : faCheckCircle;
    return (
        <div className={`${baseClasses} ${typeClasses}`} role="alert">
            <FontAwesomeIcon icon={icon} className="flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
};

/**
 * Checks the strength of a password based on a defined policy.
 */
const checkPasswordStrength = (password, policy) => {
    if (!policy || typeof policy !== 'object') return 'Weak'; 

    let score = 0;
    const { minLength, requireCapital, requireLowercase, requireNumber, requireSymbol } = policy;

    if (password.length >= minLength) {
        score += 1;
        if (password.length > minLength + 2) {
            score += 1;
        }
    }

    if (requireCapital && /[A-Z]/.test(password)) score += 1;
    if (requireLowercase && /[a-z]/.test(password)) score += 1;
    if (requireNumber && /[0-9]/.test(password)) score += 1;
    if (requireSymbol && /[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score >= 5) {
        return 'Strong';
    } else if (score >= 3) {
        return 'Good';
    } else {
        return 'Weak';
    }
};

const getStrengthColor = (strength) => {
    switch (strength) {
        case 'Strong': return 'bg-green-500';
        case 'Good': return 'bg-yellow-500';
        case 'Weak': return 'bg-red-500';
        default: return 'bg-gray-300';
    }
};

const PasswordStrengthMeter = ({ password, policy }) => {
    const strength = useMemo(() => checkPasswordStrength(password, policy), [password, policy]);
    const color = getStrengthColor(strength);

    return (
        <div className="mt-1">
            <div className="h-1 bg-gray-200 rounded-full">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${color}`}
                    style={{ width: `${password.length === 0 ? 0 : (strength === 'Strong' ? 100 : strength === 'Good' ? 66 : 33)}%` }}
                />
            </div>
            <p className="text-xs mt-1 text-gray-500">
                Strength: <span className={`font-semibold ${color.replace('bg-', 'text-')}`}>{strength}</span>
            </p>
        </div>
    );
};

// --- Main Component ---
const AccountSettingsModal = ({
    isOpen,
    onClose,
    loggedInUser: user, 
    onUserUpdate,
    passwordPolicy, 
}) => {
    // 1. Username State
    const [username, setUsername] = useState(user?.username || '');
    const [usernameLoading, setUsernameLoading] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [usernameSuccess, setUsernameSuccess] = useState('');

    // 2. Password State
    const [passData, setPassData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [passLoading, setPassLoading] = useState(false);
    const [passError, setPassError] = useState('');
    const [passSuccess, setPassSuccess] = useState('');
    const [showPass, setShowPass] = useState(false);

    // Effect to update username field if user prop changes
    useEffect(() => {
        if (user?.username) {
            setUsername(user.username);
        }
    }, [user]);

    // Effect to clear messages when modal closes
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

    // Helper to extract error message safely
    const extractErrorMessage = (error, defaultMsg) => {
        console.log("Debugging Error Response:", error.response);
        
        if (error.response && error.response.data) {
            const data = error.response.data;
            
            // Handle { msg: "..." } pattern seen in your logs
            if (data.msg) return data.msg;
            
            if (typeof data === 'string') return data;
            if (data.message) return data.message;
            if (data.error) return data.error;
            
            return JSON.stringify(data);
        }
        
        return error.message || defaultMsg;
    };

    // --- Handlers ---

    // Handler for Username Update
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
                `${API_BASE_URL}/users/update-username`, 
                { newUsername: username },
                getAuthConfig()
            );

            setUsernameSuccess(res.data.msg || 'Username updated successfully!');
            onUserUpdate(res.data.user);
        } catch (error) {
            const msg = extractErrorMessage(error, 'Failed to update username.');
            setUsernameError(msg);
        } finally {
            setUsernameLoading(false);
        }
    };
    
    // Handler for Password Field Changes
    const handlePasswordChange = (e) => {
        setPassData({ ...passData, [e.target.name]: e.target.value });
    };

    // Handler for Password Update
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPassLoading(true);
        setPassError('');
        setPassSuccess('');

        const { currentPassword, newPassword, confirmNewPassword } = passData;

        // 1. Client-side Validation
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setPassError('All password fields must be filled.'); 
            setPassLoading(false);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setPassError('New password and confirmed new password do not match.'); 
            setPassLoading(false);
            return;
        }
        
        // Check new password strength/policy
        const strength = checkPasswordStrength(newPassword, passwordPolicy);
        if (strength === 'Weak') {
            setPassError('New password is too weak. Please meet the required criteria.'); 
            setPassLoading(false);
            return;
        }

        // 2. API Call
        try {
            // Send a comprehensive payload covering all common field naming conventions
            // to satisfy the backend validator.
            const payload = { 
                userId: user._id || user.id,
                
                // Standard variations for 'Current Password'
                currentPassword: currentPassword,
                oldPassword: currentPassword, 
                
                // Standard variations for 'New Password'
                newPassword: newPassword,
                
                // Standard variations for 'Confirm Password'
                confirmPassword: confirmNewPassword,
                confirmNewPassword: confirmNewPassword
            };
            
            console.log("Sending Comprehensive Password Update Payload:", payload);

            const res = await axios.put(
                `${API_BASE_URL}/users/update-password`, 
                payload,
                getAuthConfig()
            );
            
            setPassSuccess(res.data.msg || 'Password updated successfully!'); 
            
            // Clear password fields on success
            setPassData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
            
        } catch (error) {
            const msg = extractErrorMessage(error, 'Failed to update password. Please check your current password.');
            setPassError(msg);
        } finally {
            setPassLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 transform animate-[slideIn_0.3s_ease-out] max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <FontAwesomeIcon icon={faCog} className="text-blue-600" />
                        Account Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-red-500 rounded-full transition hover:bg-red-50"
                        aria-label="Close settings"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* 1. Change Username Form */}
                    <form onSubmit={handleUsernameSubmit} className="space-y-4">
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                            Change Username
                        </h4>
                        <AlertMessage message={usernameError} type="error" />
                        <AlertMessage message={usernameSuccess} type="success" />
                        
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                New Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
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
                            className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {usernameLoading ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                                'Save Username'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <hr className="border-slate-200" />

                    {/* 2. Change Password Form */}
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                            <FontAwesomeIcon icon={faLock} className="text-red-500" />
                            Change Password
                        </h4>
                        <AlertMessage message={passError} type="error" />
                        <AlertMessage message={passSuccess} type="success" />

                        {/* Current Password */}
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                                </div>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    minLength={passwordPolicy.minLength}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-600"
                                    onClick={() => setShowPass(!showPass)}
                                    aria-label={showPass ? "Hide Password" : "Show Password"}
                                >
                                    <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                                </div>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    id="newPassword"
                                    name="newPassword"
                                    value={passData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    minLength={passwordPolicy.minLength}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-600"
                                    onClick={() => setShowPass(!showPass)}
                                    aria-label={showPass ? "Hide Password" : "Show Password"}
                                >
                                    <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                                </button>
                            </div>
                            <PasswordStrengthMeter password={passData.newPassword} policy={passwordPolicy} />
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                                </div>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    value={passData.confirmNewPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    minLength={passwordPolicy.minLength}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-600"
                                    onClick={() => setShowPass(!showPass)}
                                    aria-label={showPass ? "Hide Password" : "Show Password"}
                                >
                                    <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={passLoading}
                            className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-red-600 text-white 
                                font-semibold rounded-lg shadow-md shadow-red-500/20 
                                hover:bg-red-700 hover:-translate-y-0.5 
                                active:translate-y-0 active:bg-red-800
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
        </div>
    );
};

export default AccountSettingsModal;