import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import Apart from "../../components/assessmentForms/DSM5/Apart";
import Bpart from "../../components/assessmentForms/DSM5/Bpart";
import Otherpart from "../../components/assessmentForms/DSM5/Otherpart";
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

const ViewDSM5Form = () => {
    const [patientInfo, setPatientInfo] = useState({
        id: "",
        name: "",
        dob: "",
        hasPreviousDsm4Diagnosis: false,
    });
    const [answers, setAnswers] = useState({
        socialCommunication: Array(3).fill(null),
        repetitiveBehaviors: Array(4).fill(null),
        otherCriteria: Array(3).fill(null),
    });
    const [severityRatings, setSeverityRatings] = useState({
        socialCommunication: null,
        repetitiveBehaviors: null,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    const fetchFormData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log("ViewDSM5Form: Attempting to fetch form with ID:", id);

            if (!id) {
                console.error("ViewDSM5Form: No ID provided to fetchFormData.");
                setError("No form ID provided for viewing.");
                setLoading(false);
                return;
            }

            const res = await axios.get(`http://localhost:5000/api/dsm5forms/${id}`);
            const formData = res.data;

            setPatientInfo({
                id: formData.patientInfo?.id || "",
                name: formData.patientInfo?.name || "",
                dob: formData.patientInfo?.dob || "",
                hasPreviousDsm4Diagnosis: formData.patientInfo?.hasPreviousDsm4Diagnosis || false,
            });
            setAnswers({
                socialCommunication: formData.answers?.socialCommunication || Array(3).fill(null),
                repetitiveBehaviors: formData.answers?.repetitiveBehaviors || Array(4).fill(null),
                otherCriteria: formData.answers?.otherCriteria || Array(3).fill(null),
            });
            setSeverityRatings({
                socialCommunication: formData.severityRatings?.socialCommunication || null,
                repetitiveBehaviors: formData.severityRatings?.repetitiveBehaviors || null,
            });
            setLoading(false);
        } catch (err) {
            console.error("ViewDSM5Form: Error fetching form data for view:", err.response ? err.response.data : err.message, err);
            if (err.response && err.response.status === 404) {
                setError("Form not found. It might have been deleted or the ID is incorrect.");
                toast.error("Form not found or invalid ID."); 
            } else {
                setError("Failed to load form data. Please check your network or server connection.");
                toast.error("Failed to load form data. Please try again."); 
            }
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchFormData();
        } else {
            setError("No form ID provided for viewing.");
            setLoading(false);
            toast.error("No form ID provided to view."); 
        }
    }, [id, fetchFormData]);

    const handlePatientInfoChange = (e) => {
        if (!isEditing) return;
        const { name, value, type, checked } = e.target;
        setPatientInfo((prevInfo) => ({
            ...prevInfo,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAnswerChange = (section, index, value) => {
        if (!isEditing) return;
        setAnswers((prevAnswers) => {
            const updated = { ...prevAnswers };
            updated[section][index] = value;
            return updated;
        });
    };

    const handleSeverityChange = (section, value) => {
        if (!isEditing) return;
        setSeverityRatings((prev) => ({
            ...prev,
            [section]: value,
        }));
    };

    const handleSave = async () => {
        const allAnswered = Object.values(answers).every((section) =>
            section.every((ans) => ans !== null && ans !== undefined)
        );

        const allSeveritySet =
            severityRatings.socialCommunication !== null &&
            severityRatings.socialCommunication !== undefined &&
            severityRatings.repetitiveBehaviors !== null &&
            severityRatings.repetitiveBehaviors !== undefined;

        const hasPatientInfo =
            patientInfo.id.trim() && patientInfo.name.trim() && patientInfo.dob.trim();

        if (!allAnswered || !hasPatientInfo || !allSeveritySet) {
            toast.warn("Please complete all required fields before saving."); 
            return;
        }

        try {
            const payload = {
                patientInfo,
                answers,
                severityRatings,
            };
            const res = await axios.put(`http://localhost:5000/api/dsm5forms/${id}`, payload);
            toast.success("Changes saved successfully!"); 
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to save changes. Please try again.");
            console.error("Error saving DSM-5 form:", error.response ? error.response.data : error.message);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        fetchFormData();
        toast.info("Edit cancelled. Form data reverted."); 
    };

    if (loading) {
        return <div className="text-center p-8 text-indigo-700 text-lg">Loading form details...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-600 text-lg">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center py-12 px-4">
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />

            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-full border space-y-6">
                <h1 className="text-3xl font-bold text-indigo-700 text-center mb-6">
                    DSM-5 Diagnostic Checklist
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { label: "Patient ID", name: "id", type: "text" },
                        { label: "Patient Name", name: "name", type: "text" },
                        { label: "Date of Birth", name: "dob", type: "date" },
                    ].map((field, idx) => (
                        <div key={idx}>
                            <label className="block font-semibold text-gray-700 mb-1">{field.label}</label>
                            <input
                                name={field.name}
                                type={field.type}
                                value={patientInfo[field.name]}
                                onChange={handlePatientInfoChange}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                disabled={!isEditing}
                            />
                        </div>
                    ))}
                </div>

                <div className="overflow-x-auto"> 
                <table className="w-full border-collapse border border-indigo-400 mt-6">
                    <thead>
                        <tr className="bg-indigo-200 text-indigo-900">
                            <th className="border border-indigo-400 p-2">DSM-5 Criteria</th>
                            <th className="border border-indigo-400 p-2" colSpan="2">
                                Autism Spectrum Disorder
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-indigo-50">
                            <td className="border border-indigo-300 p-2 text-sm">
                                <strong>Note:</strong> If the individual has a previous DSM-IV diagnosis, check here and complete the checklist to reclassify.
                            </td>
                            <td className="border border-indigo-300 p-2 text-center" colSpan="2">
                                <input
                                    type="checkbox"
                                    className="scale-150 accent-indigo-600 cursor-pointer"
                                    disabled={!isEditing}
                                    checked={patientInfo.hasPreviousDsm4Diagnosis}
                                    onChange={handlePatientInfoChange}
                                    name="hasPreviousDsm4Diagnosis"
                                />
                            </td>
                        </tr>

                        <Apart
                            answers={answers}
                            handleAnswerChange={handleAnswerChange}
                            severityRating={severityRatings.socialCommunication}
                            setSeverityRating={(value) => handleSeverityChange("socialCommunication", value)}
                            isEditing={isEditing}
                        />

                        <Bpart
                            answers={answers}
                            handleAnswerChange={handleAnswerChange}
                            severityRating={severityRatings.repetitiveBehaviors}
                            setSeverityRating={(value) => handleSeverityChange("repetitiveBehaviors", value)}
                            isEditing={isEditing}
                        />

                        <Otherpart
                            answers={answers}
                            handleAnswerChange={handleAnswerChange}
                            isEditing={isEditing}
                        />
                    </tbody>
                </table>
                </div>

                <div className="flex justify-between gap-4 mt-8">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold cursor-pointer"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-semibold cursor-pointer"
                            >
                                Edit Form
                            </button>
                            <button
                                onClick={() => navigate('/submitted-dsm5-forms')}
                                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold cursor-pointer"
                            >
                                Back to List
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewDSM5Form;