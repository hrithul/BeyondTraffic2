const express = require("express");
const {
  createStore,
  getAllStore,
  getStoreById,
  updateStoreById,
  deleteStoreById,
} = require("../controllers/storeController");
const router = express.Router();

// CREATE
// Route to create a new store
router.post("/create", createStore);

// READ
// Route to get all stores with optional filtering
router.get("/", getAllStore);
// Route to get a store by ID
router.get("/:id", getStoreById);

// UPDATE
// Route to update a store by ID
router.put("/:id", updateStoreById);

// DELETE
// Route to delete a store by ID
router.delete("/:id", deleteStoreById);

module.exports = router;
