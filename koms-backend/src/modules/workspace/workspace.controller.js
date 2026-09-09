import Workspace from './workspace.model.js';
import User from '../auth/user.model.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { requireMember, requireOwner, getMembership } from '../../utils/permissions.js';
import { ROLES } from '../../constants/roles.js';
import { getIO } from '../../config/socket.js';

export const createWorkspace = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) throw new ApiError(400, 'Workspace name is required');

  const workspace = await Workspace.create({
    name,
    description,
    owner: req.user._id,
    members: [{ user: req.user._id, role: ROLES.OWNER }],
  });

  res.status(201).json(new ApiResponse(201, workspace, 'Workspace created'));
});

export const getMyWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ 'members.user': req.user._id })
    .populate('owner', 'username email avatar')
    .sort('-createdAt');

  res.status(200).json(new ApiResponse(200, workspaces, 'Workspaces fetched'));
});

export const getWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id)
    .populate('owner', 'username email avatar')
    .populate('members.user', 'username email avatar');

  if (!workspace) throw new ApiError(404, 'Workspace not found');
  requireMember(workspace, req.user._id);

  res.status(200).json(new ApiResponse(200, workspace, 'Workspace fetched'));
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) throw new ApiError(404, 'Workspace not found');
  requireOwner(workspace, req.user._id);

  const { name, description } = req.body;
  if (name) workspace.name = name;
  if (description !== undefined) workspace.description = description;

  await workspace.save();
  res.status(200).json(new ApiResponse(200, workspace, 'Workspace updated'));
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) throw new ApiError(404, 'Workspace not found');
  requireOwner(workspace, req.user._id);

  await workspace.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Workspace deleted'));
});

export const addMember = asyncHandler(async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) throw new ApiError(400, 'User email or username is required');

  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) throw new ApiError(404, 'Workspace not found');
  requireOwner(workspace, req.user._id);

  const userToAdd = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
  });
  if (!userToAdd) throw new ApiError(404, 'User not found');
  if (getMembership(workspace, userToAdd._id)) {
    throw new ApiError(409, 'User is already a member of this workspace');
  }

  workspace.members.push({ user: userToAdd._id, role: ROLES.MEMBER });
  await workspace.save();

  getIO().to(`workspace:${workspace._id}`).emit('workspace:memberAdded', {
    workspaceId: workspace._id,
    user: { _id: userToAdd._id, username: userToAdd.username },
  });

  res.status(200).json(new ApiResponse(200, workspace, 'Member added'));
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) throw new ApiError(404, 'Workspace not found');
  requireOwner(workspace, req.user._id);

  const membership = workspace.members.id(req.params.memberId);
  if (!membership) throw new ApiError(404, 'Member not found');

  membership.role = role;
  await workspace.save();

  res.status(200).json(new ApiResponse(200, workspace, 'Member role updated'));
});

export const removeMember = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) throw new ApiError(404, 'Workspace not found');
  requireOwner(workspace, req.user._id);

  const membership = workspace.members.id(req.params.memberId);
  if (!membership) throw new ApiError(404, 'Member not found');
  if (membership.user.toString() === workspace.owner.toString()) {
    throw new ApiError(400, 'Cannot remove the workspace owner');
  }

  membership.deleteOne();
  await workspace.save();

  res.status(200).json(new ApiResponse(200, workspace, 'Member removed'));
});

export const leaveWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) throw new ApiError(404, 'Workspace not found');

  if (workspace.owner.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'Owner cannot leave. Transfer ownership or delete the workspace instead.');
  }

  const membership = getMembership(workspace, req.user._id);
  if (!membership) throw new ApiError(400, 'You are not a member of this workspace');

  membership.deleteOne();
  await workspace.save();

  res.status(200).json(new ApiResponse(200, null, 'You left the workspace'));
});