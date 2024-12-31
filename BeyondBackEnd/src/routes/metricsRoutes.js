const express = require('express');
const { getAllMetrics, getMetricsById } = require('../controllers/metricsController');
const validateToken = require('./validateToken');
const router = express.Router();

// Get all metrics with optional filters
router.get('/', validateToken, getAllMetrics);

// Get metrics by ID
router.get('/:id', validateToken, getMetricsById);

module.exports = router;