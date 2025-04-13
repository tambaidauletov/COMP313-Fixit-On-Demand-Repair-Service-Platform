const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'solved', 'closed'],
    default: 'open',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  budget: {
    type: Number,
    default: 0,
  },
  deadline: {
    type: Date,
  },
  isReported: {
    type: Boolean,
    default: false,
  },
  reportReason: String,
  solvedDate: Date,
  closedDate: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Listing', listingSchema);
