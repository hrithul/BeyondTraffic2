const Organization = require('../models/organization');

// Create a new organization
exports.createOrganization = async (req, res) => {
    try {

        const { company, phone, email, firstName, lastName, address, city, postalCode, country } = req.body;
        
        const newOrg = new Organization({
            company,
            phone,
            email,
            firstName,
            lastName,
            address,
            city,
            postalCode,
            country
        });

        const savedOrg = await newOrg.save();
        res.status(201).json({ message: "Organization created successfully", data: savedOrg });
    } catch (error) {
        res.status(500).json({ message: "Error creating organization", error: error.message });
    }
};

// Fetch all organizations
exports.getAllOrganizations = async (req, res) => {
    try {
      const organizations = await Organization.find();
      res.status(200).json({ success: true, data: organizations });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };


// Update an organization by ID
exports.updateOrganizationById = async (req, res) => {
    try {
      const organization = await Organization.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!organization) {
        return res.status(404).json({ success: false, message: 'Organization not found' });
      }
      res.status(200).json({ success: true, data: organization });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };