// apiUtils.js

// FIX 1: Define API_BASE_URL using your environment variable.
// IMPORTANT: Ensure VITE_API_URL is set in your project's .env file (e.g., VITE_API_URL=http://localhost:5000/api)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * FIX 2: Retrieves the authorization configuration with the standard JWT header.
 * @returns {object} Auth headers config for Axios.
 */
export const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Auth token not found in localStorage');
    return {}; // Return empty config if token is missing
  }
  return {
    headers: {
      // Use the standard Bearer token format for authentication
      Authorization: `Bearer ${token}`, 
    },
  };
};

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