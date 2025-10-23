// client/src/services/therapyAssessmentService.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/therapyAssessments/`; // Ensure this matches your backend route

// Function to create a new therapy assessment
const createAssessment = async (assessmentData) => {
    try {
        const response = await axios.post(API_URL, assessmentData);
        return response.data; // Return the created assessment data
    } catch (error) {
        console.error('Error creating assessment:', error.response?.data || error.message);
        throw error; // Re-throw to be handled by the calling component
    }
};

// You can add more functions here for fetching, updating, deleting if needed later
// const getAssessments = async () => { ... }
// const getAssessmentById = async (id) => { ... }
// const updateAssessment = async (id, assessmentData) => { ... }
// const deleteAssessment = async (id) => { ... }

const therapyAssessmentService = {
    createAssessment,
};

export default therapyAssessmentService;