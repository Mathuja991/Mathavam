import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditTherapyAssessment = () => {
  const { id } = useParams(); // Get the ID from the URL for the record to edit
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    age: "", // This field will be calculated from DOB
    regNo: "",
    languageUsed: "",
    primaryCarer: "",
    medicalDiagnosis: "",
    communicationDiagnosis: "",
    familyHistory: "",
    hearing: "",
    vision: "",
    siblings: "",
    motorDevelopment: false,
    speechRegression: false,
    assessmentDate: "",
    accessBy: "",
    // Nested objects initialized as empty objects or default values
    prerequisiteSkills: {
      jointAttentionResponding: { yes: false, no: false },
      jointAttentionInitiation: { yes: false, no: false },
      eyeFixation: { yes: false, no: false },
      visualTracking: { yes: false, no: false },
      attentionSpan: { extremeDistraction: false, singleChannel: false },
      turnTaking: { waiting: false, takingTurn: false },
      nameResponding: { always: false, never: false },
    },
    communicationSkills: {
      communicationStages: {
        ownAgendaStage: false,
        requesterStage: false,
        earlyCommunicatorStage: false,
        partnerStage: false,
      },
      communicationFunctions: {
        requestingAssistance: { yes: false, no: false, verbal: false, nonVerbal: false },
        greeting: { yes: false, no: false, verbal: false, nonVerbal: false },
        agreeing: { yes: false, no: false, verbal: false, nonVerbal: false },
        disagreeing: { yes: false, no: false, verbal: false, nonVerbal: false },
      },
      communicationModalities: {
        eyeContact: false,
        bodyLanguage: false,
        vocalizations: false,
        gestures: false,
        pointing: false,
        words: false,
        sentences: false,
        signLanguage: false,
        pictures: false,
        communicationBook: false,
        electronicDevice: false,
      },
    },
    languageSkills: {
      comprehension: {
        gesturalCommand: '',
        verbalComprehensionSingle: false,
        verbalComprehensionTwo: false,
        verbalComprehensionThree: false,
        verbalComprehensionSentences: false,
        verbalComprehensionPicture: false,
        verbalComprehensionSequencing: false,
        verbalComprehensionStory: false,
      },
      expression: {
        useGesture: '',
        verbalExpressionSingle: false,
        verbalExpressionTwo: false,
        verbalExpressionThree: false,
        verbalExpressionSentences: false,
        verbalExpressionPicture: false,
        verbalExpressionSequencing: false,
        verbalExpressionStory: false,
        verbalExpressionAnswer: false,
      },
      vocabulary: {
        familyMembersCom: false, familyMembersExp: false,
        bodyPartsCom: false, bodyPartsExp: false,
        householdItemsCom: false, householdItemsExp: false,
        fruitsCom: false, fruitsExp: false,
        vegetablesCom: false, vegetablesExp: false,
        animalsCom: false, animalsExp: false,
        birdsCom: false, birdsExp: false,
        vehiclesCom: false, vehiclesExp: false,
        foodCom: false, foodExp: false,
        actionWordsCom: false, actionWordsExp: false,
        adjectivesCom: false, adjectivesExp: false,
        shapesCom: false, shapesExp: false,
      },
    },
    speechSkills: {
      intelligibility: "unintelligible",
      fluency: "",
      articulation: "",
      phonology: "",
      voice: {
        pitch: "",
        loudness: "",
        quality: "",
        nasality: "",
      },
    },
    oralMotorAssessment: {
      oralSensory: "",
      drooling: "",
      lipsStrength: "",
      tongueStrength: "",
      mobilityLips: "",
      mobilityTongue: "",
      socialSmile: false,
      peerRelationship: false,
      strangerRelationship: false,
      socialQuestioning: false,
      orientation: false,
      problemSolving: false,
      reasoning: false,
      organization: false,
      objectPermanent: false,
      solitaryPlay: false,
      constructivePlay: false,
      functionalPlay: false,
      pretendPlay: false,
      symbolicPlay: false,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch existing data for the assessment to be edited
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/therapyAssessments/${id}`);
        const data = response.data;

        // Flatten nested objects for state
        const loadedData = {
          ...data,
          // Convert date strings to 'YYYY-MM-DD' format for date inputs
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
          assessmentDate: data.assessmentDate ? new Date(data.assessmentDate).toISOString().split('T')[0] : '',
          prerequisiteSkills: { ...formData.prerequisiteSkills, ...data.prerequisiteSkills },
          communicationSkills: {
            ...formData.communicationSkills,
            communicationStages: { ...formData.communicationSkills.communicationStages, ...(data.communicationSkills?.communicationStages || {}) },
            communicationFunctions: {
              ...formData.communicationSkills.communicationFunctions,
              ...(data.communicationSkills?.communicationFunctions || {}),
              requestingAssistance: { ...(formData.communicationSkills.communicationFunctions.requestingAssistance), ...(data.communicationSkills?.communicationFunctions?.requestingAssistance || {}) },
              greeting: { ...(formData.communicationSkills.communicationFunctions.greeting), ...(data.communicationSkills?.communicationFunctions?.greeting || {}) },
              agreeing: { ...(formData.communicationSkills.communicationFunctions.agreeing), ...(data.communicationSkills?.communicationFunctions?.agreeing || {}) },
              disagreeing: { ...(formData.communicationSkills.communicationFunctions.disagreeing), ...(data.communicationSkills?.communicationFunctions?.disagreeing || {}) },
            },
            communicationModalities: { ...formData.communicationSkills.communicationModalities, ...(data.communicationSkills?.communicationModalities || {}) },
          },
          languageSkills: {
            ...formData.languageSkills,
            comprehension: { ...formData.languageSkills.comprehension, ...(data.languageSkills?.comprehension || {}) },
            expression: { ...formData.languageSkills.expression, ...(data.languageSkills?.expression || {}) },
            vocabulary: { ...formData.languageSkills.vocabulary, ...(data.languageSkills?.vocabulary || {}) },
          },
          speechSkills: {
            ...formData.speechSkills,
            ...(data.speechSkills || {}),
            voice: { ...formData.speechSkills.voice, ...(data.speechSkills?.voice || {}) },
          },
          oralMotorAssessment: { ...formData.oralMotorAssessment, ...data.oralMotorAssessment },
        };
        setFormData(loadedData);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching assessment with ID ${id}:`, err);
        setError("Failed to load assessment for editing. Please try again.");
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  // Helper function to calculate age
  const calculateAge = (dob) => {
    if (!dob) return "";
    const dobDate = new Date(dob);
    const today = new Date();
    let ageYears = today.getFullYear() - dobDate.getFullYear();
    let ageMonths = today.getMonth() - dobDate.getMonth();
    let ageDays = today.getDate() - dobDate.getDate();

    if (ageDays < 0) {
      ageMonths--;
      ageDays += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); // Days in previous month
    }
    if (ageMonths < 0) {
      ageYears--;
      ageMonths += 12;
    }
    return `${ageYears} years, ${ageMonths} months, ${ageDays} days`;
  };

  // General change handler for top-level fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "dob") {
        newData.age = calculateAge(value);
      }
      return newData;
    });
  };

  // Handler for nested fields (e.g., prerequisiteSkills.jointAttentionResponding.yes)
  const handleNestedChange = (parentKey, e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => {
      const updatedParent = { ...prevData[parentKey] };

      if (name.includes(".")) {
        // Handle deeply nested fields (e.g., communicationFunctions.requestingAssistance.yes)
        const [subKey, field] = name.split(".");
        updatedParent[subKey] = {
          ...(updatedParent[subKey] || {}), // Ensure sub-object exists
          [field]: type === "checkbox" ? checked : value,
        };
      } else {
        // Handle direct nested fields (e.g., prerequisiteSkills.attentionSpan.extremeDistraction)
        updatedParent[name] = type === "checkbox" ? checked : value;
      }

      return {
        ...prevData,
        [parentKey]: updatedParent,
      };
    });
  };

  // Handler for even deeper nested fields like voice (speechSkills.voice.pitch)
  const handleVoiceChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      speechSkills: {
        ...prevData.speechSkills,
        voice: {
          ...prevData.speechSkills.voice,
          [name]: value,
        },
      },
    }));
  };

  // Handler for communication functions radio/checkbox groups
  const handleCommunicationFunctionChange = (funcKey, field) => (e) => {
    const { checked, value, type } = e.target;
    setFormData(prevData => {
      const newState = { ...prevData };
      if (!newState.communicationSkills.communicationFunctions[funcKey]) {
        newState.communicationSkills.communicationFunctions[funcKey] = {};
      }

      if (type === 'radio') {
        // If it's a radio button for 'yes' or 'no'
        newState.communicationSkills.communicationFunctions[funcKey].yes = value === 'yes';
        newState.communicationSkills.communicationFunctions[funcKey].no = value === 'no';
      } else if (type === 'checkbox') {
        // If it's a checkbox for 'verbal' or 'nonVerbal'
        newState.communicationSkills.communicationFunctions[funcKey][field] = checked;
      }
      return newState;
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean up formData before sending: remove empty strings/false for non-required fields in nested objects
      const cleanedFormData = JSON.parse(JSON.stringify(formData)); // Deep copy

      // Helper to clean nested objects
      const cleanObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        const newObj = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              const cleanedNested = cleanObject(value);
              if (Object.keys(cleanedNested).length > 0 && Object.values(cleanedNested).some(v => v !== "" && v !== null && v !== false)) {
                newObj[key] = cleanedNested;
              }
            } else if (value !== "" && value !== null && value !== false) {
              newObj[key] = value;
            }
          }
        }
        return newObj;
      };

      // Apply cleaning to the specific nested sections
      cleanedFormData.prerequisiteSkills = cleanObject(cleanedFormData.prerequisiteSkills);
      cleanedFormData.communicationSkills = cleanObject(cleanedFormData.communicationSkills);
      cleanedFormData.languageSkills = cleanObject(cleanedFormData.languageSkills);
      cleanedFormData.speechSkills = cleanObject(cleanedFormData.speechSkills);
      cleanedFormData.oralMotorAssessment = cleanObject(cleanedFormData.oralMotorAssessment);

      await axios.put(`${import.meta.env.VITE_API_URL}/therapyAssessments/${id}`, cleanedFormData);
      alert("Therapy assessment updated successfully!");
      navigate(`/therapy-assessments/${id}`); // Go back to view the updated record
    } catch (err) {
      console.error("Error updating therapy assessment:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to update assessment. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-lg">Loading assessment data for editing...</div>;
  }

  if (error && !formData.name) { // Only show error if initial fetch failed to load data
    return <div className="text-center p-8 text-lg text-red-600">{error}</div>;
  }

  // Reusable components for form fields (copied from TherapyAssessment.jsx)
  const InputField = ({ label, id, name, type = "text", value, onChange, required = false, className = "", placeholder = "" }) => (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="block text-sm font-semibold text-blue-900 mb-2">
        {label}: {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md px-4 py-3 text-gray-800 bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 ease-in-out shadow-sm hover:border-blue-300"
      />
    </div>
  );

  const TextAreaField = ({ label, id, name, value, onChange, rows = 3, required = false, className = "", placeholder = "" }) => (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="block text-sm font-semibold text-blue-900 mb-2">
        {label}: {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md px-4 py-3 text-gray-800 bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 ease-in-out shadow-sm hover:border-blue-300 resize-y"
      ></textarea>
    </div>
  );

  const SelectField = ({ label, id, name, value, onChange, options, required = false, className = "" }) => (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="block text-sm font-semibold text-blue-900 mb-2">
        {label}: {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-md px-4 py-3 text-gray-800 bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 ease-in-out shadow-sm hover:border-blue-300"
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  const LabelledCheckbox = ({ label, id, name, checked, onChange, className = "" }) => (
    <div className={`flex items-center gap-3 py-2 ${className}`}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 text-blue-600 border-blue-300 rounded focus:ring-purple-500 transition-transform duration-200 hover:scale-110"
      />
      <label htmlFor={id} className="text-sm text-gray-800 font-medium">
        {label}
      </label>
    </div>
  );

  const RadioGroupField = ({ label, name, options, selectedValue, onChange, row = false, className = "" }) => (
    <div className={`py-2 ${className}`}>
      <label className="block text-sm font-semibold text-blue-900 mb-1">
        {label}
      </label>
      <div className={`flex ${row ? 'flex-wrap gap-6' : 'flex-col gap-3'}`}>
        {options.map((option) => (
          <label key={option} className="flex items-center cursor-pointer gap-2">
            <input
              type="radio"
              name={name}
              value={option.toLowerCase()}
              checked={selectedValue === option.toLowerCase()}
              onChange={onChange}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const Section = ({ title, children, className = "" }) => (
    <div className={`bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-xl border-l-4 border-blue-400 hover:shadow-2xl transition-all duration-300 ease-in-out ${className}`}>
      <h3 className="text-2xl font-semibold text-blue-900 mb-6 border-b pb-2 border-blue-200">
        {title}
      </h3>
      {children}
    </div>
  );

  const Subsection = ({ title, children, className = "" }) => (
    <div className={`mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50 ${className}`}>
      <h4 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2 border-blue-300">{title}</h4>
      {children}
    </div>
  );

  return (
    <div className="w-full px-4 py-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl my-8 font-sans text-gray-800">
      <h2 className="text-3xl font-extrabold text-center text-indigo-800 mb-8 tracking-tight leading-tight">
        Edit Therapy Assessment Record
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Part 1: Patient Information */}
        <Section title="Patient Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <InputField label="Patient Name" id="name" name="name" value={formData.name} onChange={handleChange} required />
            <InputField label="Date of Birth" id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
            <InputField label="Age" id="age" name="age" value={formData.age} readOnly disabled className="bg-gray-100 cursor-not-allowed" />
            <SelectField
              label="Gender"
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={["Male", "Female", "Other"]}
              required
            />
            <InputField label="Registration No." id="regNo" name="regNo" value={formData.regNo} onChange={handleChange} required />
            <InputField label="Language Used" id="languageUsed" name="languageUsed" value={formData.languageUsed} onChange={handleChange} required />
            <InputField label="Primary Carer" id="primaryCarer" name="primaryCarer" value={formData.primaryCarer} onChange={handleChange} required />
            <TextAreaField label="Medical Diagnosis" id="medicalDiagnosis" name="medicalDiagnosis" value={formData.medicalDiagnosis} onChange={handleChange} />
            <TextAreaField label="Communication Diagnosis" id="communicationDiagnosis" name="communicationDiagnosis" value={formData.communicationDiagnosis} onChange={handleChange} />
            <TextAreaField label="Family History" id="familyHistory" name="familyHistory" value={formData.familyHistory} onChange={handleChange} />
            <SelectField
              label="Hearing"
              id="hearing"
              name="hearing"
              value={formData.hearing}
              onChange={handleChange}
              options={["Normal", "Impaired", "N/A"]}
            />
            <SelectField
              label="Vision"
              id="vision"
              name="vision"
              value={formData.vision}
              onChange={handleChange}
              options={["Normal", "Impaired", "N/A"]}
            />
            <InputField label="Siblings" id="siblings" name="siblings" value={formData.siblings} onChange={handleChange} />
            <LabelledCheckbox
              label="Motor Development Concerns"
              id="motorDevelopment"
              name="motorDevelopment"
              checked={formData.motorDevelopment}
              onChange={handleChange}
            />
            <LabelledCheckbox
              label="Speech Regression"
              id="speechRegression"
              name="speechRegression"
              checked={formData.speechRegression}
              onChange={handleChange}
            />
            <InputField label="Assessment Date" id="assessmentDate" name="assessmentDate" type="date" value={formData.assessmentDate} onChange={handleChange} required />
            <InputField label="Accessed By" id="accessBy" name="accessBy" value={formData.accessBy} onChange={handleChange} required />
          </div>
        </Section>

        {/* Part 2: Prerequisite Skills */}
        <Section title="Prerequisite Skills" className="mt-8">
          <Subsection title="Joint Attention - Responding">
            <LabelledCheckbox
              label="Yes"
              id="jointAttentionRespondingYes"
              name="jointAttentionResponding.yes"
              checked={formData.prerequisiteSkills.jointAttentionResponding.yes}
              onChange={(e) => handleNestedChange("prerequisiteSkills", e)}
            />
            <LabelledCheckbox
              label="No"
              id="jointAttentionRespondingNo"
              name="jointAttentionResponding.no"
              checked={formData.prerequisiteSkills.jointAttentionResponding.no}
              onChange={(e) => handleNestedChange("prerequisiteSkills", e)}
            />
          </Subsection>

          <Subsection title="Joint Attention - Initiation">
            <LabelledCheckbox
              label="Yes"
              id="jointAttentionInitiationYes"
              name="jointAttentionInitiation.yes"
              checked={formData.prerequisiteSkills.jointAttentionInitiation.yes}
              onChange={(e) => handleNestedChange("prerequisiteSkills", e)}
            />
            <LabelledCheckbox
              label="No"
              id="jointAttentionInitiationNo"
              name="jointAttentionInitiation.no"
              checked={formData.prerequisiteSkills.jointAttentionInitiation.no}
              onChange={(e) => handleNestedChange("prerequisiteSkills", e)}
            />
          </Subsection>

          <Subsection title="Eye Fixation">
            <LabelledCheckbox
              label="Yes"
              id="eyeFixationYes"
              name="eyeFixation.yes"
              checked={formData.prerequisiteSkills.eyeFixation.yes}
              onChange={(e) => handleNestedChange("prerequisiteSkills", e)}
            />
            <LabelledCheckbox
              label="No"
              id="eyeFixationNo"
              name="eyeFixation.no"
              checked={formData.prerequisiteSkills.eyeFixation.no}
              onChange={(e) => handleNestedChange("prerequisiteSkills", e)}
            />
          </Subsection>

          <Subsection title="Visual Tracking">
            <LabelledCheckbox
              label="Yes"
              id="visualTrackingYes"
              name="visualTracking.yes"
              checked={formData.prerequisiteSkills.visualTracking.yes}
              onChange={(e) => handleNestedChange("prerequisiteSkills", e)}
            />
            <LabelledCheckbox
              label="No"
              id="visualTrackingNo"
              name="visualTracking.no"
              checked={formData.prerequisiteSkills.visualTracking.no}
              onChange={(e) => handleNestedChange("prerequisiteSkills", e)}
            />
          </Subsection>

          <Subsection title="Attention Span">
            <LabelledCheckbox
              label="Extreme Distraction"
              id="extremeDistraction"
              name="attentionSpan.extremeDistraction"
              checked={formData.prerequisiteSkills.attentionSpan.extremeDistraction}
              onChange={(e) => handleNestedChange("prerequisiteSkills", e)}
            />
            <LabelledCheckbox
              label="Single Channel"
              id="singleChannel"
              name="attentionSpan.singleChannel"
              checked={formData.prerequisiteSkills.attentionSpan.singleChannel}
              onChange={(e) => handleNestedChange("prerequisiteSkills", e)}
            />
          </Subsection>

          <Subsection title="Turn Taking">
            <LabelledCheckbox
              label="Waiting"
              id="waiting"
              name="turnTaking.waiting"
              checked={formData.prerequisiteSkills.turnTaking.waiting}
              onChange={(e) => handleNestedChange("prerequisiteSkills", e)}
            />
            <LabelledCheckbox
              label="Taking Turn"
              id="takingTurn"
              name="turnTaking.takingTurn"
              checked={formData.prerequisiteSkills.turnTaking.takingTurn}
              onChange={(e) => handleNestedChange("prerequisiteSkills", e)}
            />
          </Subsection>

          <Subsection title="Name Responding">
            <RadioGroupField
              label="Response to Name"
              name="nameResponding"
              options={["Always", "Never"]}
              selectedValue={
                formData.prerequisiteSkills.nameResponding.always ? "always" :
                formData.prerequisiteSkills.nameResponding.never ? "never" : ""
              }
              onChange={(e) => {
                const { value } = e.target;
                setFormData(prevData => ({
                  ...prevData,
                  prerequisiteSkills: {
                    ...prevData.prerequisiteSkills,
                    nameResponding: {
                      always: value === 'always',
                      never: value === 'never',
                    }
                  }
                }));
              }}
              row
            />
          </Subsection>
        </Section>

        {/* Part 3: Communication Skills */}
        <Section title="Communication Skills" className="mt-8">
          <Subsection title="Communication Stages">
            <LabelledCheckbox
              label="Own Agenda Stage"
              id="ownAgendaStage"
              name="communicationStages.ownAgendaStage"
              checked={formData.communicationSkills.communicationStages.ownAgendaStage}
              onChange={(e) => handleNestedChange("communicationSkills", e)}
            />
            <LabelledCheckbox
              label="Requester Stage"
              id="requesterStage"
              name="communicationStages.requesterStage"
              checked={formData.communicationSkills.communicationStages.requesterStage}
              onChange={(e) => handleNestedChange("communicationSkills", e)}
            />
            <LabelledCheckbox
              label="Early Communicator Stage"
              id="earlyCommunicatorStage"
              name="communicationStages.earlyCommunicatorStage"
              checked={formData.communicationSkills.communicationStages.earlyCommunicatorStage}
              onChange={(e) => handleNestedChange("communicationSkills", e)}
            />
            <LabelledCheckbox
              label="Partner Stage"
              id="partnerStage"
              name="communicationStages.partnerStage"
              checked={formData.communicationSkills.communicationStages.partnerStage}
              onChange={(e) => handleNestedChange("communicationSkills", e)}
            />
          </Subsection>

          <Subsection title="Communication Functions">
            {['requestingAssistance', 'greeting', 'agreeing', 'disagreeing'].map(funcKey => (
              <div key={funcKey} className="mb-4 p-3 border rounded-md bg-white">
                <p className="font-medium text-gray-800 mb-2 capitalize">{funcKey.replace(/([A-Z])/g, ' $1')}:</p>
                <div className="flex items-center space-x-4 mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`${funcKey}_present`}
                      value="yes"
                      checked={formData.communicationSkills.communicationFunctions[funcKey]?.yes}
                      onChange={handleCommunicationFunctionChange(funcKey, 'yes')}
                      className="mr-1"
                    /> Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`${funcKey}_present`}
                      value="no"
                      checked={formData.communicationSkills.communicationFunctions[funcKey]?.no}
                      onChange={handleCommunicationFunctionChange(funcKey, 'no')}
                      className="mr-1"
                    /> No
                  </label>
                </div>
                {(formData.communicationSkills.communicationFunctions[funcKey]?.yes || formData.communicationSkills.communicationFunctions[funcKey]?.no) && (
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name={`${funcKey}_verbal`}
                        checked={formData.communicationSkills.communicationFunctions[funcKey]?.verbal}
                        onChange={handleCommunicationFunctionChange(funcKey, 'verbal')}
                        className="mr-1"
                      /> Verbal
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name={`${funcKey}_nonVerbal`}
                        checked={formData.communicationSkills.communicationFunctions[funcKey]?.nonVerbal}
                        onChange={handleCommunicationFunctionChange(funcKey, 'nonVerbal')}
                        className="mr-1"
                      /> Non-Verbal
                    </label>
                  </div>
                )}
              </div>
            ))}
          </Subsection>

          <Subsection title="Communication Modalities">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {['eyeContact', 'bodyLanguage', 'vocalizations', 'gestures', 'pointing', 'words', 'sentences', 'signLanguage', 'pictures', 'communicationBook', 'electronicDevice'].map(modality => (
                <LabelledCheckbox
                  key={modality}
                  label={modality.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  id={modality}
                  name={`communicationModalities.${modality}`}
                  checked={formData.communicationSkills.communicationModalities[modality]}
                  onChange={(e) => handleNestedChange("communicationSkills", e)}
                />
              ))}
            </div>
          </Subsection>
        </Section>

        {/* Part 4: Language Skills */}
        <Section title="Language Skills" className="mt-8">
          <Subsection title="Comprehension">
            <RadioGroupField
              label="Gestural Command"
              name="comprehension.gesturalCommand"
              options={["Yes", "No"]}
              selectedValue={formData.languageSkills.comprehension.gesturalCommand}
              onChange={(e) => handleNestedChange("languageSkills", e)}
              row
            />
            <LabelledCheckbox
              label="Verbal Comprehension (Single Words)"
              id="verbalComprehensionSingle"
              name="comprehension.verbalComprehensionSingle"
              checked={formData.languageSkills.comprehension.verbalComprehensionSingle}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
            <LabelledCheckbox
              label="Verbal Comprehension (Two Words)"
              id="verbalComprehensionTwo"
              name="comprehension.verbalComprehensionTwo"
              checked={formData.languageSkills.comprehension.verbalComprehensionTwo}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
            <LabelledCheckbox
              label="Verbal Comprehension (Three Words)"
              id="verbalComprehensionThree"
              name="comprehension.verbalComprehensionThree"
              checked={formData.languageSkills.comprehension.verbalComprehensionThree}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
            <LabelledCheckbox
              label="Verbal Comprehension (Sentences)"
              id="verbalComprehensionSentences"
              name="comprehension.verbalComprehensionSentences"
              checked={formData.languageSkills.comprehension.verbalComprehensionSentences}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
            <LabelledCheckbox
              label="Verbal Comprehension (Picture Identification)"
              id="verbalComprehensionPicture"
              name="comprehension.verbalComprehensionPicture"
              checked={formData.languageSkills.comprehension.verbalComprehensionPicture}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
            <LabelledCheckbox
              label="Verbal Comprehension (Sequencing)"
              id="verbalComprehensionSequencing"
              name="comprehension.verbalComprehensionSequencing"
              checked={formData.languageSkills.comprehension.verbalComprehensionSequencing}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
            <LabelledCheckbox
              label="Verbal Comprehension (Story Comprehension)"
              id="verbalComprehensionStory"
              name="comprehension.verbalComprehensionStory"
              checked={formData.languageSkills.comprehension.verbalComprehensionStory}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
          </Subsection>

          <Subsection title="Expression">
            <RadioGroupField
              label="Use Gesture"
              name="expression.useGesture"
              options={["Yes", "No"]}
              selectedValue={formData.languageSkills.expression.useGesture}
              onChange={(e) => handleNestedChange("languageSkills", e)}
              row
            />
            <LabelledCheckbox
              label="Verbal Expression (Single Words)"
              id="verbalExpressionSingle"
              name="expression.verbalExpressionSingle"
              checked={formData.languageSkills.expression.verbalExpressionSingle}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
            <LabelledCheckbox
              label="Verbal Expression (Two Words)"
              id="verbalExpressionTwo"
              name="expression.verbalExpressionTwo"
              checked={formData.languageSkills.expression.verbalExpressionTwo}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
            <LabelledCheckbox
              label="Verbal Expression (Three Words)"
              id="verbalExpressionThree"
              name="expression.verbalExpressionThree"
              checked={formData.languageSkills.expression.verbalExpressionThree}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
            <LabelledCheckbox
              label="Verbal Expression (Sentences)"
              id="verbalExpressionSentences"
              name="expression.verbalExpressionSentences"
              checked={formData.languageSkills.expression.verbalExpressionSentences}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
            <LabelledCheckbox
              label="Verbal Expression (Picture Description)"
              id="verbalExpressionPicture"
              name="expression.verbalExpressionPicture"
              checked={formData.languageSkills.expression.verbalExpressionPicture}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
            <LabelledCheckbox
              label="Verbal Expression (Sequencing)"
              id="verbalExpressionSequencing"
              name="expression.verbalExpressionSequencing"
              checked={formData.languageSkills.expression.verbalExpressionSequencing}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
            <LabelledCheckbox
              label="Verbal Expression (Story Narration)"
              id="verbalExpressionStory"
              name="expression.verbalExpressionStory"
              checked={formData.languageSkills.expression.verbalExpressionStory}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
            <LabelledCheckbox
              label="Verbal Expression (Answer Questions)"
              id="verbalExpressionAnswer"
              name="expression.verbalExpressionAnswer"
              checked={formData.languageSkills.expression.verbalExpressionAnswer}
              onChange={(e) => handleNestedChange("languageSkills", e)}
            />
          </Subsection>

          <Subsection title="Vocabulary">
            <p className="text-gray-700 text-sm mb-2">Check for Comprehension (Com) and Expression (Exp)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6">
              {[
                "Family Members", "Body Parts", "Household Items", "Fruits", "Vegetables",
                "Animals", "Birds", "Vehicles", "Food", "Action Words", "Adjectives", "Shapes"
              ].map(item => (
                <div key={item} className="flex flex-col border-b pb-2 mb-2">
                  <p className="font-medium text-gray-800">{item}:</p>
                  <div className="flex gap-4">
                    <LabelledCheckbox
                      label="Com"
                      id={`${item.replace(/\s/g, "")}Com`}
                      name={`vocabulary.${item.replace(/\s/g, "")}Com`}
                      checked={formData.languageSkills.vocabulary[`${item.replace(/\s/g, "")}Com`]}
                      onChange={(e) => handleNestedChange("languageSkills", e)}
                      className="flex-grow"
                    />
                    <LabelledCheckbox
                      label="Exp"
                      id={`${item.replace(/\s/g, "")}Exp`}
                      name={`vocabulary.${item.replace(/\s/g, "")}Exp`}
                      checked={formData.languageSkills.vocabulary[`${item.replace(/\s/g, "")}Exp`]}
                      onChange={(e) => handleNestedChange("languageSkills", e)}
                      className="flex-grow"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Subsection>
        </Section>

        {/* Part 5: Speech Skills */}
        <Section title="Speech Skills" className="mt-8">
          <SelectField
            label="Intelligibility"
            id="intelligibility"
            name="intelligibility"
            value={formData.speechSkills.intelligibility}
            onChange={(e) => handleNestedChange("speechSkills", e)}
            options={["Unintelligible", "25%", "50%", "75%", "100%"]}
          />
          <InputField label="Fluency" id="fluency" name="fluency" value={formData.speechSkills.fluency} onChange={(e) => handleNestedChange("speechSkills", e)} />
          <InputField label="Articulation" id="articulation" name="articulation" value={formData.speechSkills.articulation} onChange={(e) => handleNestedChange("speechSkills", e)} />
          <InputField label="Phonology" id="phonology" name="phonology" value={formData.speechSkills.phonology} onChange={(e) => handleNestedChange("speechSkills", e)} />

          <Subsection title="Voice">
            <InputField label="Pitch" id="pitch" name="pitch" value={formData.speechSkills.voice.pitch} onChange={handleVoiceChange} />
            <InputField label="Loudness" id="loudness" name="loudness" value={formData.speechSkills.voice.loudness} onChange={handleVoiceChange} />
            <InputField label="Quality" id="quality" name="quality" value={formData.speechSkills.voice.quality} onChange={handleVoiceChange} />
            <InputField label="Nasality" id="nasality" name="nasality" value={formData.speechSkills.voice.nasality} onChange={handleVoiceChange} />
          </Subsection>
        </Section>

        {/* Part 6: Oral Motor Assessment */}
        <Section title="Oral Motor Assessment" className="mt-8">
          <SelectField
            label="Oral Sensory"
            id="oralSensory"
            name="oralSensory"
            value={formData.oralMotorAssessment.oralSensory}
            onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            options={["Hyposensitive", "Hypersensitive", "N/A"]}
          />
          <SelectField
            label="Drooling"
            id="drooling"
            name="drooling"
            value={formData.oralMotorAssessment.drooling}
            onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            options={["Presence", "Absence", "N/A"]}
          />
          <SelectField
            label="Lips Strength"
            id="lipsStrength"
            name="lipsStrength"
            value={formData.oralMotorAssessment.lipsStrength}
            onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            options={["Normal", "Poor", "N/A"]}
          />
          <SelectField
            label="Tongue Strength"
            id="tongueStrength"
            name="tongueStrength"
            value={formData.oralMotorAssessment.tongueStrength}
            onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            options={["Normal", "Poor", "N/A"]}
          />
          <SelectField
            label="Mobility Lips"
            id="mobilityLips"
            name="mobilityLips"
            value={formData.oralMotorAssessment.mobilityLips}
            onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            options={["Normal", "Poor", "N/A"]}
          />
          <SelectField
            label="Mobility Tongue"
            id="mobilityTongue"
            name="mobilityTongue"
            value={formData.oralMotorAssessment.mobilityTongue}
            onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            options={["Normal", "Poor", "N/A"]}
          />

          <Subsection title="Social Skills">
            <LabelledCheckbox
              label="Social Smile"
              id="socialSmile"
              name="socialSmile"
              checked={formData.oralMotorAssessment.socialSmile}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
            <LabelledCheckbox
              label="Peer Relationship"
              id="peerRelationship"
              name="peerRelationship"
              checked={formData.oralMotorAssessment.peerRelationship}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
            <LabelledCheckbox
              label="Stranger Relationship"
              id="strangerRelationship"
              name="strangerRelationship"
              checked={formData.oralMotorAssessment.strangerRelationship}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
            <LabelledCheckbox
              label="Social Questioning"
              id="socialQuestioning"
              name="socialQuestioning"
              checked={formData.oralMotorAssessment.socialQuestioning}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
          </Subsection>

          <Subsection title="Cognitive Skills">
            <LabelledCheckbox
              label="Orientation"
              id="orientation"
              name="orientation"
              checked={formData.oralMotorAssessment.orientation}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
            <LabelledCheckbox
              label="Problem Solving"
              id="problemSolving"
              name="problemSolving"
              checked={formData.oralMotorAssessment.problemSolving}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
            <LabelledCheckbox
              label="Reasoning"
              id="reasoning"
              name="reasoning"
              checked={formData.oralMotorAssessment.reasoning}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
            <LabelledCheckbox
              label="Organization"
              id="organization"
              name="organization"
              checked={formData.oralMotorAssessment.organization}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
            <LabelledCheckbox
              label="Object Permanent"
              id="objectPermanent"
              name="objectPermanent"
              checked={formData.oralMotorAssessment.objectPermanent}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
          </Subsection>

          <Subsection title="Play Skills">
            <LabelledCheckbox
              label="Solitary Play"
              id="solitaryPlay"
              name="solitaryPlay"
              checked={formData.oralMotorAssessment.solitaryPlay}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
            <LabelledCheckbox
              label="Constructive Play"
              id="constructivePlay"
              name="constructivePlay"
              checked={formData.oralMotorAssessment.constructivePlay}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
            <LabelledCheckbox
              label="Functional Play"
              id="functionalPlay"
              name="functionalPlay"
              checked={formData.oralMotorAssessment.functionalPlay}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
            <LabelledCheckbox
              label="Pretend Play"
              id="pretendPlay"
              name="pretendPlay"
              checked={formData.oralMotorAssessment.pretendPlay}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
            <LabelledCheckbox
              label="Symbolic Play"
              id="symbolicPlay"
              name="symbolicPlay"
              checked={formData.oralMotorAssessment.symbolicPlay}
              onChange={(e) => handleNestedChange("oralMotorAssessment", e)}
            />
          </Subsection>
        </Section>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/therapy-assessments/${id}`)}
            className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Assessment"}
          </button>
        </div>
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default EditTherapyAssessment;