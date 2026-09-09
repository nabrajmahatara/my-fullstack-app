import Notification from './notification.model.js';
import { getIO } from '../../config/socket.js';

export async function createNotification({ recipient, type, message, relatedTask, relatedBoard }) {
  const notification = await Notification.create({ recipient, type, message, relatedTask, relatedBoard });

  try {
    getIO().to(`user:${recipient}`).emit('notification:new', notification);
  } catch (err) {
    // socket not initialized yet (e.g. during tests) — ignore
  }

  return notification;
}