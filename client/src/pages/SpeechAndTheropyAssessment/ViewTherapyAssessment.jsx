import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";

const ViewTherapyAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/therapyAssessments/${id}`);
        setAssessment(response.data);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching assessment with ID ${id}:`, err);
        setError("Failed to load therapy assessment record.");
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this record?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/therapyAssessments/${id}`);
        alert("Record deleted successfully!");
        navigate("/dashboard/therapy-assessments");
      } catch (err) {
        console.error(`Error deleting assessment:`, err);
        setError("Failed to delete record.");
      }
    }
  };

  if (loading) return <div className="text-center p-10 text-blue-600 font-medium">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-600">{error}</div>;
  if (!assessment) return <div className="text-center p-10 text-gray-500">No data found.</div>;

  // --- Helper Components for Layout ---

  // Formats "camelCase" to "Camel Case"
  const formatLabel = (str) => str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  // Renders a Yes/No Badge
  const BooleanBadge = ({ value }) => {
    if (value === true || value === "yes" || value === "Always") {
      return <span className="px-2 py-1 text-xs font-bold text-green-800 bg-green-100 rounded-full">Yes / Always</span>;
    }
    if (value === false || value === "no" || value === "Never") {
      return <span className="px-2 py-1 text-xs font-bold text-red-800 bg-red-100 rounded-full">No / Never</span>;
    }
    if (!value) return <span className="text-gray-400">-</span>;
    return <span className="text-gray-800">{value}</span>;
  };

  // Renders a simple Key-Value Row
  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="font-semibold text-gray-900">{value || "-"}</span>
    </div>
  );

  // Renders a grid item for boolean flags (used in Prerequisite/Language)
  const BooleanItem = ({ label, value }) => (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-sm font-medium text-gray-700">{formatLabel(label)}</span>
      <BooleanBadge value={value} />
    </div>
  );

  // --- Special Table Renderers ---

  // 1. Communication Functions Table
  const CommunicationFunctionsTable = ({ data }) => {
    if (!data) return null;
    return (
      <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-bold text-blue-800 uppercase">Function</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-blue-800 uppercase">Yes</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-blue-800 uppercase">No</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-blue-800 uppercase">Verbal</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-blue-800 uppercase">Non-Verbal</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(data).map(([key, val]) => (
              <tr key={key}>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">{formatLabel(key)}</td>
                <td className="text-center"><BooleanBadge value={val.yes} /></td>
                <td className="text-center"><BooleanBadge value={val.no} /></td>
                <td className="text-center"><BooleanBadge value={val.verbal} /></td>
                <td className="text-center"><BooleanBadge value={val.nonVerbal} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 2. Vocabulary Table
  const VocabularyTable = ({ data }) => {
    if (!data) return null;
    // Group keys by topic (e.g., "animalsCom" and "animalsExp" -> "animals")
    const topics = {};
    Object.keys(data).forEach(key => {
      const topic = key.replace(/Com$|Exp$/, ''); // Remove suffix
      if (!topics[topic]) topics[topic] = { com: false, exp: false };
      if (key.endsWith('Com')) topics[topic].com = data[key];
      if (key.endsWith('Exp')) topics[topic].exp = data[key];
    });

    return (
      <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-bold text-purple-800 uppercase">Topic</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-purple-800 uppercase">Comprehension</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-purple-800 uppercase">Expression</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(topics).map(([topic, val]) => (
              <tr key={topic}>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">{formatLabel(topic)}</td>
                <td className="text-center"><BooleanBadge value={val.com} /></td>
                <td className="text-center"><BooleanBadge value={val.exp} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header with Actions */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-6 md:p-10 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Therapy Assessment</h2>
            <p className="text-blue-100 mt-1 text-lg">{assessment.name} <span className="opacity-75">({assessment.regNo})</span></p>
          </div>
          <div className="flex gap-3">
            <Link to={`/dashboard/therapy-assessments/edit/${assessment._id}`} className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg font-semibold transition">
              Edit
            </Link>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-500/80 hover:bg-red-600 rounded-lg font-semibold transition">
              Delete
            </button>
            <Link to="/dashboard/therapy-assessments" className="px-4 py-2 bg-white text-blue-900 rounded-lg font-bold hover:bg-gray-100 transition">
              Back
            </Link>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-10">
          
          {/* 1. Patient Details Card */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Personal & Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow label="DOB" value={assessment.dob ? new Date(assessment.dob).toLocaleDateString() : '-'} />
              <InfoRow label="Age" value={assessment.age} />
              <InfoRow label="Gender" value={assessment.gender} />
              <InfoRow label="Language" value={assessment.languageUsed} />
              <InfoRow label="Primary Carer" value={assessment.primaryCarer} />
              <InfoRow label="Diagnosis" value={assessment.medicalDiagnosis} />
              <InfoRow label="Hearing" value={assessment.hearing} />
              <InfoRow label="Vision" value={assessment.vision} />
              <InfoRow label="Accessed By" value={assessment.accessBy} />
            </div>
          </div>

          {/* 2. Prerequisite Skills */}
          <section>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">Prerequisite Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Handle specific nested yes/no objects */}
              {['jointAttentionResponding', 'jointAttentionInitiation', 'eyeFixation', 'visualTracking'].map(key => (
                 <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="block text-xs text-gray-500 uppercase tracking-wide mb-1">{formatLabel(key)}</span>
                    <div className="flex gap-2">
                      {assessment.prerequisiteSkills[key]?.yes && <span className="text-green-700 font-bold text-sm">Yes</span>}
                      {assessment.prerequisiteSkills[key]?.no && <span className="text-red-700 font-bold text-sm">No</span>}
                      {!assessment.prerequisiteSkills[key]?.yes && !assessment.prerequisiteSkills[key]?.no && <span className="text-gray-400 text-sm">-</span>}
                    </div>
                 </div>
              ))}
              
              {/* Handle standard fields */}
              <BooleanItem label="Extreme Distraction" value={assessment.prerequisiteSkills?.attentionSpan?.extremeDistraction} />
              <BooleanItem label="Single Channel" value={assessment.prerequisiteSkills?.attentionSpan?.singleChannel} />
              <BooleanItem label="Wait for Turn" value={assessment.prerequisiteSkills?.turnTaking?.waiting} />
              <BooleanItem label="Taking Turn" value={assessment.prerequisiteSkills?.turnTaking?.takingTurn} />
              <BooleanItem label="Social Smile" value={assessment.oralMotorAssessment?.socialSmile} />
              <BooleanItem label="Peer Relationship" value={assessment.oralMotorAssessment?.peerRelationship} />
            </div>
          </section>

          {/* 3. Communication Skills */}
          <section>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">Communication Skills</h3>
            
            <h4 className="font-semibold text-gray-600 mb-2">Stages</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {Object.entries(assessment.communicationSkills?.communicationStages || {}).map(([key, val]) => (
                 <BooleanItem key={key} label={key} value={val} />
              ))}
            </div>

            <h4 className="font-semibold text-gray-600 mb-2">Functions</h4>
            {/* This fixes the [object Object] issue by using a table */}
            <CommunicationFunctionsTable data={assessment.communicationSkills?.communicationFunctions} />
          </section>

          {/* 4. Language Skills */}
          <section>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">Language Skills</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-indigo-600 mb-3">Comprehension</h4>
                <div className="space-y-2">
                   <InfoRow label="Gestural Command" value={assessment.languageSkills?.comprehension?.gesturalCommand} />
                   {Object.entries(assessment.languageSkills?.comprehension || {}).map(([key, val]) => (
                      key !== 'gesturalCommand' && <BooleanItem key={key} label={key} value={val} />
                   ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-purple-600 mb-3">Expression</h4>
                 <div className="space-y-2">
                   <InfoRow label="Use Gesture" value={assessment.languageSkills?.expression?.useGesture} />
                   {Object.entries(assessment.languageSkills?.expression || {}).map(([key, val]) => (
                      key !== 'useGesture' && <BooleanItem key={key} label={key} value={val} />
                   ))}
                </div>
              </div>
            </div>

            <h4 className="font-semibold text-gray-600 mt-8 mb-2">Vocabulary</h4>
            {/* This renders the Vocabulary as a clear table */}
            <VocabularyTable data={assessment.languageSkills?.vocabulary} />
          </section>

          {/* 5. Speech & Oral Motor */}
          <section>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">Speech & Oral Motor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                 <h4 className="font-bold text-gray-700 mb-3">Speech Parameters</h4>
                 <InfoRow label="Intelligibility" value={assessment.speechSkills?.intelligibility} />
                 <InfoRow label="Fluency" value={assessment.speechSkills?.fluency} />
                 <InfoRow label="Articulation" value={assessment.speechSkills?.articulation} />
                 <InfoRow label="Phonology" value={assessment.speechSkills?.phonology} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                 <h4 className="font-bold text-gray-700 mb-3">Voice</h4>
                 <InfoRow label="Pitch" value={assessment.speechSkills?.voice?.pitch} />
                 <InfoRow label="Loudness" value={assessment.speechSkills?.voice?.loudness} />
                 <InfoRow label="Quality" value={assessment.speechSkills?.voice?.quality} />
              </div>
            </div>

            <h4 className="font-semibold text-gray-600 mb-2">Play & Cognitive Skills</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {['solitaryPlay', 'constructivePlay', 'functionalPlay', 'pretendPlay', 'symbolicPlay', 'objectPermanent'].map(key => (
                  <BooleanItem key={key} label={key} value={assessment.oralMotorAssessment?.[key]} />
               ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default ViewTherapyAssessment;