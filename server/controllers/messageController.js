const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { sendNotification } = require('../utils/notifications');

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, attachments } = req.body;
    
    let conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const message = new Message({
      conversation: conversationId,
      sender: req.user.userId,
      recipient: conversation.participants.find(
        p => p.toString() !== req.user.userId
      ),
      content,
      attachments
    });

    await message.save();

    // Send notification to recipient
    sendNotification({
      userId: message.recipient,
      type: 'new_message',
      data: {
        conversationId,
        messageId: message._id,
        senderName: req.user.name
      }
    });

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.userId
    })
    .populate('participants', 'name avatar')
    .populate({
      path: 'lastMessage',
      select: 'content createdAt isRead'
    })
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'name avatar');

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        recipient: req.user.userId,
        isRead: false
      },
      { isRead: true }
    );

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.reportMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reason } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.isReported = true;
    message.reportReason = reason;
    await message.save();

    // Create report
    const report = new Report({
      reporter: req.user.userId,
      reportedContent: {
        type: 'message',
        id: messageId
      },
      reason
    });
    await report.save();

    res.json({ message: 'Message reported successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 