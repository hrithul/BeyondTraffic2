const Device = require("../models/device");

// Create a new store
exports.createDevice = async (req, res) => {
  try {
    const device = new Device(req.body);
    const deviceData = await device.save();
    res.status(201).json({ success: true, data: deviceData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all devices
exports.getAllDevices = async (req, res) => {
  try {
    const { store_code } = req.query;

    // Trim and normalize store_code if provided
    const query = store_code ? { store_code: store_code.trim() } : {};
    const devices = await Device.find(query);

    res.status(200).json({ success: true, data: devices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a specific device by ID
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }
    res.status(200).json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a specific device by ID
exports.updateDeviceById = async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }
    res.status(200).json({ success: true, data: device });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a specific device by ID
exports.deleteDeviceById = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Device deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
