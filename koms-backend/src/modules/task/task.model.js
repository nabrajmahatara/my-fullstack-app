import mongoose from 'mongoose';
import { PRIORITY_VALUES, PRIORITIES } from '../../constants/priorities.js';

const taskSchema = new mongoose.Schema(
  {
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
    title: { type: String, required: [true, 'task title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    priority: { type: String, enum: PRIORITY_VALUES, default: PRIORITIES.MEDIUM },
    labels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Label' }],
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dueDate: { type: Date, default: null },
    position: { type: Number, required: true, default: 0 },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taskSchema.index({ list: 1, position: 1 });
taskSchema.index({ board: 1 });

export default mongoose.model('Task', taskSchema);