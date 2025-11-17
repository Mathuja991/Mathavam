import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Base from "../../components/assessmentForms/SensoryProfile/Base";

function SensoryProfileCreatePage() {
  const [patientAge, setPatientAge] = useState(null);
  const [patientId, setPatientId] = useState("");
  const [examinerId, setExaminerId] = useState("");
  const [testDate, setTestDate] = useState("");

  const [validationMessage, setValidationMessage] = useState("");
  const navigate = useNavigate();

  const handleBaseDataChange = useCallback(
    (ageInMonths, patientId, examinerId, testDate) => {
      setPatientAge(ageInMonths);
      setPatientId(patientId);
      setExaminerId(examinerId);
      setTestDate(testDate);
    },
    []
  );

  const getFormType = () => {
    if (patientAge === null) return null;
    if (patientAge >= 36 && patientAge <= 179) return "child";
    if (patientAge >= 7 && patientAge <= 35) return "toddler";
    return "invalid";
  };

  const formType = getFormType();

  const canProceedToSections =
    formType &&
    formType !== "invalid" &&
    patientId &&
    examinerId &&
    testDate;

  const handleNextStep = () => {
    if (!canProceedToSections) {
      setValidationMessage(
        "Please complete the basic details to continue to the assessment forms."
      );
      return;
    }
    setValidationMessage("");
    navigate("/dashboard/sensory-profile-sections", {
      state: {
        patientAge,
        patientId,
        examinerId,
        testDate,
      },
    });
  };

  return (
    <div className="pb-16 px-4 sm:px-6 lg:px-8">
      <Base onDataChange={handleBaseDataChange} />

      {patientAge === null && (
        <div className="text-center p-8 bg-gray-50 rounded-lg mt-12">
          <p className="text-gray-600 font-medium text-xl">
            Please enter the patient's date of birth and the test date to begin
            the assessment.
          </p>
        </div>
      )}

      {formType === "invalid" && (
        <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg mt-12">
          <p className="font-medium text-xl">
            The patient's age is outside the valid range (7 to 179 months) for
            this assessment.
          </p>
        </div>
      )}

      <div className="mt-10 flex justify-end">
        <button
          onClick={handleNextStep}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          disabled={!canProceedToSections}
        >
          Next
        </button>
      </div>

      {validationMessage && (
        <p className="mt-4 text-right text-red-600 text-sm">
          {validationMessage}
        </p>
      )}
    </div>
  );
}

export default SensoryProfileCreatePage;
