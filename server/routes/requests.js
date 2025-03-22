const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Request = require('../models/Request');
const User = require('../models/User');

// Create a new service request
router.post('/', auth, async (req, res) => {
  try {
    const { service, description, location, budget } = req.body;
    
    const request = new Request({
      client: req.user.id,
      service,
      description,
      location,
      budget,
      status: 'pending'
    });

    await request.save();
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client's requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await Request.find({ client: req.user.id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get provider's jobs
router.get('/provider-jobs', auth, async (req, res) => {
  try {
    const jobs = await Request.find({ 
      provider: req.user.id,
      status: { $in: ['accepted', 'in_progress'] }
    })
    .populate('client', 'name')
    .sort({ createdAt: -1 });

    const formattedJobs = jobs.map(job => ({
      ...job.toObject(),
      clientName: job.client.name
    }));

    res.json(formattedJobs);
  } catch (error) {
    console.error('Error fetching provider jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available requests for providers
router.get('/available', auth, async (req, res) => {
  try {
    const requests = await Request.find({ 
      status: 'pending',
      provider: { $exists: false }
    })
    .populate('client', 'name')
    .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching available requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept a request (for providers)
router.post('/:requestId/accept', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is no longer available' });
    }

    request.provider = req.user.id;
    request.status = 'accepted';
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status
router.patch('/:requestId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.provider.toString() !== req.user.id && 
        request.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    if (status === 'completed') {
      request.completedAt = new Date();
    }
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 