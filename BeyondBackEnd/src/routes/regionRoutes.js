const express = require('express');
const {
  createRegion,
  getRegionById,
  getAllRegions,
  updateRegionById,
  deleteRegionById,
} = require('../controllers/regionController');
const router = express.Router();

// Route to create a new region
router.post('/create', createRegion);

// Route to get a region by ID
router.get('/:id', getRegionById);

// Route to get all regions
router.get('/', getAllRegions);

// Route to update a region by ID
router.put('/:id', updateRegionById);

// Route to delete a region by ID
router.delete('/:id', deleteRegionById);

module.exports = router;
