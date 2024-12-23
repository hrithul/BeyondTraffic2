const mongoose = require("mongoose");

// Define Organization Schema
const storeSchema = new mongoose.Schema(
  {
    organization_id: { type: String },
    region_id: { type: String, required: true },
    store_code: { type: String, required: true },
    store_name: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", storeSchema);
