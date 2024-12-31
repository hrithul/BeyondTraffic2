const express = require('express');
const {
  createOrganization,
  getOrganizationById,
  updateOrganizationById,
  getAllOrganizations, 
} = require('../controllers/organizationController');
const validateToken = require('./validateToken');
const router = express.Router();

// Route to create an organization
router.post('/create', validateToken, createOrganization);

// Route to update an organization by ID
router.put('/:id', validateToken, updateOrganizationById);

// Route to get all organizations
router.get('/', validateToken, getAllOrganizations);
  
module.exports = router;
