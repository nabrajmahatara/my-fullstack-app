import ApiError from './ApiError.js';
import { ROLES } from '../constants/roles.js';

export function getMembership(workspace, userId) {
  return workspace.members.find((m) => m.user.toString() === userId.toString());
}

export function requireMember(workspace, userId) {
  const membership = getMembership(workspace, userId);
  if (!membership) throw new ApiError(403, 'You are not a member of this workspace');
  return membership;
}

export function requireOwner(workspace, userId) {
  const membership = requireMember(workspace, userId);
  if (membership.role !== ROLES.OWNER) {
    throw new ApiError(403, 'Only the workspace owner can perform this action');
  }
  return membership;
}