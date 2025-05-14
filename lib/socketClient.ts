import { io, Socket } from 'socket.io-client';

// Socket event types - should match server-side events
export const SOCKET_EVENTS = {
  TASK_CREATED: 'task-created',
  TASK_UPDATED: 'task-updated',
  TASK_DELETED: 'task-deleted',
  BOARD_UPDATED: 'board-updated'
};

// Singleton pattern for socket instance
let socket: Socket | null = null;

export const getSocketInstance = (): Socket => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot use socket on server-side');
  }
  
  if (!socket) {
    // Initialize the client with proper configuration
    socket = io({
      path: '/api/socket/io',
      addTrailingSlash: false,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true,
      forceNew: false
    });
    
    // Add debugging listeners
    socket.on('connect', () => {
      console.log('Socket.io client connected', socket?.id);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket.io client disconnected:', reason);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error.message);
    });
  }
  return socket;
}; 