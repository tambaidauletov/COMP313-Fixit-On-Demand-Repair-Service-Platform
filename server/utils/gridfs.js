const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

let gridfsBucket;

// Initialize GridFS bucket
mongoose.connection.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
  console.log('GridFS initialized');
});

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
          contentType: file.mimetype
        };
        console.log('Creating file in GridFS:', fileInfo);
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Processing file upload:', file.originalname);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Function to delete file
const deleteFile = async (filename) => {
  try {
    console.log('Attempting to delete file:', filename);
    const files = await gridfsBucket.find({ filename }).toArray();
    if (files.length > 0) {
      await gridfsBucket.delete(files[0]._id);
      console.log('File deleted successfully:', filename);
      return true;
    }
    console.log('File not found for deletion:', filename);
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

module.exports = {
  upload,
  gridfsBucket,
  deleteFile
}; 