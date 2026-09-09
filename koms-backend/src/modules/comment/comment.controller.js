import Comment from './comment.model.js';
import Task from '../task/task.model.js';
import { loadBoardAndCheckAccess } from '../task/task.controller.js';
import { createNotification } from '../notification/notification.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { getIO } from '../../config/socket.js';

export const createComment = asyncHandler(async (req, res) => {
  const { taskId, text } = req.body;
  if (!taskId || !text) throw new ApiError(400, 'taskId and text are required');

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');
  await loadBoardAndCheckAccess(task.board, req.user._id);

  const comment = await Comment.create({ task: taskId, user: req.user._id, text });
  const populated = await comment.populate('user', 'username avatar');

  getIO().to(`board:${task.board}`).emit('comment:created', populated);

  const recipients = new Set(task.assignees.map((a) => a.toString()));
  recipients.delete(req.user._id.toString());
  for (const userId of recipients) {
    await createNotification({
      recipient: userId,
      type: 'COMMENT_ADDED',
      message: `${req.user.username} commented on "${task.title}"`,
      relatedTask: task._id,
      relatedBoard: task.board,
    });
  }

  res.status(201).json(new ApiResponse(201, populated, 'Comment added'));
});

export const getCommentsByTask = asyncHandler(async (req, res) => {
  const { taskId } = req.query;
  if (!taskId) throw new ApiError(400, 'taskId query param is required');

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');
  await loadBoardAndCheckAccess(task.board, req.user._id);

  const comments = await Comment.find({ task: taskId }).populate('user', 'username avatar').sort('createdAt');
  res.status(200).json(new ApiResponse(200, comments, 'Comments fetched'));
});

export const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found');
  if (comment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own comments');
  }

  comment.text = req.body.text ?? comment.text;
  await comment.save();

  res.status(200).json(new ApiResponse(200, comment, 'Comment updated'));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found');

  const task = await Task.findById(comment.task);
  const isAuthor = comment.user.toString() === req.user._id.toString();
  if (!isAuthor) await loadBoardAndCheckAccess(task.board, req.user._id);

  await comment.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Comment deleted'));
});