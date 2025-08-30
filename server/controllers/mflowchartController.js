const MFlowchart = require('../models/MFlowchart');

// @desc Submit Mathavam Flowchart
const submitMFlowchart = async (req, res) => {
  try {
    const { name, childNo, age, gender, date, ...rest } = req.body;

    // Extract section data into schema format
    const sections = Object.entries(rest).map(([key, value]) => ({
      name: key,
      dates: value,
    }));

    const form = new MFlowchart({
      name,
      childNo,
      age,
      gender,
      date,
      sections,
    });

    const saved = await form.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Submission failed", error: err.message });
  }
};

// @desc Get all entries
const getMFlowchart = async (req, res) => {
  try {
    const forms = await MFlowchart.find();
    res.json(forms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching entries", error: err.message });
  }
};

// @desc Get by ID
const getMFlowchartById = async (req, res) => {
  try {
    const form = await MFlowchart.findById(req.params.id);
    if (!form) return res.status(404).json({ message: "Form not found" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: "Error fetching form", error: err.message });
  }
};

// @desc Delete an entry by ID
const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEntry = await MFlowchart.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { childNo, name, age, gender, date, sections } = req.body;

    const entry = await MFlowchart.findById(id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    sections.forEach((incomingSection) => {
      const existingSection = entry.sections.find(
        (s) => s.name === incomingSection.name
      );

      if (existingSection) {
        // ✅ Update specific date by index
        if (
          existingSection.dates[incomingSection.index] !== undefined
        ) {
          existingSection.dates[incomingSection.index] = incomingSection.newDate;
        }
      }
    });

    entry.childNo = childNo;
    entry.name = name;
    entry.age = age;
    entry.gender = gender;
    entry.date = date;

    const updatedEntry = await entry.save();

    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error('Update failed:', error);
    res.status(500).json({ message: 'Server error while updating entry' });
  }
};


// @desc Get an entry by ID (duplicate handler, keeping for reference)
const getEntryById = async (req, res) => {
  try {
    console.log("Fetching entry with ID:", req.params.id);
    const entry = await MFlowchart.findById(req.params.id);
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

// Export all handlers in CommonJS
module.exports = {
  submitMFlowchart,
  getMFlowchart,
  getMFlowchartById,
  deleteEntry,
  updateEntry,
  getEntryById,
};
