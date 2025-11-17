import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Base from "../../components/assessmentForms/SensoryProfile/Base";
import BaseCards from "../../components/assessmentForms/SensoryProfile/BaseCards";
import { createSensoryProfilePayload } from "../../utills/apiUtils";

function SensoryProfileEditPage() {
  const { id } = useParams();
  const navigate = useNavigate(); 

  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await axios.get(`/api/assessments/sensory-profile/${id}`);
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
    const {responses, comments, totalScore, formTitle} = formSpecificData;
    
    const formData = createSensoryProfilePayload(
      { responses, comments, totalScore, formTitle },
      {
        patientId: initialData.patientId,
        examinerId: initialData.examinerId,
        testDate: initialData.testDate,
        ageGroup: initialData.ageGroup,
      }
    );
    //console.log("Submitting updated data:", formData);
    try{
        await axios.put(`/api/assessments/sensory-profile/${id}`, formData);
        alert('Assessment updated successfully!');
        setIsEditing(false);
        navigate('/dashboard/sensory-profile-view');
    } catch (err){
        console.error("Error updating assessment:", err);

        let errorMessage = "An unexpected error occurred. Please try again.";

        if (err.response){
            if (err.response.status === 409){
                errorMessage = err.response.data.message || 'This update would create a duplicate record.';
            } else if (err.response.status === 404) {
              errorMessage = 'This assessment could not be found. It may have been deleted.';
            } else if (err.response.data?.message) {
              errorMessage = err.response.data.message;
            }
          } else if (err.request) {
            errorMessage = "Cannot connect to the server. Please check your network connection.";
          }
          alert(`Error: ${errorMessage}`);
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
          Personal details are view-only. Use the button below to edit section scores.
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
                isEditing ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"
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
              disabled={!isEditing}
              
            />
          </div>
        </>
      )}
    </div>
  );
}

export default SensoryProfileEditPage;
