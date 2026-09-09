import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { createLabel, getLabelsByBoard, updateLabel, deleteLabel } from './label.controller.js';

const router = Router();
router.use(protect);

router.route('/').post(createLabel).get(getLabelsByBoard);
router.route('/:id').patch(updateLabel).delete(deleteLabel);

export default router;