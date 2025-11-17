import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaPencilAlt,
  FaLock,
} from "react-icons/fa";

import Base from "../../components/assessmentForms/SensoryProfile/Base";

// Child Form Components
import AuditoryProcessingForm from "../../components/assessmentForms/SensoryProfile/ChildSensoryProfile2Form/AuditoryProcessingForm";
import VisualProcessingForm from "../../components/assessmentForms/SensoryProfile/ChildSensoryProfile2Form/VisualProcessingForm";
import TouchProcessingForm from "../../components/assessmentForms/SensoryProfile/ChildSensoryProfile2Form/TouchProcessingForm";
import MovementProcessingForm from "../../components/assessmentForms/SensoryProfile/ChildSensoryProfile2Form/MovementProcessingForm";
import BodyPositionProcessingForm from "../../components/assessmentForms/SensoryProfile/ChildSensoryProfile2Form/BodyPositionProcessingForm";
import OralSensoryProcessingForm from "../../components/assessmentForms/SensoryProfile/ChildSensoryProfile2Form/OralSensoryProcessingForm";
import ConductSensoryProcessingForm from "../../components/assessmentForms/SensoryProfile/ChildSensoryProfile2Form/ConductSensoryProcessingForm";
import SocialEmotionalSensoryProcessingForm from "../../components/assessmentForms/SensoryProfile/ChildSensoryProfile2Form/SocialEmotionalSensoryProcessingForm";
import AttentionalSensoryProcessingForm from "../../components/assessmentForms/SensoryProfile/ChildSensoryProfile2Form/AttentionalSensoryProcessingForm";

// Toddler Form Components
import ToddlerGeneralProcessingForm from "../../components/assessmentForms/SensoryProfile/ToddlerSensoryProfileForm/GeneralProcessingForm";
import ToddlerAuditoryProcessingForm from "../../components/assessmentForms/SensoryProfile/ToddlerSensoryProfileForm/AuditoryProcessingForm";
import ToddlerVisualProcessingForm from "../../components/assessmentForms/SensoryProfile/ToddlerSensoryProfileForm/VisualProcessingForm";
import ToddlerTouchProcessingForm from "../../components/assessmentForms/SensoryProfile/ToddlerSensoryProfileForm/TouchProcessingForm";
import ToddlerMovementProcessingForm from "../../components/assessmentForms/SensoryProfile/ToddlerSensoryProfileForm/MovementProcessingForm";
import ToddlerOralSensoryProcessingForm from "../../components/assessmentForms/SensoryProfile/ToddlerSensoryProfileForm/OralSensoryProcessingForm";
import ToddlerBehavioralProcessingForm from "../../components/assessmentForms/SensoryProfile/ToddlerSensoryProfileForm/BehavioralSensoryProcessingForm";

const toddlerFormSections = [
  { name: "General Processing", component: ToddlerGeneralProcessingForm },
  { name: "Auditory Processing", component: ToddlerAuditoryProcessingForm },
  { name: "Visual Processing", component: ToddlerVisualProcessingForm },
  { name: "Touch Processing", component: ToddlerTouchProcessingForm },
  { name: "Movement Processing", component: ToddlerMovementProcessingForm },
  {
    name: "Oral Sensory Processing",
    component: ToddlerOralSensoryProcessingForm,
  },
  { name: "Behavioral Processing", component: ToddlerBehavioralProcessingForm },
];

const childFormSections = [
  { name: "Auditory Processing", component: AuditoryProcessingForm },
  { name: "Visual Processing", component: VisualProcessingForm },
  { name: "Touch Processing", component: TouchProcessingForm },
  { name: "Movement Processing", component: MovementProcessingForm },
  { name: "Body Position Processing", component: BodyPositionProcessingForm },
  { name: "Oral Sensory Processing", component: OralSensoryProcessingForm },
  {
    name: "Conduct Sensory Processing",
    component: ConductSensoryProcessingForm,
  },
  {
    name: "Social Emotional Sensory Processing",
    component: SocialEmotionalSensoryProcessingForm,
  },
  {
    name: "Attentional Sensory Processing",
    component: AttentionalSensoryProcessingForm,
  },
];

// --- Helper Functions ---

const isEditable = (timestamp) => {
  if (!timestamp) return false;
  const FIVE_HOURS_IN_MS = 5 * 60 * 60 * 1000;
  const submissionTime = new Date(timestamp).getTime();
  const now = new Date().getTime();
  return now - submissionTime < FIVE_HOURS_IN_MS;
};

