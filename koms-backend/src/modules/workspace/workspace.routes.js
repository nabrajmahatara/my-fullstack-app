import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import {
  createWorkspace, getMyWorkspaces, getWorkspace, updateWorkspace, deleteWorkspace,
  addMember, updateMemberRole, removeMember, leaveWorkspace,
} from './workspace.controller.js';

const router = Router();
router.use(protect);

router.route('/').post(createWorkspace).get(getMyWorkspaces);
router.route('/:id').get(getWorkspace).patch(updateWorkspace).delete(deleteWorkspace);
router.post('/:id/members', addMember);
router.patch('/:id/members/:memberId', updateMemberRole);
router.delete('/:id/members/:memberId', removeMember);
router.post('/:id/leave', leaveWorkspace);

export default router;