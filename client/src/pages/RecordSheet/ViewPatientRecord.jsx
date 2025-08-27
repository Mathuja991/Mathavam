// D:\Computer Science - University of Jaffna\3rd Year\Group Project\Mathavam Project\client\src\pages\RecordSheet\ViewPatientRecord.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

const ViewPatientRecord = () => {
    const { id } = useParams(); // Get the ID from the URL
    const navigate = useNavigate();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/patientRecords/${id}`);
                setRecord(response.data);
                setLoading(false);
            } catch (err) {
                console.error(`Error fetching record with ID ${id}:`, err);
                setError('Failed to load patient record. It might not exist or there was a server error.');
                setLoading(false);
            }
        };

        fetchRecord();
    }, [id]); // Re-run effect if ID changes

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to permanently delete this patient record?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/patientRecords/${id}`);
                alert('Patient record deleted successfully!');
                navigate('/patient-records'); // Redirect to the list after deletion
            } catch (err) {
                console.error(`Error deleting record with ID ${id}:`, err);
                alert('Failed to delete patient record. Please try again.');
            }
        }
    };

    const renderField = (label, value) => {
        if (value === undefined || value === null || value === '') {
            return null; // Don't render if value is empty/null/undefined
        }
        if (typeof value === 'boolean') {
            return (
                <p className="mb-2 text-gray-700">
                    <strong className="font-semibold text-blue-800">{label}:</strong> {value ? 'Yes' : 'No'}
                </p>
            );
        }
        if (typeof value === 'object' && value instanceof Date) {
            return (
                <p className="mb-2 text-gray-700">
                    <strong className="font-semibold text-blue-800">{label}:</strong> {value.toLocaleDateString()}
                </p>
            );
        }
        // Handle dates that might come as ISO strings
        if (typeof value === 'string' && (label.toLowerCase().includes('date') || label.toLowerCase().includes('dob'))) {
             try {
                const date = new Date(value);
                if (!isNaN(date)) { // Check if it's a valid date
                    return (
                        <p className="mb-2 text-gray-700">
                            <strong className="font-semibold text-blue-800">{label}:</strong> {date.toLocaleDateString()}
                        </p>
                    );
                }
            } catch (e) {
                // Ignore parsing errors, treat as regular string
            }
        }
        
        return (
            <p className="mb-2 text-gray-700">
                <strong className="font-semibold text-blue-800">{label}:</strong> {value}
            </p>
        );
    };

    const renderSection = (title, dataObject) => {
        if (!dataObject || Object.keys(dataObject).length === 0 || Object.values(dataObject).every(val => val === null || val === undefined || val === '')) {
            return null; // Don't render section if all its fields are empty
        }
        return (
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6">
                <h3 className="text-xl font-bold text-blue-700 border-b pb-2 mb-4">{title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                    {Object.entries(dataObject).map(([key, value]) => {
                        // Attempt to make keys more readable
                        const readableKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        return renderField(readableKey, value);
                    })}
                </div>
            </div>
        );
    };


    if (loading) {
        return <div className="text-center text-xl font-semibold mt-10">Loading patient record details...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600 text-xl font-semibold mt-10">{error}</div>;
    }

    if (!record) {
        return <div className="text-center text-gray-600 text-xl font-semibold mt-10">Patient record not found.</div>;
    }

    // Main render
    return (
        <div className="p-8 bg-white rounded-lg shadow-xl max-w-7xl mx-auto my-8">
            <h2 className="text-4xl font-extrabold text-center text-blue-900 mb-10">Patient Record Details</h2>
            <div className="flex justify-between items-center mb-6">
                <Link 
                    to="/dashboard/patient-records" 
                    className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-200"
                >
                    ← Back to List
                </Link>
                <div>
                    <Link 
                        to={`/patient-records/edit/${record._id}`} 
                        className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 mr-4"
                    >
                        Edit Record
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="px-5 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
                    >
                        Delete Record
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Part 1: Patient Information */}
                <div className="bg-blue-100 p-8 rounded-xl shadow-lg border-l-4 border-blue-600">
                    <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b pb-2 border-blue-400">Patient Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                        {renderField('Child No', record.childNo)}
                        {renderField('Name', record.name)}
                        {renderField('Address', record.address)}
                        {renderField('Contact No', record.contactNo)}
                        {renderField('GN Division', record.gnDiv)}
                        {renderField('Referred By', record.referredBy)}
                        {renderField('Reason For Referral', record.reasonForReferral)}
                        {renderField('Date of Initial Assessment', record.dateOfInitialAssessment)}
                        {renderField('Date of Birth', record.dateOfBirth)}
                        {renderField('Gender', record.gender)}
                        {renderField('Age', record.age)}
                    </div>
                </div>

                {renderSection('Parent Information', record.parentInformation)}
                
                {/* Part 2: Review of System */}
                {renderSection('Growth & Weight Problems', record.reviewOfSystem?.growthWeightProblems)}
                {renderSection('Respiratory System', record.reviewOfSystem?.respiratorySystem)}
                {renderSection('Gastrointestinal System', record.reviewOfSystem?.gastrointestinalSystem)}
                {renderSection('Cardiovascular System', record.reviewOfSystem?.cardiovascularSystem)}
                {renderSection('Genitourinary System', record.reviewOfSystem?.genitourinarySystem)}
                {renderSection('Musculoskeletal System', record.reviewOfSystem?.musculoskeletalSystem)}
                {renderSection('Nervous System', record.reviewOfSystem?.nervousSystem)}
                {renderSection('Sensory Organs (Eyes/Ears)', record.reviewOfSystem?.sensoryOrgans)}
                {renderSection('Skin', record.reviewOfSystem?.skin)}

                {/* Part 2: Developmental History */}
                {renderSection('Motor', record.developmentalHistory?.motor)}
                {renderSection('Speech and Language', record.developmentalHistory?.speechAndLanguage)}
                {renderSection('Social and Emotional', record.developmentalHistory?.socialAndEmotional)}
                {renderSection('Cognitive', record.developmentalHistory?.cognitive)}
                {renderSection('Toileting', record.developmentalHistory?.toileting)}
                {renderSection('Feeding', record.developmentalHistory?.feeding)}
                {renderSection('Sleep', record.developmentalHistory?.sleep)}
                {renderSection('Play', record.developmentalHistory?.play)}
                {renderSection('Behavior', record.developmentalHistory?.behavior)}
                {renderSection('Specific Skills', record.developmentalHistory?.specificSkills)}
                {renderSection('School Readiness', record.developmentalHistory?.schoolReadiness)}
                {renderSection('Allergies', record.developmentalHistory?.allergies)}
                {renderSection('Immunization', record.developmentalHistory?.immunization)}
                {renderSection('Medications', record.developmentalHistory?.medications)}
                {renderSection('Hospitalizations', record.developmentalHistory?.hospitalizations)}
                {renderSection('Family History', record.developmentalHistory?.familyHistory)}

                {/* Part 3: Other Sections */}
                {renderField('Chief Complaints', record.chiefComplaints)}
                {renderField('Parent\'s Expectation', record.parentsExpectation)}
                {renderSection('Clinical Diagnosis', record.clinicalDiagnosis)}
                {renderField('Associated Conditions', record.associatedConditions)}

                {/* Part 4: Management Plan */}
                {renderField('Management Plan', record.managementPlan)}
                {renderField('Home Training Recommendations', record.homeTrainingRecommendations)}
                {renderField('Summary', record.summary)}
                {renderField('Presenting Complaints Summary', record.presentingComplaintsSummary)}
                {renderField('CARS Score', record.carsScore)}
                {renderField('Vineland Social Maturity Scale', record.vinelandSocialMaturityScale)}
                {renderSection('Assessment Plan', record.assessmentPlan)}
                {renderField('Future Therapy Plan', record.futureTherapyPlan)}
                {renderField('Next Review Date', record.nextReviewDate)}
                {renderField('Therapist Name', record.therapistName)}
                {renderField('Contact Number of Therapist', record.contactNumberOfTherapist)}
            </div>
        </div>
    );
};

export default ViewPatientRecord;