const express = require('express');
const {
  submitMFlowchart,
  getMFlowchart,
  getMFlowchartById,
  deleteEntry,
  updateEntry,
} = require('../controllers/mflowchartController');

const router = express.Router();

router.post('/submit', submitMFlowchart);
router.get('/', getMFlowchart);
router.get('/:id', getMFlowchartById);
router.delete('/:id', deleteEntry);
router.put('/entries/:id', updateEntry);

module.exports = router;
