import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { register, login, getMe, updateProfile, changePassword, searchUsers } from './auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/update-profile', protect, updateProfile);
router.patch('/change-password', protect, changePassword);
router.get('/search', protect, searchUsers);

export default router;