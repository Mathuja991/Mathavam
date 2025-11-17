const SensoryProfile = require("../models/SensoryProfile");

const parseDateOnlyToUTC = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed
        .split("-")
        .map((part) => parseInt(part, 10));
      if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
        return null;
      }
      return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed
        .split("-")
        .map((part) => parseInt(part, 10));
      if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
        return null;
      }
      return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      12,
      0,
      0
    )
  );
};

// GET all sensory profiles, with an optional filter for patientId
const getAllSensoryProfiles = async (req, res) => {
  try {
    const filter = {};
    const { patientId, category, testDate, ageGroup } = req.query;

    if (patientId) {
      filter.patientId = patientId;
    }

    if (category) {
      filter.category = category;
    }

    if (ageGroup) {
      filter.ageGroup = ageGroup;
    }

    if (testDate) {
      const normalized = parseDateOnlyToUTC(testDate);
      if (normalized) {
        const nextDay = new Date(normalized.getTime() + 24 * 60 * 60 * 1000);
        filter.testDate = { $gte: normalized, $lt: nextDay };
      }
    }

    const assessments = await SensoryProfile.find(filter).sort({
      testDate: -1,
    });
    res.status(200).json(assessments);
  } catch (error) {
    console.error("Error fetching sensory profiles:", error);
    res.status(500).json({ message: "Error fetching assessments" });
  }
};

// POST a new sensory profile section
const createSensoryProfile = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.patientId || !payload.category || !payload.testDate) {
      return res
        .status(400)
        .json({ message: "patientId, category and testDate are required." });
    }

    const normalizedDate = parseDateOnlyToUTC(payload.testDate);

    if (!normalizedDate) {
      return res.status(400).json({ message: "Invalid test date provided." });
    }

    payload.testDate = normalizedDate;

    const filter = {
      patientId: payload.patientId,
      category: payload.category,
      testDate: normalizedDate,
    };

    const existing = await SensoryProfile.findOne(filter);
    if (existing) {
      const updated = await SensoryProfile.findByIdAndUpdate(
        existing._id,
        payload,
        { new: true, runValidators: true }
      );
      return res.status(200).json(updated);
    }

    const newProfile = new SensoryProfile(payload);
    const savedProfile = await newProfile.save();
    console.log("Document saved successfully:", savedProfile);
    return res.status(201).json(savedProfile);
  } catch (error) {
    console.error("Error saving assessment section:", error);
    return res
      .status(500)
      .json({ message: "An unexpected error occurred while saving." });
  }
};

// DELETE a sensory profile section by its document ID
const deleteSensoryProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAssessment = await SensoryProfile.findByIdAndDelete(id);
    if (!deletedAssessment) {
      return res.status(404).json({ message: "Assessment section not found." });
    }
    res
      .status(200)
      .json({ message: "Assessment section deleted successfully." });
  } catch (error) {
    console.error("Error deleting assessment section:", error);
    res.status(500).json({ message: "Error deleting assessment section." });
  }
};

// GET a single sensory profile section by its document ID
const getSensoryProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await SensoryProfile.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment section not found" });
    }
    res.status(200).json(assessment);
  } catch (error) {
    console.error("Error fetching assessment section:", error);
    res.status(500).json({ message: "Error fetching assessment section" });
  }
};

// PUT (update) a sensory profile section by its document ID
const updateSensoryProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = { ...req.body };

    if (updatedData.testDate) {
      const normalized = parseDateOnlyToUTC(updatedData.testDate);
      if (normalized) {
        updatedData.testDate = normalized;
      }
    }
    const updatedAssessment = await SensoryProfile.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedAssessment) {
      return res.status(404).json({ message: "Assessment section not found" });
    }
    res.status(200).json(updatedAssessment);
  } catch (error) {
    console.error("Error updating assessment section:", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "This update would create a duplicate record." });
    }
    res.status(500).json({ message: "Error updating assessment section" });
  }
};

// --- NEW CONTROLLER TO FIX THE 'EDIT FROM VIEW PAGE' ERROR ---
// GET all sections belonging to a single assessment group
const getSectionsByAssessmentId = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    // This requires that your SensoryProfile model has a field called `assessmentId`
    const sections = await SensoryProfile.find({ assessmentId: assessmentId });

    if (!sections) {
      // Return an empty array if nothing is found, which is not an error
      return res.status(200).json([]);
    }
    res.status(200).json(sections);
  } catch (error) {
    console.error("Error fetching sections by assessment ID:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching assessment sections." });
  }
};

// Export all the controller functions
module.exports = {
  getAllSensoryProfiles,
  createSensoryProfile,
  deleteSensoryProfileById,
  getSensoryProfileById,
  updateSensoryProfileById,
  getSectionsByAssessmentId, // Don't forget to export the new one
};
