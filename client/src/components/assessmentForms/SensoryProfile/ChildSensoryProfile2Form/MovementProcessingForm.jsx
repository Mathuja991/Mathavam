import axios from "axios";
import BaseForm from "../BaseForm";
import { useState } from "react";
import { createSensoryProfilePayload } from "../../../../utills/apiUtils";
import { useSensorySectionLock } from "../../../../hooks/useSensorySectionLock";

function MovementProcessingForm({
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

  const isSubmitting = isSubmittingProp !== undefined ? isSubmittingProp : isCreating;
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
    category: "Movement Processing",
    initialResponses,
    initialComments,
  });
  const finalDisabled = disabled || autoLocked;

  const questions = [
    {
      qid: 27,
      text: "pursues movement to the point it interferes with daily routines (for example, can't sit still, fidgets).",
      quadrant: "SK",
    },
    {
      qid: 28,
      text: "rocks in chair, on floor, or while standing.",
      quadrant: "SK",
    },
    {
      qid: 29,
      text: "hesitates going up or down curbs or steps (for example, is cautious, stops before moving).",
      quadrant: "",
    },
    {
      qid: 30,
      text: "becomes excited during movement tasks.",
      quadrant: "SK",
    },
    {
      qid: 31,
      text: "takes movement or climbing risks that are unsafe.",
      quadrant: "SK",
    },
    {
      qid: 32,
      text: "looks for opportunities to fall with no regard for own safety (for example, falls down on purpose).",
      quadrant: "SK",
    },
    {
      qid: 33,
      text: "loses balance unexpectedly when walking on an uneven surface.",
      quadrant: "RG",
    },
    {
      qid: 34,
      text: "bumps into things, failing to notice objects or people in the way.",
      quadrant: "RG",
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
    <BaseForm
      questions={questions}
      onSubmit={handleFormSubmit}
      formTitle="Movement Processing"
      isSubmitting={isSubmitting}
      initialResponses={resolvedResponses || initialResponses}
      initialComments={resolvedComments}
      disabled={finalDisabled}
    />
  );
}

export default MovementProcessingForm;
