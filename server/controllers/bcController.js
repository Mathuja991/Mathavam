const BehaviorChecklist = require('../models/BehaviorChecklist');

// POST handler
const submitChecklist = async (req, res) => {
  try {
    console.log("Incoming Data:", req.body);

    const {
      childNo,
      name,
      age,
      gender,
      date,
      social,
      restrictive,
      mood,
      selfRegulation,
      challenging,
      selfInjury,
      scores,
      severity
    } = req.body;

    // Basic validation
    if (!childNo || !name || !social || !restrictive) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Save to DB
    const checklist = new BehaviorChecklist({
      childNo,
      name,
      age,
      gender,
      date,
      social,
      restrictive,
      mood,
      selfRegulation,
      challenging,
      selfInjury,
      scores,
      severity,
    });

    const saved = await checklist.save();

    res.status(200).json({ success: true, message: "Checklist saved.", data: saved });
  } catch (err) {
    console.error("Submit Error:", err.message, err);
    res.status(500).json({ error: "Failed to submit checklist." });
  }
};

// GET all entries
const getAllEntries = async (req, res) => {
  try {
    const entries = await BehaviorChecklist.find();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Fetching entries failed', error: err.message });
  }
};

// DELETE entry by ID
const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEntry = await BehaviorChecklist.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE entry by ID
const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await BehaviorChecklist.findByIdAndUpdate(id, req.body, {
      new: true, // return the updated document
      runValidators: true, // enforce schema validation
    });

    if (!updated) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update failed:', error);
    res.status(500).json({ message: 'Server error while updating entry' });
  }
};

// GET entry by ID
const getEntryById = async (req, res) => {
  try {
    console.log("Fetching entry with ID:", req.params.id);  // <-- debug log
    const entry = await BehaviorChecklist.findById(req.params.id);
    if (!entry) {
      console.log("Entry not found for ID:", req.params.id);
      return res.status(404).json({ message: "Entry not found" });
    }
    res.status(200).json(entry);
  } catch (err) {
    console.error("Error fetching entry by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Exporting all functions in CommonJS
module.exports = {
  submitChecklist,
  getAllEntries,
  deleteEntry,
  updateEntry,
  getEntryById,
};
