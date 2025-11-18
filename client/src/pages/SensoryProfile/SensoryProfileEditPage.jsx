import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Base from "../../components/assessmentForms/SensoryProfile/Base";
import BaseCards from "../../components/assessmentForms/SensoryProfile/BaseCards";
import { createSensoryProfilePayload } from "../../utills/apiUtils";

// Helper function to get the auth token (Duplicated for simplicity; ideally from a central utility)
const getAuthToken = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      // Assuming the token is stored as 'token' inside the 'user' object
      return parsedUser.token;
    } catch (error) {
      console.error("Error parsing user data for token:", error);
      return null;
    }
  }
  return null;
};

function SensoryProfileEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setError(
            "Authentication token missing. Please ensure you are logged in."
          );
          setIsLoading(false);
          return;
        }

        const config = {
          headers: {
            "x-auth-token": token,
          },
        };

        const response = await axios.get(
          `/api/assessments/sensory-profile/${id}`,
          config
        );
        setInitialData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setError(
            "Error: Authorization failed (401). You may not have permission to view this."
          );
        } else {
          setError("Failed to load assessment data.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  const handleUpdateSubmit = async (formSpecificData) => {
    const { responses, comments, totalScore, formTitle } = formSpecificData;

    const token = getAuthToken();
    if (!token) {
      alert("Update failed: Authentication token missing. Please log in again.");
      return;
    }

    const config = {
      headers: {
        "x-auth-token": token,
      },
    };

    const formData = createSensoryProfilePayload(
      { responses, comments, totalScore, formTitle },
      {
        patientId: initialData.patientId,
        examinerId: initialData.examinerId,
        testDate: initialData.testDate,
        category: initialData.category,
        ageGroup: initialData.ageGroup,
      }
    );

    setIsSaving(true);
    try {
      const response = await axios.put(
        `/api/assessments/sensory-profile/${id}`,
        formData,
        config // Pass the configuration for PUT
      );
      setInitialData(response.data);
      setIsEditing(false); // Disable editing on successful update
      alert("Assessment updated successfully!");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        alert(
          "Update failed: Authorization failed (401). Please re-login or check permissions."
        );
      } else {
        alert(
          `Update failed: ${err.response?.data?.message || err.message}`
        );
      }
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xl font-medium text-gray-600">
        Loading assessment for editing...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-100 text-red-800 rounded-lg max-w-xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="p-8 text-center text-xl font-medium text-gray-600">
        Assessment data not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 lg:p-10 bg-white rounded-3xl shadow-2xl font-['Roboto',_sans-serif]">
      <h1 className="text-4xl font-extrabold text-center mb-6 text-indigo-800 tracking-tight leading-snug">
        Sensory Profile: Edit Entry
      </h1>
      <p className="text-center text-lg text-gray-600 mb-10">
        Patient ID: <span className="font-semibold">{initialData.patientId}</span> |
        Assessment Type: <span className="font-semibold capitalize">{initialData.ageGroup}</span>
      </p>

      {/* View Only Mode (Always visible for reference) */}
      <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${isEditing ? 'border-gray-200 bg-gray-50' : 'border-indigo-400 bg-white shadow-xl'}`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Original Submission (View Only)</h2>
        <span className="inline-block text-xs font-medium tracking-wide text-gray-500 bg-white/80 px-3 py-1 rounded-full border border-gray-200">
          View Only
        </span>
        <div className="pointer-events-none opacity-60">
          <Base onDataChange={() => {}} initialData={initialData} />
        </div>
      </div>

      <div className="flex justify-end px-6 -mt-6">
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className={`px-5 py-2 rounded-lg font-semibold text-white transition ${
            isEditing
              ? "bg-gray-600 hover:bg-gray-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isEditing ? "Cancel Edit" : "Enable Editing"}
        </button>
      </div>

      <div className={`mt-8 transition-all duration-300 ${isEditing ? 'opacity-100 max-h-screen' : 'opacity-50 max-h-0 overflow-hidden'}`}>
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Editable Section</h2>
        <BaseCards
          sensoryName={initialData.category}
          isExpanded={true}
          onToggle={() => {}}
          formType={initialData.ageGroup.toLowerCase()}
          patientId={initialData.patientId}
          examinerId={initialData.examinerId}
          testDate={initialData.testDate}
          initialResponses={initialData.responses}
          initialComments={initialData.comments}
          onSubmit={handleUpdateSubmit}
          disabled={!isEditing || isSaving} // Disable form when not editing or when saving
          isSaving={isSaving}
          isEditMode={true}
        />
      </div>
    </div>
  );
}

export default SensoryProfileEditPage;