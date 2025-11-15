const Child = require('../models/Child');

// @desc Get all children
const getAllChildren = async (req, res) => {
  try {
    const children = await Child.find();
    res.json(children);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch children', error: err.message });
  }
};

// @desc Get a child by childNo
const getChildByChildNo = async (req, res) => {
  try {
    const child = await Child.findOne({ childNo: req.params.childNo });
    if (!child) return res.status(404).json({ message: 'Child not found' });
    res.json(child);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch child', error: err.message });
  }
};

// @desc Create a new child
const createChild = async (req, res) => {
  console.log('Received POST /api/child with body:', req.body);
  try {
    const { childNo, name, age, gender, date } = req.body;

    if (!childNo) {
      return res.status(400).json({ message: 'childNo is required' });
    }

    const newChild = new Child({ childNo, name, age, gender, date });
    const savedChild = await newChild.save();
    res.status(201).json(savedChild);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create child', error: err.message });
  }
};

// @desc Update child by childNo
const updateChild = async (req, res) => {
  try {
    const updatedChild = await Child.findOneAndUpdate(
      { childNo: req.params.childNo },
      req.body,
      { new: true }
    );
    if (!updatedChild) return res.status(404).json({ message: 'Child not found' });
    res.json(updatedChild);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update child', error: err.message });
  }
};

// @desc Delete child by childNo
const deleteChild = async (req, res) => {
  try {
    const deletedChild = await Child.findOneAndDelete({ childNo: req.params.childNo });
    if (!deletedChild) return res.status(404).json({ message: 'Child not found' });
    res.json({ message: 'Child deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete child', error: err.message });
  }
};

module.exports = {
  getAllChildren,
  getChildByChildNo,
  createChild,
  updateChild,
  deleteChild,
};
