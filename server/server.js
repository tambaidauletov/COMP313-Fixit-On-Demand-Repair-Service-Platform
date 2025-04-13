require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const { GridFsStorage } = require('multer-gridfs-storage');

// Import routes
const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const messagesRoutes = require('./routes/messages');
const requestsRoutes = require('./routes/requests');
const serviceProviderRoutes = require('./routes/serviceProvider');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io middleware
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

let gridfsBucket;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixit')
  .then((connection) => {
    console.log('MongoDB Connected Successfully');
    // Initialize GridFS
    gridfsBucket = new GridFSBucket(connection.connection.db, {
      bucketName: 'uploads'
    });
    console.log('GridFS initialized');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/fixit',
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'uploads',
      filename: `${Date.now()}-${file.originalname}`
    };
  }
});

const upload = multer({ storage });

// Debug route to list all files in GridFS
app.get('/api/debug/files', async (req, res) => {
  try {
    const cursor = gridfsBucket.find({});
    const files = await cursor.toArray();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Updated image serving route
app.get('/api/auth/image/:filename', async (req, res) => {
  try {
    if (!gridfsBucket) {
      return res.status(500).json({ message: 'GridFS not initialized' });
    }

    const cursor = gridfsBucket.find({ filename: req.params.filename });
    const files = await cursor.toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];

    // Set proper content type
    res.set('Content-Type', file.contentType);
    
    // Create download stream
    const downloadStream = gridfsBucket.openDownloadStreamByName(file.filename);
    
    // Handle errors on the stream
    downloadStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).json({ message: 'Error streaming file' });
    });

    // Pipe the file to the response
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ message: error.message });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/service-provider', serviceProviderRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Add this to your error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  }
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  console.log('Server continues running despite error');
});

module.exports = { app, io };