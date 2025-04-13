const Listing = require('../models/Listing');
const User = require('../models/User');
const { uploadToCloud } = require('../utils/fileUpload');
const { sendNotification } = require('../utils/notifications');

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private/Customer
const createListing = async (req, res) => {
  try {
    const { title, description, category, location, budget, deadline } = req.body;
    
    let imageUrls = [];
    if (req.files) {
      imageUrls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
    }
    
    const listing = new Listing({
      title,
      description, 
      category,
      location,
      budget: budget || 0,
      deadline: deadline || null,
      images: imageUrls,
      creator: req.user.id
    });
    
    const createdListing = await listing.save();
    
    // Notify service providers with matching preferences
    const io = req.app.get('io');
    if (io) {
      const matchingProviders = await User.find({
        role: 'service_provider',
        'searchPreferences.categories': category,
        'searchPreferences.emailNotifications': true
      });
      
      matchingProviders.forEach(provider => {
        io.to(provider._id.toString()).emit('newListing', {
          message: 'New listing matches your preferences',
          listing: {
            _id: createdListing._id,
            title: createdListing.title,
            category: createdListing.category
          }
        });
      });
    }
    
    res.status(201).json(createdListing);
  } catch (error) {
    console.error("Listing creation error details:", error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res) => {
  try {
    const { category, location, status, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (location) query.location = location;
    if (status) query.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const listings = await Listing.find(query)
      .populate('creator', 'name avatar averageRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Listing.countDocuments(query);
    
    res.json({
      listings,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my listings
// @route   GET /api/listings/mylistings
// @access  Private
const getMyListings = async (req, res) => {
  try {
    console.log('User in request:', req.user);
    console.log('Looking for listings with creator:', req.user.id || req.user._id);
    
    const listings = await Listing.find({ 
      creator: req.user.id || req.user._id
    })
      .sort({ createdAt: -1 })
      .populate('creator', 'name avatar');
    
    console.log('Found listings:', listings);
    res.json(listings);
  } catch (error) {
    console.error('Error in getMyListings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get listing by ID
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('creator', 'name email avatar phone averageRating')
      .populate('assignedTo', 'name avatar averageRating');
    
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check ownership
    if (listing.creator.toString() !== (req.user.id || req.user._id).toString() && 
        req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update fields
    const { title, description, category, location, budget, deadline, status } = req.body;
    
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (category) listing.category = category;
    if (location) listing.location = location;
    if (budget) listing.budget = budget;
    if (deadline) listing.deadline = deadline;
    if (status) listing.status = status;
    
    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => 
        `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
      );
      listing.images = [...listing.images, ...newImages];
    }
    
    const updatedListing = await listing.save();
    
    res.json(updatedListing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check ownership
    if (listing.creator.toString() !== (req.user.id || req.user._id).toString() && 
        req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Listing.deleteOne({ _id: listing._id });
    
    res.json({ message: 'Listing removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark listing as solved
// @route   PUT /api/listings/:id/solve
// @access  Private
const markListingAsSolved = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check ownership
    if (listing.creator.toString() !== (req.user.id || req.user._id).toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    listing.status = 'solved';
    listing.solvedDate = Date.now();
    
    const updatedListing = await listing.save();
    
    res.json(updatedListing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createListing,
  getListings,
  getMyListings,
  getListingById,
  updateListing,
  deleteListing,
  markListingAsSolved
}; 