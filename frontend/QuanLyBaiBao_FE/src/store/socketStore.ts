import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import useUIStore from './uiStore';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinDiscussion: (discussionId: string) => void;
  leaveDiscussion: (discussionId: string) => void;
  sendMessage: (discussionId: string, message: any) => void;
  sendTypingStatus: (discussionId: string, userId: string, isTyping: boolean) => void;
}

const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: () => {
    const { showErrorToast } = useUIStore.getState();
    const socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
      console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
      showErrorToast('Socket connection error');
      console.error('Socket error:', error);
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinDiscussion: (discussionId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('join_discussion', discussionId);
    }
  },

  leaveDiscussion: (discussionId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('leave_discussion', discussionId);
    }
  },

  sendMessage: (discussionId: string, message: any) => {
    const { socket } = get();
    if (socket) {
      socket.emit('new_message', { discussionId, message });
    }
  },

  sendTypingStatus: (discussionId: string, userId: string, isTyping: boolean) => {
    const { socket } = get();
    if (socket) {
      socket.emit('typing', { discussionId, userId, isTyping });
    }
  },
}));

export default useSocketStore; 