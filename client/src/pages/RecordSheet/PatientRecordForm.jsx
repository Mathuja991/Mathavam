import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import Part1PatientInfo from './Part1PatientInfo';
import Part2History from './Part2History';
import Part3Diagnosis from './Part3Diagnosis';
import Part4Management from './Part4Management';

const PatientRecordForm = () => {

    const { id } = useParams();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (id) {
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
            const savedData = localStorage.getItem('patientRecordFormData');
            if (savedData) {
                setFormData(JSON.parse(savedData));
            }
            setIsEditMode(false);
        }
    }, [id]);

    useEffect(() => {
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
                response = await axios.put(`${backendUrl}/${id}`, formData);
                console.log('Record updated successfully:', response.data);
                alert('Patient record updated successfully!');
            } else {
                response = await axios.post(backendUrl, formData);
                console.log('Record saved successfully:', response.data);
                alert('Patient record submitted successfully!');
            }
            
            setSuccess(true);
            localStorage.removeItem('patientRecordFormData');
            setFormData({});
            setStep(1);

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
            {error && !isEditMode && <p className="error-message">{error}</p>}
            {renderStep()}
            {success && <p className="success-message">Record {isEditMode ? 'Updated' : 'Submitted'} Successfully!</p>}
            {error && isEditMode && <p className="error-message">{error}</p>}
        </div>
    );
};

export default PatientRecordForm;