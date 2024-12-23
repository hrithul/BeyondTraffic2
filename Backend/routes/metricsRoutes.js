const express = require("express");
const {
  getAllMetrics,
  getMetricsById,
} = require("../controllers/metricsController");
const router = express.Router();


router.get("/", getAllMetrics);

router.get("/:id", getMetricsById);
