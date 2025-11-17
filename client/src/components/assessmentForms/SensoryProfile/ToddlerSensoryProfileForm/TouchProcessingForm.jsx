import React, { useImperativeHandle, forwardRef, useRef } from "react";
import BaseForm from "../BaseForm";
import { useSensorySectionLock } from "../../../../hooks/useSensorySectionLock";

const ToddlerTouchProcessingForm = forwardRef(
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
      category: "Touch Processing",
      initialResponses,
      initialComments,
    });
    const finalDisabled = disabled || autoLocked;

    const questions = [
      {
        qid: 26,
        text: "becomes upset when having nails trimmed.",
        quadrant: "SN",
      },
      {
        qid: 27,
        text: "resists being cuddled.",
        quadrant: "AV",
      },
      {
        qid: 28,
        text: "is upset when moving among spaces with very different temperatures (for example, colder, warmer).",
        quadrant: "AV",
      },
      {
        qid: 29,
        text: "withdraws from contact with rough, cold, or sticky surfaces (for example, carpet, countertops).",
        quadrant: "AV",
      },
      {
        qid: 30,
        text: "bumps into things, failing to notice objects or people in the way.",
        quadrant: "RG",
      },
      {
        qid: 31,
        text: "pulls at clothing or resists getting clothing on.",
        quadrant: "SN",
      },
      {
        qid: 32,
        text: "enjoys splashing during bath or swim time.*",
        quadrant: "SK",
        excludeFromScore: true,
      },
      {
        qid: 33,
        text: "becomes upset if own clothing, hands, or face are messy.*",
        quadrant: "AV",
        excludeFromScore: true,
      },
      {
        qid: 34,
        text: "becomes anxious when walking or crawling on certain surfaces (for example, grass, sand, carpet, tile).*",
        quadrant: "SN",
        excludeFromScore: true,
      },
      {
        qid: 35,
        text: "withdraws from unexpected touch.*",
        quadrant: "AV",
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
        formTitle="Touch Processing"
        initialResponses={resolvedResponses || initialResponses}
        initialComments={resolvedComments}
        disabled={finalDisabled}
      />
    );
  }
);

export default ToddlerTouchProcessingForm;
