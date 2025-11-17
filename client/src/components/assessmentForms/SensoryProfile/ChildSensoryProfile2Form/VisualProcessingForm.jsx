import axios from "axios";
import BaseForm from "../BaseForm";
import { useState } from "react";
import { createSensoryProfilePayload } from "../../../../utills/apiUtils";
import { useSensorySectionLock } from "../../../../hooks/useSensorySectionLock";

function VisualProcessingForm({
  patientId,
  examinerId,
  testDate,
  initialResponses,
  initialComments,
  onFormSubmit,
  isSubmitting: isSubmittingProp,
  disabled = false,
}) {
  const [isCreating, setIsCreating] = useState(false);

  const isSubmitting =
    isSubmittingProp !== undefined ? isSubmittingProp : isCreating;
  const hasInitialFromParent =
    Array.isArray(initialResponses) && initialResponses.length > 0;
  const {
    resolvedResponses,
    resolvedComments,
    isLocked: autoLocked,
    refreshSection,
  } = useSensorySectionLock({
    patientId,
    testDate,
    category: "Visual Processing",
    initialResponses,
    initialComments,
  });
  const finalDisabled = disabled || autoLocked;

  const questions = [
    {
      qid: 9,
      text: "prefers to play or work in low lighting.",
      quadrant: "SN",
    },
    {
      qid: 10,
      text: "prefers bright colors or patterns for clothing.",
      quadrant: "",
    },
    {
      qid: 11,
      text: "enjoys looking at visual details in objects.",
      quadrant: "",
    },
    {
      qid: 12,
      text: "needs help to find objects that are obvious to others.",
      quadrant: "RG",
    },
    {
      qid: 13,
      text: "is more bothered by bright lights than other same-aged children.",
      quadrant: "SN",
    },
    {
      qid: 14,
      text: "watches people as they move around the room.",
      quadrant: "SK",
    },
    {
      qid: 15, //not part of visual raw score
      text: "is bothered by bright lights (for example, hides from sunlight through car window).*",
      quadrant: "AV",
      excludeFromScore: true,
    },
  ];

  const handleFormSubmit = async (formSpecificData) => {
    if (onFormSubmit) {
      onFormSubmit(formSpecificData);
      return;
    }

    if (isCreating) return;
    setIsCreating(true);

    const sharedData = {
      patientId,
      examinerId,
      testDate,
      ageGroup: "Child",
    };

    const formData = createSensoryProfilePayload(formSpecificData, sharedData);

    try {
      const result = await axios.post(
        "/api/assessments/sensory-profile",
        formData
      );
      console.log("Form Submitted Successfully:", result.data);
      if (!hasInitialFromParent) {
        await refreshSection();
      }
      alert("Assessment saved!");
    } catch (error) {
      console.error("There was an error submitting the form:", error);
      alert("Error: Could not save the assessment.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <BaseForm
        questions={questions}
        onSubmit={handleFormSubmit}
        formTitle="Visual Processing"
        isSubmitting={isSubmitting}
        initialResponses={resolvedResponses || initialResponses}
        initialComments={resolvedComments}
        disabled={finalDisabled}
      />
      <p>* - Item/s is/are not part of the VISUAL Raw Score.</p>
    </>
  );
}

export default VisualProcessingForm;
