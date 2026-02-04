const express = require("express");
const router = express.Router();
const {
  createDish,
  getDishes,
  getDishById,
  getDishesByCategory,
  updateDish,
  deleteDish,
  toggleAvailability,
} = require("../controllers/dishController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
// Public routes
router.get("/", getDishes);
router.get("/:id", getDishById);
router.get("/category/:categoryId", getDishesByCategory);
// Protected routes (require authentication)
router.post("/", isVerifiedUser, createDish);
router.put("/:id", isVerifiedUser, updateDish);
router.delete("/:id", isVerifiedUser, deleteDish);
router.patch("/:id/toggle", isVerifiedUser, toggleAvailability);
module.exports = router;
