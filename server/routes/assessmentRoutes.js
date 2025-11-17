const express = require("express");
const router = express.Router();

// Import all the controller functions we just created
const {
  getAllSensoryProfiles,
  createSensoryProfile,
  deleteSensoryProfileById,
  getSensoryProfileById,
  updateSensoryProfileById,
  getSectionsByAssessmentId, // Import the new controller
} = require("../controllers/sensoryProfileController");

// --- Define the routes ---

// GET all sensory profiles (e.g., /api/assessments/sensory-profile)
router.get("/sensory-profile", getAllSensoryProfiles);

// POST a new sensory profile section
router.post("/sensory-profile", createSensoryProfile);

// --- NEW ROUTE TO FIX THE 'EDIT FROM VIEW PAGE' ERROR ---
// This must come BEFORE the '/:id' route to avoid conflicts
// GET all sections for a specific assessment group (e.g., /api/assessments/sensory-profile/assessment/some-group-id)
router.get(
  "/sensory-profile/assessment/:assessmentId",
  getSectionsByAssessmentId
);

// DELETE a specific sensory profile section by its document ID
router.delete("/sensory-profile/:id", deleteSensoryProfileById);

// GET a specific sensory profile section by its document ID
router.get("/sensory-profile/:id", getSensoryProfileById);

// PUT (update) a specific sensory profile section by its document ID
router.put("/sensory-profile/:id", updateSensoryProfileById);

module.exports = router;
