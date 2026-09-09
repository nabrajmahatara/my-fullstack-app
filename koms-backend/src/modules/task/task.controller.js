import Task from './task.model.js';
import List from '../list/list.model.js';
import Board from '../board/board.model.js';
import Label from '../label/label.model.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { loadWorkspaceAndCheckAccess } from '../board/board.controller.js';
import { requireMember } from '../../utils/permissions.js';
import { getIO } from '../../config/socket.js';
import { createNotification } from '../notification/notification.service.js';

export async function loadBoardAndCheckAccess(boardId, userId) {
  const board = await Board.findById(boardId);
  if (!board) throw new ApiError(404, 'Board not found');
  const workspace = await loadWorkspaceAndCheckAccess(board.workspace, userId);
  return { board, workspace };
}

export const createTask = asyncHandler(async (req, res) => {
  const { listId, title, description, priority, dueDate, assignees, labels } = req.body;
  if (!listId || !title) throw new ApiError(400, 'listId and title are required');

  const list = await List.findById(listId);
  if (!list) throw new ApiError(404, 'List not found');

  const { board } = await loadBoardAndCheckAccess(list.board, req.user._id);

  const lastTask = await Task.findOne({ list: listId }).sort('-position');
  const position = lastTask ? lastTask.position + 1 : 0;

  const task = await Task.create({
    board: board._id, list: listId, title, description, priority, dueDate,
    assignees, labels, position, createdBy: req.user._id,
  });

  const populated = await task.populate(['assignees', 'labels']);
  getIO().to(`board:${board._id}`).emit('task:created', populated);

  if (assignees?.length) {
    for (const userId of assignees) {
      if (userId.toString() !== req.user._id.toString()) {
        await createNotification({
          recipient: userId,
          type: 'TASK_ASSIGNED',
          message: `${req.user.username} assigned you to "${task.title}"`,
          relatedTask: task._id,
          relatedBoard: board._id,
        });
      }
    }
  }

  res.status(201).json(new ApiResponse(201, populated, 'Task created'));
});

export const getTasksByBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.query;
  if (!boardId) throw new ApiError(400, 'boardId query param is required');

  await loadBoardAndCheckAccess(boardId, req.user._id);

  const tasks = await Task.find({ board: boardId, isArchived: false })
    .populate('assignees', 'username avatar')
    .populate('labels')
    .sort('position');

  res.status(200).json(new ApiResponse(200, tasks, 'Tasks fetched'));
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignees', 'username avatar email')
    .populate('labels')
    .populate('createdBy', 'username avatar')
    .populate('attachments');

  if (!task) throw new ApiError(404, 'Task not found');
  await loadBoardAndCheckAccess(task.board, req.user._id);

  res.status(200).json(new ApiResponse(200, task, 'Task fetched'));
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  await loadBoardAndCheckAccess(task.board, req.user._id);

  const { title, description, priority, dueDate } = req.body;
  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;

  await task.save();
  const populated = await task.populate(['assignees', 'labels']);

  getIO().to(`board:${task.board}`).emit('task:updated', populated);
  res.status(200).json(new ApiResponse(200, populated, 'Task updated'));
});

export const moveTask = asyncHandler(async (req, res) => {
  const { targetListId, position } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  await loadBoardAndCheckAccess(task.board, req.user._id);

  const targetList = await List.findById(targetListId);
  if (!targetList || targetList.board.toString() !== task.board.toString()) {
    throw new ApiError(400, 'Target list not found on this board');
  }

  const sourceListId = task.list.toString();
  const isSameList = sourceListId === targetListId.toString();

  const targetTasks = await Task.find({ list: targetListId, _id: { $ne: task._id } }).sort('position');
  const targetIds = targetTasks.map((t) => t._id.toString());
  const insertAt = Math.max(0, Math.min(position ?? targetIds.length, targetIds.length));
  targetIds.splice(insertAt, 0, task._id.toString());

  await Promise.all(targetIds.map((id, idx) => Task.findByIdAndUpdate(id, { position: idx, list: targetListId })));

  if (!isSameList) {
    const sourceTasks = await Task.find({ list: sourceListId }).sort('position');
    await Promise.all(sourceTasks.map((t, idx) => Task.findByIdAndUpdate(t._id, { position: idx })));
  }

  const updatedTask = await Task.findById(task._id).populate('assignees', 'username avatar').populate('labels');

  getIO().to(`board:${task.board}`).emit('task:moved', {
    taskId: task._id, sourceListId, targetListId, position: insertAt,
  });

  res.status(200).json(new ApiResponse(200, updatedTask, 'Task moved'));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  await loadBoardAndCheckAccess(task.board, req.user._id);

  await task.deleteOne();

  getIO().to(`board:${task.board}`).emit('task:deleted', { taskId: task._id, listId: task.list });
  res.status(200).json(new ApiResponse(200, null, 'Task deleted'));
});

export const addAssignee = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  const { workspace } = await loadBoardAndCheckAccess(task.board, req.user._id);

  requireMember(workspace, userId);

  if (task.assignees.some((a) => a.toString() === userId)) {
    throw new ApiError(409, 'User is already assigned to this task');
  }

  task.assignees.push(userId);
  await task.save();

  await createNotification({
    recipient: userId,
    type: 'TASK_ASSIGNED',
    message: `${req.user.username} assigned you to "${task.title}"`,
    relatedTask: task._id,
    relatedBoard: task.board,
  });

  const populated = await task.populate('assignees', 'username avatar');
  getIO().to(`board:${task.board}`).emit('task:updated', populated);
  res.status(200).json(new ApiResponse(200, populated, 'Assignee added'));
});

export const removeAssignee = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  await loadBoardAndCheckAccess(task.board, req.user._id);

  task.assignees = task.assignees.filter((a) => a.toString() !== req.params.userId);
  await task.save();

  const populated = await task.populate('assignees', 'username avatar');
  getIO().to(`board:${task.board}`).emit('task:updated', populated);
  res.status(200).json(new ApiResponse(200, populated, 'Assignee removed'));
});

export const addLabel = asyncHandler(async (req, res) => {
  const { labelId } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  await loadBoardAndCheckAccess(task.board, req.user._id);

  const label = await Label.findById(labelId);
  if (!label || label.board.toString() !== task.board.toString()) {
    throw new ApiError(400, 'Label not found on this board');
  }
  if (task.labels.some((l) => l.toString() === labelId)) {
    throw new ApiError(409, 'Label already added');
  }

  task.labels.push(labelId);
  await task.save();

  const populated = await task.populate('labels');
  getIO().to(`board:${task.board}`).emit('task:updated', populated);
  res.status(200).json(new ApiResponse(200, populated, 'Label added'));
});

export const removeLabel = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  await loadBoardAndCheckAccess(task.board, req.user._id);

  task.labels = task.labels.filter((l) => l.toString() !== req.params.labelId);
  await task.save();

  const populated = await task.populate('labels');
  getIO().to(`board:${task.board}`).emit('task:updated', populated);
  res.status(200).json(new ApiResponse(200, populated, 'Label removed'));
});