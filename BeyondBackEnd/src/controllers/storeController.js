const Store = require("../models/store");
const Device = require("../models/device");

// Create a new store
exports.createStore = async (req, res) => {
  try {
    const store = new Store(req.body);
    const storeData = await store.save();
    res.status(201).json({ success: true, data: storeData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all stores with optional filtering
exports.getAllStore = async (req, res) => {
  try {
    const { organization_id, region_id } = req.query;
    let query = {};
    
    if (region_id) query.region_id = region_id;

    const stores = await Store.find(query);

    // Get device counts for each store
    const storesWithCounts = await Promise.all(
      stores.map(async (store) => {
        const deviceCount = await Device.countDocuments({
          store_code: store.store_code,
        });
        return {
          ...store.toObject(),
          device_count: deviceCount,
        };
      })
    );

    res.status(200).json({ success: true, data: storesWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a specific store by ID
exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }
    res.status(200).json({ success: true, data: store });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a specific store by ID
exports.updateStoreById = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }
    res.status(200).json({ success: true, data: store });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a specific store by ID
exports.deleteStoreById = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }
    res.status(200).json({ success: true, message: "Store deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
