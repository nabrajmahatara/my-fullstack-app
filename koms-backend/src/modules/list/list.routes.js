import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { createList, getListsByBoard, updateList, reorderLists, deleteList } from './list.controller.js';

const router = Router();
router.use(protect);

router.route('/').post(createList).get(getListsByBoard);
router.patch('/reorder', reorderLists);
router.route('/:id').patch(updateList).delete(deleteList);

export default router;