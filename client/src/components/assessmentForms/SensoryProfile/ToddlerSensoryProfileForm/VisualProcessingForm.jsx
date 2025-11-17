import React, { useImperativeHandle, forwardRef, useRef } from "react";
import BaseForm from "../BaseForm";
import { useSensorySectionLock } from "../../../../hooks/useSensorySectionLock";

const ToddlerVisualProcessingForm = forwardRef(
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
      category: "Visual Processing",
      initialResponses,
      initialComments,
    });
    const finalDisabled = disabled || autoLocked;

    const questions = [
      {
        qid: 18,
        text: "enjoys looking at moving or spinning objects (for example, ceiling fans, toys with wheels).",
        quadrant: "SK",
      },
      {
        qid: 19,
        text: "enjoys looking at shiny objects.",
        quadrant: "SK",
      },
      {
        qid: 20,
        text: "is attracted to TV or computer screens with fast-paced, brightly colored graphics.",
        quadrant: "SK",
      },
      {
        qid: 21,
        text: "startles at bright or unpredictable light (for example, when moving from inside to outside).",
        quadrant: "",
      },
      {
        qid: 22,
        text: "is bothered by bright lights (for example, hides from sunlight through car window).",
        quadrant: "",
      },
      {
        qid: 23,
        text: "is more bothered by bright lights than other same-aged children.",
        quadrant: "RG",
      },
      {
        qid: 24,
        text: "pushes brightly colored toys away.*",
        quadrant: "RG",
        excludeFromScore: true,
      },
      {
        qid: 25,
        text: "fails to respond to self in the mirror.*",
        quadrant: "RG",
        excludeFromScore: true,
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
        formTitle="Visual Processing"
        initialResponses={resolvedResponses || initialResponses}
        initialComments={resolvedComments}
        disabled={finalDisabled}
      />
    );
  }
);

export default ToddlerVisualProcessingForm;
