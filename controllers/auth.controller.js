const User = require("../models/user.model.js");
const authService = require("../services/auth.service.js");
const setCookies = require("../utils/setCookies.js");
const catchAsync = require("../utils/catchAsync.js");
const crypto = require("crypto");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const generateTokens = require("../utils/generateTokens.js");

const refreshAccessToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    const { accessToken } = generateTokens(user._id);
    console.log("access token ", accessToken);
    
    res.json({ accessToken });
});

const signup = catchAsync(async (req, res) => {
  const { email, password, first_name, last_name, phone_number, role, profileImage } = req.body;

  const { user, accessToken, refreshToken } = await authService.createUser(
    email, 
    password, 
    first_name, 
    last_name, 
    phone_number, 
    role, 
    profileImage
  );
  
  setCookies(res, accessToken, refreshToken);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "User created successfully",
    user: {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
    },
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const { code } = req.body;

  const { user, accessToken, refreshToken } = await authService.verifyUserEmail(code);
  await authService.sendWelcomeEmail(user.email, user.first_name);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Email verified successfully",
    accessToken,  
    refreshToken,
    user: {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    },
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

  setCookies(res, accessToken, refreshToken);

  res.status(httpStatus.default.OK).json({
    success: true,
    message: "Logged in successfully",
    accessToken,  
    refreshToken,
    user: {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
    },
  });
});

const logout = catchAsync(async (req, res) => {
  await authService.logoutUser(req.cookies.refreshToken);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(httpStatus.default.OK).json({ success: true, message: "Logged out successfully" });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const resetToken = crypto.randomBytes(3).toString("hex").slice(0, 6);

  await authService.sendResetEmail(email, resetToken);
  res.status(httpStatus.default.OK).json({ success: true, message: "Password reset link sent to your email" });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await authService.resetUserPassword(token, password);
  await authService.sendResetSuccessEmail(user.email);
  res.status(httpStatus.default.OK).json({ success: true, message: "Password reset successful" });
});

const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.userId).select("-password -refreshToken");
  if (!user) {
    return res.status(httpStatus.default.BAD_REQUEST).json({ success: false, message: "User not found" });
  }

  res.status(httpStatus.default.OK).json({ success: true, user });
});

const deleteUser = catchAsync(async (req, res) => {
  const userId = req.user._id;

  await authService.deleteUser(userId);
  res.status(httpStatus.default.OK).json({ success: true, message: "User deleted" });
});

const updateUserProfile = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const updates = req.body;

  const user = await authService.updateUser(userId, updates);
  res.status(httpStatus.default.OK).json({ 
    success: true, 
    user: {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
    }
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const user = await authService.getUserById(req.user._id);
  res.status(httpStatus.default.OK).json({ 
    success: true, 
    user: {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const users = await authService.getAllUsers();
  res.status(httpStatus.default.OK).json({ success: true, users });
});

const checkAuth = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(httpStatus.default.BAD_REQUEST).json({ success: false, message: "User not found" });
  }

  res.status(httpStatus.default.OK).json({ 
    success: true, 
    user: {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
    }
  });
});

module.exports = {
  signup,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  deleteUser,
  updateUserProfile,
  getMyProfile,
  getAllUsers,
  checkAuth, 
  refreshAccessToken
};