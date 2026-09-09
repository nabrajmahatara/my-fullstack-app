import List from './list.model.js';
import Task from '../task/task.model.js';
import Board from '../board/board.model.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { loadWorkspaceAndCheckAccess } from '../board/board.controller.js';
import { getIO } from '../../config/socket.js';

export async function loadBoardAndCheckAccess(boardId, userId) {
  const board = await Board.findById(boardId);
  if (!board) throw new ApiError(404, 'Board not found');
  await loadWorkspaceAndCheckAccess(board.workspace, userId);
  return board;
}

export const createList = asyncHandler(async (req, res) => {
  const { boardId, title } = req.body;
  if (!boardId || !title) throw new ApiError(400, 'boardId and title are required');

  await loadBoardAndCheckAccess(boardId, req.user._id);

  const lastList = await List.findOne({ board: boardId }).sort('-position');
  const position = lastList ? lastList.position + 1 : 0;

  const list = await List.create({ board: boardId, title, position });

  getIO().to(`board:${boardId}`).emit('list:created', list);
  res.status(201).json(new ApiResponse(201, list, 'List created'));
});

export const getListsByBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.query;
  if (!boardId) throw new ApiError(400, 'boardId query param is required');

  await loadBoardAndCheckAccess(boardId, req.user._id);

  const lists = await List.find({ board: boardId, isArchived: false }).sort('position');
  res.status(200).json(new ApiResponse(200, lists, 'Lists fetched'));
});

export const updateList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) throw new ApiError(404, 'List not found');
  await loadBoardAndCheckAccess(list.board, req.user._id);

  const { title } = req.body;
  if (title) list.title = title;
  await list.save();

  getIO().to(`board:${list.board}`).emit('list:updated', list);
  res.status(200).json(new ApiResponse(200, list, 'List updated'));
});

export const reorderLists = asyncHandler(async (req, res) => {
  const { boardId, order } = req.body; // order: [{ id, position }]
  if (!boardId || !Array.isArray(order)) throw new ApiError(400, 'boardId and order[] are required');

  await loadBoardAndCheckAccess(boardId, req.user._id);

  await Promise.all(order.map(({ id, position }) => List.findByIdAndUpdate(id, { position })));

  getIO().to(`board:${boardId}`).emit('list:reordered', order);
  res.status(200).json(new ApiResponse(200, order, 'Lists reordered'));
});

export const deleteList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) throw new ApiError(404, 'List not found');
  await loadBoardAndCheckAccess(list.board, req.user._id);

  await Task.deleteMany({ list: list._id });
  await list.deleteOne();

  getIO().to(`board:${list.board}`).emit('list:deleted', { listId: list._id });
  res.status(200).json(new ApiResponse(200, null, 'List deleted'));
});