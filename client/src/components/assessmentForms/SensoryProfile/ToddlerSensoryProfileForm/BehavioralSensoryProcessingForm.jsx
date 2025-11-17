import React, { useImperativeHandle, forwardRef, useRef } from "react";
import BaseForm from "../BaseForm";
import { useSensorySectionLock } from "../../../../hooks/useSensorySectionLock";

const ToddlerBehavioralSensoryProcessingForm = forwardRef(
  (
    {
      onSubmit,
      initialResponses,
      initialComments,
      disabled,
      patientId,
      testDate,
    },
    ref
  ) => {
    const baseFormRef = useRef();
    const {
      resolvedResponses,
      resolvedComments,
      isLocked: autoLocked,
    } = useSensorySectionLock({
      patientId,
      testDate,
      category: "Behavioral Associated with Sensory Processing",
      initialResponses,
      initialComments,
    });
    const finalDisabled = disabled || autoLocked;

    const questions = [
      {
        qid: 49,
        text: "has temper tantrums.",
        quadrant: "AV",
      },
      {
        qid: 50,
        text: "is clingy.",
        quadrant: "",
      },
      {
        qid: 51,
        text: "stays calm only when being held.",
        quadrant: "",
      },
      {
        qid: 52,
        text: "is fussy or irritable.",
        quadrant: "SN",
      },
      {
        qid: 53,
        text: "is bothered by new settings.",
        quadrant: "AV",
      },
      {
        qid: 54,
        text: "becomes so upset in new settings that it's hard to calm down.",
        quadrant: "AV",
      },
    ];

    useImperativeHandle(ref, () => ({
      getFormData: () => {
        if (baseFormRef.current) {
          return baseFormRef.current.getFormData();
        }
        return null;
      },
    }));

    return (
      <BaseForm
        ref={baseFormRef}
        questions={questions}
        onSubmit={onSubmit}
        formTitle="Behavioral Sensory Processing"
        initialResponses={resolvedResponses || initialResponses}
        initialComments={resolvedComments}
        disabled={finalDisabled}
      />
    );
  }
);

export default ToddlerBehavioralSensoryProcessingForm;
