import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom'; // <-- useLocation import කරන්න

import Part1PatientInfo from './Part1PatientInfo';
import Part2History from './Part2History';
import Part3Diagnosis from './Part3Diagnosis';
import Part4Management from './Part4Management';

const PatientRecordForm = () => {

    const { id } = useParams();
    const location = useLocation(); // <-- location hook එක ගන්න
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // Edit සහ View mode state දෙක
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false); // <-- View mode සඳහා

    const topOfFormRef = useRef(null); // <-- Scroll කිරීම සඳහා ref

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

    // Data Fetching (Edit සහ View සඳහා)
    useEffect(() => {
        if (id) {
            // URL එක බලලා mode එක තීරණය කරනවා
            if (location.pathname.includes('/view/')) {
                setIsViewMode(true);
                setIsEditMode(false);
            } else if (location.pathname.includes('/edit/')) {
                setIsViewMode(false);
                setIsEditMode(true);
            }

            // Edit සහ View mode දෙකේදීම දත්ත ගේන්න ඕන
            setLoading(true);
            const fetchPatientData = async () => {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_URL}/patientRecords/${id}`,
                        getAuthConfig() // <-- Auth Token එක පාවිච්චි කරනවා
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
            // ID නැත්නම්, ඒ 'Create new' mode
            setIsEditMode(false);
            setIsViewMode(false);
            const savedData = localStorage.getItem('patientRecordFormData');
            if (savedData) {
                setFormData(JSON.parse(savedData));
            }
        }
    }, [id, location.pathname]); // <-- dependency එකට location.pathname දාන්න

    // LocalStorage (Create mode එකේදී විතරක්)
    useEffect(() => {
        // Only save to localStorage if not in edit or view mode
        if (!isEditMode && !isViewMode && !id) {
            localStorage.setItem('patientRecordFormData', JSON.stringify(formData));
        }
    }, [formData, isEditMode, isViewMode, id]);

    // Scroll to Top (step එක වෙනස් වෙද්දී)
    useEffect(() => {
        if (topOfFormRef.current) {
            // Use 'auto' behavior for an instant jump
            topOfFormRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [step]);

    // handleChange (View mode එකේදී disable)
    const handleChange = (e) => {
        if (isViewMode) return; // View mode නම් වෙනස් කරන්න බෑ

        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // handleNestedChange (View mode එකේදී disable)
    const handleNestedChange = (path, e) => {
        if (isViewMode) return; // View mode නම් වෙනස් කරන්න බෑ

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

    // handleSubmit (View mode එකේදී disable)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isViewMode) {
            console.log("Cannot submit in view mode.");
            return; // View mode නම් submit කරන්න බෑ
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        const authConfig = getAuthConfig(); // <-- Auth token එක ගන්න
        if (!authConfig.headers['x-auth-token']) {
            setLoading(false);
            return; 
        }

        try {
            const backendUrl = `${import.meta.env.VITE_API_URL}/patientRecords`;
            let response;

            if (isEditMode) {
                // PUT (Update) with auth
                response = await axios.put(`${backendUrl}/${id}`, formData, authConfig);
                alert('Patient record updated successfully!');
            } else {
                // POST (Create) with auth
                response = await axios.post(backendUrl, formData, authConfig);
                alert('Patient record submitted successfully!');
            }
            
            setSuccess(true);
            localStorage.removeItem('patientRecordFormData');
            setFormData({});
            setStep(1); 

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

    // renderStep (readOnly prop එක pass කරනවා)
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Part1PatientInfo 
                        formData={formData} 
                        handleChange={handleChange} 
                        nextStep={nextStep} 
                        readOnly={isViewMode} // <-- මෙතන
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
                        readOnly={isViewMode} // <-- මෙතන
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
                        readOnly={isViewMode} // <-- මෙතන
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
                        readOnly={isViewMode} // <-- මෙතන
                    />
                );
            default:
                return <p>Invalid Step</p>;
        }
    };

    // Loading...
    if (loading) {
        return <div className="loading-message">Loading patient data...</div>;
    }

    return (
        // ref එක මෙතනට දාන්න
        <div className="patient-record-form-container" ref={topOfFormRef}> 
            {error && <p className="error-message">{error}</p>}
            {renderStep()}
            {success && <p className="success-message">Record {isEditMode ? 'Updated' : 'Submitted'} Successfully!</p>}
        </div>
    );
};

export default PatientRecordForm;