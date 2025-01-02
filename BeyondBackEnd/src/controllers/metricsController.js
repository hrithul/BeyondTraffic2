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

const getLatestMetrics = async (deviceIds) => {
  try {
    const metricsPromises = deviceIds.map(async (deviceId) => {
      console.log(deviceId);
      const latestMetric = await Metrics.findOne(
        { "Metrics.@DeviceId": deviceId },
        {
          "Metrics.ReportData.Report.@Date": 1,
          "Metrics.ReportData.Report.Object.Count.@EndTime": 1,
          "Metrics.region_id": 1,
          "Metrics.store_code": 1,
        }
      ).sort({ createdAt: -1 }); // Assuming newer entries have later timestamps

      if (latestMetric) {
        const report = latestMetric.Metrics.ReportData.Report;
        const Met = latestMetric.Metrics;
        return {
          deviceId,
          last_sync_date: report["@Date"],
          region: Met["region_id"],
          store_code: Met["store_code"],
          last_sync_time: report.Object?.[0]?.Count?.[0]?.["@EndTime"] || null,
        };
      }

      return {
        deviceId,
        region: null,
        store_code: null,
        last_sync_date: null,
        last_sync_time: null,
      };
    });

    // Wait for all promises to resolve
    return await Promise.all(metricsPromises);
  } catch (error) {
    console.error("Error fetching metrics:", error.message);
    throw new Error("Failed to fetch metrics");
  }
};

module.exports = {
  getAllMetrics,
  getMetricsById,
  getLatestMetrics
};
