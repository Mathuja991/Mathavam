// controllers/monthReturnController.js
const MonthlyReturn = require('../models/MonthlyReturn');

// Create new monthly return
exports.createMonthlyReturn = async (req, res) => {
  try {
    const monthlyReturn = new MonthlyReturn(req.body);
    await monthlyReturn.save();
    res.status(201).json({ success: true, data: monthlyReturn });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all monthly returns
exports.getMonthlyReturns = async (req, res) => {
  try {
    const returns = await MonthlyReturn.find();
    res.status(200).json({ success: true, data: returns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get monthly return by ID
exports.getMonthlyReturnById = async (req, res) => {
  try {
    const monthlyReturn = await MonthlyReturn.findById(req.params.id);
    if (!monthlyReturn) {
      return res.status(404).json({ success: false, message: 'Monthly Return not found' });
    }
    res.status(200).json({ success: true, data: monthlyReturn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update monthly return
exports.updateMonthlyReturn = async (req, res) => {
  try {
    const monthlyReturn = await MonthlyReturn.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!monthlyReturn) {
      return res.status(404).json({ success: false, message: 'Monthly Return not found' });
    }
    res.status(200).json({ success: true, data: monthlyReturn });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete monthly return (optional)
exports.deleteMonthlyReturn = async (req, res) => {
  try {
    const monthlyReturn = await MonthlyReturn.findByIdAndDelete(req.params.id);
    if (!monthlyReturn) {
      return res.status(404).json({ success: false, message: 'Monthly Return not found' });
    }
    res.status(200).json({ success: true, message: 'Monthly Return deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
