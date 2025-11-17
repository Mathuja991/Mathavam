import axios from "axios";
import BaseForm from "../BaseForm";
import { useState } from "react";
import { createSensoryProfilePayload } from "../../../../utills/apiUtils";
import { useSensorySectionLock } from "../../../../hooks/useSensorySectionLock";

function ConductSensoryProcessingForm({
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
    category: "Conduct Associated with Sensory Processing",
    initialResponses,
    initialComments,
  });
  const finalDisabled = disabled || autoLocked;


  const questions = [
    {
      qid: 53,
      text: "seems accident-prone.",
      quadrant: "RG",
    },
    {
      qid: 54,
      text: "rushes through coloring, writing, or drawing.",
      quadrant: "RG",
    },
    {
      qid: 55,
      text: "takes excessive risks (for example, climbs high into a tree, jumps off tall furniture) that compromise own safety.",
      quadrant: "SK",
    },
    {
      qid: 56,
      text: "seems more active than same-aged children.",
      quadrant: "SK",
    },
    {
      qid: 57,
      text: "does things in a harder way than is needed (for example, wastes time, moves slowly).",
      quadrant: "RG",
    },
    {
      qid: 58,
      text: "can be stubborn and uncooperative.",
      quadrant: "AV",
    },
    {
      qid: 59,
      text: "has temper tantrums.",
      quadrant: "AV",
    },
    {
      qid: 60,
      text: "appears to enjoy falling.",
      quadrant: "SK",
    },
    {
      qid: 61,
      text: "resists eye contact from me or others.",
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
      formTitle="Conduct Associated with Sensory Processing"
      isSubmitting={isSubmitting}
      initialResponses={resolvedResponses || initialResponses}
      initialComments={resolvedComments}
      disabled={finalDisabled}
    />
  );
}

export default ConductSensoryProcessingForm;
