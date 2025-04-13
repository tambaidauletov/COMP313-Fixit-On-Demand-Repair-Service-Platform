import io from 'socket.io-client';
import { store } from '../store';
import { addNotification } from '../slices/notificationSlice';

let socket;

export const initializeSocket = (token) => {
  socket = io(process.env.REACT_APP_API_URL, {
    query: { token }
  });

  socket.on('connect', () => {
    console.log('Connected to notification service');
  });

  socket.on('notification', (notification) => {
    store.dispatch(addNotification(notification));
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from notification service');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
}; 