const mongoose = require('mongoose');

const CarsformSchema = new mongoose.Schema({
  name: String,
  childNo: String,
  age: String,
  gender: String,
  date: String,
  scores: { type: Map, of: Number },
  severity: {
    label: String,
    color: String,
  }
}, { timestamps: true });

const Carsform = mongoose.model('Carsform', CarsformSchema);

module.exports = Carsform;
