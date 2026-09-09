import mongoose from 'mongoose';

const NOTIFICATION_TYPES = ['TASK_ASSIGNED', 'TASK_DUE_SOON', 'COMMENT_ADDED', 'BOARD_INVITE', 'WORKSPACE_INVITE'];

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    message: { type: String, required: true },
    relatedTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    relatedBoard: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export { NOTIFICATION_TYPES };
export default mongoose.model('Notification', notificationSchema);