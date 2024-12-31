const express = require('express');
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport
} = require('../controllers/reportController');
const validateToken = require('./validateToken');
const router = express.Router();

// Create a new report
router.post('/', validateToken, createReport);

// Get all reports
router.get('/', validateToken, getReports);

// Get a single report by ID
router.get('/:id', validateToken, getReportById);

// Update a report
router.put('/:id', validateToken, updateReport);

// Delete a report
router.delete('/:id', validateToken, deleteReport);

module.exports = router;
