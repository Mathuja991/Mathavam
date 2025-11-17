import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Base from "../../components/assessmentForms/SensoryProfile/Base";
import BaseCards from "../../components/assessmentForms/SensoryProfile/BaseCards";
import { createSensoryProfilePayload } from "../../utills/apiUtils";

// Helpers to fetch auth headers (prefers standalone token, falls back to user.token)
const getAuthToken = () => {
  const direct = localStorage.getItem("token");
  if (direct) return direct;
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try {
    const parsed = JSON.parse(storedUser);
    return parsed.token || null;
  } catch (err) {
    console.error("Error parsing user token:", err);
    return null;
  }
};

const buildAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) return null;
  return {
    "x-auth-token": token,
    Authorization: `Bearer ${token}`,
  };
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
        const headers = buildAuthHeaders();
        if (!headers) {
          setError("Authentication token missing. Please ensure you are logged in.");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`/api/assessments/sensory-profile/${id}`, {
          headers,
        });
        setInitialData(response.data);
      } catch (err) {
        setError("Failed to load assessment data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  const handleUpdateSubmit = async (formSpecificData) => {
    const { responses, comments, totalScore, formTitle } = formSpecificData;
    const headers = buildAuthHeaders();
    if (!headers) {
      alert("Update failed: Authentication token missing. Please log in again.");
      return;
    }

    const formData = createSensoryProfilePayload(
      { responses, comments, totalScore, formTitle },
      {
        patientId: initialData.patientId,
        examinerId: initialData.examinerId,
        testDate: initialData.testDate,
        ageGroup: initialData.ageGroup,
      }
    );

    setIsSaving(true);
    try {
      await axios.put(`/api/assessments/sensory-profile/${id}`, formData, {
        headers,
      });
      alert("Assessment updated successfully!");
      setIsEditing(false);
      navigate("/dashboard/sensory-profile-view");
    } catch (err) {
      console.error("Error updating assessment:", err);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (err.response) {
        if (err.response.status === 409) {
          errorMessage =
            err.response.data.message ||
            "This update would create a duplicate record.";
        } else if (err.response.status === 404) {
          errorMessage =
            "This assessment could not be found. It may have been deleted.";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage =
          "Cannot connect to the server. Please check your network connection.";
      }
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading assessment for editing...</div>;
  }
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  if (!initialData) {
    return <div>Assessment not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 p-6">
        <h1 className="text-3xl font-bold">Sensory Profile</h1>
        <p className="text-sm text-gray-500">
          Personal details are view-only. Use the button below to edit section
          scores.
        </p>
      </div>

      {initialData && (
        <>
          <div className="relative">
            <span className="absolute top-4 right-6 z-10 text-xs font-semibold uppercase tracking-wide text-gray-500 bg-white/80 px-3 py-1 rounded-full border border-gray-200">
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
              {isEditing ? "Cancel Edit" : "Edit Scores"}
            </button>
          </div>

          <div className="max-w-3xl mx-auto mt-8">
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
              disabled={!isEditing || isSaving}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default SensoryProfileEditPage;
