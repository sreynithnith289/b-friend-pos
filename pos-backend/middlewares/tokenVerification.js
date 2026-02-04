const createHttpError = require("http-errors");
const config = require("../config/config");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const isVerifiedUser = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      return next(createHttpError(401, "Please provide token!"));
    }
    let decoded;
    try {
      decoded = jwt.verify(accessToken, config.accessTokenSecret);
      console.log("Decoded token:", decoded); // Debug
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(createHttpError(401, "Token expired. Please login again."));
      }
      return next(createHttpError(401, "Invalid token!"));
    }
    // Support both {id: ...} or {_id: ...}
    const userId = decoded.id || decoded._id;
    const user = await User.findById(userId);
    if (!user) {
      return next(createHttpError(401, "User does not exist!"));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(createHttpError(401, "Authentication failed."));
  }
};
module.exports = { isVerifiedUser };
