import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { createComment, getCommentsByTask, updateComment, deleteComment } from './comment.controller.js';

const router = Router();
router.use(protect);

router.route('/').post(createComment).get(getCommentsByTask);
router.route('/:id').patch(updateComment).delete(deleteComment);

export default router;