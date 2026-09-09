import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: [true, 'board name is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    background: { type: String, default: '#0079bf' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

boardSchema.index({ workspace: 1 });

export default mongoose.model('Board', boardSchema);