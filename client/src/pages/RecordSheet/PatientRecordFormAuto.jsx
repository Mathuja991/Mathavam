import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';

import Part1PatientInfoAuto from './Part1PatientInfoAuto'; // Import the Auto version
import Part2History from './Part2History';
import Part3Diagnosis from './Part3Diagnosis';
import Part4Management from './Part4Management';

const PatientRecordFormAuto = () => {

    const { id } = useParams();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Edit and View mode states
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);

    const topOfFormRef = useRef(null);

    // Auth Token helper
    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Auth token not found in localStorage');
            setError('Authentication token not found. Please log in again.');
            return { headers: {} };
        }
        return {
            headers: {
                'x-auth-token': token,
            },
        };
    };

    // Auto-generate ID logic
    useEffect(() => {
        if (!id && !isEditMode && !isViewMode) {
            const fetchLatestId = async () => {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_URL}/patientRecords`,
                        getAuthConfig()
                    );
                    const records = response.data;

                    // Determine target year (start from 2026 as requested)
                    const currentYear = new Date().getFullYear();
                    const targetYear = Math.max(currentYear, 2026);
                    const prefix = `${targetYear}/M/`;

                    let maxSeq = 0;
                    records.forEach(record => {
                        if (record.childNo && record.childNo.startsWith(prefix)) {
                            const parts = record.childNo.split('/');
                            if (parts.length === 3) {
                                const seq = parseInt(parts[2]);
                                if (!isNaN(seq) && seq > maxSeq) {
                                    maxSeq = seq;
                                }
                            }
                        }
                    });

                    const nextSeq = maxSeq + 1;
                    const nextId = `${prefix}${nextSeq.toString().padStart(3, '0')}`;

                    setFormData(prev => ({ ...prev, childNo: nextId }));
                } catch (err) {
                    console.error('Error generating new ID:', err);
                    // Fallback or error handling if needed
                }
            };
            fetchLatestId();
        }
    }, [id, isEditMode, isViewMode]);


    // Data Fetching (Edit and View)
    useEffect(() => {
        if (id) {
            if (location.pathname.includes('/view/')) {
                setIsViewMode(true);
                setIsEditMode(false);
            } else if (location.pathname.includes('/edit/')) {
                setIsViewMode(false);
                setIsEditMode(true);
            }

            setLoading(true);
            const fetchPatientData = async () => {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_URL}/patientRecords/${id}`,
                        getAuthConfig()
                    );
                    setFormData(response.data);
                    setLoading(false);
                } catch (err) {
                    console.error('Error fetching patient data:', err);
                    setError('Failed to load patient data.');
                    setLoading(false);
                }
            };
            fetchPatientData();
        } else {
            setIsEditMode(false);
            setIsViewMode(false);
            // Note: We don't load from localStorage for auto-ID form to prevent stale IDs
        }
    }, [id, location.pathname]);

    // Scroll to Top
    useEffect(() => {
        if (topOfFormRef.current) {
            topOfFormRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [step]);

    const handleChange = (e) => {
        if (isViewMode) return;

        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNestedChange = (path, e) => {
        if (isViewMode) return;

        const { name, value, type, checked } = e.target;
        setFormData(prevData => {
            const newData = { ...prevData };
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (!current[key]) {
                    current[key] = {};
                }
                if (i < keys.length - 1) {
                    current = current[key];
                } else {
                    current[key] = {
                        ...current[key],
                        [name]: type === 'checkbox' ? checked : value
                    };
                }
            }
            return newData;
        });
    };

    const nextStep = () => {
        setStep(prevStep => prevStep + 1);
    };

    const prevStep = () => {
        setStep(prevStep => prevStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isViewMode) {
            console.log("Cannot submit in view mode.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        const authConfig = getAuthConfig();
        if (!authConfig.headers['x-auth-token']) {
            setLoading(false);
            return;
        }

        try {
            const backendUrl = `${import.meta.env.VITE_API_URL}/patientRecords`;
            let response;

            if (isEditMode) {
                response = await axios.put(`${backendUrl}/${id}`, formData, authConfig);
                alert('Patient record updated successfully!');
            } else {
                response = await axios.post(backendUrl, formData, authConfig);
                alert('Patient record submitted successfully!');
            }

            setSuccess(true);
            setFormData({});
            setStep(1);
            // Re-fetch ID for next entry if needed, but usually we redirect or reset
            // For now, just reset form. User might need to refresh to get next ID or we can re-trigger ID fetch.

        } catch (err) {
            console.error('Error submitting form:', err.response ? err.response.data : err.message);
            const errorMsg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'An unexpected error occurred.';
            setError(errorMsg);
            alert('Error submitting form: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Part1PatientInfoAuto
                        formData={formData}
                        handleChange={handleChange}
                        nextStep={nextStep}
                        readOnly={isViewMode}
                    />
                );
            case 2:
                return (
                    <Part2History
                        formData={formData}
                        handleChange={handleChange}
                        handleNestedChange={handleNestedChange}
                        nextStep={nextStep}
                        prevStep={prevStep}
                        readOnly={isViewMode}
                    />
                );
            case 3:
                return (
                    <Part3Diagnosis
                        formData={formData}
                        handleChange={handleChange}
                        handleNestedChange={handleNestedChange}
                        nextStep={nextStep}
                        prevStep={prevStep}
                        readOnly={isViewMode}
                    />
                );
            case 4:
                return (
                    <Part4Management
                        formData={formData}
                        handleChange={handleChange}
                        handleNestedChange={handleNestedChange}
                        prevStep={prevStep}
                        handleSubmit={handleSubmit}
                        loading={loading}
                        error={error}
                        readOnly={isViewMode}
                    />
                );
            default:
                return <p>Invalid Step</p>;
        }
    };

    if (loading && (isEditMode || isViewMode)) {
        return <div className="loading-message">Loading patient data...</div>;
    }

    return (
        <div className="patient-record-form-container" ref={topOfFormRef}>
            {error && <p className="error-message">{error}</p>}
            {renderStep()}
            {success && <p className="success-message">Record {isEditMode ? 'Updated' : 'Submitted'} Successfully!</p>}
        </div>
    );
};

export default PatientRecordFormAuto;
