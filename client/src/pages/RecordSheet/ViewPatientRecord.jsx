// ViewPatientRecord.jsx (Full Data Layout Updated - Fixed Nested Section Display and Object Display)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft, faEdit, faTrash, faPrint } from '@fortawesome/free-solid-svg-icons';

// 1. Token eka ganna helper function eka
const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Auth token not found in localStorage');
        return { headers: {} };
    }
    return {
        headers: {
            'x-auth-token': token,
        },
    };
};

// 2. Userge Role eka ganna helper function eka
const getLoggedInUser = () => {
    const userString = localStorage.getItem('user');
    if (!userString) {
        console.error('Logged in user object not found in localStorage');
        return null;
    }
    try {
        return JSON.parse(userString);
    } catch (e) {
        console.error('Error parsing user from localStorage', e);
        return null;
    }
};

// 3. Helper component (Data field pennanna) - MODIFIED to handle objects gracefully
const InfoField = ({ label, value }) => {
    // Check for null, undefined, or empty string. Allow 0.
    if (!value && typeof value !== 'number' && typeof value !== 'boolean') {
        if (value === null || value === undefined) return null;
    }

    let displayValue = value;

    // Boolean-gulo "Yes/No" hishebe dekhano
    if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
    }
    
    // Date string hole format kora (Date object noy)
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
        const date = new Date(value);
        if (!isNaN(date)) {
             displayValue = date.toLocaleDateString();
        }
    }
    
    // Array hole join kora
    if (Array.isArray(value)) {
        displayValue = value.length > 0 ? value.join(', ') : 'N/A';
    } 
    
    // Handle non-null objects that are not arrays (e.g., Assessment Plan data)
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Simple and safe way to display object content for viewing/debugging
        // We replace the new lines with a space and remove quotes for cleaner in-line view
        displayValue = JSON.stringify(value, null, 2)
            .replace(/\n\s*/g, ' ')
            .replace(/"/g, '')
            .replace(/,\s*}/g, '}')
            .trim();
        // If it still looks like an empty object after cleaning
        if (displayValue === '{}' || displayValue === '') {
            return null;
        }
    }

    return (
        <div className="mb-4 break-inside-avoid">
            <p className="text-sm font-semibold text-indigo-700">{label}</p>
            {/* For multiline object display (like the Assessment Plan), use a pre tag */}
            {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                <pre className="text-sm text-gray-800 break-all whitespace-pre-wrap bg-gray-100 p-2 rounded-md font-mono mt-1">{displayValue}</pre>
            ) : (
                <p className="text-lg text-gray-800 break-words">{String(displayValue)}</p>
            )}
        </div>
    );
};

// 4. Helper component (Section pennanna)
const InfoSection = ({ title, children, noColumns = false }) => (
    <div className="mb-8 p-6 bg-gray-50 rounded-2xl shadow-lg border border-gray-200">
        <h3 className="text-2xl font-bold text-indigo-800 mb-6 pb-2 border-b border-indigo-200">
            {title}
        </h3>
        {noColumns ? (
            // Single column layout for nested boxes
            <div>
                {children}
            </div>
        ) : (
            // Column layout for better readability (default)
            <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8">
                {children}
            </div>
        )}
    </div>
);

