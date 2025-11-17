import React, { useImperativeHandle, forwardRef, useRef } from "react";
import BaseForm from "../BaseForm";
import { useSensorySectionLock } from "../../../../hooks/useSensorySectionLock";

const ToddlerGeneralProcessingForm = forwardRef(
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
      category: "General Processing",
      initialResponses,
      initialComments,
    });
    const finalDisabled = disabled || autoLocked;

    const questions = [
      {
        qid: 1,
        text: "needs a routine to stay content or calm.",
        quadrant: "SN",
      },
      {
        qid: 2,
        text: "acts in a way that interferes with family schedules and plans.",
        quadrant: "SN",
      },
      { qid: 3, text: "resists playing among other children.", quadrant: "AV" },
      {
        qid: 4,
        text: "takes longer than same-aged children to respond to questions or actions.",
        quadrant: "",
      },
      { qid: 5, text: "withdraws from situations.", quadrant: "" },
      { qid: 6, text: "has an unpredictable sleeping pattern.", quadrant: "" },
      { qid: 7, text: "has an unpredictable eating pattern.", quadrant: "" },
      { qid: 8, text: "is easily awakened.", quadrant: "" },
      {
        qid: 9,
        text: "misses eye contact with me during everyday interactions.",
        quadrant: "RG",
      },
      { qid: 10, text: "gets anxious in new situations.", quadrant: "AV" },
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
        formTitle="General Processing"
        initialResponses={resolvedResponses || initialResponses} 
        initialComments={resolvedComments}
        disabled={finalDisabled} 
      />
    );
  }
);

export default ToddlerGeneralProcessingForm;
