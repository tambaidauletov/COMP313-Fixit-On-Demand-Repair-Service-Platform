const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Add timestamp and clean filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const cleanFileName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, uniqueSuffix + '-' + cleanFileName);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Function to get public URL for uploaded file
const getFileUrl = (filename) => {
  return `/uploads/${filename}`; // This will be the public path to access the file
};

// Export everything together
module.exports = {
  upload,
  uploadDir,
  getFileUrl
}; 