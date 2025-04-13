const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const { sendEmail } = require('../utils/email');
const { sendNotification } = require('../utils/notifications');
const multer = require('multer');
const { upload, deleteFile, gfs, gridfsBucket } = require('../utils/gridfs');
const path = require('path');
const fs = require('fs');
const { getFileUrl } = require('../utils/fileUpload');

// Controller imports (if they exist)
// Uncomment these if you have these controller functions defined
/*
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
*/

const jwtSecret = process.env.JWT_SECRET || 'secret';

// Add this near the top of your auth.js routes file
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ msg: 'Auth routes working' });
});

// Register new user
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('role', 'Role must be either customer or service_provider').isIn(['customer', 'service_provider'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create user WITHOUT manually hashing the password
    user = new User({
      name,
      email,
      password, // The pre-save hook will hash this
      role
    });

    await user.save(); // Password will be hashed by the pre-save hook

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      }
    );

    // Send welcome email (if email utility is configured)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Fixit',
        text: `Hi ${user.name}, welcome to Fixit! Your account has been created successfully.`
      });
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr);
      // Don't fail the registration if email fails
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login user
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  console.log('\n=== LOGIN ATTEMPT START ===');
  console.log('Request body:', {
    email: req.body.email,
    hasPassword: !!req.body.password,
    passwordLength: req.body.password?.length
  });

  // Validation check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      msg: 'Validation failed',
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;

  try {
    // Find user
    console.log('Searching for user:', email);
    let user = await User.findOne({ email }).select('+password'); // explicitly include password

    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
      hasPasswordField: !!user.password,
      passwordHash: user.password ? user.password.substring(0, 10) + '...' : 'none'
    });

    // Check password
    console.log('Attempting password comparison');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Create token payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ msg: 'Token generation failed' });
        }

        console.log('Login successful for user:', email);
        res.json({
          token,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      }
    );
  } catch (err) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ msg: 'Server error during login' });
  }
  console.log('=== LOGIN ATTEMPT END ===\n');
});

// User route with the proper middleware
router.get('/user', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Alternative route to get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Password recovery
router.post('/forgot-password', [
  check('email', 'Please include a valid email').isEmail()
], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with reset token
    // Implementation depends on your email service
    // Example:
    // const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Password Reset',
    //   text: `Please use the following link to reset your password: ${resetUrl}`
    // });

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.put('/reset-password/:token', [
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve uploaded files statically
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Update profile route
router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
  try {
    console.log('Profile update request received');
    console.log('Request body:', req.body);
    console.log('File:', req.file);

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.address) user.address = req.body.address;

    // Handle password update
    if (req.body.currentPassword && req.body.newPassword) {
      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = req.body.newPassword;
    }

    // Handle avatar upload
    if (req.file) {
      console.log('Processing avatar file:', req.file);
      // Store the complete URL for the avatar
      const avatarUrl = `/api/auth/image/${req.file.filename}`;
      console.log('Setting avatar URL:', avatarUrl);
      user.avatar = avatarUrl;
    }

    // Save user and log the complete user object
    const updatedUser = await user.save();
    console.log('Updated user object:', {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar // Check if this is set correctly
    });

    // Remove sensitive data
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update the image serving route
router.get('/image/:filename', async (req, res) => {
  try {
    console.log('Serving image:', req.params.filename);
    const { gridfsBucket } = require('../utils/gridfs');
    
    if (!gridfsBucket) {
      console.error('GridFS bucket not initialized');
      return res.status(500).json({ message: 'GridFS not initialized' });
    }
    
    // Find the file metadata
    const files = await gridfsBucket.find({ filename: req.params.filename }).toArray();
    if (!files || files.length === 0) {
      console.error('No file exists:', req.params.filename);
      return res.status(404).json({ message: 'No file exists' });
    }

    const file = files[0];

    // Check if image
    if (!file.contentType.startsWith('image/')) {
      return res.status(400).json({ message: 'Not an image' });
    }

    // Set caching headers
    res.set({
      'Content-Type': file.contentType,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'ETag': `"${file._id}"` // Use the file ID as ETag
    });

    // Check if the client has a valid cached version
    const clientETag = req.headers['if-none-match'];
    if (clientETag === `"${file._id}"`) {
      return res.status(304).end(); // Not Modified
    }

    // Create read stream
    const readStream = gridfsBucket.openDownloadStreamByName(req.params.filename);
    
    // Handle stream errors
    readStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).json({ message: 'Error streaming file' });
    });

    // Pipe the file to the response
    readStream.pipe(res);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ message: 'Error serving image' });
  }
});

// IMPORTANT: Choose ONE approach for defining routes:
// Either use the controller-based approach or direct route handlers above

// APPROACH 1: If you have controller functions defined, uncomment these:
/*
router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
*/

// APPROACH 2: If you already defined route handlers inline (as above), 
// remove the duplicate routes at the bottom of the file.

module.exports = router;
