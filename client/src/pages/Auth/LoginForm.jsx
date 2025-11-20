
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Eye,
    EyeOff,
    Lock,
    Mail,
    Loader2,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import logo from "../../assets/mathavam-logo.png";
import ForgotPasswordModal from "./ForgotPasswordModal";

const passwordPolicy = {
    minLength: 6,
    maxLength: 12,
    requireCapital: true,
    requireLowercase: true,
    requireNumber: true,
    requireSymbol: true,
};

/**
 * Checks the strength of a password based on a defined policy.
 * @param {string} password The password string.
 * @param {object} policy The password policy object.
 * @returns {('Weak'|'Good'|'Strong')} The calculated strength.
 */
const checkPasswordStrength = (password, policy) => {
    if (password.length < policy.minLength) return 'Weak';
    
    let score = 0;
    const { minLength, requireCapital, requireLowercase, requireNumber, requireSymbol } = policy;

    score += (password.length >= minLength && password.length <= policy.maxLength) ? 1 : 0;
    
    if (requireCapital && /[A-Z]/.test(password)) score += 1;
    if (requireLowercase && /[a-z]/.test(password)) score += 1;
    if (requireNumber && /[0-9]/.test(password)) score += 1;
    if (requireSymbol && /[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score === 5) {
        return 'Strong';
    } else if (score >= 3) {
        return 'Good';
    } else {
        return 'Weak';
    }
};

const getStrengthColor = (strength) => {
    switch (strength) {
        case 'Strong':
            return 'text-green-600 dark:text-green-400 border-green-400 bg-green-50 dark:bg-green-950/40';
        case 'Good':
            return 'text-yellow-600 dark:text-yellow-400 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/40';
        case 'Weak':
        default:
            return 'text-red-600 dark:text-red-400 border-red-400 bg-red-50 dark:bg-red-950/40';
    }
}


export default function LoginForm() {
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const redirect = search.get("redirect") || "/dashboard";

    const [formData, setFormData] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [capsLockOn, setCapsLockOn] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [remember, setRemember] = useState(() => {
        return localStorage.getItem("remember_username") ? true : false;
    });

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem("remember_username");
        if (saved) {
            setFormData((f) => ({ ...f, username: saved }));
        }
    }, []);

    const errors = useMemo(() => {
        const e = {};
        if (!formData.username.trim()) e.username = "Username is required";
        if (!formData.password) e.password = "Password is required";
        return e;
    }, [formData.username, formData.password]);

    const hasErrors = Object.keys(errors).length > 0;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const onKeyEvent = (e) => {
        if (e.getModifierState) {
            setCapsLockOn(e.getModifierState("CapsLock"));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (hasErrors) {
            if (errors.username) usernameRef.current?.focus();
            else passwordRef.current?.focus();
            return;
        }

        setIsLoading(true);
        setMessage("Signing you in...");

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/login`,
                formData,
                { timeout: 15000, withCredentials: false }
            );

            const { token, user, requiresPasswordReset } = response.data || {};

            if (!token) throw new Error("Missing token in response");

            const canManageUsers = user.userType === "Super Admin" || user.userType === "Admin";

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user || {}));
            localStorage.setItem("canManageUsers", canManageUsers);

            if (remember) {
                localStorage.setItem("remember_username", formData.username);
            } else {
                localStorage.removeItem("remember_username");
            }

            setMessage("Login successful. Redirecting...");

            if (requiresPasswordReset) {
                navigate("/reset-password");
            } else {
                navigate(redirect);
            }
        } catch (err) {
            let msg = "Invalid username or password.";
            if (axios.isAxiosError(err)) {
                msg = err.response?.data?.message || err.message || msg;
            } else if (err instanceof Error) {
                msg = err.message || msg;
            }
            setError(msg);
            setMessage("");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center py-10 px-4">
            <div className="mx-auto grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/10 md:grid-cols-2">
                <div className="relative hidden h-full bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-white md:flex md:flex-col md:items-center md:justify-center">
                    <img
                        src={logo}
                        alt="Mathavam"
                        className="mb-8 w-56 drop-shadow-xl select-none"
                        draggable={false}
                    />
                    <h1 className="text-center text-3xl font-bold tracking-tight drop-shadow-sm md:text-4xl">
                        Welcome to Mathavam
                    </h1>
                    <p className="mt-4 max-w-sm text-center text-blue-100">
                        Sign in to continue to your dashboard and manage your learning
                        journey.
                    </p>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,.15),transparent_50%),radial-gradient(circle_at_80%_90%,rgba(255,255,255,.08),transparent_50%)]" />
                </div>

                <div className="flex flex-col justify-center p-8 md:p-12">
                    <div className="mx-auto w-full max-w-sm">
                        <div className="mb-6 flex items-center gap-3 md:hidden">
                            <img src={logo} alt="Mathavam" className="h-10 w-auto" />
                            <span className="text-xl font-semibold dark:text-slate-100">
                                Mathavam
                            </span>
                        </div>

                        <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                            Login to your account
                        </h2>
                        <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            Enter your credentials below.
                        </p>

                        {message && (
                            <div
                                className="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-200"
                                role="status"
                            >
                                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                                <span>{message}</span>
                            </div>
                        )}

                        {error && (
                            <div
                                className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200"
                                role="alert"
                            >
                                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            <div>
                                <label
                                    htmlFor="username"
                                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                                >
                                    Username
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                                        <Mail className="size-4 text-slate-400" />
                                    </span>
                                    <input
                                        ref={usernameRef}
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        inputMode="email"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-300 bg-white pl-12 pr-3 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                        aria-invalid={!!errors.username}
                                        aria-describedby={errors.username ? "username-error" : undefined}
                                    />
                                </div>
                                {errors.username && (
                                    <p id="username-error" className="mt-1 text-sm text-red-600">
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                                        <Lock className="size-4 text-slate-400" />
                                    </span>
                                    <input
                                        ref={passwordRef}
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onKeyUp={onKeyEvent}
                                        onKeyDown={onKeyEvent}
                                        onFocus={onKeyEvent}
                                        className="w-full rounded-xl border border-slate-300 bg-white pl-12 pr-10 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                        aria-invalid={!!errors.password}
                                        aria-describedby={
                                            errors.password || capsLockOn ? "password-hint" : undefined
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-700"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                                {(errors.password || capsLockOn) && (
                                    <p id="password-hint" className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                                        {errors.password ? errors.password : "Caps Lock is ON"}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
                                    />
                                    Remember my username
                                </label>
                                
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPasswordOpen(true)}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>Sign in</>
                                )}
                            </button>

                            {!error && !isLoading && message && (
                                <div className="flex items-center justify-center gap-2 pt-2 text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="size-4" />
                                    <span className="text-sm">Authenticated</span>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            <ForgotPasswordModal
                isOpen={isForgotPasswordOpen}
                onClose={() => setIsForgotPasswordOpen(false)}
                policy={passwordPolicy}
                checkStrength={checkPasswordStrength}
                getStrengthColor={getStrengthColor}
            />
        </div>
    );
}