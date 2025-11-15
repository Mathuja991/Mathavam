const express = require("express");
const router = express.Router();

const SensoryProfile = require("../models/SensoryProfile");

// --- ALUTH IMPORTS ---
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware');

// --- Role Arrays ---
// Rule: View for Doctor, Therapist, Admin, Super Admin. Parent = Restrict
const ROLES_VIEW_STAFF = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person'];
// Rule: CRUD for "O,P" -> Therapists
const ROLES_CRUD_THERAPIST = ['Therapist', 'Resource Person'];


// GET all sensory profiles with optional patientId filter
router.get(
    "/sensory-profile", 
    authMiddleware,
    checkRole(ROLES_VIEW_STAFF),
    async (req, res) => {
  try {
    const filter = {};
    if (req.query.patientId) {
      filter.patientId = req.query.patientId;
    }

    const assessments = await SensoryProfile.find(filter).sort({
      testDate: -1,
    });
    res.status(200).json(assessments);
  } catch (error) {
    console.error("Error fetching sensory profiles:", error);
    res.status(500).json({ message: "Error fetching assessments" });
  }
});

// POST new sensory profile
router.post(
    "/sensory-profile", 
    authMiddleware,
    checkRole(ROLES_CRUD_THERAPIST),
    async (req, res) => {
  try {
    const newProfile = new SensoryProfile(req.body);
    const savedProfile = await newProfile.save();
    console.log("Document saved successfully:", savedProfile);
    res.status(201).json(savedProfile);
  } catch (error) {
    console.error("Error saving assessment:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A duplicate assessment for this patient, category, and test date already exists.",
      });
    }
    res.status(500).json({ message: "Error saving assessment" });
  }
});

// DELETE sensory profile by ID
router.delete(
    "/sensory-profile/:id", 
    authMiddleware,
    checkRole(ROLES_CRUD_THERAPIST),
    async (req, res) => {
  try {
    const assessment = await SensoryProfile.findByIdAndDelete(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(200).json({ message: "Assessment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({ message: "Error deleting assessment." });
  }
});

// GET sensory profile by ID
router.get(
    "/sensory-profile/:id", 
    authMiddleware,
    checkRole(ROLES_VIEW_STAFF),
    async (req, res) => {
  try {
    const assessment = await SensoryProfile.findById(req.params.id);
    console.log("DATA BEING SENT TO EDIT PAGE:", assessment);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(200).json(assessment);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ message: "Error fetching assessment" });
  }
});

// PUT update sensory profile by ID
router.put(
    "/sensory-profile/:id", 
    authMiddleware,
    checkRole(ROLES_CRUD_THERAPIST),
    async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedAssessment = await SensoryProfile.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedAssessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json(updatedAssessment);
  } catch (error) {
    console.error("Error updating assessment:", error);
    res.status(500).json({ message: "Error updating assessment" });
  }
});

module.exports = router;