const express = require('express');
const router = express.Router();
const { 
  createListing,
  getListings,
  getMyListings,
  getListingById,
  updateListing,
  deleteListing,
  markListingAsSolved
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../utils/fileUpload');

// Public routes
router.get('/', getListings);

// Protected routes - Put specific routes before parameter routes
router.get('/mylistings', protect, getMyListings);

// Routes with parameters
router.get('/:id', getListingById);
router.post('/', protect, upload.array('images', 5), createListing);
router.route('/:id')
  .put(protect, upload.array('images', 5), updateListing)
  .delete(protect, deleteListing);

router.put('/:id/solve', protect, markListingAsSolved);

module.exports = router;
