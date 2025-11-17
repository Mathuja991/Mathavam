// src/pages/EditBcEntry.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChildInfoInputs from '../forms/ChildInfoInputs';

const EditBcEntry = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const totalSteps = 6;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const options = [
    { label: 'Never', value: '1', color: 'bg-green-100 border-green-400' },
    { label: 'Sometimes', value: '2', color: 'bg-yellow-100 border-yellow-400' },
    { label: 'Often', value: '3', color: 'bg-orange-100 border-orange-400' },
    { label: 'Always', value: '5', color: 'bg-red-100 border-red-400' },
    { label: 'N/A', value: 'NA', color: 'bg-gray-100 border-gray-400' },
  ];

 const sections = [
    {
      title: 'I. Social Communication',
      key: 'social',
      questions: [
        'Shows appropriate affection towards familiar people',
        'Resists affection from familiar people',
        'Shows inappropriate affection towards unfamiliar people',
        'Responds to attempts to initiate social interaction',
        'Directs facial expression towards other people',
        'Uses common gestures - waves "hello" and "goodbye"',
        'Combines gestures with vocalizations to enhance communication',
        'Looks when he/she is called or praised',
        'Looks where another person is looking or pointing',
        'Has difficulty interacting with peers',
        'Says socially inappropriate things',
        'Attends to parts of sentences and misinterprets whole',
      ],
    },
    {
      title: 'II. Restrictive Behaviors',
      key: 'restrictive',
      questions: [
        'Gets upset over small changes in routine',
        'Resists trying out new things - places, clothes, food, etc.',
        'Is fixated on certain topics or activities and unable to move on',
        'Has an unusually narrow range of interests',
        'Repeats/echoes what others say',
        'Makes repetitive body movements',
      ],
    },
    {
      title: 'III. Mood and Anxiety',
      key: 'mood',
      questions: [
        'Cries over minor annoyances and hurts',
        'Is irritable and whiny',
        'Clings to adults or is too dependent on them',
        'Is anxious in social situations',
        'Is fearful of specific objects or situations',
        'Has sleep problems',
      ],
    },
    {
      title: 'IV. Self-regulation',
      key: 'selfRegulation',
      questions: [
        'Has difficulties waiting his/her turn',
        'Switches quickly from one topic or activity to another',
        'Has difficulties playing or engaging in leisure activities quietly',
        'Fidgets',
        'Has difficulty remaining seated',
        'Is excessively active',
      ],
    },
    {
      title: 'V. Challenging Behavior',
      key: 'challenging',
      questions: [
        'Is verbally aggressive towards other children or adults',
        'Is physically aggressive towards other children or adults',
        'Throws things inappropriately',
        'Runs away',
        'Takes or grabs things that belong to others',
        'Has temper outbursts or tantrum',
      ],
    },
    {
      title: 'VI. Self-injurious Behavior',
      key: 'selfInjury',
      questions: [
        'Engages in head-banging',
        'Engages in arm-biting',
        'Engages in excessive scratching',
        'Engages in hair-pulling',
        'Engages in eye-poking',
        'Engages in other self-injurious behavior',
      ],
    },
  ];
  const currentSection = sections[step - 1];

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`${API_URL}/bc/entries/${id}`);
        if (!response.ok) throw new Error('Entry not found');

        const data = await response.json();
        setFormData(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch entry:', err);
        setErrorMessage('Failed to load entry.');
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (sectionKey, idx, value) => {
    const updated = [...formData[sectionKey]];
    updated[idx] = value;
    setFormData((prev) => ({ ...prev, [sectionKey]: updated }));
  };

  const isStepComplete = () => formData[currentSection.key].every((val) => val !== '');

  const allBasicInfoFilled = formData?.childNo && formData?.name && formData?.age && formData?.gender && formData?.date;

  const allFilled = () =>
    sections.every((section) => formData[section.key].every((val) => val !== ''));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!allBasicInfoFilled || !allFilled()) {
      setErrorMessage('❗ Please complete all required fields.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bc/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Update failed');

      alert('Entry updated successfully!');
      navigate('/dashboard/forms/bc-previous-entries');
    } catch (err) {
      console.error('Update error:', err);
      setErrorMessage('🚨 Update failed. Please try again.');
    }
  };

  const renderCardOptions = (sectionKey, idx) => (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => {
        const isSelected = formData[sectionKey][idx] === opt.value;
        return (
          <div
            key={opt.value}
            className={`cursor-pointer border rounded-lg px-3 py-2 text-center text-sm font-medium transition-all w-24
              ${opt.color} ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:ring-1 hover:ring-gray-400'}`}
            onClick={() => handleChange(sectionKey, idx, opt.value)}
          >
            {opt.label}
          </div>
        );
      })}
    </div>
  );

  if (loading) return <div className="p-4">Loading...</div>;
  if (!formData) return <div className="p-4">Entry not found.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Behavior Checklist Entry</h2>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>

      {/* Child Info */}
      <div className="bg-blue-50 p-6 rounded-xl shadow-sm mb-6">
        <ChildInfoInputs formData={formData} handleChildNoChange={() => {}} handleInputChange={handleInputChange} />
        <label className="mb-2 font-semibold text-gray-700" htmlFor="date">Date</label>
        <input
          type="text"
          name="date"
          placeholder="Date of Test"
          value={formData.date}
          readOnly
          className="border p-2 ml-2 rounded mb-6 mt-6"
        />
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 mb-6 mt-5">
        <p>On average, how often does your child engage in the following behaviors?</p>
        <ul className=" ml-5 mt-2 space-y-1 text-center">
          <li>1 - Almost never (less than 10% of the time)</li>
          <li>2 - Occasionally (around 25% of the time)</li>
          <li>3 - Half the time (around 50% of the time)</li>
          <li>5 - Almost always (90% of the time or more)</li>
          <li>NA - Not Applicable</li>
        </ul>
      </div>

      {/* Questions Section */}
   <div className='text-left ml-20'>
         {/* Questions Section */}
         <motion.div
           key={step}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.3 }}
         >
           <h3 className="text-lg font-semibold mb-4 text-blue-700">{currentSection.title}</h3>
           {currentSection.questions.map((q, idx) => (
             <div key={idx} className="mb-6">
               <p className="mb-3">{idx + 1}. {q}</p>
               {renderCardOptions(currentSection.key, idx)}
             </div>
           ))}
         </motion.div>
         </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Back</button>
        )}
        {step < totalSteps ? (
          <button
            onClick={() => isStepComplete() && setStep(step + 1)}
            disabled={!isStepComplete()}
            className={`px-4 py-2 rounded ${isStepComplete() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-white cursor-not-allowed'}`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!(isStepComplete() && allBasicInfoFilled && allFilled())}
            className={`px-4 py-2 rounded ${isStepComplete() && allBasicInfoFilled && allFilled() ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-white cursor-not-allowed'}`}
          >
            Save
          </button>
        )}
      </div>

      {/* Messages */}
      {errorMessage && <div className="mt-4 text-red-600 font-semibold">{errorMessage}</div>}
    </div>
  );
};

export default EditBcEntry;
