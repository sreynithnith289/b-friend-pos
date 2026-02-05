const createHttpError = require("http-errors");
const User = require("../models/userModel");
const LoginHistory = require("../models/loginHistoryModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Helper function to detect device type
const getDeviceType = (userAgent) => {
  if (!userAgent) return "Unknown";
  if (/mobile/i.test(userAgent)) return "Mobile";
  if (/tablet/i.test(userAgent)) return "Tablet";
  return "Desktop";
};
/* ================= REGISTER ================= */
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const user = new User({
      name,
      email,
      phone,
      password,
      role: role || "Waiter",
    });
    await user.save();
    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/* ================= LOGIN ================= */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(createHttpError(400, "All fields are required!"));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(401, "Invalid Credentials"));
    }
    if (user.isActive === false) {
      return next(createHttpError(401, "Your account has been deactivated"));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createHttpError(401, "Invalid Password Credentials"));
    }
    // ✅ Get login info
    const ipAddress =
      req.ip ||
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      "";
    const userAgent = req.headers["user-agent"] || "";
    const device = getDeviceType(userAgent);
    // ✅ Create login history record
    const loginRecord = await LoginHistory.create({
      user: user._id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      loginAt: new Date(),
      ipAddress: ipAddress,
      userAgent: userAgent,
      device: device,
      status: "Active",
    });
    // Create JWT token with loginRecord ID
    const accessToken = jwt.sign(
      { _id: user._id, loginId: loginRecord._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      path: "/",
    });
    // ✅ Return user data including phone
    res.status(200).json({
      success: true,
      message: "User login successfully!",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "", // ✅ Make sure phone is included
        role: user.role,
        loginAt: loginRecord.loginAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
/* ================= GET USER DATA (Current User) ================= */
const getUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
/* ================= LOGOUT ================= */
const logout = async (req, res, next) => {
  try {
    // ✅ Update login history record
    if (req.loginId) {
      await LoginHistory.findByIdAndUpdate(req.loginId, {
        logoutAt: new Date(),
        status: "Logged Out",
      });
    }
    const isProduction = process.env.NODE_ENV === "production";

res.clearCookie("accessToken", {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  path: "/",
});
    res
      .status(200)
      .json({ success: true, message: "User logout successfully!" });
  } catch (error) {
    next(error);
  }
};
/* ================= GET ALL USERS (Staff Management) ================= */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    next(createHttpError(500, "Failed to fetch users"));
  }
};
/* ================= GET USER BY ID ================= */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    next(createHttpError(500, "Failed to fetch user"));
  }
};
/* ================= UPDATE USER ================= */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, role, isActive } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password && password.trim() !== "") {
      user.password = password;
    }
    await user.save();
    const updatedUser = await User.findById(id).select("-password");
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    next(createHttpError(500, "Failed to update user"));
  }
};
/* ================= DELETE USER ================= */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    if (user.role === "Admin") {
      const adminCount = await User.countDocuments({ role: "Admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last admin user",
        });
      }
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    next(createHttpError(500, "Failed to delete user"));
  }
};
module.exports = {
  register,
  login,
  getUserData,
  logout,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
