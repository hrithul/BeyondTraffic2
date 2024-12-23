const mongoose = require('mongoose');

// Define the Region schema
const regionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Export the Region model
module.exports = mongoose.model('Region', regionSchema);
