const MFlowchart = require('../models/MFlowchart');


const submitMFlowchart = async (req, res) => {
  try {
    const { name, childNo, age, gender, date, ...rest } = req.body;

    const sections = Object.entries(rest).map(([key, value]) => ({
      name: key,
      dates: Array.isArray(value) ? value : [value],
    }));

    const form = new MFlowchart({ name, childNo, age, gender, date, sections });
    const saved = await form.save();

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Submission failed", error: err.message });
  }
};


const getMFlowchart = async (req, res) => {
  try {
    const forms = await MFlowchart.find();
    res.json(forms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching entries", error: err.message });
  }
};


const getMFlowchartById = async (req, res) => {
  try {
    const form = await MFlowchart.findById(req.params.id);
    if (!form) return res.status(404).json({ message: "Form not found" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: "Error fetching form", error: err.message });
  }
};


const deleteEntry = async (req, res) => {
  try {
    const deleted = await MFlowchart.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Entry not found" });
    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting entry", error: err.message });
  }
};


const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionName, oldDate, newDate } = req.body;

    if (!sectionName || !oldDate || !newDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const entry = await MFlowchart.findById(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    const section = entry.sections.find(sec => sec.name === sectionName);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const dateIndex = section.dates.findIndex(d => d === oldDate);
    if (dateIndex === -1) {
      return res.status(404).json({ message: `Date '${oldDate}' not found in section '${sectionName}'` });
    }

    // Update the date safely
    section.dates[dateIndex] = newDate;

    await entry.save();

    res.status(200).json({ message: "Date updated successfully", entry });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ message: "Server error while updating entry", error: err.message });
  }
};

// Export all handlers
module.exports = {
  submitMFlowchart,
  getMFlowchart,
  getMFlowchartById,
  deleteEntry,
  updateEntry,
};
