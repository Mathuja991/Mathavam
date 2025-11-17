import React, { useState, useEffect } from "react";
import Apart from "../../components/assessmentForms/DSM5/Apart";
import Bpart from "../../components/assessmentForms/DSM5/Bpart";
import Otherpart from "../../components/assessmentForms/DSM5/Otherpart";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DSM5Form = () => {
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

  const isEditing = true; 
  const navigate = useNavigate();

  

  useEffect(() => {
    handleReset();
  }, []);

  const handlePatientInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPatientInfo((prevInfo) => ({
      ...prevInfo,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAnswerChange = (section, index, value) => {
    setAnswers((prevAnswers) => {
      const updated = { ...prevAnswers };
      updated[section][index] = value;
      return updated;
    });
  };

  const handleSeverityChange = (section, value) => {
    setSeverityRatings((prev) => ({
      ...prev,
      [section]: value,
    }));
  };

  const handleReset = () => {
    setPatientInfo({
      id: "",
      name: "",
      dob: "",
      hasPreviousDsm4Diagnosis: false,
    });
    setAnswers({
      socialCommunication: Array(3).fill(null),
      repetitiveBehaviors: Array(4).fill(null),
      otherCriteria: Array(3).fill(null),
    });
    setSeverityRatings({
      socialCommunication: null,
      repetitiveBehaviors: null,
    });
  };

  const handleSubmit = async () => {
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
      toast.error("Please complete all required fields before submitting.");
      return;
    }

    try {
      const payload = {
        patientInfo,
        answers,
        severityRatings,
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/dsm5forms`, payload);
      toast.success(res.data.message);
      navigate('submitted-dsm5-forms');
    } catch (error) {
      toast.error("Submission failed. Please check console for details.");
      console.error("Error submitting DSM-5 form:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="bg-slate-50 py-12 px-4 min-h-screen">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max- mx-auto border border-blue-200 space-y-6">
        <h1 className="text-3xl font-bold text-indigo-700 text-center mb-6">
          DSM-5 Diagnostic Checklist
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={!isEditing}
              />
            </div>
          ))}
        </div>
        <div className="overflow-x-auto"> 
        <table className="w-full border-collapse border border-blue-400">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-blue-500 p-3 text-center uppercase text-lg">DSM-5 Criteria</th>
              <th className="border border-blue-500 p-3" colSpan="2">
                <span className="uppercase text-sm">Autism Spectrum Disorder</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-blue-50 transition-colors">
              <td className="border border-blue-300 p-2 text-sm text-gray-700 text-left">
                <strong>Note:</strong>  If the individual has a well-established DSM-IV diagnosis of autistic disorder, Asperger’s disorder, or PDD-NOS, please check this box. Complete the below checklist to reclassify the previous diagnosis to Autism Spectrum Disorder.
              </td>
              <td className="border border-blue-300 p-2 text-center" colSpan="2">
                <input
                  type="checkbox"
                  className="scale-150 accent-blue-600 cursor-pointer"
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
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold cursor-pointer transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold cursor-pointer transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default DSM5Form;