import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import {
  createTask, getTasksByBoard, getTask, updateTask, moveTask, deleteTask,
  addAssignee, removeAssignee, addLabel, removeLabel,
} from './task.controller.js';

const router = Router();
router.use(protect);

router.route('/').post(createTask).get(getTasksByBoard);
router.route('/:id').get(getTask).patch(updateTask).delete(deleteTask);
router.patch('/:id/move', moveTask);
router.post('/:id/assignees', addAssignee);
router.delete('/:id/assignees/:userId', removeAssignee);
router.post('/:id/labels', addLabel);
router.delete('/:id/labels/:labelId', removeLabel);

export default router;