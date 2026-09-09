import mongoose from 'mongoose';
import { ROLE_VALUES, ROLES } from '../../constants/roles.js';

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ROLE_VALUES, default: ROLES.MEMBER },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'workspace name is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
  },
  { timestamps: true }
);

workspaceSchema.index({ 'members.user': 1 });

export default mongoose.model('Workspace', workspaceSchema);