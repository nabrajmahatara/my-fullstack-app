import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { getMyNotifications, markAsRead, markAllAsRead, deleteNotification } from './notification.controller.js';

const router = Router();
router.use(protect);

router.get('/', getMyNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;