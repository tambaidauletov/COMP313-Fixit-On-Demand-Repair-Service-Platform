import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import PageTemplate from '../../components/PageTemplate';

const JOB_STATUSES = ['accepted', 'in_progress', 'completed', 'cancelled'];

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [activeJobs, setActiveJobs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [openJobDetails, setOpenJobDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openRequestDetails, setOpenRequestDetails] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchRequests();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/requests/provider-jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setActiveJobs(data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error fetching jobs');
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/requests/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setRequests(data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error fetching requests');
      console.error('Error fetching requests:', error);
    }
    setLoading(false);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setOpenRequestDetails(false);
        fetchJobs();
        fetchRequests();
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError('Error accepting request');
      console.error('Error accepting request:', error);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/requests/${selectedJob._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setOpenStatusDialog(false);
        fetchJobs();
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError('Error updating status');
      console.error('Error updating status:', error);
    }
  };

  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
    setOpenJobDetails(true);
  };

  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request);
    setOpenRequestDetails(true);
  };

  return (
    <PageTemplate title="Provider Dashboard">
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Service Provider Dashboard
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Active Jobs
                  </Typography>
                  {activeJobs.length > 0 ? (
                    <List>
                      {activeJobs.map((job) => (
                        <React.Fragment key={job._id}>
                          <ListItem>
                            <ListItemText
                              primary={job.service}
                              secondary={`Client: ${job.clientName} | Status: ${job.status}`}
                            />
                            <Box>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ mr: 1 }}
                                onClick={() => handleViewJobDetails(job)}
                              >
                                View Details
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setSelectedJob(job);
                                  setNewStatus(job.status);
                                  setOpenStatusDialog(true);
                                }}
                              >
                                Update Status
                              </Button>
                            </Box>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography>No active jobs.</Typography>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Available Requests
                  </Typography>
                  {loading ? (
                    <Typography>Loading...</Typography>
                  ) : requests.length > 0 ? (
                    <List>
                      {requests.map((request) => (
                        <React.Fragment key={request._id}>
                          <ListItem>
                            <ListItemText
                              primary={request.service}
                              secondary={`Location: ${request.location} | Posted: ${new Date(request.createdAt).toLocaleDateString()}`}
                            />
                            <Box>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ mr: 1 }}
                                onClick={() => handleViewRequestDetails(request)}
                              >
                                View Details
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleAcceptRequest(request._id)}
                              >
                                Accept Request
                              </Button>
                            </Box>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography>No available requests.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    My Profile
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      Name: {user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Services Offered:
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {user?.services?.map((service, index) => (
                        <Chip
                          key={index}
                          label={service}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {/* Handle edit profile */}}
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Update Status Dialog */}
        <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
          <DialogTitle>Update Job Status</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                label="Status"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {JOB_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} variant="contained">Update</Button>
          </DialogActions>
        </Dialog>

        {/* Job Details Dialog */}
        <Dialog open={openJobDetails} onClose={() => setOpenJobDetails(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Job Details</DialogTitle>
          <DialogContent>
            {selectedJob && (
              <>
                <Typography variant="h6" gutterBottom>
                  {selectedJob.service}
                </Typography>
                <Typography variant="body1" paragraph>
                  Description: {selectedJob.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Client: {selectedJob.clientName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {selectedJob.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Budget: ${selectedJob.budget}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {selectedJob.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Started: {new Date(selectedJob.createdAt).toLocaleString()}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenJobDetails(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Request Details Dialog */}
        <Dialog open={openRequestDetails} onClose={() => setOpenRequestDetails(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Request Details</DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <>
                <Typography variant="h6" gutterBottom>
                  {selectedRequest.service}
                </Typography>
                <Typography variant="body1" paragraph>
                  Description: {selectedRequest.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {selectedRequest.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Budget: ${selectedRequest.budget}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Posted: {new Date(selectedRequest.createdAt).toLocaleString()}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRequestDetails(false)}>Cancel</Button>
            <Button 
              onClick={() => handleAcceptRequest(selectedRequest._id)}
              variant="contained"
            >
              Accept Request
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageTemplate>
  );
};

export default ProviderDashboard; 