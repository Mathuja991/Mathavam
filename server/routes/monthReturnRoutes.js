const express = require('express');
const {
  createMonthlyReturn,
  getMonthlyReturns,
  deleteMonthlyReturn,
} = require('../controllers/monthreturnController');

const router = express.Router();

router.post('/submit', createMonthlyReturn);
router.get('/', getMonthlyReturns);
router.delete('/:id', deleteMonthlyReturn);

module.exports = router;