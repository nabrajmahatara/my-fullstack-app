import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { createBoard, getBoardsByWorkspace, getBoard, updateBoard, archiveBoard, deleteBoard } from './board.controller.js';

const router = Router();
router.use(protect);

router.route('/').post(createBoard).get(getBoardsByWorkspace);
router.route('/:id').get(getBoard).patch(updateBoard).delete(deleteBoard);
router.patch('/:id/archive', archiveBoard);

export default router;