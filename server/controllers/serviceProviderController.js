const User = require('../models/User');
const { uploadToCloud } = require('../utils/fileUpload');
const { sendEmail } = require('../utils/email');
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');
const { deleteFile } = require('../utils/gridfs');

// Get service provider profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('ratings.fromUser', 'name avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update service provider profile
exports.updateProfile = async (req, res) => {
  try {
    console.log('Updating profile with file:', req.file);
    const {
      name,
      email,
      phone,
      bio,
      specializations,
      experience,
      hourlyRate,
      searchPreferences
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (specializations) user.specializations = specializations;
    if (experience) user.experience = experience;
    if (hourlyRate) user.hourlyRate = hourlyRate;

    // Update search preferences if provided
    if (searchPreferences) {
      user.searchPreferences = {
        ...user.searchPreferences,
        ...searchPreferences
      };
    }

    // Handle avatar upload
    if (req.file) {
      console.log('Processing new avatar file:', req.file.filename);
      // If there's an existing avatar, delete it
      if (user.avatar) {
        try {
          await deleteFile(user.avatar);
          console.log('Old avatar deleted:', user.avatar);
        } catch (error) {
          console.error('Error deleting old avatar:', error);
        }
      }
      user.avatar = req.file.filename;
      console.log('New avatar set:', user.avatar);
    }

    await user.save();
    console.log('User profile saved successfully');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        specializations: user.specializations,
        experience: user.experience,
        hourlyRate: user.hourlyRate,
        searchPreferences: user.searchPreferences,
        averageRating: user.averageRating
      }
    });
  } catch (err) {
    console.error('Error in updateProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add qualification
exports.addQualification = async (req, res) => {
  try {
    const { title, description } = req.body;
    const documentUrl = req.file ? req.file.filename : null;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.qualifications.push({
      title,
      description,
      documentUrl,
      submittedDate: new Date()
    });

    await user.save();
    res.json({ message: 'Qualification added successfully', qualifications: user.qualifications });
  } catch (err) {
    console.error('Error in addQualification:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update search preferences
exports.updateSearchPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.searchPreferences = {
      ...user.searchPreferences,
      ...req.body
    };

    await user.save();
    res.json({ message: 'Search preferences updated', searchPreferences: user.searchPreferences });
  } catch (err) {
    console.error('Error in updateSearchPreferences:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get service provider reviews
exports.getReviews = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('ratings averageRating')
      .populate('ratings.fromUser', 'name avatar');

    if (!user) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    res.json({
      ratings: user.ratings,
      averageRating: user.averageRating
    });
  } catch (err) {
    console.error('Error in getReviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitIdentityDocuments = async (req, res) => {
  try {
    const documentUrls = await Promise.all(
      req.files.map(file => uploadToCloud(file))
    );

    const user = await User.findById(req.user.userId);
    documentUrls.forEach(url => {
      user.identityDocuments.push({
        documentUrl: url,
        isApproved: false,
        submittedDate: new Date()
      });
    });

    await user.save();

    // Notify moderators about new identity documents
    notifyModerators('new_identity_documents', {
      userId: user._id
    });

    res.json(user.identityDocuments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQualifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('qualifications');
    res.json(user.qualifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 