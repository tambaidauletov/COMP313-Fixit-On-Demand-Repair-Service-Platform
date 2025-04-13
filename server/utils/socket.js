const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"]
    }
  });

  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.decoded = decoded;
        next();
      });
    } else {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.decoded.userId);
    
    socket.join(socket.decoded.userId);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.decoded.userId);
    });
  });

  return io;
};

const sendNotification = (userId, notification) => {
  if (io) {
    io.to(userId).emit('notification', notification);
  }
};

module.exports = {
  initializeSocket,
  sendNotification
}; 