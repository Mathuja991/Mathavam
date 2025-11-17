import React, { useImperativeHandle, forwardRef, useRef } from "react";
import BaseForm from "../BaseForm";
import { useSensorySectionLock } from "../../../../hooks/useSensorySectionLock";

const ToddlerAuditoryProcessingForm = forwardRef(
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
      category: "Auditory Processing",
      initialResponses,
      initialComments,
    });
    const finalDisabled = disabled || autoLocked;

    const questions = [
      {
        qid: 11,
        text: "only pays attention if I speak loudly.",
        quadrant: "RG",
      },
      {
        qid: 12,
        text: "only pays attention when I touch my child (and hearing is OK).",
        quadrant: "RG",
      },
      {
        qid: 13,
        text: "startles easily at sound compared to same-aged children (for example, dog barking, children shouting).",
        quadrant: "SN",
      },
      {
        qid: 14,
        text: "is distracted in noisy settings.",
        quadrant: "RG",
      },
      {
        qid: 15,
        text: "ignores sounds, including my voice.",
        quadrant: "RG",
      },
      {
        qid: 16,
        text: "becomes upset or tries to escape from noisy settings.",
        quadrant: "SN",
      },
      {
        qid: 17,
        text: "takes a long time to respond to own name.",
        quadrant: "",
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
        formTitle="Auditory Processing"
        initialResponses={resolvedResponses || initialResponses}
        initialComments={resolvedComments}
        disabled={finalDisabled}
      />
    );
  }
);
export default ToddlerAuditoryProcessingForm;
