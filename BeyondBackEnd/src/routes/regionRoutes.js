const express = require('express');
const {
  createRegion,
  getRegionById,
  getAllRegions,
  updateRegionById,
  deleteRegionById
} = require('../controllers/regionController');
const validateToken = require('./validateToken');
const router = express.Router();

// Create a new region
router.post('/create', validateToken, createRegion);

// Get a region by ID
router.get('/:id', validateToken, getRegionById);

// Get all regions
router.get('/', validateToken, getAllRegions);

// Update a region
router.put('/:id', validateToken, updateRegionById);

// Delete a region
router.delete('/:id', validateToken, deleteRegionById);

module.exports = router;
