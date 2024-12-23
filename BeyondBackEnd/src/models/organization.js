const mongoose = require('mongoose');

// Define Organization Schema
const organizationSchema = new mongoose.Schema({
    company: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
