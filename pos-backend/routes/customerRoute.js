const express = require("express");
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  hardDeleteCustomer,
  searchCustomers,
  updateCustomerStats,
  syncAllCustomerStats,
} = require("../controllers/customerController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
// Search customers (must be before :id route)
router.get("/search", isVerifiedUser, searchCustomers);
// Sync all customer stats from orders
router.post("/sync-stats", isVerifiedUser, syncAllCustomerStats);
// Update customer stats (when order is placed)
router.post("/update-stats", isVerifiedUser, updateCustomerStats);
// CRUD routes
router.get("/", isVerifiedUser, getCustomers);
router.get("/:id", isVerifiedUser, getCustomerById);
router.post("/", isVerifiedUser, addCustomer);
router.put("/:id", isVerifiedUser, updateCustomer);
router.delete("/:id", isVerifiedUser, deleteCustomer);
router.delete("/hard/:id", isVerifiedUser, hardDeleteCustomer);
module.exports = router;
