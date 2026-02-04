const express = require("express");
const {
  register,
  login,
  getUserData,
  logout,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const router = express.Router();
/* ================= AUTH ROUTES ================= */
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(isVerifiedUser, logout);
/* ================= CURRENT USER ================= */
router.route("/").get(isVerifiedUser, getUserData);
/* ================= STAFF MANAGEMENT ROUTES ================= */
router.route("/all").get(isVerifiedUser, getAllUsers);
router.route("/:id").get(isVerifiedUser, getUserById);
router.route("/:id").put(isVerifiedUser, updateUser);
router.route("/:id").delete(isVerifiedUser, deleteUser);
module.exports = router;
