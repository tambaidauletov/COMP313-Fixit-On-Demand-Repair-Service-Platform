const User = require('../models/User');
const Report = require('../models/Report');
const { generatePDF } = require('../utils/pdfGenerator');

exports.createModerator = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const moderator = new User({
      name,
      email,
      password: hashedPassword,
      role: 'moderator'
    });

    await moderator.save();

    // Send welcome email with credentials
    await sendEmail({
      email: moderator.email,
      subject: 'Moderator Account Created',
      message: `Your moderator account has been created. Please login with your email and the provided password.`
    });

    res.json({ message: 'Moderator created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reporter', 'name email')
      .populate('assignedModerator', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportReports = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reporter', 'name email')
      .populate('assignedModerator', 'name email');

    const pdfBuffer = await generatePDF(reports);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reports.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.manageAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    switch (action) {
      case 'suspend':
        user.isActive = false;
        user.suspensionReason = req.body.reason;
        user.suspensionDate = new Date();
        break;
      case 'activate':
        user.isActive = true;
        user.suspensionReason = null;
        user.suspensionDate = null;
        break;
      case 'delete':
        await user.remove();
        return res.json({ message: 'Account deleted successfully' });
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    await user.save();
    res.json({ message: `Account ${action}d successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 