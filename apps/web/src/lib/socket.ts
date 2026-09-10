import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const socketUrl = rawApiUrl.replace(/\/api\/?$/, '');

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
