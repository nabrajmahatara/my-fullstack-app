import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import workspaceRoutes from '../modules/workspace/workspace.routes.js';
import boardRoutes from '../modules/board/board.routes.js';
import listRoutes from '../modules/list/list.routes.js';
import taskRoutes from '../modules/task/task.routes.js';
import labelRoutes from '../modules/label/label.routes.js';
import commentRoutes from '../modules/comment/comment.routes.js';
import attachmentRoutes from '../modules/attachment/attachment.routes.js';
import notificationRoutes from '../modules/notification/notification.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/boards', boardRoutes);
router.use('/lists', listRoutes);
router.use('/tasks', taskRoutes);
router.use('/labels', labelRoutes);
router.use('/comments', commentRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/notifications', notificationRoutes);

export default router;