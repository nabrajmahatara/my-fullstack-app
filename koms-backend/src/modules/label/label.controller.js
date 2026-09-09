import Label from './label.model.js';
import { loadBoardAndCheckAccess } from '../list/list.controller.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const createLabel = asyncHandler(async (req, res) => {
  const { boardId, name, color } = req.body;
  if (!boardId || !name) throw new ApiError(400, 'boardId and name are required');

  await loadBoardAndCheckAccess(boardId, req.user._id);

  const label = await Label.create({ board: boardId, name, color });
  res.status(201).json(new ApiResponse(201, label, 'Label created'));
});

export const getLabelsByBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.query;
  if (!boardId) throw new ApiError(400, 'boardId query param is required');

  await loadBoardAndCheckAccess(boardId, req.user._id);

  const labels = await Label.find({ board: boardId }).sort('createdAt');
  res.status(200).json(new ApiResponse(200, labels, 'Labels fetched'));
});

export const updateLabel = asyncHandler(async (req, res) => {
  const label = await Label.findById(req.params.id);
  if (!label) throw new ApiError(404, 'Label not found');
  await loadBoardAndCheckAccess(label.board, req.user._id);

  const { name, color } = req.body;
  if (name) label.name = name;
  if (color) label.color = color;
  await label.save();

  res.status(200).json(new ApiResponse(200, label, 'Label updated'));
});

export const deleteLabel = asyncHandler(async (req, res) => {
  const label = await Label.findById(req.params.id);
  if (!label) throw new ApiError(404, 'Label not found');
  await loadBoardAndCheckAccess(label.board, req.user._id);

  await label.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Label deleted'));
});