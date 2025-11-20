import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft, faEdit, faTrash, faPrint } from '@fortawesome/free-solid-svg-icons';

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

const InfoField = ({ label, value }) => {
    // Only render if value is present, or if it's a number/boolean (which might be 0 or false)
    if (!value && typeof value !== 'number' && typeof value !== 'boolean') {
        if (value === null || value === undefined) return null;
    }

    let displayValue = value;

    if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
    }
    
    // Handle Date strings
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
        const date = new Date(value);
        if (!isNaN(date)) {
             displayValue = date.toLocaleDateString();
        }
    }
    
    // Handle Arrays
    if (Array.isArray(value)) {
        displayValue = value.length > 0 ? value.join(', ') : 'N/A';
    } 
    
    // Handle Objects (for backward compatibility if not broken down)
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
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
        <div className="mb-4 break-inside-avoid p-3 border border-gray-100 rounded-lg bg-gray-50 shadow-sm">
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">{label}</p>
            {/* For multiline object display (if object isn't broken down), use a pre tag */}
            {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                <pre className="text-sm text-gray-800 break-all whitespace-pre-wrap bg-white p-2 rounded-md font-mono mt-1 border border-gray-200">{displayValue}</pre>
            ) : (
                <p className="text-base text-gray-900 font-medium break-words mt-1">{String(displayValue)}</p>
            )}
        </div>
    );
};

