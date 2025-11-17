import React, {
  useState,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import scores from "./Scores"; // Assuming this is your array of score options

const BaseForm = forwardRef(
  (
    {
      questions,
      onSubmit,
      formTitle,
      disabled, // This prop will disable the form while saving/locked
      initialResponses,
      initialComments,
      isSubmitting = false,
    },
    ref
  ) => {
    // Memoize the initial responses object for stability.
    // This now correctly assumes it receives the rich object format or nothing.
    const initialResponsesObject = useMemo(() => {
      if (!initialResponses || !Array.isArray(initialResponses)) {
        // If there's no data or it's not an array, return an empty object.
        return {};
      }

      // Use reduce to convert the array into an object.
      // The key is the qid, and the value is the rich { score, quadrant } object.
      return initialResponses.reduce((acc, response) => {
        acc[response.qid] = {
          score: response.score,
          quadrant: response.quadrant,
        };
        return acc;
      }, {});
    }, [initialResponses]); 

    const [responses, setResponses] = useState({});
    const [comments, setComments] = useState("");

    // Populate the form with initial data when it becomes available
    useEffect(() => {
      setResponses(initialResponsesObject);
      setComments(initialComments || "");
    }, [initialResponsesObject, initialComments]);

    // Handle changes when a user selects a score
    const handleChange = (qid, score, quadrant) => {
      setResponses((prev) => ({
        ...prev,
        [qid]: { score: Number(score), quadrant: quadrant },
      }));
    };

    // Correctly calculate the total score from the rich 'responses' object
    const totalScore = useMemo(() => {
      let sum = 0;
      // Iterate over the keys of the responses object
      for (const qid in responses) {
        // Check if the response for this qid exists and has a numeric score
        if (responses[qid] && typeof responses[qid].score === "number") {
          const question = questions.find((q) => q.qid === parseInt(qid, 10));

          if (question && !question.excludeFromScore) {
            sum += responses[qid].score;
          }
        }
      }
      return sum;
    }, [responses]);

    // Expose a function to the parent to get the form's current data
    useImperativeHandle(ref, () => ({
      getFormData: () => {
        return {
          responses,
          comments,
          totalScore,
        };
      },
    }));

    // Handle the form's own submit event
    const lockedState = Boolean(disabled);
    const submittingState = Boolean(isSubmitting);
    const isFormDisabled = lockedState || submittingState;
    const buttonLabel = submittingState
      ? "Submitting..."
      : lockedState
      ? "Locked"
      : "Submit Section";

    const handleFormSubmit = (event) => {
      event.preventDefault();
      if (onSubmit) {
        onSubmit({ responses, comments, totalScore, formTitle });
      }
    };

    return (
      <form onSubmit={handleFormSubmit} className="w-full">
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-bold text-blue-700 text-left">
            My child...
          </h3>
        </div>
        <div className="space-y-6">
          {questions.map((question, index) => {
            const selectedResponse = responses[question.qid];
            return (
              <div
                key={question.qid}
                className="p-6 bg-white rounded-xl shadow-lg border border-gray-200"
              >
                <p className="text-base sm:text-lg font-semibold text-blue-600 mb-5 text-left">
                  <span className="text-blue-600 font-bold mr-2">
                    {index + 1}.
                  </span>
                  {question.text}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {scores.map((scoreOption) => {
                    const isSelected =
                      selectedResponse?.score === scoreOption.rate;
                    return (
                      <label
                        key={scoreOption.rate}
                        className={`p-4 rounded-lg text-center cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                          isSelected
                            ? "bg-green-500 text-white shadow-xl ring-2 ring-green-200"
                            : `${scoreOption.colorClass} text-white hover:brightness-110`
                        }`}
                        title={scoreOption.text}
                      >
                      <input
                        type="radio"
                        name={`q${question.qid}`}
                        value={scoreOption.rate}
                        checked={isSelected}
                        onChange={() =>
                          handleChange(
                            question.qid,
                            scoreOption.rate,
                            question.quadrant
                          )
                        }
                        required
                        className="sr-only"
                        disabled={isFormDisabled}
                      />
                      <span className="font-bold text-lg block">
                        {scoreOption.rate}
                      </span>
                      <span className="block text-sm mt-1 font-semibold opacity-90">
                        {scoreOption.text}
                      </span>
                    </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {formTitle} - Summary
          </h3>
          <p className="text-lg mb-4">
            Raw Score:{" "}
            <span className="font-bold text-blue-600 text-2xl">
              {totalScore}
            </span>
          </p>
          <div>
            <label
              htmlFor="comments"
              className="block text-lg font-semibold text-gray-700 mb-2"
            >
              Comments
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter any additional comments here..."
              rows={4}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isFormDisabled}
            />
          </div>
        </div>
        <div className="text-center mt-6">
          <button
            type="submit"
            disabled={isFormDisabled}
            className="px-10 py-3 bg-green-500 text-white font-bold text-lg rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {buttonLabel}
          </button>
        </div>
      </form>
    );
  }
);

export default BaseForm;
