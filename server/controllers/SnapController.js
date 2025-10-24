const SnapForm = require("../models/Snap");

const createForm = async (req, res) => {
  try {
    const { studentInfo, answers, totalScore } = req.body;

    if (!studentInfo) {
      return res.status(400).json({ message: "Student information is required." });
    }
    if (
      !studentInfo.id ||
      !studentInfo.name ||
      !studentInfo.age ||
      !studentInfo.class ||
      !studentInfo.address ||
      !studentInfo.gender ||
      !studentInfo.completedBy
    ) {
      return res.status(400).json({ message: "All student information fields (ID, Name, Age, Class, Address, Gender, Completed By) are required." });
    }
    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ message: "Answers to questions are required." });
    }
    if (totalScore === undefined || totalScore === null) {
      return res.status(400).json({ message: "Total score is required." });
    }

    if (!['Male', 'Female', 'Other'].includes(studentInfo.gender)) {
        return res.status(400).json({ message: "Invalid gender provided." });
    }

    const newForm = new SnapForm({
      studentInfo: { 
        id: studentInfo.id,
        name: studentInfo.name,
        age: studentInfo.age,
        class: studentInfo.class,
        address: studentInfo.address,
        gender: studentInfo.gender,
        completedBy: studentInfo.completedBy,
      },
      answers,
      totalScore,
    });

    const savedForm = await newForm.save(); 
    res.status(201).json({ message: "Form created successfully!", data: savedForm });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: `A form with Student ID '${error.keyValue["studentInfo.id"]}' already exists.`, details: error.message });
    }
    if (error.name === 'ValidationError') {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ message: "Validation Error", errors });
    }
    console.error("Error creating form:", error);
    res.status(500).json({ message: "Server error creating form.", details: error.message });
  }
};

const getForms = async (req, res) => {
  try {
    const forms = await SnapForm.find({}); 
    res.status(200).json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Server error fetching forms.", details: error.message });
  }
};

const getFormById = async (req, res) => {
  try {
    const form = await SnapForm.findById(req.params.id); 
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.status(200).json(form);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid form ID format." });
    }
    console.error("Error fetching form by ID:", error);
    res.status(500).json({ message: "Server error fetching form.", details: error.message });
  }
};

const updateForm = async (req, res) => {
  try {
    const { studentInfo, answers, totalScore } = req.body;

    if (!studentInfo || !studentInfo.id || !studentInfo.name || !studentInfo.age || !studentInfo.class || !studentInfo.address || !studentInfo.gender || !studentInfo.completedBy || !answers || totalScore === undefined || totalScore === null) {
      return res.status(400).json({ message: "All required fields must be provided for update." });
    }

    if (!['Male', 'Female', 'Other'].includes(studentInfo.gender)) {
        return res.status(400).json({ message: "Invalid gender provided." });
    }

    const updatedForm = await SnapForm.findByIdAndUpdate(
      req.params.id, 
      {
        studentInfo: { 
          id: studentInfo.id,
          name: studentInfo.name,
          age: studentInfo.age,
          class: studentInfo.class,
          address: studentInfo.address,
          gender: studentInfo.gender,
          completedBy: studentInfo.completedBy,
        },
        answers,
        totalScore,
      },
      { new: true, runValidators: true } 
    );

    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.status(200).json({ message: "Form updated successfully!", data: updatedForm });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: `A form with Student ID '${error.keyValue["studentInfo.id"]}' already exists.`, details: error.message });
    }
    if (error.name === 'ValidationError') {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ message: "Validation Error", errors });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid form ID format." });
    }
    console.error("Error updating form:", error);
    res.status(500).json({ message: "Server error updating form.", details: error.message });
  }
};


const deleteForm = async (req, res) => {
  try {
    const deletedForm = await SnapForm.findByIdAndDelete(req.params.id);
    if (!deletedForm) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.status(200).json({ message: "Form deleted successfully!", data: deletedForm });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid form ID format." });
    }
    console.error("Error deleting form:", error);
    res.status(500).json({ message: "Server error deleting form.", details: error.message });
  }
};

const getStudentInfoByStudentId = async (req, res) => {
  try {
    const form = await SnapForm.findOne({ 'studentInfo.id': req.params.studentId }).select('studentInfo -_id'); 
    if (!form) {
      return res.status(404).json({ message: 'Student information not found for this ID.' });
    }
    res.status(200).json(form.studentInfo); 
  } catch (error) {
    console.error("Error fetching student info:", error);
    res.status(500).json({ message: "Server error fetching student information.", details: error.message });
  }
};


module.exports = {
  createForm,
  getForms,
  getFormById,
  updateForm, 
  deleteForm,
  getStudentInfoByStudentId 
};