// 4. Helper component (Section)
const InfoSection = ({ title, children, noColumns = false }) => (
    <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border-l-4 border-indigo-500">
        <h3 className="text-2xl font-bold text-indigo-800 mb-6 pb-2 border-b-2 border-indigo-200">
            {title}
        </h3>
        {noColumns ? (
            // Single column layout for nested boxes
            <div>
                {children}
            </div>
        ) : (
            // Column layout for better readability (default)
            <div className="columns-1 md:columns-2 lg:columns-3 gap-x-6">
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
                setError('Failed to load patient data. It may not exist or you lack permission.');
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

        if (window.confirm(`Are you sure you want to permanently delete the record for ${record.name}?`)) {
            try {
                const config = getAuthConfig();
                await axios.delete(
                    `${import.meta.env.VITE_API_URL}/patientRecords/${id}`,
                    config
                );
                alert("Record deleted successfully.");
                navigate('/dashboard/patient-records'); // Redirect to list after deletion
            } catch (err) {
                console.error('Error deleting patient data:', err);
                alert('Failed to delete patient data. Please try again.');
            }
        }
    };

    // Conditional render checks (kept from original logic)
    const hasFamilyHistory = record.familyHistoryOfDisorders && Object.values(record.familyHistoryOfDisorders).some(val => val === true);
    const hasMotherInfo = record.motherInfo && record.motherInfo.name;
    const hasFatherInfo = record.fatherInfo && record.fatherInfo.name;
    const hasPresentingComplaints = record.presentingComplaints;
    const hasBirthMedical = record.birthHistory || record.medicalHistory;
    const hasDevelopmentalMilestones = record.developmentalMilestones && (record.developmentalMilestones.rolling || record.developmentalMilestones.sitting || record.developmentalMilestones.standing || record.developmentalMilestones.walking || record.developmentalMilestones.firstWords || record.developmentalMilestones.firstSentences);
    const hasMotorSpeech = record.motorSkills || record.speech;
    const hasReviewOfSystem = record.reviewOfSystem; // Kept for general check
    const hasGrowthAndWeight = record.growthAndWeight; // Kept for general check
    const hasClinicalAutismDiagnosis = record.clinicalDiagnosis || record.autismDiagnosis; // Kept for general check
    const hasManagementDetails = record.managementPlan || record.homeTraining || record.therapistObservation;
    const hasSummariesAndScores = record.carsScore || record.vinelandSocialMaturityScale || record.overallSummary || record.presentingComplaintsSummary || record.summary;
    const hasFuturePlanInfo = record.futureTherapyPlan || record.nextReviewDate || record.therapistName || record.contactNumberOfTherapist || record.assessmentPlan;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-2xl max-w-7xl mx-auto my-8 min-h-[500px]">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-indigo-600 mb-3" />
                <p className="text-xl font-medium text-gray-700">Loading patient record...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-10 bg-red-50 border-l-4 border-red-500 text-red-700 max-w-3xl mx-auto my-8 rounded-lg shadow-lg">
                <p className="font-semibold text-lg">Error:</p>
                <p>{error}</p>
                <button 
                    onClick={() => navigate('/dashboard/patient-records')} 
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-150"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Back to List
                </button>
            </div>
        );
    }

    return (
        // *******************************************************************
        // CHANGE 1: Apply print styles to the outermost container
        // print:p-0 print:bg-white print:min-h-0 removes background and padding for print
        // *******************************************************************
        <div className="bg-gray-50 p-4 md:p-8 min-h-screen **print:p-0 print:bg-white print:min-h-0**">
            
            {/* *******************************************************************
            // CHANGE 2: Apply print styles to the inner content container
            // print:shadow-none print:m-0 print:p-4 print:rounded-none removes UI chrome for print
            // ******************************************************************* */}
            <div className="bg-white rounded-3xl shadow-3xl p-6 md:p-10 max-w-7xl mx-auto my-8 **print:shadow-none print:m-0 print:p-4 print:rounded-none**">

                {/* Header and Action Buttons (already correctly using print:hidden) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 **print:hidden** border-b-4 border-indigo-100 pb-4">
                    <h1 className="text-4xl font-extrabold text-indigo-900">
                        Patient Record View
                    </h1>
                    <div className="flex flex-wrap gap-3">
                        <Link 
                            to="/dashboard/patient-records" 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-full shadow-md hover:bg-gray-300 transition duration-200"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} /> Back to List
                        </Link>
                        
                        {canCRUD && (
                            <>
                                <Link
                                    to={`/dashboard/patient-records/edit/${id}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-full shadow-md hover:bg-yellow-600 transition duration-200"
                                >
                                    <FontAwesomeIcon icon={faEdit} /> Edit Record
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-full shadow-md hover:bg-red-700 transition duration-200"
                                >
                                    <FontAwesomeIcon icon={faTrash} /> Delete Record
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 transition duration-200"
                        >
                            <FontAwesomeIcon icon={faPrint} /> Print
                        </button>
                    </div>
                </div>
                
                {/* --- Part 1: Patient Information --- */}
                <InfoSection title="Part 1: Patient Information">
                    <InfoField label="Child's Name" value={record.name} />
                    <InfoField label="Child No" value={record.childNo} />
                    <InfoField label="Age" value={`${record.age} years`} />
                    <InfoField label="Gender" value={record.gender} />
                    <InfoField label="Date of Birth" value={record.dateOfBirth} />
                    <InfoField label="Date of Initial Assessment" value={record.dateOfInitialAssessment} />
                    <InfoField label="Contact No" value={record.contactNo} />
                    <InfoField label="Address" value={record.address} />
                    <InfoField label="GN Division" value={record.gnDiv} />
                    <InfoField label="Referred By" value={record.referredBy} />

                    {/* Parents' Information (Nested Sections) */}
                    {(hasMotherInfo || hasFatherInfo) && (
                        <div className="break-inside-avoid-column p-4 border border-indigo-100 rounded-xl bg-indigo-50/50 shadow-inner col-span-1 md:col-span-2 lg:col-span-3 columns-1 md:columns-2 gap-4">
                            <h4 className="text-xl font-bold text-indigo-700 mb-4 border-b-2 border-indigo-200 pb-2">Parents' Details</h4>
                            {/* Mother's Information */}
                            {record.motherInfo && (
                                <div className="break-inside-avoid-column p-3 border border-gray-200 rounded-lg bg-white mb-4 shadow-sm">
                                    <h5 className="text-sm font-semibold text-blue-600 mb-2 border-b pb-1">Mother's Information</h5>
                                    <InfoField label="Mother's Name" value={record.motherInfo.name} />
                                    <InfoField label="Mother's Occupation" value={record.motherInfo.occupation} />
                                    <InfoField label="Mother's Contact No" value={record.motherInfo.contactNo} />
                                </div>
                            )}
                            {/* Father's Information */}
                            {record.fatherInfo && (
                                <div className="break-inside-avoid-column p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                                    <h5 className="text-sm font-semibold text-blue-600 mb-2 border-b pb-1">Father's Information</h5>
                                    <InfoField label="Father's Name" value={record.fatherInfo.name} />
                                    <InfoField label="Father's Occupation" value={record.fatherInfo.occupation} />
                                    <InfoField label="Father's Contact No" value={record.fatherInfo.contactNo} />
                                </div>
                            )}
                        </div>
                    )}
                    
                    {hasPresentingComplaints && <InfoField label="Presenting Complaints" value={record.presentingComplaints} />}
                    <InfoField label="Sibling Position" value={record.siblingPosition} />
                    <InfoField label="Number of Siblings" value={record.numberOfSiblings} />
                    <InfoField label="Primary Caregiver" value={record.primaryCaregiver} />
                    <InfoField label="Family Type" value={record.familyType} />
                    
                </InfoSection>

                {/* --- Part 2: History --- */}
                <InfoSection title="Part 2: Medical and Developmental History" noColumns={true}>
                    
                    {/* Nested Section: Family History (Existing) */}
                    {hasFamilyHistory && (
                        <div className="mb-6 p-4 border border-indigo-100 rounded-xl bg-indigo-50/50 shadow-inner break-inside-avoid">
                            <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Family History of Disorders</h4>
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-x-6">
                                <InfoField label="Developmental Disorders" value={record.familyHistoryOfDisorders.devDisorders} />
                                <InfoField label="ASD" value={record.familyHistoryOfDisorders.asd} />
                                <InfoField label="Speech Disorders" value={record.familyHistoryOfDisorders.speechDisorders} />
                                <InfoField label="Psychiatric Illness" value={record.familyHistoryOfDisorders.psychiatricIllness} />
                                <InfoField label="Behavioral Problems" value={record.familyHistoryOfDisorders.behavioralProblems} />
                                <InfoField label="Intellectual Disability" value={record.familyHistoryOfDisorders.intellectualDisability} />
                                <InfoField label="Other" value={record.familyHistoryOfDisorders.other} />
                            </div>
                        </div>
                    )}
                    
                    {/* Nested Section: Birth & Medical History */}
                    {hasBirthMedical && (
                        <div className="mb-6 p-4 border border-indigo-100 rounded-xl bg-indigo-50/50 shadow-inner break-inside-avoid">
                            <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Birth & Medical History</h4>
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-x-6">
                                {record.birthHistory && (
                                    <>
                                        <InfoField label="Gestation" value={`${record.birthHistory.gestation} weeks`} />
                                        <InfoField label="Birth Weight (kg)" value={record.birthHistory.birthWeight} />
                                        <InfoField label="Type of Delivery" value={record.birthHistory.typeOfDelivery} />
                                        <InfoField label="Mother's Health During Pregnancy" value={record.birthHistory.mothersHealthDuringPregnancyDelivery} />
                                        <InfoField label="Neonatal Status" value={record.birthHistory.neonatalStatus} />
                                    </>
                                )}
                                {record.medicalHistory && (
                                    <>
                                        <InfoField label="Previous Hospitalizations" value={record.medicalHistory.previousHospitalizations} />
                                        <InfoField label="Past Medical Issues" value={record.medicalHistory.pastMedicalIssues} />
                                        <InfoField label="Current Medications" value={record.medicalHistory.currentMedications} />
                                        <InfoField label="Neurological Problems (Medical)" value={record.medicalHistory.neurologicalProblems} />
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Nested Section: Developmental Milestones */}
                    {hasDevelopmentalMilestones && (
                        <div className="mb-6 p-4 border border-indigo-100 rounded-xl bg-indigo-50/50 shadow-inner break-inside-avoid">
                            <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Developmental Milestones</h4>
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-x-6">
                                <InfoField label="Rolling" value={record.developmentalMilestones?.rolling} />
                                <InfoField label="Sitting" value={record.developmentalMilestones?.sitting} />
                                <InfoField label="Standing" value={record.developmentalMilestones?.standing} />
                                <InfoField label="Walking" value={record.developmentalMilestones?.walking} />
                                <InfoField label="First Words" value={record.developmentalMilestones?.firstWords} />
                                <InfoField label="First Sentences" value={record.developmentalMilestones?.firstSentences} />
                            </div>
                        </div>
                    )}

                    {/* Nested Section: Motor Skills & Speech */}
                    {hasMotorSpeech && (
                        <div className="mb-6 p-4 border border-indigo-100 rounded-xl bg-indigo-50/50 shadow-inner break-inside-avoid">
                            <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Motor Skills & Speech</h4>
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-x-6">
                                <InfoField label="Speech Details" value={record.speech} />
                                <InfoField label="Gross Motor" value={record.motorSkills?.grossMotor} />
                                <InfoField label="Fine Motor" value={record.motorSkills?.fineMotor} />
                            </div>
                        </div>
                    )}
                    
                    {/* Nested Section: Other Systems - UPDATED TO SHOW NESTED FIELDS */}
                    {(record.reviewOfSystem || record.growthAndWeight) && (
                        <div className="mb-6 p-4 border border-indigo-100 rounded-xl bg-indigo-50/50 shadow-inner break-inside-avoid">
                            <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Review of Systems / Growth & Weight</h4>
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-x-6">
                                {/* BEGIN: Updated fields from reviewOfSystem */}
                                {record.reviewOfSystem && typeof record.reviewOfSystem === 'object' && (
                                    <>
                                        {record.reviewOfSystem.growthWeightProblems && (
                                            <>
                                                <InfoField label="Height (cm)" value={record.reviewOfSystem.growthWeightProblems.height} />
                                                <InfoField label="Weight (kg)" value={record.reviewOfSystem.growthWeightProblems.weight} />
                                            </>
                                        )}
                                        <InfoField label="Vision Problem" value={record.reviewOfSystem.visionProblem} />
                                        <InfoField label="Hearing Problem" value={record.reviewOfSystem.hearingProblem} />
                                        <InfoField label="Gastro-Intestinal Problems" value={record.reviewOfSystem.gastroIntestinalProblems} />
                                        <InfoField label="Neurological Problems (Review)" value={record.reviewOfSystem.neurologicalProblems} />
                                        <InfoField label="Other Review Specify" value={record.reviewOfSystem.anyOtherSpecifyReview} />
                                    </>
                                )}
                                {/* END: Updated fields from reviewOfSystem */}

                                {/* Existing growthAndWeight fields (kept for compatibility with older records) */}
                                {record.growthAndWeight && (!record.reviewOfSystem || !record.reviewOfSystem.growthWeightProblems) && (
                                    <>
                                        <InfoField label="Growth (%)" value={record.growthAndWeight.growthPercentile} />
                                        <InfoField label="Weight (%)" value={record.growthAndWeight.weightPercentile} />
                                        <InfoField label="Head Circumference (%)" value={record.growthAndWeight.headCircumferencePercentile} />
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </InfoSection>

                {/* --- Part 3: Diagnosis --- */}
                <InfoSection title="Part 3: Diagnosis & Assessment" noColumns={true}>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-x-6">
                        {/* BEGIN: Updated Clinical Diagnosis Fields */}
                        {record.clinicalDiagnosis && typeof record.clinicalDiagnosis === 'object' ? (
                            <>
                                <InfoField label="Clinical Diagnosis (DSM-IV)" value={record.clinicalDiagnosis.dsmIv} />
                                <InfoField label="Clinical Diagnosis (CARS)" value={record.clinicalDiagnosis.cars} />
                            </>
                        ) : (
                             <InfoField label="Clinical Diagnosis" value={record.clinicalDiagnosis} /> // Fallback for simple string
                        )}
                        {/* END: Updated Clinical Diagnosis Fields */}

                        {/* BEGIN: Updated Autism Diagnosis Fields */}
                        {record.autismDiagnosis && typeof record.autismDiagnosis === 'object' ? (
                            <InfoField label="Autism Diagnosed Before?" value={record.autismDiagnosis.diagnosedBefore} />
                        ) : (
                            <InfoField label="Autism Diagnosis" value={record.autismDiagnosis} /> // Fallback for simple string
                        )}
                        {/* END: Updated Autism Diagnosis Fields */}

                        <InfoField label="Associated Conditions" value={record.associatedConditions} />
                    </div>

                    <InfoField label="Schooling Details" value={record.schooling} />
                    <InfoField label="Parent's Expectation" value={record.parentsExpectation} />
                    
                </InfoSection>

                {/* --- Part 4: Management Plan --- */}
                <InfoSection title="Part 4: Management Plan" noColumns={true}> 
                
                    {/* BEGIN: NEW Nested Section for Detailed Assessment Plan */}
                    {record.assessmentPlan && typeof record.assessmentPlan === 'object' && !Array.isArray(record.assessmentPlan) && (
                        <div className="mb-6 p-4 border border-indigo-100 rounded-xl bg-green-50/50 shadow-inner break-inside-avoid">
                            <h4 className="text-lg font-bold text-green-800 mb-3 border-b pb-1">Detailed Assessment Plan</h4>
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-x-6">
                                <InfoField label="Consult Pediatrician?" value={record.assessmentPlan.byConPediatrician} />
                                <InfoField label="Consult Speech Therapist?" value={record.assessmentPlan.bySpeechTherapist} />
                                <InfoField label="Consult Psychiatrist?" value={record.assessmentPlan.byConPsychiatrist} />
                                <InfoField label="Date for Home Visit" value={record.assessmentPlan.dateForHomeVisit} />
                                <InfoField label="Commencement of Therapy" value={record.assessmentPlan.commencementOfTherapy} />
                            </div>
                        </div>
                    )}
                    {/* END: NEW Nested Section for Detailed Assessment Plan */}

                    {/* Nested Section: Management Details and Summaries (Original Grouping) */}
                    {(hasManagementDetails || hasSummariesAndScores || hasFuturePlanInfo) && (
                        <div className="mb-6 p-4 border border-indigo-100 rounded-xl bg-indigo-50/50 shadow-inner break-inside-avoid">
                            <h4 className="text-lg font-bold text-blue-800 mb-3 border-b pb-1">Management, Summaries, and Plan</h4>
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-x-6">
                                <InfoField label="Management Plan" value={record.managementPlan} />
                                <InfoField label="Home Training" value={record.homeTraining} />
                                <InfoField label="Therapist Observation/Recommendations" value={record.therapistObservation} />
                                <InfoField label="Overall Summary" value={record.overallSummary} />
                                <InfoField label="Presenting Complaints Summary" value={record.presentingComplaintsSummary} />
                                <InfoField label="Summary (General Text Field)" value={record.summary} />
                                <InfoField label="CARS Score" value={record.carsScore} />
                                <InfoField label="Vineland Social Maturity Scale" value={record.vinelandSocialMaturityScale} />
                                
                                {/* Fallback for older/simple string assessmentPlan, removed if the new object is present */}
                                {record.assessmentPlan && typeof record.assessmentPlan !== 'object' && (
                                    <InfoField label="Assessment Plan" value={record.assessmentPlan} />
                                )}

                                <InfoField label="Future Therapy Plan" value={record.futureTherapyPlan} />
                                <InfoField label="Next Review Date" value={record.nextReviewDate} />
                                <InfoField label="Therapist Name" value={record.therapistName} />
                                <InfoField label="Contact No of Therapist" value={record.contactNumberOfTherapist} />
                            </div>
                        </div>
                    )}
            
                </InfoSection>
            </div>
        </div>
    );
};

export default ViewPatientRecord;