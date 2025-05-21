import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a discussion room
    socket.on('join_discussion', (discussionId) => {
      socket.join(`discussion_${discussionId}`);
      console.log(`User ${socket.id} joined discussion ${discussionId}`);
    });

    // Leave a discussion room
    socket.on('leave_discussion', (discussionId) => {
      socket.leave(`discussion_${discussionId}`);
      console.log(`User ${socket.id} left discussion ${discussionId}`);
    });

    // Handle new message
    socket.on('new_message', (data) => {
      const { discussionId, message } = data;
      io.to(`discussion_${discussionId}`).emit('message_received', message);
    });

    // Handle typing status
    socket.on('typing', (data) => {
      const { discussionId, userId, isTyping } = data;
      socket.to(`discussion_${discussionId}`).emit('user_typing', { userId, isTyping });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}; 