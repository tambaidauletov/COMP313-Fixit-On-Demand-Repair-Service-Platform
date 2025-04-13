const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    originalname: String,
    contentType: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: String
}, {
  timestamps: true
});

// Create indexes for efficient querying
messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ sender: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
