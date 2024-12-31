const express = require("express");
const {
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDeviceById,
  deleteDeviceById,
} = require("../controllers/deviceController");
const validateToken = require('./validateToken');
const router = express.Router();

// CREATE
// Route to create a new device
router.post("/create", validateToken, createDevice);

// READ
// Route to get all devices with optional store_code filter
router.get("/", validateToken, getAllDevices);
// Route to get a device by ID
router.get("/:id", validateToken, getDeviceById);

// UPDATE
// Route to update a device by ID
router.put("/:id", validateToken, updateDeviceById);

// DELETE
// Route to delete a device by ID
router.delete("/:id", validateToken, deleteDeviceById);

module.exports = router;
