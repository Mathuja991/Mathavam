import React, { useImperativeHandle, forwardRef, useRef } from "react";
import BaseForm from "../BaseForm";
import { useSensorySectionLock } from "../../../../hooks/useSensorySectionLock";

const ToddlerMovementProcessingForm = forwardRef(
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
      category: "Movement Processing",
      initialResponses,
      initialComments,
    });
    const finalDisabled = disabled || autoLocked;

    const questions = [
      {
        qid: 36,
        text: "enjoys physical activity (for example, bouncing, being held up high in the air).",
        quadrant: "SK",
      },
      {
        qid: 37,
        text: "enjoys rhythmical activities (for example, swinging, rocking, car rides).",
        quadrant: "SK",
      },
      {
        qid: 38,
        text: "takes movement or climbing risks.",
        quadrant: "SK",
      },
      {
        qid: 39,
        text: "becomes upset when placed on the back (for example, at changing times).",
        quadrant: "SN",
      },
      {
        qid: 40,
        text: "seems accident-prone or clumsy.",
        quadrant: "RG",
      },
      {
        qid: 41,
        text: "fusses when moved around (for example, walking around, when being handed over to another person).*",
        quadrant: "SN",
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
        formTitle="Movement Processing"
        initialResponses={resolvedResponses || initialResponses}
        initialComments={resolvedComments}
        disabled={finalDisabled}
      />
    );
  }
);

export default ToddlerMovementProcessingForm;
