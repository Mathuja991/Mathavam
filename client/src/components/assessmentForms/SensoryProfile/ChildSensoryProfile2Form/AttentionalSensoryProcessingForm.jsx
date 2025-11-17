import axios from "axios";
import BaseForm from "../BaseForm";
import { useState } from "react";
import { createSensoryProfilePayload } from "../../../../utills/apiUtils";
import { useSensorySectionLock } from "../../../../hooks/useSensorySectionLock";

function AttentionalSensoryProcessingForm({
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
    category: "Attentional Responses Associated with Sensory Processing",
    initialResponses,
    initialComments,
  });
  const finalDisabled = disabled || autoLocked;

  const questions = [
    {
      qid: 76,
      text: "misses eye contact with me during everyday interactions.",
      quadrant: "RG",
    },
    {
      qid: 77,
      text: "struggles to pay attention.",
      quadrant: "SN",
    },
    {
      qid: 78,
      text: "looks away from tasks to notice all actions in the room.",
      quadrant: "SN",
    },
    {
      qid: 79,
      text: "seems oblivious within an active environment (for example, unaware of activity).",
      quadrant: "RG",
    },
    {
      qid: 80,
      text: "stares intensively at objects.",
      quadrant: "RG",
    },
    {
      qid: 81,
      text: "stares intensively at people.",
      quadrant: "AV",
    },
    {
      qid: 82,
      text: "watches everyone when they move around the room.",
      quadrant: "SK",
    },
    {
      qid: 83,
      text: "jumps from one thing to another so that it interferes with activities.",
      quadrant: "SK",
    },
    {
      qid: 84,
      text: "gets lost easily.",
      quadrant: "SN",
    },
    {
      qid: 85,
      text: "has a hard time finding objects in competing backgrounds (for example, shoes in a messy room, pencil in 'junk drawer').",
      quadrant: "RG",
    },
    {
      qid: 86,
      text: "seems unaware when people come into the room.*", //not a part of raw score
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
        formTitle="Attentional Responses Associated with Sensory Processing"
        isSubmitting={isSubmitting}
        initialResponses={resolvedResponses || initialResponses}
        initialComments={resolvedComments}
        disabled={finalDisabled}
      />
      <p>* - Item/s is/are not part of the ATTENTIONAL Raw Score.</p>
    </>
  );
}

export default AttentionalSensoryProcessingForm;
