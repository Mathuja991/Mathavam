import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ViewPart = ({
  selectedForm,
  questions,
  isTranslated,
  getAnswerOptionText,
  getLightColorShadeClass,
}) => {
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);

  if (!selectedForm) {
    return <p className="text-red-500 text-center">Error: No form data to display.</p>;
  }

  const { studentInfo } = selectedForm;

  if (!studentInfo) {
    return <p className="text-red-500 text-center">Error: Child information not found within the form data.</p>;
  }

  const handleGoBackToSubmissions = () => {
    navigate('/dashboard/snap-submitted-forms');
  };

  const handleEditForm = () => {
    navigate(`/dashboard/snapform/${selectedForm._id}?edit=true`);
  };

  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  // Calculate answer summary
  const calculateSummary = () => {
    const summary = {
      0: { count: 0, labelEn: "Not At All", labelTa: "இல்லை" },
      1: { count: 0, labelEn: "Just A Little", labelTa: "குறைவாக" },
      2: { count: 0, labelEn: "Quite A Bit", labelTa: "சில நேரங்களில்" },
      3: { count: 0, labelEn: "Very Much", labelTa: "அதிகமாக" }
    };

    Object.values(selectedForm.answers).forEach(answer => {
      if (summary[answer]) {
        summary[answer].count++;
      }
    });

    return summary;
  };

  const answerSummary = calculateSummary();

  return (
    <div className="space-y-6 animate-fade-in-down">
      <h2 className="text-3xl font-bold text-blue-800 text-center mb-8 border-b-2 pb-3">
        {isTranslated ? "Details" : "விவரங்கள்"}
      </h2>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 border border-blue-200">
        <h3 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b border-blue-100">
          {isTranslated ? "Child Information" : "பிள்ளையின் தகவல்கள்"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-gray-700 mb-8 text-left">
          <div className="flex flex-col">
            <p className="font-semibold text-gray-900">
              {isTranslated ? "Name:" : "பெயர்:"}
            </p>
            <p className="font-bold text-blue-700 text-lg">
              {studentInfo.name}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-gray-900">
              {isTranslated ? "Age:" : "வயது:"}
            </p>
            <p className="font-bold text-lg">{studentInfo.age}</p>
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-gray-900">
              {isTranslated ? "Gender:" : "பால்:"}
            </p>
            <p className="font-bold text-lg">{studentInfo.gender}</p>
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-gray-900">
              {isTranslated ? "Submission Date:" : "சமர்ப்பித்த தேதி:"}
            </p>
            <p className="font-bold text-lg">
              {new Date(selectedForm.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-gray-900">
              {isTranslated ? "Total Score:" : "மொத்த மதிப்பெண்:"}
            </p>
            <p className="font-bold text-lg text-green-700">
              {selectedForm.totalScore || 0}
            </p>
          </div>
        </div>

        {/* Summary Section */}
        {showSummary && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h4 className="text-xl font-bold text-blue-700 mb-4">
              {isTranslated ? "Answer Summary" : "பதில் சுருக்கம்"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(answerSummary).map(([key, data]) => (
                <div key={key} className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className={`text-2xl font-bold ${getLightColorShadeClass(parseInt(key))} rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2`}>
                    {data.count}
                  </div>
                  <p className="font-semibold text-gray-800">
                    {isTranslated ? data.labelEn : data.labelTa}
                  </p>
                  <p className="text-sm text-gray-600">
                    {((data.count / questions.length) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t-2 border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-blue-700">
              {isTranslated ? "Answers to Questions:" : "கேள்விகளுக்கான பதில்கள்:"}
            </h3>
            <button
              onClick={toggleSummary}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-md font-semibold text-sm"
            >
              {showSummary 
                ? (isTranslated ? "Hide Summary" : "சுருக்கத்தை மறை") 
                : (isTranslated ? "Show Summary" : "சுருக்கத்தைக் காட்டு")
              }
            </button>
          </div>
          <ul className="list-none space-y-4 pl-0 text-gray-700 text-left">
            {Object.entries(selectedForm.answers).map(([qIndex, val]) => (
              <li key={qIndex} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="font-medium text-gray-800 mb-2">
                  <span className="font-bold text-blue-600">Q{Number(qIndex) + 1}.</span>{" "}
                  {isTranslated
                    ? questions[qIndex]?.en
                    : questions[qIndex]?.ta}
                </p>
                <p>
                  <span
                    className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${getLightColorShadeClass(
                      val
                    )}`}
                  >
                    {getAnswerOptionText(val, isTranslated ? "en" : "ta")}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-between gap-x-4 mt-8"> 
        <button
          onClick={handleEditForm}
          className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300 shadow-lg font-semibold"
        >
          {isTranslated ? "Edit Form" : "படிவத்தைத் திருத்து"}
        </button>
        <button
          onClick={handleGoBackToSubmissions}
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg font-semibold"
        >
          {isTranslated ? "Back to Submitted Forms" : "சமர்ப்பிக்கப்பட்ட படிவங்களுக்குத் திரும்பு"}
        </button>
      </div>
    </div>
  );
};

export default ViewPart;