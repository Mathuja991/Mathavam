// D:\Computer Science - University of Jaffna\3rd Year\Group Project\Mathavam Project\client\src\pages\RecordSheet\PatientRecordForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams

import Part1PatientInfo from './Part1PatientInfo';
import Part2History from './Part2History';
import Part3Diagnosis from './Part3Diagnosis';
import Part4Management from './Part4Management';

const PatientRecordForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL for editing
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({}); // Initialize as empty, data will be loaded
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); // New state to track edit mode

    useEffect(() => {
        if (id) {
            // If an ID is present in the URL, we are in edit mode
            setIsEditMode(true);
            setLoading(true);
            const fetchPatientData = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/patientRecords/${id}`);
                    setFormData(response.data);
                    setLoading(false);
                } catch (err) {
                    console.error('Error fetching patient data for editing:', err);
                    setError('Failed to load patient data for editing.');
                    setLoading(false);
                }
            };
            fetchPatientData();
        } else {
            // If no ID, it's a new record, try to load from localStorage
            const savedData = localStorage.getItem('patientRecordFormData');
            if (savedData) {
                setFormData(JSON.parse(savedData));
            }
            setIsEditMode(false);
        }
    }, [id]); // Re-run when ID changes

    useEffect(() => {
        // Save to localStorage only if not in edit mode (to prevent overwriting fetched data)
        if (!isEditMode) {
            localStorage.setItem('patientRecordFormData', JSON.stringify(formData));
        }
    }, [formData, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNestedChange = (path, e) => {
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
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const backendUrl = `${import.meta.env.VITE_API_URL}/patientRecords`;
            let response;

            if (isEditMode) {
                // If in edit mode, send a PUT request to update
                response = await axios.put(`${backendUrl}/${id}`, formData);
                console.log('Record updated successfully:', response.data);
                alert('Patient record updated successfully!');
            } else {
                // If not in edit mode, send a POST request to create
                response = await axios.post(backendUrl, formData);
                console.log('Record saved successfully:', response.data);
                alert('Patient record submitted successfully!');
            }
            
            setSuccess(true);
            localStorage.removeItem('patientRecordFormData'); // Clear local storage after successful submission/update
            setFormData({}); // Clear form data
            setStep(1); // Go back to the first step

            // Optionally navigate after submission
            // navigate('/some-confirmation-page');

        } catch (err) {
            console.error('Error submitting form:', err.response ? err.response.data : err.message);
            setError(err.response ? err.response.data.message : 'An unexpected error occurred.');
            alert('Error submitting form: ' + (err.response ? err.response.data.message : err.message));
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Part1PatientInfo 
                        formData={formData} 
                        handleChange={handleChange} 
                        nextStep={nextStep} 
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
                    />
                );
            default:
                return <p>Invalid Step</p>;
        }
    };

    if (loading && isEditMode) {
        return <div className="loading-message">Loading patient data...</div>;
    }

    return (
        <div className="patient-record-form-container">
            <h2>{isEditMode ? 'Edit Patient Record' : 'New Patient Record'} - Step {step} of 4</h2>
            {error && !isEditMode && <p className="error-message">{error}</p>} {/* Show error for new record if any */}
            {renderStep()}
            {success && <p className="success-message">Record {isEditMode ? 'Updated' : 'Submitted'} Successfully!</p>}
            {error && isEditMode && <p className="error-message">{error}</p>} {/* Show error for edit mode if any */}
        </div>
    );
};

export default PatientRecordForm;