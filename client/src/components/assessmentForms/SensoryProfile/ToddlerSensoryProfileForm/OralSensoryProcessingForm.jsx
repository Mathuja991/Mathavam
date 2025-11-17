import React, { useImperativeHandle, forwardRef, useRef } from "react";
import BaseForm from "../BaseForm";
import { useSensorySectionLock } from "../../../../hooks/useSensorySectionLock";

const ToddlerOralSensoryProcessingForm = forwardRef(
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
      category: "Oral Sensory Processing",
      initialResponses,
      initialComments,
    });
    const finalDisabled = disabled || autoLocked;

    const questions = [
      {
        qid: 42,
        text: "shows a clear dislike for all but a few food choices.",
        quadrant: "AV",
      },
      {
        qid: 43,
        text: "drools.",
        quadrant: "",
      },
      {
        qid: 44,
        text: "prefers one texture of food (for example, smooth, crunchy).",
        quadrant: "SN",
      },
      {
        qid: 45,
        text: "uses drinking to calm self.",
        quadrant: "RG",
      },
      {
        qid: 46,
        text: "gags on foods or drink.",
        quadrant: "SN",
      },
      {
        qid: 47,
        text: "holds food in cheeks before swallowing.",
        quadrant: "",
      },
      {
        qid: 48,
        text: "has difficulty weaning to chunky foods.",
        quadrant: "SN",
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
        formTitle="Oral Sensory Processing"
        initialResponses={resolvedResponses || initialResponses}
        initialComments={resolvedComments}
        disabled={finalDisabled}
      />
    );
  }
);

export default ToddlerOralSensoryProcessingForm;
