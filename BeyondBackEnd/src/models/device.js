const mongoose = require("mongoose");

// Define Organization Schema
const deviceSchema = new mongoose.Schema(
  {
    organization_id: { type: String },
    region_id: { type: String, required: true },
    store_code: { type: String, required: true },
    device_id: { type: String, required: true },
    device_name: { type: String, required: true },
    mac_address: { type: String, required: true },
    ip_address: { type: String, required: true },
    serial_number: { type: String, required: true },
    active: { type: String},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Device", deviceSchema);
