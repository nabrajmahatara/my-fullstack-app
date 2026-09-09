import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import upload from '../../config/multer.js';
import { uploadAttachment, getAttachmentsByTask, deleteAttachment } from './attachment.controller.js';

const router = Router();
router.use(protect);

router.route('/').post(upload.single('file'), uploadAttachment).get(getAttachmentsByTask);
router.delete('/:id', deleteAttachment);

export default router;