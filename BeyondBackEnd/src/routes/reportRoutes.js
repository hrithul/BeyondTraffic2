const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Create a new report
router.post('/', reportController.createReport);

// Get all reports
router.get('/', reportController.getReports);

// Get a single report
router.get('/:id', reportController.getReportById);

// Update a report
router.put('/:id', reportController.updateReport);

// Delete a report
router.delete('/:id', reportController.deleteReport);

module.exports = router;
