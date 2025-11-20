// apiUtils.js

// Note: Please ensure this base URL is correctly configured in your .env file
// The variable name in your LoginForm.jsx was VITE_API_URL, not VITE_API_BASE_URL.
// I recommend changing VITE_API_BASE_URL to VITE_API_URL for consistency with your existing files.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Retrieves the authorization configuration with the token from local storage.
 * @returns {object} Auth headers config.
 */
export const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Auth token not found');
    return { headers: {} };
  }
  return {
    headers: {
      // FIX 1: Using the standard 'Authorization: Bearer <token>' header
      Authorization: `Bearer ${token}`, 
    },
  };
};

// ... (Keep your createSensoryProfilePayload function below)
export const createSensoryProfilePayload = (formSpecificData, sharedData) => {
  const { responses, comments, totalScore, formTitle } = formSpecificData;

  const { patientId, examinerId, testDate, ageGroup } = sharedData;

  const formattedResponses = Object.entries(responses).map(([qid, data]) => ({
    qid: parseInt(qid, 10),
    score: data.score,
    quadrant: data.quadrant,
  }));

  const formData = {
    patientId: patientId,
    examinerId: examinerId,
    testDate: testDate,
    assessmentType: "Sensory Profile", 
    ageGroup: ageGroup,
    category: formTitle,
    responses: formattedResponses,
    rawScore: totalScore,
    comments: comments,
  };

  return formData;
};