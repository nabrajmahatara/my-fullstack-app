import Board from './board.model.js';
import Workspace from '../workspace/workspace.model.js';
import List from '../list/list.model.js';
import Task from '../task/task.model.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { requireMember } from '../../utils/permissions.js';
import { getIO } from '../../config/socket.js';

export async function loadWorkspaceAndCheckAccess(workspaceId, userId) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new ApiError(404, 'Workspace not found');
  requireMember(workspace, userId);
  return workspace;
}

export const createBoard = asyncHandler(async (req, res) => {
  const { workspaceId, name, description, background } = req.body;
  if (!workspaceId || !name) throw new ApiError(400, 'workspaceId and name are required');

  await loadWorkspaceAndCheckAccess(workspaceId, req.user._id);

  const board = await Board.create({
    workspace: workspaceId, name, description, background, createdBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, board, 'Board created'));
});

export const getBoardsByWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) throw new ApiError(400, 'workspaceId query param is required');

  await loadWorkspaceAndCheckAccess(workspaceId, req.user._id);

  const boards = await Board.find({ workspace: workspaceId, isArchived: false }).sort('-createdAt');
  res.status(200).json(new ApiResponse(200, boards, 'Boards fetched'));
});

export const getBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id).populate('createdBy', 'username avatar');
  if (!board) throw new ApiError(404, 'Board not found');

  await loadWorkspaceAndCheckAccess(board.workspace, req.user._id);
  res.status(200).json(new ApiResponse(200, board, 'Board fetched'));
});

export const updateBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) throw new ApiError(404, 'Board not found');
  await loadWorkspaceAndCheckAccess(board.workspace, req.user._id);

  const { name, description, background } = req.body;
  if (name) board.name = name;
  if (description !== undefined) board.description = description;
  if (background) board.background = background;

  await board.save();
  getIO().to(`board:${board._id}`).emit('board:updated', board);
  res.status(200).json(new ApiResponse(200, board, 'Board updated'));
});

export const archiveBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) throw new ApiError(404, 'Board not found');
  await loadWorkspaceAndCheckAccess(board.workspace, req.user._id);

  board.isArchived = !board.isArchived;
  await board.save();

  res.status(200).json(new ApiResponse(200, board, `Board ${board.isArchived ? 'archived' : 'unarchived'}`));
});

export const deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) throw new ApiError(404, 'Board not found');
  await loadWorkspaceAndCheckAccess(board.workspace, req.user._id);

  const lists = await List.find({ board: board._id }).select('_id');
  const listIds = lists.map((l) => l._id);

  await Task.deleteMany({ list: { $in: listIds } });
  await List.deleteMany({ board: board._id });
  await board.deleteOne();

  getIO().to(`board:${board._id}`).emit('board:deleted', { boardId: board._id });
  res.status(200).json(new ApiResponse(200, null, 'Board deleted'));
});