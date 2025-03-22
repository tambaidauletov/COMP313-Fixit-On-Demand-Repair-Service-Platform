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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import PageTemplate from '../../components/PageTemplate';

const AVAILABLE_SERVICES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Landscaping',
  'HVAC',
  'Roofing',
  'General Maintenance'
];

const ClientDashboard = () => {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openNewRequest, setOpenNewRequest] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newRequestData, setNewRequestData] = useState({
    service: '',
    description: '',
    location: '',
    budget: ''
  });

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/requests/my-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMyRequests(data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error fetching requests');
      console.error('Error fetching requests:', error);
    }
    setLoading(false);
  };

  const handleCreateRequest = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newRequestData)
      });

      const data = await response.json();
      if (response.ok) {
        setOpenNewRequest(false);
        setNewRequestData({
          service: '',
          description: '',
          location: '',
          budget: ''
        });
        fetchMyRequests();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error creating request');
      console.error('Error creating request:', error);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setOpenDetails(true);
  };

  const handleCancelRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        fetchMyRequests();
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError('Error cancelling request');
      console.error('Error cancelling request:', error);
    }
  };

  return (
    <PageTemplate title="Client Dashboard">
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.name}!
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    My Service Requests
                  </Typography>
                  {loading ? (
                    <Typography>Loading...</Typography>
                  ) : myRequests.length > 0 ? (
                    <List>
                      {myRequests.map((request) => (
                        <React.Fragment key={request._id}>
                          <ListItem>
                            <ListItemText
                              primary={request.service}
                              secondary={`Status: ${request.status} | Created: ${new Date(request.createdAt).toLocaleDateString()}`}
                            />
                            <Box>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ mr: 1 }}
                                onClick={() => handleViewDetails(request)}
                              >
                                View Details
                              </Button>
                              {request.status === 'pending' && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  onClick={() => handleCancelRequest(request._id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </Box>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography>No service requests found.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mb: 2 }}
                    onClick={() => setOpenNewRequest(true)}
                  >
                    New Service Request
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {/* Handle view providers */}}
                  >
                    Browse Service Providers
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* New Request Dialog */}
        <Dialog open={openNewRequest} onClose={() => setOpenNewRequest(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Service Request</DialogTitle>
          <DialogContent>
            <TextField
              select
              margin="normal"
              required
              fullWidth
              label="Service Type"
              value={newRequestData.service}
              onChange={(e) => setNewRequestData({ ...newRequestData, service: e.target.value })}
            >
              {AVAILABLE_SERVICES.map((service) => (
                <MenuItem key={service} value={service}>
                  {service}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={newRequestData.description}
              onChange={(e) => setNewRequestData({ ...newRequestData, description: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Location"
              value={newRequestData.location}
              onChange={(e) => setNewRequestData({ ...newRequestData, location: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Budget"
              type="number"
              value={newRequestData.budget}
              onChange={(e) => setNewRequestData({ ...newRequestData, budget: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNewRequest(false)}>Cancel</Button>
            <Button onClick={handleCreateRequest} variant="contained">Create Request</Button>
          </DialogActions>
        </Dialog>

        {/* Request Details Dialog */}
        <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
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
                  Status: {selectedRequest.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(selectedRequest.createdAt).toLocaleString()}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetails(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageTemplate>
  );
};

export default ClientDashboard; 