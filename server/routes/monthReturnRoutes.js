// routes/monthReturnRoutes.js
const express = require('express');
const {
  createMonthlyReturn,
  getMonthlyReturns,
  getMonthlyReturnById,
  updateMonthlyReturn,
  deleteMonthlyReturn,
} = require('../controllers/monthreturnController');

const router = express.Router();

// POST: Create monthly return
router.post('/submit', createMonthlyReturn);

// GET: All monthly returns
router.get('/', getMonthlyReturns);

// GET: Monthly return by ID
router.get('/:id', getMonthlyReturnById);

// PUT: Update monthly return
router.put('/:id', updateMonthlyReturn);

// DELETE: Delete monthly return
router.delete('/:id', deleteMonthlyReturn);

module.exports = router;
