const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../utils/gridfs');
const {
  getProfile,
  updateProfile,
  addQualification,
  updateSearchPreferences,
  getReviews
} = require('../controllers/serviceProviderController');

// All routes are protected and require service_provider role
router.use(protect);
router.use(authorize('service_provider'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', upload.single('avatar'), updateProfile);

// Qualifications routes
router.post('/qualifications', upload.single('document'), addQualification);

// Search preferences routes
router.put('/preferences', updateSearchPreferences);

// Reviews routes
router.get('/:id/reviews', getReviews);

module.exports = router; 