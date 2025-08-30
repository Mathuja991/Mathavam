import React, { useState, useEffect } from "react";
import ChildInfoInputs from "./ChildInfoInputs"; 
import { Link } from "react-router-dom";
import CarsPrevious from "../components/CarsPrevious";
import { useNavigate } from "react-router-dom";
// Inside the return JSX:





const AutismRatingForm = () => {

  const navigate = useNavigate();
  const categories = [
    "Relating people", "Imitation", "Emotional Response", "Body use", "Object use",
    "Adaptation to change", "Visual Response", "Listening Response",
    "Taste, smell & touch response", "Fear or Nervousness", "Verbal Communication",
    "Nonverbal Communication", "Activity level", "Consistency of intellectual response",
    "General Impression"
  ];

  const scores = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];

  const [selectedScores, setSelectedScores] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    childNo: "",
    age: "",
    date: new Date().toISOString().split("T")[0], // ← sets current date in YYYY-MM-DD format
    gender: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previousEntries, setPreviousEntries] = useState([]);

 const handleChildNoChange = async (e) => {
  const value = e.target.value;
  setFormData((prev) => ({ ...prev, childNo: value }));

  try {
    const response = await fetch(`http://localhost:5000/api/patientRecords`);
    if (!response.ok) throw new Error("Failed to fetch records");
    const data = await response.json();

    // Find the record with matching childNo
    const matchedRecord = data.find(record => record.childNo === value);

    if (matchedRecord) {
      setFormData((prev) => ({
        ...prev,
        name: matchedRecord.name || '',
        age: matchedRecord.age || '',
        gender: matchedRecord.gender || '',
        address: matchedRecord.address || '',
        contactNo: matchedRecord.contactNo || '',
        dateOfBirth: matchedRecord.dateOfBirth ? new Date(matchedRecord.dateOfBirth).toISOString().split('T')[0] : '',
        // add other fields similarly as needed
      }));
      setErrorMessage('');
    } else {
      // No record found
      setFormData((prev) => ({
        ...prev,
        name: '',
        age: '',
        gender: '',
        address: '',
        contactNo: '',
        dateOfBirth: '',
      }));
      setErrorMessage('Child record not found');
    }
  } catch (err) {
    console.error(err);
    setErrorMessage('Failed to fetch patient records');
    setFormData((prev) => ({
      ...prev,
      name: '',
      age: '',
      gender: '',
      address: '',
      contactNo: '',
      dateOfBirth: '',
    }));
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrorMessage("");
  };

  const handleRadioChange = (category, value) => {
    setSelectedScores((prev) => ({
      ...prev,
      [category]: parseFloat(value),
    }));
    setErrorMessage("");
  };

  const totalScore = Object.values(selectedScores).reduce((acc, curr) => acc + curr, 0);
  const allFilled = Object.keys(selectedScores).length === categories.length;
  const allBasicInfoFilled = Object.values(formData).every(
  (field) => typeof field === 'string' ? field.trim() !== '' : field !== undefined && field !== null
);


  const getSeverity = () => {
    if (!allFilled) return { label: "Pending", color: "bg-gray-400 text-white" };
    if (totalScore >= 15 && totalScore < 30) return { label: "Minimal to no symptoms of ASD", color: "bg-green-500 text-white" };
    if (totalScore >= 30 && totalScore < 37) return { label: "Mild to Moderate symptoms of ASD", color: "bg-yellow-400 text-black" };
    if (totalScore >= 37) return { label: "Severe symptoms of ASD", color: "bg-red-500 text-white" };
  };

  const severity = getSeverity();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allFilled || !allBasicInfoFilled) {
      setErrorMessage("⚠️ Please complete the form before submitting.");
      return;
    }

    const newEntry = { ...formData, scores: selectedScores, severity };

    try {
      const response = await fetch("http://localhost:5000/api/carsform/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) throw new Error("Failed to submit");

      const savedEntry = await response.json();

      setPreviousEntries((prev) => [...prev, savedEntry]);
      setIsSubmitted(true);
      alert("Form submitted successfully!");
      navigate("/forms");

    } catch (err) {
      console.error(err);
      setErrorMessage("🚨 Submission failed. Please try again.");
    }
  };

  const handleEdit = (entryIndex) => {
    const entryToEdit = previousEntries[entryIndex];
    setFormData(entryToEdit);
    setSelectedScores(entryToEdit.scores);
    setIsSubmitted(false);
  };

 

  return (
    <div>
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-xl space-y-6">
      <h2 className="text-2xl font-bold text-center">Childhood Autism Rating Scale (CARS)</h2>
      <p className="text-center text-gray-600">Second Edition - Mathavam Centre</p>

   <div className="bg-blue-50 p-6 rounded-xl shadow-sm space-y-6">
  <ChildInfoInputs
    formData={formData}
    handleChildNoChange={handleChildNoChange}
  />

 
    </div>

<div className="overflow-x-auto rounded-2xl max-h-[400px] overflow-y-auto">
  <table className="min-w-full border-separate border-spacing-1">
    <thead className="bg-gray-100 sticky top-0 z-20">
      <tr>
        <th
          rowSpan="2"
          className="border border-gray-300 p-3 font-semibold text-gray-700 text-center align-middle sticky left-0 bg-gray-100 z-30"
          style={{ minWidth: '50px' }}
        >
          #
        </th>
        <th
          rowSpan="2"
          className="border border-gray-300 p-3 font-semibold text-gray-700 text-left align-middle sticky left-[50px] bg-gray-100 z-30"
          style={{ minWidth: '150px' }}
        >
          Category
        </th>
        <th
          colSpan="7"
          className="border border-gray-300 p-3 font-semibold text-gray-700 text-center"
        >
          Score
        </th>
      </tr>
      <tr>
        {scores.map((score, idx) => {
          const colors = [
            "bg-green-300", "bg-green-200", "bg-yellow-100",
            "bg-yellow-200", "bg-orange-200", "bg-red-200", "bg-red-400"
          ];
          return (
            <th
              key={idx}
              className={`border border-gray-300 p-3 font-medium text-gray-800 ${colors[idx]}`}
              style={{ minWidth: '60px' }}
            >
              {score.toFixed(1)}
            </th>
          );
        })}
      </tr>
    </thead>
    <tbody>
      {categories.map((item, idx) => (
        <tr key={idx} className="hover:bg-blue-50 transition-colors">
          <td
            className="border border-gray-300 p-3 text-center sticky left-0 bg-white z-10"
            style={{ minWidth: '50px' }}
          >
            {idx + 1}
          </td>
          <td
            className="border border-gray-300 p-3 text-left sticky left-[50px] bg-white z-10"
            style={{ minWidth: '150px' }}
          >
            {item}
          </td>
          {scores.map((score) => (
            <td
              key={score}
              className="border border-gray-300 p-3 text-center"
              style={{ minWidth: '60px' }}
            >
              <input
                type="radio"
                name={item}
                value={score}
                checked={selectedScores[item] === score}
                onChange={() => handleRadioChange(item, score)}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>


     {/* Total Score */}
<div className="flex justify-end">
  <div className="text-lg font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg shadow-inner">
    Total Score: <span className="text-blue-600">{totalScore.toFixed(1)}</span>
  </div>
</div>

{/* Severity Group */}
<div className="p-6 border rounded-xl bg-gray-50 shadow-sm flex items-center space-x-3 mt-4 max-w-3xl">
  <p className="font-semibold text-gray-700">Severity Group:</p>
  <span className={`text-base font-medium px-4 py-2 rounded-full ${severity.color} shadow`}>
    {severity.label}
  </span>
</div>

{/* Error Message */}
{errorMessage && (
  <div className="flex items-center p-4 mt-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow">
    <svg
      className="w-5 h-5 mr-2 text-red-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
    {errorMessage}
  </div>
)}

{/* Submit Button */}
<button
  type="submit"
  className={`mt-6 w-1/3 py-3 rounded-xl font-semibold transition-all duration-300 ${
    allFilled && allBasicInfoFilled
      ? "bg-green-600 text-white hover:bg-green-700 active:scale-95"
      : "bg-green-400 text-white cursor-not-allowed"
  }`}
  disabled={!(allFilled && allBasicInfoFilled)}
>
  Submit
</button>

    </form>
   

  
      </div>
  );
};

export default AutismRatingForm;
