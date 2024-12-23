const express = require('express');
const router = express.Router();
const { getAllMetrics, getMetricsById } = require('../controllers/metricsController');

router.get('/', getAllMetrics);
router.get('/:id', getMetricsById);

module.exports = router;