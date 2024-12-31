const express = require("express");
const {
  createStore,
  getAllStore,
  getStoreById,
  updateStoreById,
  deleteStoreById,
} = require("../controllers/storeController");
const validateToken = require('./validateToken');
const router = express.Router();

// CREATE
// Route to create a new store
router.post("/create", validateToken, createStore);

// READ
// Route to get all stores with optional filtering
router.get("/", validateToken, getAllStore);
// Route to get a store by ID
router.get("/:id", validateToken, getStoreById);

// UPDATE
// Route to update a store by ID
router.put("/:id", validateToken, updateStoreById);

// DELETE
// Route to delete a store by ID
router.delete("/:id", validateToken, deleteStoreById);

module.exports = router;
