import User from './user.model.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { generateToken } from '../../utils/generateToken.js';

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new ApiError(400, 'username, email and password are required');
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) throw new ApiError(409, 'User with this email or username already exists');

  const user = await User.create({ username, email, password });
  const token = generateToken({ id: user._id });

  res.status(201).json(new ApiResponse(201, { user: user.toSafeObject(), token }, 'Registered successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) {
    throw new ApiError(400, 'emailOrUsername and password are required');
  }

  const user = await User.findOne({
    $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername.toLowerCase() }],
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }
  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated');

  const token = generateToken({ id: user._id });
  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject(), token }, 'Logged in successfully'));
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, 'Current user fetched'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { username, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (username) user.username = username;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  res.status(200).json(new ApiResponse(200, user.toSafeObject(), 'Profile updated'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) throw new ApiError(400, "Search query 'q' is required");

  const users = await User.find({
    $or: [{ username: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }],
  })
    .select('username email avatar')
    .limit(10);

  res.status(200).json(new ApiResponse(200, users, 'Users fetched'));
});