// 5. Main Component
const ViewPatientRecord = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [record, setRecord] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [canCRUD, setCanCRUD] = useState(false);

    useEffect(() => {
        // User role check
        const loggedInUser = getLoggedInUser();
        if (loggedInUser && loggedInUser.userType === 'Super Admin') {
            setCanCRUD(true);
        }

        // Data fetch
        const fetchRecord = async () => {
            try {
                const config = getAuthConfig();
                if (!config.headers['x-auth-token']) {
                    setError('Authentication token not found. Please log in again.');
                    setLoading(false);
                    return;
                }
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/patientRecords/${id}`,
                    config
                );
                setRecord(response.data);
            } catch (err) {
                console.error('Error fetching patient data:', err);
                setError('Failed to load patient data.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecord();
    }, [id]);

    const handleDelete = async () => {
        if (!canCRUD) {
            alert("You do not have permission to delete this record.");
            return;
        }
        if (window.confirm('Are you sure you want to permanently delete this patient record?')) {
            try {
                const config = getAuthConfig();
                await axios.delete(`${import.meta.env.VITE_API_URL}/patientRecords/${id}`, config);
                alert('Record deleted successfully.');
                navigate('/dashboard/patient-records');
            } catch (err) {
                console.error('Error deleting record:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    alert("You do not have permission to delete this record.");
                } else {
                    alert('Failed to delete record.');
                }
            }
        }
    };
    
    // Handle Print
    const handlePrint = () => {
        window.print(); // Simple browser print
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-600" />
                    <p className="mt-4 text-lg text-gray-700">Loading patient record...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-2xl mx-auto mt-10 bg-red-50 border border-red-400 rounded-lg shadow-xl text-center">
                <p className="text-xl font-bold text-red-700">{error}</p>
                <Link
                    to="/dashboard/patient-records"
                    className="mt-6 inline-block px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700"
                >
                    Back to List
                </Link>
            </div>
        );
    }

    // Determine if any content exists for a section to prevent rendering empty boxes
    const hasFamilyHistory = record.familyHistoryOfDisorders;
    const hasBirthHistory = record.birthHistory;
    const hasMedicalHistory = record.medicalHistory; // FIX 1: Conditional rendering check
    const hasDevelopmentalHistory = record.developmentalHistory; // FIX 1: Conditional rendering check
    const hasDevelopmentalMilestones = record.developmentalMilestones; // FIX 1: Conditional rendering check
    const hasMotorSpeech = record.motorSkills || record.speech; // FIX 1: Conditional rendering check
    const hasReviewOfSystem = record.reviewOfSystem;
    const hasGrowthAndWeight = record.growthAndWeight;
    const hasClinicalAutismDiagnosis = record.clinicalDiagnosis || record.autismDiagnosis;
    const hasManagementDetails = record.managementPlan || record.homeTraining || record.therapistObservation;
    const hasSummariesAndScores = record.carsScore || record.vinelandSocialMaturityScale || record.overallSummary || record.presentingComplaintsSummary || record.summary;
    const hasFuturePlanInfo = record.futureTherapyPlan || record.nextReviewDate || record.therapistName || record.contactNumberOfTherapist || record.assessmentPlan; // FIX 1: Conditional rendering check

    return (
        <div className="p-4 md:p-8 bg-gray-100 max-w-7xl mx-auto my-8 rounded-2xl shadow-2xl">
            
            {/* Header and Action Buttons (Print: hidden) */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 print:hidden">
                <h1 className="text-4xl font-extrabold text-indigo-900">
                    Patient Record View
                </h1>
                <div className="flex flex-wrap gap-3">
                    <Link
                        to="/dashboard/patient-records"
                        className="flex items-center px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Back
                    </Link>
                    {canCRUD && (
                        <>
                            <Link
                                to={`../patient-records/edit/${id}`}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
                            >
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition"
                            >
                                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                Delete
                            </button>
                        </>
                    )}
                    <button
                        onClick={handlePrint}
                        className="flex items-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition"
                    >
                        <FontAwesomeIcon icon={faPrint} className="mr-2" />
                        Print
                    </button>
                </div>
            </div>

            {/* --- Form Data Display --- */}
            
            {/* --- Part 1: Patient Info --- */}
            <InfoSection title="Part 1: Patient Information" noColumns={true}>
                
                {/* Nested Section: Core Patient Details */}
                <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                    <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Core Patient Details</h4>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8">
                        <InfoField label="Child No" value={record.childNo} />
                        <InfoField label="Name" value={record.name} />
                        <InfoField label="Date of Birth" value={record.dateOfBirth} />
                        <InfoField label="Age" value={record.age} />
                        <InfoField label="Gender" value={record.gender} />
                        <InfoField label="Contact No (General)" value={record.contactNo} />
                        <InfoField label="Address" value={record.address} />
                        <InfoField label="GN Division" value={record.gnDiv} />
                        <InfoField label="Date of Initial Assessment" value={record.dateOfInitialAssessment} />
                        <InfoField label="Referred By" value={record.referredBy} />
                    </div>
                </div>

                {/* Nested Section: Parent Details (NEW) - FIX 1: Conditional render check */}
                {(record.motherInfo || record.fatherInfo) && (
                    <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                        <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Parent Details</h4>
                        <div className="columns-1 md:columns-2 gap-x-8">
                            {/* Mother's Information */}
                            {record.motherInfo && (
                                <div className="break-inside-avoid-column p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <h5 className="text-md font-semibold text-blue-600 mb-2 border-b pb-1">Mother's Information</h5>
                                    <InfoField label="Mother's Name" value={record.motherInfo.name} />
                                    <InfoField label="Mother's Occupation" value={record.motherInfo.occupation} />
                                    <InfoField label="Mother's Contact No" value={record.motherInfo.contactNo} />
                                </div>
                            )}
                            {/* Father's Information */}
                            {record.fatherInfo && (
                                <div className="break-inside-avoid-column p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <h5 className="text-md font-semibold text-blue-600 mb-2 border-b pb-1">Father's Information</h5>
                                    <InfoField label="Father's Name" value={record.fatherInfo.name} />
                                    <InfoField label="Father's Occupation" value={record.fatherInfo.occupation} />
                                    <InfoField label="Father's Contact No" value={record.fatherInfo.contactNo} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </InfoSection>

            {/* --- Part 2: History --- */}
            <InfoSection title="Part 2: History" noColumns={true}>
                {/* Nested Section: Family History (Existing) */}
                {hasFamilyHistory && (
                    <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                        <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Family History of Disorders</h4>
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8">
                            <InfoField label="Developmental Disorders" value={record.familyHistoryOfDisorders?.devDisorders} />
                            <InfoField label="ASD" value={record.familyHistoryOfDisorders?.asd} />
                            <InfoField label="Speech Disorders" value={record.familyHistoryOfDisorders?.speechDisorders} />
                            <InfoField label="Psychiatric Illness" value={record.familyHistoryOfDisorders?.psychiatricIllness} />
                            <InfoField label="Other Family History" value={record.familyHistoryOfDisorders?.other} />
                        </div>
                    </div>
                )}
                
                {/* Nested Section: Birth History (Existing) */}
                {hasBirthHistory && (
                    <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                        <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Birth History</h4>
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8">
                            <InfoField label="Gestational Age (weeks)" value={record.birthHistory?.gestationalAge} />
                            <InfoField label="Birth Weight (kg)" value={record.birthHistory?.birthWeight} />
                            <InfoField label="Type of Delivery" value={record.birthHistory?.typeOfDelivery} />
                            <InfoField label="Mother's Health During Pregnancy/Delivery" value={record.birthHistory?.mothersHealthDuringPregnancyDelivery} />
                        </div>
                    </div>
                )}

                {/* Nested Section: Medical History (Existing) - FIX 1: Conditional render check */}
                {hasMedicalHistory && (
                    <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                        <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Medical History</h4>
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8">
                            <InfoField label="Allergies" value={record.medicalHistory?.allergies} />
                            <InfoField label="Medications" value={record.medicalHistory?.medications} />
                            <InfoField label="Past Illnesses" value={record.medicalHistory?.pastIllnesses} />
                            <InfoField label="Past Surgeries" value={record.medicalHistory?.pastSurgeries} />
                        </div>
                    </div>
                )}

                {/* Nested Section: Developmental History (Existing) - FIX 1: Conditional render check */}
                {hasDevelopmentalHistory && (
                    <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                        <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Developmental History</h4>
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8">
                            <InfoField label="Developmental Delay" value={record.developmentalHistory?.developmentalDelay} />
                            <InfoField label="Other Developmental Concerns" value={record.developmentalHistory?.otherDevelopmentalConcerns} />
                        </div>
                    </div>
                )}

                {/* Nested Section: Developmental Milestones (Existing) - FIX 1: Conditional render check */}
                {hasDevelopmentalMilestones && (
                    <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                        <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Developmental Milestones (Age in months)</h4>
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8">
                            <InfoField label="Head Control" value={record.developmentalMilestones?.headControl} />
                            <InfoField label="Sitting" value={record.developmentalMilestones?.sitting} />
                            <InfoField label="Walking" value={record.developmentalMilestones?.walking} />
                            <InfoField label="First Words" value={record.developmentalMilestones?.firstWords} />
                            <InfoField label="First Sentences" value={record.developmentalMilestones?.firstSentences} />
                        </div>
                    </div>
                )}

                {/* Nested Section: Motor Skills & Speech (Updated to include speech) - FIX 1: Conditional render check */}
                {hasMotorSpeech && (
                    <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                        <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Motor Skills & Speech</h4>
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8">
                            <InfoField label="Speech" value={record.speech} />
                            <InfoField label="Gross Motor" value={record.motorSkills?.grossMotor} />
                            <InfoField label="Fine Motor" value={record.motorSkills?.fineMotor} />
                        </div>
                    </div>
                )}

                {/* Nested Section: Review of System (NEW) */}
                {hasReviewOfSystem && (
                    <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                        <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Review of System</h4>
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8">
                            <InfoField label="Vision Problem" value={record.reviewOfSystem?.visionProblem} />
                            <InfoField label="Hearing Problem" value={record.reviewOfSystem?.hearingProblem} />
                            <InfoField label="Gastro-Intestinal Problems" value={record.reviewOfSystem?.gastroIntestinalProblems} />
                            <InfoField label="Neurological Problems" value={record.reviewOfSystem?.neurologicalProblems} />
                            <InfoField label="Any Other (Specify)" value={record.reviewOfSystem?.anyOther} />
                        </div>
                    </div>
                )}

                {/* Nested Section: Growth & Weight (NEW) */}
                {hasGrowthAndWeight && (
                    <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                        <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Growth & Weight Problems</h4>
                        <div className="columns-1 md:columns-2 gap-x-8">
                            <InfoField label="Height (cm)" value={record.growthAndWeight?.height} />
                            <InfoField label="Weight (kg)" value={record.growthAndWeight?.weight} />
                        </div>
                    </div>
                )}
            </InfoSection>

            {/* --- Part 3: Diagnosis & Assessment --- */}
            <InfoSection title="Part 3: Diagnosis & Assessment" noColumns={true}>

                {/* Nested Section: General Diagnosis, Complaints, and Expectations (NEW Grouping) */}
                <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                    <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">General Diagnosis, Complaints, and Expectations</h4>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8">
                        <InfoField label="Schooling" value={record.schooling} />
                        <InfoField label="General Diagnosis" value={record.generalDiagnosis} />
                        <InfoField label="Reason for Referral" value={record.reasonForReferral} />
                        <InfoField label="Chief Complaints (Repetitive/Odd Behaviors)" value={record.chiefComplaints} />
                        <InfoField label="Parent's Expectation" value={record.parentsExpectation} />
                        <InfoField label="Hearing Screening" value={record.hearingScreening} />
                        <InfoField label="Vision Screening" value={record.visionScreening} />
                    </div>
                </div>

                {/* Nested Section: Clinical & Autism Diagnosis (NEW Grouping) - FIX 1: Conditional render check */}
                {hasClinicalAutismDiagnosis && (
                    <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                        <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Clinical & Autism Diagnosis</h4>
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8">
                            <InfoField label="Clinical Diagnosis (DSM IV)" value={record.clinicalDiagnosis?.dsmIv} />
                            <InfoField label="CARS (Clinical)" value={record.clinicalDiagnosis?.cars} />
                            <InfoField label="Diagnosis (General Text Field)" value={record.diagnosis} />
                            <InfoField label="Associated Conditions" value={record.associatedConditions} />
                            <InfoField label="Diagnosed Before?" value={record.autismDiagnosis?.diagnosedBefore} />
                            <InfoField label="Diagnosed By Whom & Where" value={record.autismDiagnosis?.diagnosedByWhere} />
                            <InfoField label="Any Medications Given (for Autism)" value={record.autismDiagnosis?.medicationsGiven} />
                        </div>
                    </div>
                )}
            </InfoSection>

            {/* --- Part 4: Management Plan --- */}
            <InfoSection title="Part 4: Management Plan" noColumns={true}>
                
                {/* Nested Section: Management Details (NEW Grouping) - FIX 1: Conditional render check */}
                {hasManagementDetails && (
                    <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                        <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Management Details</h4>
                        <div className="columns-1 md:columns-2 gap-x-8">
                            <InfoField label="Management Plan" value={record.managementPlan} />
                            <InfoField label="Home Training Recommendations" value={record.homeTraining} />
                            <InfoField label="Therapist's Observation/Recommendations" value={record.therapistObservation} />
                        </div>
                    </div>
                )}

                {/* Nested Section: Summaries and Assessment Scores (NEW Grouping) - FIX 1: Conditional render check */}
                {hasSummariesAndScores && (
                    <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-white break-inside-avoid shadow-sm">
                        <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Summaries and Assessment Scores</h4>
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8">
                            <InfoField label="Overall Summary" value={record.overallSummary} />
                            <InfoField label="Presenting Complaints Summary" value={record.presentingComplaintsSummary} />
                            <InfoField label="Summary (General Text Field)" value={record.summary} />
                            <InfoField label="CARS Score" value={record.carsScore} />
                            <InfoField label="Vineland Social Maturity Scale" value={record.vinelandSocialMaturityScale} />
                        </div>
                    </div>
                )}

                {/* Nested Section: Future Plan & Therapist Information (NEW Grouping) - FIX 1: Conditional render check */}
         
            </InfoSection>
        </div>
    );
};

export default ViewPatientRecord;