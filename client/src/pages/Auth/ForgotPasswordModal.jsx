import React, { useMemo, useState } from "react";
import axios from "axios";
import {
    Eye,
    EyeOff,
    Lock,
    Mail,
    Loader2,
    AlertCircle,
    CheckCircle2,
    User,
    CreditCard,
    ArrowRight,
    ArrowLeft,
    X,
} from "lucide-react";

/**
 * A Modal component specifically for the Forgot Password flow.
 * (Props remain unchanged)
 */
const ForgotPasswordModal = ({ isOpen, onClose, policy, checkStrength, getStrengthColor }) => {
    const [forgotData, setForgotData] = useState({
        username: "",
        firstName: "",
        lastName: "",
        idNumber: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showPass, setShowPass] = useState(false);

    // ⭐ FIX 1: Add state to control the multi-step flow AND a state for tracking invalid fields
    const [currentStep, setCurrentStep] = useState(1);
    const [invalidFields, setInvalidFields] = useState({});

    const passwordStrength = useMemo(() => {
        if (!forgotData.newPassword || !checkStrength) return null;
        return checkStrength(forgotData.newPassword, policy);
    }, [forgotData.newPassword, policy, checkStrength]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForgotData((prev) => ({ ...prev, [name]: value }));
        setError("");
        setMessage("");
        // Clear the validation state for the field being typed into
        setInvalidFields((prev) => {
            const { [name]: _, ...rest } = prev;
            return rest;
        });
    };

    // ⭐ FIX 2: Refactor Handler to move from Step 1 (Verification) to Step 2 (Password)
    const handleNextStep = (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setInvalidFields({}); // Clear previous invalid fields

        const { username, firstName, lastName, idNumber } = forgotData;
        const missingFields = [];
        const newInvalidFields = {};

        // Detailed check for verification fields
        if (!username) { missingFields.push("Username"); newInvalidFields.username = true; }
        if (!firstName) { missingFields.push("First Name"); newInvalidFields.firstName = true; }
        if (!lastName) { missingFields.push("Last Name"); newInvalidFields.lastName = true; }
        if (!idNumber) { missingFields.push("ID Number"); newInvalidFields.idNumber = true; }

        if (missingFields.length > 0) {
            setError(`The following fields are required for verification: ${missingFields.join(", ")}.`);
            setInvalidFields(newInvalidFields);
            return;
        }

        // If validation passes, move to the next step
        setCurrentStep(2);
    };

    // Handler for the final form submission (Password Reset) - kept unchanged but added logic for invalidFields on password fields
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setInvalidFields({});
        const { username, firstName, lastName, idNumber, newPassword, confirmNewPassword } = forgotData;

        let passwordMissing = false;
        const newInvalidFields = {};
        
        // Check password fields for final submission
        if (!newPassword) { newInvalidFields.newPassword = true; passwordMissing = true; }
        if (!confirmNewPassword) { newInvalidFields.confirmNewPassword = true; passwordMissing = true; }
        
        if (passwordMissing) {
            setError("Both new password fields are required.");
            setInvalidFields(newInvalidFields);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError("New password and confirmation password do not match.");
            setInvalidFields({ newPassword: true, confirmNewPassword: true });
            return;
        }

        if (passwordStrength === 'Weak') {
            setError("The new password is too weak. Please meet all policy requirements.");
            setInvalidFields({ newPassword: true });
            return;
        }

        // Re-check verification fields just in case
        if (!username || !firstName || !lastName || !idNumber) {
            setError("Verification data is missing. Please go back to Step 1.");
            setCurrentStep(1);
            return;
        }

        setIsLoading(true);
        setMessage("Attempting to reset password...");
        // ... (axios call logic remains the same)
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
                {
                    username,
                    firstName,
                    lastName,
                    idNumber,
                    newPassword,
                },
                { timeout: 15000, withCredentials: false }
            );

            setMessage(response.data.message || "Password reset successfully. You can now login.");
            setForgotData((prev) => ({
                ...prev,
                newPassword: "",
                confirmNewPassword: "",
            }));
            setError("");
        } catch (err) {
            let msg = "Verification failed or an error occurred.";
            if (axios.isAxiosError(err)) {
                msg = err.response?.data?.message || err.message || msg;
            }
            setError(msg);
            setMessage("");
        } finally {
            setIsLoading(false);
        }
    };
    // ... (handleModalClose remains the same)
    const handleModalClose = () => {
        setForgotData({
            username: "",
            firstName: "",
            lastName: "",
            idNumber: "",
            newPassword: "",
            confirmNewPassword: "",
        });
        setCurrentStep(1);
        setError("");
        setMessage("");
        setInvalidFields({}); // Reset invalid fields
        onClose();
    }

    if (!isOpen) return null;

    // Helper function for applying conditional styles
    const getInputClasses = (fieldName) => {
        const baseClasses = "w-full rounded-xl border pl-12 pr-3 py-3 text-slate-900 shadow-sm outline-none transition";
        const themeClasses = "bg-white dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100";
        const focusClasses = "focus:ring-4";

        if (invalidFields[fieldName]) {
            return `${baseClasses} border-red-500 ${focusClasses} focus:border-red-500 focus:ring-red-500/20 ${themeClasses}`;
        }
        return `${baseClasses} border-slate-300 ${focusClasses} focus:border-blue-500 focus:ring-blue-500/20 ${themeClasses}`;
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={handleModalClose}
        >
            <div 
                className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b pb-4 mb-6 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Forgot Password - Step {currentStep} of 2
                    </h3>
                    <button
                        onClick={handleModalClose}
                        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {message && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-950/40 dark:text-green-200" role="status">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200" role="alert">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Conditional Form Rendering based on step */}
                <form onSubmit={currentStep === 1 ? handleNextStep : handlePasswordReset} className="space-y-5">
                    
                    {currentStep === 1 && (
                        <div className="space-y-5">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                **Step 1: Account Verification.** Please provide your full registered details to verify your identity.
                            </p>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="forgot-username" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Username (Email)</label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"><Mail className="size-4 text-slate-400" /></span>
                                        <input id="forgot-username" name="username" type="text" value={forgotData.username} onChange={handleChange} required
                                            className={getInputClasses("username")} // ⭐ FIX 3: Apply dynamic class
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="forgot-idNumber" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">ID Number</label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"><CreditCard className="size-4 text-slate-400" /></span>
                                        <input id="forgot-idNumber" name="idNumber" type="text" value={forgotData.idNumber} onChange={handleChange} required
                                            className={getInputClasses("idNumber")} // ⭐ FIX 3: Apply dynamic class
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="forgot-firstName" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">First Name</label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"><User className="size-4 text-slate-400" /></span>
                                        <input id="forgot-firstName" name="firstName" type="text" value={forgotData.firstName} onChange={handleChange} required
                                            className={getInputClasses("firstName")} // ⭐ FIX 3: Apply dynamic class
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="forgot-lastName" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Last Name</label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"><User className="size-4 text-slate-400" /></span>
                                        <input id="forgot-lastName" name="lastName" type="text" value={forgotData.lastName} onChange={handleChange} required
                                            className={getInputClasses("lastName")} // ⭐ FIX 3: Apply dynamic class
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                Next: Set Password <ArrowRight className="size-4" />
                            </button>
                        </div>
                    )}
                    
                    {currentStep === 2 && (
                        <div className="space-y-5">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                **Step 2: Set New Password.** Choose a strong password that meets the policy requirements below.
                            </p>
                            
                            <h4 className="pt-2 text-md font-semibold text-slate-900 dark:text-white">New Password Details</h4>
                            
                            <div className="text-xs text-slate-500 dark:text-slate-400 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                                <p className="font-medium mb-1">Policy: Min {policy.minLength}, Max {policy.maxLength}. Must include: Capital, Lowercase, Number, Symbol.</p>
                            </div>

                            <div>
                                <label htmlFor="forgot-newPassword" className="mb-1 flex justify-between items-baseline text-sm font-medium text-slate-700 dark:text-slate-200">
                                    New Password
                                    {forgotData.newPassword && getStrengthColor && (
                                        <span 
                                            className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStrengthColor(passwordStrength)}`}
                                        >
                                            {passwordStrength}
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"><Lock className="size-4 text-slate-400" /></span>
                                    <input id="forgot-newPassword" name="newPassword" type={showPass ? "text" : "password"} value={forgotData.newPassword} onChange={handleChange} required
                                        minLength={policy.minLength}
                                        maxLength={policy.maxLength}
                                        className={getInputClasses("newPassword")} // ⭐ Apply dynamic class
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass((s) => !s)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-600"
                                        aria-label={showPass ? "Hide password" : "Show password"}
                                    >
                                        {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="forgot-confirmNewPassword" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Confirm New Password</label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"><Lock className="size-4 text-slate-400" /></span>
                                    <input id="forgot-confirmNewPassword" name="confirmNewPassword" type={showPass ? "text" : "password"} value={forgotData.confirmNewPassword} onChange={handleChange} required
                                        className={getInputClasses("confirmNewPassword")} // ⭐ Apply dynamic class
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    <>Reset Password</>
                                )}
                            </button>
                            
                            <button
                                type="button" 
                                onClick={() => setCurrentStep(1)} 
                                className="w-full mt-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="size-4" /> Go Back to Verification
                            </button>
                        </div>
                    )}
                    
                    {/* The general Cancel button remains outside the conditional steps */}
                    <button type="button" onClick={handleModalClose} className="w-full mt-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        Cancel and return to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;