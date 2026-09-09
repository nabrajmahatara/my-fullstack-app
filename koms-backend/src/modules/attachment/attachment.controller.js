import fs from 'fs';
import path from 'path';
import Attachment from './attachment.model.js';
import Task from '../task/task.model.js';
import { loadBoardAndCheckAccess } from '../task/task.controller.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { getIO } from '../../config/socket.js';

export const uploadAttachment = asyncHandler(async (req, res) => {
  const { taskId } = req.body;
  if (!taskId) throw new ApiError(400, 'taskId is required');
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');
  await loadBoardAndCheckAccess(task.board, req.user._id);

  const attachment = await Attachment.create({
    task: taskId,
    uploadedBy: req.user._id,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
  });

  task.attachments.push(attachment._id);
  await task.save();

  getIO().to(`board:${task.board}`).emit('attachment:created', attachment);
  res.status(201).json(new ApiResponse(201, attachment, 'File uploaded'));
});

export const getAttachmentsByTask = asyncHandler(async (req, res) => {
  const { taskId } = req.query;
  if (!taskId) throw new ApiError(400, 'taskId query param is required');

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');
  await loadBoardAndCheckAccess(task.board, req.user._id);

  const attachments = await Attachment.find({ task: taskId }).populate('uploadedBy', 'username avatar');
  res.status(200).json(new ApiResponse(200, attachments, 'Attachments fetched'));
});

export const deleteAttachment = asyncHandler(async (req, res) => {
  const attachment = await Attachment.findById(req.params.id);
  if (!attachment) throw new ApiError(404, 'Attachment not found');

  const task = await Task.findById(attachment.task);
  await loadBoardAndCheckAccess(task.board, req.user._id);

  const filePath = path.resolve('uploads', attachment.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  task.attachments = task.attachments.filter((a) => a.toString() !== attachment._id.toString());
  await task.save();
  await attachment.deleteOne();

  getIO().to(`board:${task.board}`).emit('attachment:deleted', { attachmentId: attachment._id });
  res.status(200).json(new ApiResponse(200, null, 'Attachment deleted'));
});