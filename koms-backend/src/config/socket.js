import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from './env.js';
import User from '../modules/auth/user.model.js';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl || '*',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication token missing'));

      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.username} (${socket.id})`);
    socket.join(`user:${socket.user._id}`);

    socket.on('joinBoard', (boardId) => socket.join(`board:${boardId}`));
    socket.on('leaveBoard', (boardId) => socket.leave(`board:${boardId}`));
    socket.on('joinWorkspace', (workspaceId) => socket.join(`workspace:${workspaceId}`));

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}