const express = require("express");
const {
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDeviceById,
  deleteDeviceById,
  getLastSyncDateTime,
} = require("../controllers/deviceController");
const router = express.Router();

// CREATE
// Route to create a new device
router.post("/create", createDevice);

// Get last sync time for devices
router.get("/lastsync", getLastSyncDateTime);

// READ
// Route to get all devices with optional store_code filter
router.get("/", getAllDevices);

// Route to get a device by ID
router.get("/:id", getDeviceById);

// UPDATE
// Route to update a device by ID
router.put("/:id", updateDeviceById);

// DELETE
// Route to delete a device by ID
router.delete("/:id", deleteDeviceById);

module.exports = router;
