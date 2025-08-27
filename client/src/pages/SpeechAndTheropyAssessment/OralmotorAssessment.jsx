import React, { useState, useEffect } from "react";

export default function OralmotorAssessment({ navigateBackToSpeech }) {
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(
        "mamaMathavam_oralMotorAssessmentData"
      );
      if (savedData) {
        setFormData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error(
        "Error loading oral-motor assessment data from localStorage:",
        error
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveCurrentFormData = () => {
    try {
      localStorage.setItem(
        "mamaMathavam_oralMotorAssessmentData",
        JSON.stringify(formData)
      );
      console.log(
        "Oral-Motor Assessment data saved to localStorage temporarily."
      );
    } catch (error) {
      console.error(
        "Error saving current oral-motor assessment data to localStorage:",
        error
      );
    }
  };

  useEffect(() => {
    saveCurrentFormData();
  }, [formData]);


  const handleSubmit = async () => {
    try {
      const therapyAssessmentData = JSON.parse(localStorage.getItem("mamaMathavam_therapyAssessmentData")) || {};
      const preRequisiteSkillData = JSON.parse(localStorage.getItem("mamaMathavam_preRequisiteSkillData")) || {};
      const communicationData = JSON.parse(localStorage.getItem("mamaMathavam_communicationData")) || {};
      const languageData = JSON.parse(localStorage.getItem("mamaMathavam_languageData")) || {};
      const speechData = JSON.parse(localStorage.getItem("mamaMathavam_speechData")) || {};

      const dataToSendToBackend = {
          name: therapyAssessmentData.name,
          dob: therapyAssessmentData.dob,
          gender: therapyAssessmentData.gender,
          age: therapyAssessmentData.age,
          regNo: therapyAssessmentData.regNo,
          languageUsed: therapyAssessmentData.languageUsed,
          primaryCarer: therapyAssessmentData.primaryCarer,
          medicalDiagnosis: therapyAssessmentData.medicalDiagnosis,
          communicationDiagnosis: therapyAssessmentData.communicationDiagnosis,
          familyHistory: therapyAssessmentData.familyHistory,
          hearing: therapyAssessmentData.hearing,
          vision: therapyAssessmentData.vision,
          siblings: therapyAssessmentData.siblings,
          motorDevelopment: therapyAssessmentData.motorDevelopment,
          speechRegression: therapyAssessmentData.speechRegression,
          assessmentDate: therapyAssessmentData.assessmentDate,
          accessBy: therapyAssessmentData.accessBy,
          nameResponding: therapyAssessmentData.nameResponding,
          canWaitTurn: therapyAssessmentData.canWaitTurn,
          canTakeTurns: therapyAssessmentData.canTakeTurns,

          prerequisiteSkills: {
            jointAttentionRespondingYes: preRequisiteSkillData.jointAttentionRespondingYes,
            jointAttentionRespondingNo: preRequisiteSkillData.jointAttentionRespondingNo,
            jointAttentionInitiationYes: preRequisiteSkillData.jointAttentionInitiationYes,
            jointAttentionInitiationNo: preRequisiteSkillData.jointAttentionInitiationNo,
            eyeFixationYes: preRequisiteSkillData.eyeFixationYes,
            eyeFixationNo: preRequisiteSkillData.eyeFixationNo,
            visualTrackingYes: preRequisiteSkillData.visualTrackingYes,
            visualTrackingNo: preRequisiteSkillData.visualTrackingNo,
            extremeDistraction: preRequisiteSkillData.extremeDistraction,
            singleChannel: preRequisiteSkillData.singleChannel,
            waiting: preRequisiteSkillData.waiting,
            takingTurn: preRequisiteSkillData.takingTurn,
            nameRespondingAlways: preRequisiteSkillData.nameRespondingAlways,
            nameRespondingNever: preRequisiteSkillData.nameRespondingNever,
          },
          communicationSkills: {
            requestingYes: communicationData.communicationFunctions?.requestingAssistance?.yes,
            requestingNo: communicationData.communicationFunctions?.requestingAssistance?.no,
            requestingVerbal: communicationData.communicationFunctions?.requestingAssistance?.verbal,
            requestingNonVerbal: communicationData.communicationFunctions?.requestingAssistance?.nonVerbal,

            protestingYes: communicationData.communicationFunctions?.protesting?.yes,
            protestingNo: communicationData.communicationFunctions?.protesting?.no,
            protestingVerbal: communicationData.communicationFunctions?.protesting?.verbal,
            protestingNonVerbal: communicationData.communicationFunctions?.protesting?.nonVerbal,

            greetingYes: communicationData.communicationFunctions?.greeting?.yes,
            greetingNo: communicationData.communicationFunctions?.greeting?.no,
            greetingVerbal: communicationData.communicationFunctions?.greeting?.verbal,
            greetingNonVerbal: communicationData.communicationFunctions?.greeting?.nonVerbal,

            showingOffYes: communicationData.communicationFunctions?.showingOff?.yes,
            showingOffNo: communicationData.communicationFunctions?.showingOff?.no,
            showingOffVerbal: communicationData.communicationFunctions?.showingOff?.verbal,
            showingOffNonVerbal: communicationData.communicationFunctions?.showingOff?.nonVerbal,

            disagreeingYes: communicationData.communicationFunctions?.disagreeing?.yes,
            disagreeingNo: communicationData.communicationFunctions?.disagreeing?.no,
            disagreeingVerbal: communicationData.communicationFunctions?.disagreeing?.verbal,
            disagreeingNonVerbal: communicationData.communicationFunctions?.disagreeing?.nonVerbal,

            understandingSocialCuesYes: communicationData.communicationFunctions?.understandingSocialCues?.yes,
            understandingSocialCuesNo: communicationData.communicationFunctions?.understandingSocialCues?.no,
            understandingSocialCuesVerbal: communicationData.communicationFunctions?.understandingSocialCues?.verbal,
            understandingSocialCuesNonVerbal: communicationData.communicationFunctions?.understandingSocialCues?.nonVerbal,

            understandingFacialExpressionsYes: communicationData.communicationFunctions?.understandingFacialExpressions?.yes,
            understandingFacialExpressionsNo: communicationData.communicationFunctions?.understandingFacialExpressions?.no,
            understandingFacialExpressionsVerbal: communicationData.communicationFunctions?.understandingFacialExpressions?.verbal,
            understandingFacialExpressionsNonVerbal: communicationData.communicationFunctions?.understandingFacialExpressions?.nonVerbal,

            respondingToOthersYes: communicationData.communicationFunctions?.respondingToOthers?.yes,
            respondingToOthersNo: communicationData.communicationFunctions?.respondingToOthers?.no,
            respondingToOthersVerbal: communicationData.communicationFunctions?.respondingToOthers?.verbal,
            respondingToOthersNonVerbal: communicationData.communicationFunctions?.respondingToOthers?.nonVerbal,

            initiatingConversationYes: communicationData.communicationFunctions?.initiatingConversation?.yes,
            initiatingConversationNo: communicationData.communicationFunctions?.initiatingConversation?.no,
            initiatingConversationVerbal: communicationData.communicationFunctions?.initiatingConversation?.verbal,
            initiatingConversationNonVerbal: communicationData.communicationFunctions?.initiatingConversation?.nonVerbal,

            maintainingConversationYes: communicationData.communicationFunctions?.maintainingConversation?.yes,
            maintainingConversationNo: communicationData.communicationFunctions?.maintainingConversation?.no,
            maintainingConversationVerbal: communicationData.communicationFunctions?.maintainingConversation?.verbal,
            maintainingConversationNonVerbal: communicationData.communicationFunctions?.maintainingConversation?.nonVerbal,

            expressingEmotionsYes: communicationData.communicationFunctions?.expressingEmotions?.yes,
            expressingEmotionsNo: communicationData.communicationFunctions?.expressingEmotions?.no,
            expressingEmotionsVerbal: communicationData.communicationFunctions?.expressingEmotions?.verbal,
            expressingEmotionsNonVerbal: communicationData.communicationFunctions?.expressingEmotions?.nonVerbal,
          },
          languageSkills: {
            comprehension: languageData.comprehension,
            expression: languageData.expression,
            vocabulary: languageData.vocabulary,
          },
          speechSkills: {
            intelligibility: speechData.intelligibility,
            fluency: speechData.fluency,
            articulation: speechData.articulation,
            phonology: speechData.phonology,
          },
          oralMotorAssessment: formData,
      };

      console.log("Final Data to Send to Backend:", dataToSendToBackend);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/therapyAssessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSendToBackend),
      });

      if (response.ok) {
        alert("Skill Assessment form successfully submitted!");
        console.log("Form data successfully sent to backend.");
        localStorage.removeItem("mamaMathavam_therapyAssessmentData");
        localStorage.removeItem("mamaMathavam_preRequisiteSkillData");
        localStorage.removeItem("mamaMathavam_communicationData");
        localStorage.removeItem("mamaMathavam_languageData");
        localStorage.removeItem("mamaMathavam_speechData");
        localStorage.removeItem("mamaMathavam_oralMotorAssessmentData");
        localStorage.removeItem("mamaMathavam_allFormData");
        console.log("Relevant local storage data cleared after successful submission.");
      } else {
        const errorData = await response.json();
        alert(`Failed to submit form: ${errorData.message || response.statusText}`);
        console.error("Failed to send form data to backend:", response.status, errorData);
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      alert("An error occurred during submission. Please try again.");
    }
  };

  const handleBack = () => {
    saveCurrentFormData();
    if (navigateBackToSpeech) {
      navigateBackToSpeech();
    }
  };

  return (
    <div className="w-full px-4 py-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl my-8 font-sans text-gray-800">
      <h2 className="text-3xl font-extrabold text-center text-indigo-800 mb-8 tracking-tight leading-tight">
        Oral-Motor Assessment
      </h2>

      <form className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="👄 Oral Sensory">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Oral Sensory</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="oralSensory"
                            id="oralHyposensitive"
                            value="Hyposensitive"
                            checked={formData.oralSensory === "Hyposensitive"}
                            onChange={handleChange}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <label
                            className="ml-2 block text-gray-700"
                            htmlFor="oralHyposensitive"
                          >
                            Hyposensitive
                          </label>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="oralSensory"
                            id="oralHypersensitive"
                            value="Hypersensitive"
                            checked={formData.oralSensory === "Hypersensitive"}
                            onChange={handleChange}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <label
                            className="ml-2 block text-gray-700"
                            htmlFor="oralHypersensitive"
                          >
                            Hypersensitive
                          </label>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Drooling</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            className="form-radio h-4 w-4 text-blue-600"
                            type="radio"
                            name="drooling"
                            id="droolingPresence"
                            value="presence"
                            checked={formData.drooling === "presence"}
                            onChange={handleChange}
                          />
                          <label
                            className="ml-2 block text-gray-700"
                            htmlFor="droolingPresence"
                          >
                            {" "}
                            Presence{" "}
                          </label>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            className="form-radio h-4 w-4 text-blue-600"
                            type="radio"
                            name="drooling"
                            id="droolingAbsence"
                            value="absence"
                            checked={formData.drooling === "absence"}
                            onChange={handleChange}
                          />
                          <label
                            className="ml-2 block text-gray-700"
                            htmlFor="droolingAbsence"
                          >
                            {" "}
                            Absence{" "}
                          </label>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Lips strength</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            className="form-radio h-4 w-4 text-blue-600"
                            type="radio"
                            name="lipsStrength"
                            id="lipsNormal"
                            value="normal"
                            checked={formData.lipsStrength === "normal"}
                            onChange={handleChange}
                          />
                          <label
                            className="ml-2 block text-gray-700"
                            htmlFor="lipsNormal"
                          >
                            {" "}
                            Normal{" "}
                          </label>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            className="form-radio h-4 w-4 text-blue-600"
                            type="radio"
                            name="lipsStrength"
                            id="lipsPoor"
                            value="poor"
                            checked={formData.lipsStrength === "poor"}
                            onChange={handleChange}
                          />
                          <label
                            className="ml-2 block text-gray-700"
                            htmlFor="lipsPoor"
                          >
                            {" "}
                            Poor{" "}
                          </label>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Tongue strength</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            className="form-radio h-4 w-4 text-blue-600"
                            type="radio"
                            name="tongueStrength"
                            id="tongueNormal"
                            value="normal"
                            checked={formData.tongueStrength === "normal"}
                            onChange={handleChange}
                          />
                          <label
                            className="ml-2 block text-gray-700"
                            htmlFor="tongueNormal"
                          >
                            {" "}
                            Normal{" "}
                          </label>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            className="form-radio h-4 w-4 text-blue-600"
                            type="radio"
                            name="tongueStrength"
                            id="tonguePoor"
                            value="poor"
                            checked={formData.tongueStrength === "poor"}
                            onChange={handleChange}
                          />
                          <label
                            className="ml-2 block text-gray-700"
                            htmlFor="tonguePoor"
                          >
                            {" "}
                            Poor{" "}
                          </label>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Mobility: Lips</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            className="form-radio h-4 w-4 text-blue-600"
                            type="radio"
                            name="mobilityLips"
                            id="mobilityLipsNormal"
                            value="normal"
                            checked={formData.mobilityLips === "normal"}
                            onChange={handleChange}
                          />
                          <label
                            className="ml-2 block text-gray-700"
                            htmlFor="mobilityLipsNormal"
                          >
                            {" "}
                            Normal{" "}
                          </label>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            className="form-radio h-4 w-4 text-blue-600"
                            type="radio"
                            name="mobilityLips"
                            id="mobilityLipsPoor"
                            value="poor"
                            checked={formData.mobilityLips === "poor"}
                            onChange={handleChange}
                          />
                          <label
                            className="ml-2 block text-gray-700"
                            htmlFor="mobilityLipsPoor"
                          >
                            {" "}
                            Poor{" "}
                          </label>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Mobility: Tongue</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            className="form-radio h-4 w-4 text-blue-600"
                            type="radio"
                            name="mobilityTongue"
                            id="mobilityTongueNormal"
                            value="normal"
                            checked={formData.mobilityTongue === "normal"}
                            onChange={handleChange}
                          />
                          <label
                            className="ml-2 block text-gray-700"
                            htmlFor="mobilityTongueNormal"
                          >
                            {" "}
                            Normal{" "}
                          </label>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            className="form-radio h-4 w-4 text-blue-600"
                            type="radio"
                            name="mobilityTongue"
                            id="mobilityTonguePoor"
                            value="poor"
                            checked={formData.mobilityTongue === "poor"}
                            onChange={handleChange}
                          />
                          <label
                            className="ml-2 block text-gray-700"
                            htmlFor="mobilityTonguePoor"
                          >
                            {" "}
                            Poor{" "}
                          </label>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="🤝 Social Skills (✓ / X)">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Social smile</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="socialSmile"
                        checked={formData.socialSmile}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {" "}
                      Peer group relationship{" "}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="peerRelationship"
                        checked={formData.peerRelationship}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {" "}
                      Stranger relationship{" "}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="strangerRelationship"
                        checked={formData.strangerRelationship}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      Social Questioning
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="socialQuestioning"
                        checked={formData.socialQuestioning}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="🧠 Cognitive Skills (✓ / X)">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Orientation</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="orientation"
                        checked={formData.orientation}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      Problem solving
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="problemSolving"
                        checked={formData.problemSolving}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Reasoning</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="reasoning"
                        checked={formData.reasoning}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Organization</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="organization"
                        checked={formData.organization}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="🧸 Play Skills (✓ / X)">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Object permanent</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="objectPermanent"
                        checked={formData.objectPermanent}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Solitary play</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="solitaryPlay"
                        checked={formData.solitaryPlay}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      Constructive play
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="constructivePlay"
                        checked={formData.constructivePlay}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Functional play</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="functionalPlay"
                        checked={formData.functionalPlay}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Pretend play</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="pretendPlay"
                        checked={formData.pretendPlay}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Symbolic play</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        name="symbolicPlay"
                        checked={formData.symbolicPlay}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10 pt-6 border-t border-indigo-100">
          <button
            type="button"
            onClick={handleBack}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-10 rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out text-base tracking-wide focus:outline-none focus:ring-4 focus:ring-gray-400"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 px-10 rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out text-base tracking-wide focus:outline-none focus:ring-4 focus:ring-green-400"
          >
            Submit All Data
          </button>
        </div>
      </form>
    </div>
  );
}

const Section = ({ title, children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-xl border-l-4 border-blue-400 hover:shadow-2xl transition-all duration-300 ease-in-out ${className}`}>
    <h3 className="text-2xl font-semibold text-blue-900 mb-6 border-b pb-2 border-blue-100">
      {title}
    </h3>
    {children}
  </div>
);