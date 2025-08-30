// server/models/Child.js

const mongoose = require('mongoose');

const ChildSchema = new mongoose.Schema({
  childNo: { type: String, required: true, unique: true },
  name: String,
  age: String,
  gender: String,
  date: String,
});

// The third argument 'patientrecords' specifies the collection name in the database.
// This is crucial for Mongoose to find the correct data.
const Child = mongoose.model('Child', ChildSchema, 'patientrecords');

module.exports = Child;