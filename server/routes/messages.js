const express = require('express');
const Message = require('../models/Message');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'secret';
const Conversation = require('../models/Conversation');
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

// Middleware to verify JWT token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "No token provided" });
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// Configure GridFS storage
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/fixit',
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'uploads',
      filename: `${Date.now()}-${file.originalname}`
    };
  }
});

const upload = multer({ storage });

// Get all conversations for the authenticated user
router.get('/conversations', auth, async (req, res) => {
  try {
    console.log('Fetching conversations for user:', req.user.id);
    
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name avatar')
    .populate('listing', 'title status')
    .populate({
      path: 'lastMessage',
      select: 'content createdAt sender attachments'
    })
    .sort('-updatedAt');

    console.log(`Found ${conversations.length} conversations`);
    res.json(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user.id
    })
    .populate('participants', 'name avatar')
    .populate('listing', 'title status');

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name avatar')
      .sort('createdAt');

    res.json({ conversation, messages });
  } catch (err) {
    console.error('Error fetching conversation messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Start a new conversation
router.post('/conversations', [auth, upload.array('attachments')], async (req, res) => {
  try {
    const { listingId, initialMessage } = req.body;
    
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Create conversation
    const conversation = new Conversation({
      participants: [req.user.id, listing.creator],
      listing: listingId
    });
    await conversation.save();

    // Handle attachments
    const attachments = req.files?.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      contentType: file.contentType
    })) || [];

    // Create initial message
    const message = new Message({
      conversation: conversation._id,
      sender: req.user.id,
      content: initialMessage,
      attachments
    });
    await message.save();

    // Update conversation with last message
    conversation.lastMessage = message._id;
    conversation.unreadCount.set(listing.creator.toString(), 1);
    await conversation.save();

    // Get io instance
    const io = req.app.get('io');
    
    // Notify other participant
    io.to(listing.creator.toString()).emit('newMessage', {
      conversation: conversation._id,
      message
    });

    // Return populated conversation
    await conversation
      .populate('participants', 'name avatar')
      .populate('listing', 'title status')
      .populate('lastMessage');

    res.status(201).json(conversation);
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Send a message in a conversation
router.post('/conversations/:conversationId', [auth, upload.array('attachments')], async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Handle attachments
    const attachments = req.files?.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      contentType: file.contentType
    })) || [];

    // Create message
    const message = new Message({
      conversation: conversation._id,
      sender: req.user.id,
      content: req.body.content,
      attachments
    });
    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    
    // Update unread count for other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id.toString()) {
        const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });
    
    await conversation.save();

    // Get io instance and notify other participants
    const io = req.app.get('io');
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id.toString()) {
        io.to(participantId.toString()).emit('newMessage', {
          conversation: conversation._id,
          message
        });
      }
    });

    // Populate and return message
    await message.populate('sender', 'name avatar');
    
    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark conversation as read
router.put('/conversations/:conversationId/read', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Reset unread count for current user
    conversation.unreadCount.set(req.user.id.toString(), 0);
    await conversation.save();

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user.id },
        isRead: false
      },
      { isRead: true }
    );

    res.json({ message: 'Conversation marked as read' });
  } catch (err) {
    console.error('Error marking conversation as read:', err);
    res.status(500).json({ error: 'Failed to mark conversation as read' });
  }
});

// Report a message
router.post('/:messageId/report', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.isReported = true;
    message.reportReason = req.body.reason;
    await message.save();

    res.json({ message: 'Message reported successfully' });
  } catch (err) {
    console.error('Error reporting message:', err);
    res.status(500).json({ error: 'Failed to report message' });
  }
});

module.exports = router;
