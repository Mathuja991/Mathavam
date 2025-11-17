const DSMForm = require('../models/DSM5'); 

const getAllForms = async (req, res) => {
  try {
    const forms = await DSMForm.find().sort({ createdAt: -1 }); 
    res.json(forms);
  } catch (err) {
    console.error('Error fetching forms:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getFormById = async (req, res) => {
  try {
    const form = await DSMForm.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (err) {
    console.error('Error fetching form by ID:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

const createForm = async (req, res) => {
  const { patientInfo, answers, severityRatings } = req.body;

  if (!patientInfo || !answers || !severityRatings) {
    return res.status(400).json({ message: 'Please provide all required form data.' });
  }

  try {
    const newForm = new DSMForm({
      patientInfo,
      answers,
      severityRatings,
    });
    const form = await newForm.save();
    res.status(201).json({ message: 'Form submitted successfully!', formId: form._id, form });
  } catch (err) {
    console.error('Error creating form:', err.message);
    if (err.name === 'ValidationError') {
      let errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateForm = async (req, res) => {
  const { patientInfo, answers, severityRatings } = req.body;
  const { id } = req.params;

  try {
    let form = await DSMForm.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    form.patientInfo = patientInfo;
    form.answers = answers;
    form.severityRatings = severityRatings;

    await form.save(); 
    res.json({ message: 'Form updated successfully!', form });
  } catch (err) {
    console.error('Error updating form:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Form not found' });
    }
    if (err.name === 'ValidationError') {
      let errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteForm = async (req, res) => {
  const { id } = req.params;
  try {
    const form = await DSMForm.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    await DSMForm.deleteOne({ _id: id }); 

    res.json({ message: 'Form deleted successfully!' });
  } catch (err) {
    console.error('Error deleting form:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAllForms,
  getFormById,
  createForm,
  updateForm, 
  deleteForm
};