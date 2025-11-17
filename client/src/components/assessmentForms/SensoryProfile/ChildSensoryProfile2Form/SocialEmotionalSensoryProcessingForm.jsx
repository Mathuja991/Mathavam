import axios from "axios";
import BaseForm from "../BaseForm";
import { useState } from "react";
import { createSensoryProfilePayload } from "../../../../utills/apiUtils";
import { useSensorySectionLock } from "../../../../hooks/useSensorySectionLock";

function SocialEmotionalSensoryProcessingForm({
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
    category: "Social Emotional Responses Associated with Sensory Processing",
    initialResponses,
    initialComments,
  });
  const finalDisabled = disabled || autoLocked;

  const questions = [
    {
      qid: 62,
      text: "seems to have low self-esteem (for example, difficulty liking self).",
      quadrant: "RG",
    },
    {
      qid: 63,
      text: "needs positive support to return to challenging situations.",
      quadrant: "AV",
    },
    {
      qid: 64,
      text: "is sensitive to criticisms.",
      quadrant: "AV",
    },
    {
      qid: 65,
      text: "has definite, predictable fears.",
      quadrant: "AV",
    },
    {
      qid: 66,
      text: "expresses feeling like a failure.",
      quadrant: "AV",
    },
    {
      qid: 67,
      text: "is too serious.",
      quadrant: "AV",
    },
    {
      qid: 68,
      text: "has strong emotional outbursts when unable to complete a task.",
      quadrant: "AV",
    },
    {
      qid: 69,
      text: "struggles to interpret body language or facial expression.",
      quadrant: "SN",
    },
    {
      qid: 70,
      text: "gets frustrated easily.",
      quadrant: "AV",
    },
    {
      qid: 71,
      text: "has fears that interfere with daily routines.",
      quadrant: "AV",
    },
    {
      qid: 72,
      text: "is distressed by changes in plans, routines, or expectations.",
      quadrant: "AV",
    },
    {
      qid: 73,
      text: "needs more protection from life than same-aged children (for example, defenseless physically or emotionally).",
      quadrant: "SN",
    },
    {
      qid: 74,
      text: "interacts or participates in groups less than same-aged children.",
      quadrant: "AV",
    },
    {
      qid: 75,
      text: "has difficulty with friendships (for example, making or keeping friends).",
      quadrant: "AV",
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
      formTitle="Social Emotional Responses Associated with Sensory Processing"
      isSubmitting={isSubmitting}
      initialResponses={resolvedResponses || initialResponses}
      initialComments={resolvedComments}
      disabled={finalDisabled}
    />
  );
}

export default SocialEmotionalSensoryProcessingForm;
