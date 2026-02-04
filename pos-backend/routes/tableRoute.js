const express = require("express");
const {
  addTable,
  getTables,
  updateTable,
  updateTableStatus,
  releaseTable,
  deleteTable,
  getAvailableTables,
} = require("../controllers/tableController");
const router = express.Router();
const { isVerifiedUser } = require("../middlewares/tokenVerification");
// Get all tables
router.get("/", isVerifiedUser, getTables);
// Get available tables
router.get("/available", isVerifiedUser, getAvailableTables);
// Add new table
router.post("/", isVerifiedUser, addTable);
// Update table status (quick)
router.put("/status", isVerifiedUser, updateTableStatus);
// Update table by ID
router.put("/:id", isVerifiedUser, updateTable);
// Release table
router.put("/:id/release", isVerifiedUser, releaseTable);
// Delete table
router.delete("/:id", isVerifiedUser, deleteTable);
module.exports = router;
