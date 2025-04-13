const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'service_provider', 'moderator', 'manager', 'admin'],
    required: true
  },
  avatar: {
    type: String,
    default: '' // Will store the GridFS file URL
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  // Service Provider specific fields
  qualifications: [{
    title: String,
    description: String,
    documentUrl: String,
    isApproved: { type: Boolean, default: false },
    submittedDate: Date
  }],
  identityDocuments: [{
    type: String,
    documentUrl: String,
    isApproved: { type: Boolean, default: false },
    submittedDate: Date
  }],
  // For password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  suspensionReason: String,
  suspensionDate: Date,
  // For service providers
  searchPreferences: {
    categories: [String],
    locations: [String],
    keywords: [String],
    emailNotifications: { type: Boolean, default: false }
  },
  // Reviews and ratings
  ratings: [{
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    review: String,
    date: { type: Date, default: Date.now }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  console.log('matchPassword method called with:', {
    enteredPasswordLength: enteredPassword?.length || 0,
    storedPasswordLength: this.password?.length || 0
  });
  
  try {
    const result = await bcrypt.compare(enteredPassword, this.password);
    console.log('bcrypt.compare result:', result);
    return result;
  } catch (error) {
    console.error('Password comparison error:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);
