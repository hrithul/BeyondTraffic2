const Region = require('../models/Region');
const jwt = require('jsonwebtoken');

const validateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token.' });
  }
};

// Create a new region
exports.createRegion = async (req, res) => {
  try {
    const region = new Region(req.body);
    await region.save();
    res.status(201).json({ success: true, data: region });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get a region by ID
exports.getRegionById = async (req, res) => {
  try {
    const region = await Region.findById(req.params.id);
    if (!region) {
      return res.status(404).json({ success: false, message: 'Region not found' });
    }
    res.status(200).json({ success: true, data: region });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all regions
exports.getAllRegions = async (req, res) => {
  try {
    const regions = await Region.find();
    res.status(200).json({ success: true, data: regions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a region by ID
exports.updateRegionById = async (req, res) => {
  try {
    const region = await Region.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!region) {
      return res.status(404).json({ success: false, message: 'Region not found' });
    }
    res.status(200).json({ success: true, data: region });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a region by ID
exports.deleteRegionById = async (req, res) => {
  try {
    const region = await Region.findByIdAndDelete(req.params.id);
    if (!region) {
      return res.status(404).json({ success: false, message: 'Region not found' });
    }
    res.status(200).json({ success: true, message: 'Region deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
