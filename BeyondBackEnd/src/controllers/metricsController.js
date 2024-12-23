const Metrics = require("../models/Metrics");

// Get all metrics
const getAllMetrics = async (req, res) => {
  try {
    const { device_id, start_date, end_date } = req.query;
    let query = {};

    if (device_id) query.device_id = device_id;
    if (start_date && end_date) {
      query.timestamp = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    }

    const metrics = await Metrics.find(query);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get metrics by ID
const getMetricsById = async (req, res) => {
  try {
    const metrics = await Metrics.findById(req.params.id);
    if (!metrics) {
      return res.status(404).json({ message: 'Metrics not found' });
    }
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMetrics,
  getMetricsById
};