const getLocalStorageKey = (assessmentId, sectionName) =>
  `sensory-profile-${assessmentId}-${sectionName}`;

const saveSectionToLocalStorage = (assessmentId, sectionName, data) => {
  if (!assessmentId || !sectionName) return;
  const key = getLocalStorageKey(assessmentId, sectionName);
  localStorage.setItem(key, JSON.stringify(data));
};

const loadSectionFromLocalStorage = (assessmentId, sectionName) => {
  if (!assessmentId || !sectionName) return null;
  const key = getLocalStorageKey(assessmentId, sectionName);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const clearSectionFromLocalStorage = (assessmentId, sectionName) => {
  if (!assessmentId || !sectionName) return;
  const key = getLocalStorageKey(assessmentId, sectionName);
  localStorage.removeItem(key);
};

// --- Component ---

function SensoryProfileAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [stage, setStage] = useState(isEditMode ? "assessment" : "details");
  const [assessmentData, setAssessmentData] = useState(null);
  const [currentSectionIndex, setCurrentIndex] = useState(0);
  const [formSections, setFormSections] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [completedSections, setCompletedSections] = useState({});
  const [isEditingCurrentSection, setIsEditingCurrentSection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sectionDocuments, setSectionDocuments] = useState({});
  const formRef = useRef();

  useEffect(() => {
    if (isEditMode) {
      loadAssessmentSections();
    } else {
      const today = new Date().toISOString().split("T")[0];
      setAssessmentData({ testDate: today });
    }
  }, [id, isEditMode]);

  const loadAssessmentSections = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/assessments/sensory-profile/assessment/${id}`
      );
      const sections = response.data;

      if (sections.length === 0) {
        setError("No assessment data found.");
        return;
      }

      const firstSection = sections[0];
      const assessmentBaseData = {
        patientId: firstSection.patientId,
        examinerId: firstSection.examinerId,
        testDate: firstSection.testDate,
        assessmentType: firstSection.assessmentType,
        ageGroup: firstSection.ageGroup,
      };

      setAssessmentData(assessmentBaseData);

      const relevantSections =
        firstSection.ageGroup === "Toddler"
          ? toddlerFormSections
          : childFormSections;
      setFormSections(relevantSections);

      const completedState = {};
      const sectionDocs = {};
      const sectionData = {};

      sections.forEach((section) => {
        // FIX: Handle different possible timestamp field names and ensure proper format
        let timestamp =
          section.submittedAt || section.createdAt || section.updatedAt;

        // If timestamp is a string, ensure it's in ISO format
        if (typeof timestamp === "string") {
          timestamp = new Date(timestamp).toISOString();
        } else if (timestamp instanceof Date) {
          timestamp = timestamp.toISOString();
        } else if (
          timestamp &&
          typeof timestamp === "object" &&
          timestamp.$date
        ) {
          // Handle MongoDB date format
          timestamp = new Date(timestamp.$date).toISOString();
        }

        // Debug logging to help identify the issue
        console.log(
          `Section: ${
            section.category
          }, Timestamp: ${timestamp}, Type: ${typeof timestamp}`
        );

        completedState[section.category] = {
          submitted: true,
          timestamp: timestamp,
        };
        sectionDocs[section.category] = section._id;
        sectionData[section.category] = {
          responses: section.responses,
          comments: section.comments,
          rawScore: section.rawScore,
        };
      });

      setCompletedSections(completedState);
      setSectionDocuments(sectionDocs);

      setAssessmentData((prev) => ({
        ...prev,
        ...sectionData,
      }));

      setStage("assessment");
    } catch (err) {
      console.error("Error loading assessment:", err);
      setError("Failed to load assessment data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (assessmentData?.ageGroup === "Toddler")
      setFormSections(toddlerFormSections);
    else if (assessmentData?.ageGroup === "Child")
      setFormSections(childFormSections);
  }, [assessmentData]);

  useEffect(() => {
    setIsEditingCurrentSection(false);
  }, [currentSectionIndex]);

  const handleBaseDataChange = useCallback(
    (ageInMonths, patientId, examinerId, testDate) => {
      setAssessmentData((prev) => {
        const updatedData = { ...prev };
        if (patientId !== undefined) updatedData.patientId = patientId;
        if (examinerId !== undefined) updatedData.examinerId = examinerId;
        if (testDate !== undefined) updatedData.testDate = testDate;
        if (ageInMonths !== undefined) updatedData.ageInMonths = ageInMonths;

        if (ageInMonths !== null && ageInMonths !== undefined) {
          if (ageInMonths >= 36 && ageInMonths <= 179) {
            updatedData.ageGroup = "Child";
          } else if (ageInMonths >= 7 && ageInMonths <= 35) {
            updatedData.ageGroup = "Toddler";
          } else {
            updatedData.ageGroup = null;
          }
        }
        return updatedData;
      });
    },
    []
  );

  const transformResponsesToSchema = (responses) => {
    if (!responses || typeof responses !== "object") {
      return [];
    }

    return Object.entries(responses).map(([qid, data]) => ({
      qid: parseInt(qid),
      quadrant: data.quadrant || "",
      score: parseInt(data.score) || 0,
    }));
  };

  const saveSectionToMongoDB = async (sectionName, sectionData) => {
    try {
      setIsSaving(true);

      const { responses, comments, totalScore } = sectionData;
      const currentTimestamp = new Date().toISOString();

      const mongoData = {
        assessmentId: id,
        patientId: assessmentData.patientId,
        examinerId: assessmentData.examinerId,
        testDate: assessmentData.testDate,
        assessmentType: "Sensory Profile",
        ageGroup: assessmentData.ageGroup,
        category: sectionName,
        responses: transformResponsesToSchema(responses),
        rawScore: totalScore || 0,
        comments: comments || "",
        submittedAt: currentTimestamp, // FIX: Ensure we always save the timestamp
      };

      let response;
      const existingDocumentId = sectionDocuments[sectionName];

      if (existingDocumentId) {
        response = await axios.put(
          `/api/assessments/sensory-profile/${existingDocumentId}`,
          mongoData
        );
      } else {
        response = await axios.post(
          `/api/assessments/sensory-profile`,
          mongoData
        );

        setSectionDocuments((prev) => ({
          ...prev,
          [sectionName]: response.data._id,
        }));
      }

      return response.data;
    } catch (error) {
      console.error("Error saving section to MongoDB:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionSubmit = async (sectionData) => {
    const { responses, comments, totalScore } = sectionData;
    const sectionName = formSections[currentSectionIndex].name;
    const timestamp = new Date().toISOString();

    try {
      await saveSectionToMongoDB(sectionName, sectionData);
      setCompletedSections((prev) => ({
        ...prev,
        [sectionName]: { submitted: true, timestamp },
      }));

      setIsEditingCurrentSection(false);

      setAssessmentData((prev) => ({
        ...prev,
        [sectionName]: { responses, comments, rawScore: totalScore },
      }));
      alert(`Section "${sectionName}" saved successfully!`);
    } catch (error) {
      console.error("Error saving section:", error);
      alert(`Failed to save section "${sectionName}". Please try again.`);
    }
  };

  const handleEditSection = () => {
    const sectionName = formSections[currentSectionIndex].name;
    const sectionCompletionInfo = completedSections[sectionName];

    if (!sectionCompletionInfo) return;

    // FIX: Add more detailed logging and validation
    console.log("Edit section check:", {
      sectionName,
      timestamp: sectionCompletionInfo.timestamp,
      isEditable: isEditable(sectionCompletionInfo.timestamp),
      timeDiff: sectionCompletionInfo.timestamp
        ? (new Date().getTime() -
            new Date(sectionCompletionInfo.timestamp).getTime()) /
          (1000 * 60 * 60)
        : "No timestamp",
    });

    if (isEditable(sectionCompletionInfo.timestamp)) {
      setIsEditingCurrentSection(true);
    } else {
      const timeDiff = sectionCompletionInfo.timestamp
        ? (new Date().getTime() -
            new Date(sectionCompletionInfo.timestamp).getTime()) /
          (1000 * 60 * 60)
        : 0;

      alert(
        `The 5-hour editing window for this section has expired (${timeDiff.toFixed(
          1
        )} hours ago). You will need to complete this section again.`
      );
      setCompletedSections((prev) => {
        const updated = { ...prev };
        delete updated[sectionName];
        return updated;
      });
      setAssessmentData((prev) => {
        const updated = { ...prev };
        delete updated[sectionName];
        return updated;
      });
      setIsEditingCurrentSection(false);
    }
  };

  const handleNext = () => {
    if (currentSectionIndex < formSections.length - 1) {
      setCurrentIndex(currentSectionIndex + 1);
    }
  };

  const handleFinalize = async () => {
    if (!assessmentData.patientId || !assessmentData.examinerId) {
      alert("Patient and Examiner information is missing.");
      return;
    }

    const allSectionsCompleted = formSections.every(
      (section) => completedSections[section.name]?.submitted
    );

    if (!allSectionsCompleted) {
      const confirmed = window.confirm(
        "You have not submitted all sections. Are you sure you want to finish?"
      );
      if (!confirmed) {
        return;
      }
    }

    alert("Assessment complete. Navigating back to the main view.");
    navigate("/sensory-profile-view");
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (stage === "details") {
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold text-center mb-6">
          Patient & Assessment Details
        </h1>
        <Base
          initialData={assessmentData}
          onDataChange={handleBaseDataChange}
          isEditMode={isEditMode}
        />
        <div className="text-center mt-8">
          <button
            onClick={() => {
              if (assessmentData?.patientId && assessmentData?.examinerId) {
                setStage("assessment");
              } else {
                alert(`Patient ID and Examiner ID are required.`);
              }
            }}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 hover:shadow-lg mx-auto"
          >
            Proceed to Assessment Sections
            <FaArrowRight className="text-lg" />
          </button>
        </div>
      </div>
    );
  }

  const sectionName = formSections[currentSectionIndex]?.name;
  const sectionCompletionInfo = sectionName
    ? completedSections[sectionName]
    : null;
  const isCurrentSectionCompleted = sectionCompletionInfo?.submitted;
  const CurrentFormComponent = formSections[currentSectionIndex]?.component;

  if (!CurrentFormComponent) {
    return <div>Initializing assessment sections...</div>;
  }

  return (
    <div className="p-4 sm:p-8">
      {isSaving && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg font-semibold">Saving...</span>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Sensory Profile</h1>
        <p className="text-lg text-gray-500">
          Patient ID: {assessmentData.patientId}
        </p>
      </div>

      <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-10 overflow-x-auto">
        {formSections.map((section, idx) => {
          const canEdit = isEditable(
            completedSections[section.name]?.timestamp
          );
          const isComplete = completedSections[section.name]?.submitted;
          return (
            <div
              key={section.name}
              className="flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105 min-w-max"
              onClick={() => setCurrentIndex(idx)}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 mb-2 ${
                  isComplete && canEdit
                    ? "bg-green-500 text-white"
                    : isComplete && !canEdit
                    ? "bg-yellow-500 text-white"
                    : idx === currentSectionIndex
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isComplete && canEdit ? (
                  <FaCheckCircle className="text-xl" />
                ) : null}
                {isComplete && !canEdit ? <FaLock className="text-xl" /> : null}
                {!isComplete ? <span>{idx + 1}</span> : null}
              </div>
              <p
                className={`text-sm font-semibold text-center leading-tight ${
                  isComplete
                    ? "text-green-600 font-medium"
                    : idx === currentSectionIndex
                    ? "text-blue-600 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {section.name}
              </p>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-white rounded-2xl shadow-xl min-h-[300px] flex flex-col justify-center">
        {isCurrentSectionCompleted && !isEditingCurrentSection ? (
          <div className="text-center">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">
              Section Complete & Saved
            </h2>
            <p className="text-gray-600 mt-2">
              You have successfully submitted and saved the "{sectionName}"
              section to the database.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleEditSection}
                disabled={isSaving}
                className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 bg-indigo-100 text-indigo-700 font-semibold rounded-lg shadow-sm hover:bg-indigo-200 transition-all duration-200 disabled:opacity-50"
              >
                <FaPencilAlt />
                Edit Responses
              </button>
              {currentSectionIndex < formSections.length - 1 && (
                <button
                  onClick={() => setCurrentIndex(currentSectionIndex + 1)}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
                >
                  Export PDF
                 
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              You can edit this section for the next 5 hours.
            </p>
          </div>
        ) : (
          <CurrentFormComponent
            ref={formRef}
            onSubmit={handleSectionSubmit}
            initialData={
              loadSectionFromLocalStorage(id, sectionName) ||
              assessmentData?.[sectionName]
            }
            patientId={assessmentData?.patientId}
            examinerId={assessmentData?.examinerId}
            testDate={assessmentData?.testDate}
            isEditing={isEditingCurrentSection}
            disabled={isSaving}
          />
        )}
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentSectionIndex === 0 || isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            currentSectionIndex === 0 || isSaving
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg"
          }`}
        >
          <FaArrowLeft className="text-sm" />
          Previous
        </button>

        {currentSectionIndex === formSections.length - 1 ? (
          <button
            onClick={handleFinalize}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
          >
            <FaCheckCircle className="text-sm" />
            Finish
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
          >
            Next Section
            <FaArrowRight className="text-sm" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SensoryProfileAssessment;
