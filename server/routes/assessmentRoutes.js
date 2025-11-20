const express = require("express");
const router = express.Router();

const SensoryProfile = require("../models/SensoryProfile");

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware');

const ROLES_VIEW_STAFF = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Therapists', 'Resource Person'];
const ROLES_CRUD_THERAPIST = ['Therapist', 'Therapists', 'Resource Person'];


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

router.post(
    "/sensory-profile", 
    authMiddleware,
    checkRole(ROLES_CRUD_THERAPIST),
    async (req, res) => {
  try {
    const newAssessment = new SensoryProfile(req.body);
    await newAssessment.save();
    res.status(201).json(newAssessment);
  } catch (error) {
    console.error("Error creating sensory profile:", error);
    res.status(400).json({ message: "Error creating assessment", error: error.message });
  }
});

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
    res.status(400).json({ message: "Error updating assessment", error: error.message });
  }
});

router.delete(
    "/sensory-profile/:id", 
    authMiddleware,
    checkRole(ROLES_CRUD_THERAPIST),
    async (req, res) => {
  try {
    const deletedAssessment = await SensoryProfile.findByIdAndDelete(req.params.id);

    if (!deletedAssessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json({ message: "Assessment successfully deleted." });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({ message: "Error deleting assessment." });
  }
});

module.exports = router;
