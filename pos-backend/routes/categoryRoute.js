const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);
// Protected routes (require authentication)
router.post("/", isVerifiedUser, createCategory);
router.put("/:id", isVerifiedUser, updateCategory);
router.delete("/:id", isVerifiedUser, deleteCategory);
module.exports = router;
