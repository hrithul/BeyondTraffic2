const express = require('express');
const {
  createOrganization,
  getOrganizationById,
  updateOrganizationById,
  getAllOrganizations, // New controller for fetching all records
} = require('../controllers/organizationController');
const router = express.Router();

// Route to create an organization
router.post('/create', createOrganization);

// Route to update an organization by ID
router.put('/:id', updateOrganizationById);

// Route to get all organizations
router.get('/', getAllOrganizations);
  
module.exports = router;
