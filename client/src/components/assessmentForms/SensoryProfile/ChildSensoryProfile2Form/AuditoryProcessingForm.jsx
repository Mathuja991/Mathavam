import axios from 'axios';
import BaseForm from "../BaseForm";
import { useState } from 'react';
import { createSensoryProfilePayload } from "../../../../utills/apiUtils";
import { useSensorySectionLock } from "../../../../hooks/useSensorySectionLock";

function AuditoryProcessingForm({
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
    category: "Auditory Processing",
    initialResponses,
    initialComments,
  });
  const finalDisabled = disabled || autoLocked;

  const questions = [
    {
      qid: 1,
      text: "reacts strongly to unexpected or loud noises (for example, sirens, dog barking, hair dryer).",
      quadrant: "AV",
    },
    {
      qid: 2,
      text: "holds hands over ears to protect them from sound.",
      quadrant: "AV",
    },
    {
      qid: 3,
      text: "struggles to complete tasks when music or TV is on.",
      quadrant: "SN",
    },
    {
      qid: 4,
      text: "is distracted when there is a lot of noise around.",
      quadrant: "SN",
    },
    {
      qid: 5,
      text: "becomes unproductive with background noise (for example, fan, refridgerator).",
      quadrant: "AV",
    },
    {
      qid: 6,
      text: "tunes me out or seems to ignore me.",
      quadrant: "SN",
    },
    {
      qid: 7,
      text: "seems not to hear when I call his or her name (even though hearing is OK).",
      quadrant: "SN",
    },
    {
      qid: 8,
      text: "enjoys strange noises or makes noise(s) for fun.",
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
      formTitle="Auditory Processing"
      isSubmitting={isSubmitting}
      initialResponses={resolvedResponses || initialResponses}
      initialComments={resolvedComments}
      disabled={finalDisabled}
    />
  );
}
export default AuditoryProcessingForm;
