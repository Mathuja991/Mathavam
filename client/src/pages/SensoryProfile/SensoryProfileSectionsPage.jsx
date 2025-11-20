import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import BaseCards from "../../components/assessmentForms/SensoryProfile/BaseCards";
import { API_BASE_URL, createSensoryProfilePayload } from "../../utills/apiUtils";
import { printSensorySection } from "../../utills/printSensorySection";

const buildAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    "x-auth-token": token,
    Authorization: `Bearer ${token}`,
  };
};

const formatIsoToDisplay = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
};

const normalizeDateOnly = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.length === 10 && !value.includes("T")) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const getSectionTimestamp = (section) =>
  section?.submittedAt || section?.updatedAt || section?.createdAt;

const canEditSection = (section) => {
  const timestamp = getSectionTimestamp(section);
  if (!timestamp) return false;
  const FIVE_HOURS = 5 * 60 * 60 * 1000;
  const submittedAt = new Date(timestamp).getTime();
  if (Number.isNaN(submittedAt)) return false;
  return Date.now() - submittedAt < FIVE_HOURS;
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const timePart = date.toLocaleTimeString();
  return `${day}-${month}-${year} ${timePart}`;
};

function SensoryProfileSectionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const { patientAge, patientId, examinerId, testDate } = state;
  const normalizedTestDate = useMemo(
    () => normalizeDateOnly(testDate),
    [testDate]
  );

  const formType = useMemo(() => {
    if (patientAge === null || patientAge === undefined) return null;
    if (patientAge >= 36 && patientAge <= 179) return "child";
    if (patientAge >= 7 && patientAge <= 35) return "toddler";
    return "invalid";
  }, [patientAge]);

  const formSections = useMemo(() => {
    if (formType === "child") {
      return [
        "Auditory Processing",
        "Visual Processing",
        "Touch Processing",
        "Movement Processing",
        "Body Position Processing",
        "Oral Sensory Processing",
        "Conduct Associated with Sensory Processing",
        "Social Emotional Responses Associated with Sensory Processing",
        "Attentional Responses Associated with Sensory Processing",
      ];
    }
    if (formType === "toddler") {
      return [
        "General Processing",
        "Auditory Processing",
        "Visual Processing",
        "Touch Processing",
        "Movement Processing",
        "Oral Sensory Processing",
        "Behavioral Associated with Sensory Processing",
      ];
    }
    return [];
  }, [formType]);

  const [selectedSection, setSelectedSection] = useState(
    formSections[0] || null
  );
  const [existingSections, setExistingSections] = useState({});
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [sectionsError, setSectionsError] = useState("");
  const [savingSection, setSavingSection] = useState(false);
  const [editingSections, setEditingSections] = useState({});

  useEffect(() => {
    if (
      !patientId ||
      !examinerId ||
      !testDate ||
      !formType ||
      formType === "invalid"
    ) {
      navigate("/dashboard/sensory-profile-fill-form", { replace: true });
    }
  }, [patientId, examinerId, testDate, formType, navigate]);

  useEffect(() => {
    if (!patientId || !normalizedTestDate) {
      setExistingSections({});
      return;
    }

    let cancelled = false;
    const fetchSavedSections = async () => {
      setIsLoadingSections(true);
      setSectionsError("");
      try {
        const headers = buildAuthHeaders();
        if (!headers["x-auth-token"]) {
          throw new Error("Missing auth token. Please log in again.");
        }
        const response = await axios.get(`${API_BASE_URL}/assessments/sensory-profile`, {
          params: { patientId },
          headers,
        });
        if (cancelled) return;

        const mapped = {};
        response.data.forEach((section) => {
          const sectionDate = normalizeDateOnly(section.testDate);
          if (sectionDate === normalizedTestDate) {
            mapped[section.category] = section;
          }
        });
        setExistingSections(mapped);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load saved sections:", error);
          setSectionsError("Unable to load previously saved sections.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSections(false);
        }
      }
    };

    fetchSavedSections();
    return () => {
      cancelled = true;
    };
  }, [patientId, normalizedTestDate, formSections]);

  useEffect(() => {
    if (formSections.length === 0) {
      setSelectedSection(null);
    } else if (!selectedSection || !formSections.includes(selectedSection)) {
      setSelectedSection(formSections[0]);
    }
  }, [formSections, selectedSection]);

  useEffect(() => {
    setEditingSections({});
  }, [normalizedTestDate]);

  const handleSectionSubmit = useCallback(
    async (formSpecificData) => {
      if (!patientId || !examinerId || !testDate || !formType) {
        alert("Patient and therapist information is required.");
        return;
      }

      setSavingSection(true);
      try {
        const headers = buildAuthHeaders();
        if (!headers["x-auth-token"]) {
          throw new Error("Missing auth token. Please log in again.");
        }
        const existingSection = selectedSection
          ? existingSections[selectedSection]
          : null;
        const payload = createSensoryProfilePayload(formSpecificData, {
          patientId,
          examinerId,
          testDate,
          ageGroup: formType === "child" ? "Child" : "Toddler",
        });

        const url = existingSection?._id
          ? `${API_BASE_URL}/assessments/sensory-profile/${existingSection._id}`
          : `${API_BASE_URL}/assessments/sensory-profile`;
        const method = existingSection?._id ? axios.put : axios.post;
        const response = await method(url, payload, { headers });

        const savedDoc = response.data;
        const categoryKey = savedDoc?.category || payload.category;

        setExistingSections((prev) => {
          const next = { ...prev };
          const key =
            categoryKey ||
            selectedSection ||
            formSpecificData?.formTitle ||
            "Unknown Section";
          next[key] = { ...(prev[key] || {}), ...savedDoc };
          return next;
        });
        setEditingSections((prev) => {
          const next = { ...prev };
          if (selectedSection) {
            delete next[selectedSection];
          }
          if (categoryKey) {
            delete next[categoryKey];
          }
          return next;
        });
        alert("Assessment section saved.");
      } catch (error) {
        console.error("There was an error submitting the form:", error);
        const message =
          error?.response?.data?.message ||
          "Error: Could not save the assessment.";
        alert(message);
      } finally {
        setSavingSection(false);
      }
    },
    [
      patientId,
      examinerId,
      testDate,
      formType,
      formSections,
      selectedSection,
      existingSections,
    ]
  );

  const rawSelectedSectionData = selectedSection
    ? existingSections[selectedSection] || null
    : null;
  const selectedSectionData =
    rawSelectedSectionData &&
    normalizeDateOnly(rawSelectedSectionData.testDate) === normalizedTestDate
      ? rawSelectedSectionData
      : null;
  const isEditingSection = Boolean(editingSections[selectedSection]);
  const isSectionLocked =
    Boolean(selectedSectionData) && !isEditingSection && !savingSection;
  const canEditCurrentSection =
    Boolean(selectedSectionData) && canEditSection(selectedSectionData);
  const submissionTimestamp = getSectionTimestamp(selectedSectionData);

  const startEditingSection = () => {
    if (!selectedSection) return;
    setEditingSections((prev) => ({ ...prev, [selectedSection]: true }));
  };

  const cancelEditingSection = () => {
    if (!selectedSection) return;
    setEditingSections((prev) => {
      const next = { ...prev };
      delete next[selectedSection];
      return next;
    });
  };

  const handlePrintSelectedSection = useCallback(() => {
    if (!selectedSectionData) {
      alert("No saved responses available for printing.");
      return;
    }
    printSensorySection({
      baseInfo: {
        patientId,
        examinerId,
        testDate,
        ageGroup: formType === "child" ? "Child" : "Toddler",
      },
      sectionData: {
        category: selectedSectionData.category || selectedSection,
        responses: selectedSectionData.responses,
        rawScore: selectedSectionData.rawScore,
        comments: selectedSectionData.comments,
      },
    });
  }, [
    selectedSectionData,
    patientId,
    examinerId,
    testDate,
    formType,
    selectedSection,
  ]);

  if (
    !patientId ||
    !examinerId ||
    !testDate ||
    !formType ||
    formType === "invalid"
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {formType === "child"
                    ? "Child Sensory Profile-2"
                    : "Toddler Sensory Profile"}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 ml-5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Patient ID:</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg border border-blue-100">
                    {patientId}
                  </span>
                </div>
                <div className="hidden sm:block text-gray-300">•</div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Therapist ID:</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-100">
                    {examinerId}
                  </span>
                </div>
                <div className="hidden sm:block text-gray-300">•</div>
                {testDate && (
                  <>
                    <div className="hidden sm:block text-gray-300">•</div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Test Date:</span>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 font-semibold rounded-lg border border-purple-100">
                        {formatIsoToDisplay(testDate)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/sensory-profile-fill-form")}
              className="group px-6 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-medium hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Patient Details
            </button>
          </div>
        </div>

        {sectionsError && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {sectionsError}
          </div>
        )}

        {/* Section Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-4 text-center">
            Assessment Sections
          </h2>

          <div className="flex justify-between items-start">
            {formSections.map((section, index) => {
              const shortName = section
                .replace(/Processing/g, "")
                .replace(/Associated with Sensory/g, "")
                .trim();

              return (
                <button
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className="group flex flex-col items-center gap-2 transition-all duration-200 flex-1"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                      selectedSection === section
                        ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110"
                        : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:scale-105"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs font-medium text-center px-1 leading-tight transition-colors ${
                      selectedSection === section
                        ? "text-blue-700"
                        : "text-gray-600 group-hover:text-blue-600"
                    }`}
                  >
                    {shortName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Assessment Form */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isLoadingSections && (
            <div className="p-4 text-sm text-gray-500 text-center">
              Loading saved responses...
            </div>
          )}

          {selectedSectionData && (
            <div className="border-b border-blue-100 bg-blue-50 px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Responses saved on {formatDateTime(submissionTimestamp)}
                </p>
                <p className="text-xs text-blue-700">
                  {isSectionLocked
                    ? canEditCurrentSection
                      ? "Section locked. You can edit within 5 hours of submission."
                      : "Edit window (5 hours) has expired."
                    : "You are editing the saved responses for this section."}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePrintSelectedSection}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-blue-700 border border-blue-200 hover:bg-blue-100"
                  disabled={!selectedSectionData}
                >
                  Print
                </button>
                {isSectionLocked ? (
                  canEditCurrentSection ? (
                    <button
                      onClick={startEditingSection}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      Edit Responses
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-rose-600">
                      Editing disabled
                    </span>
                  )
                ) : (
                  <button
                    onClick={cancelEditingSection}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          )}

          {selectedSection ? (
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500"></div>
              <BaseCards
                key={selectedSection}
                sensoryName={selectedSection}
                isExpanded={true}
                onToggle={() => {}}
                formType={formType}
                patientId={patientId}
                examinerId={examinerId}
                testDate={testDate}
                onSubmit={handleSectionSubmit}
                initialResponses={selectedSectionData?.responses}
                initialComments={selectedSectionData?.comments}
                disabled={isSectionLocked || savingSection}
                minimal
              />
              {isSectionLocked && (
                <div className="absolute inset-0 rounded-2xl border-2 border-blue-100 pointer-events-none"></div>
              )}
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Section Selected
              </h3>
              <p className="text-gray-500">
                Please select a section from above to begin the assessment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SensoryProfileSectionsPage;
