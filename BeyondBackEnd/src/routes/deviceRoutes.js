const express = require("express");
const {
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDeviceById,
  deleteDeviceById,
} = require("../controllers/deviceController");
const router = express.Router();

// CREATE
// Route to create a new device
router.post("/create", createDevice);

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
