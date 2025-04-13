import React, { useState, useEffect, useContext } from 'react';
import { Container, Grid, Paper, Typography, Button, Box, Card, CardContent, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { listingService, messageService } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AlertMessage from '../../components/ui/AlertMessage';

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [listings, setListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's listings
        const listingsResponse = await listingService.getMyListings();
        setListings(listingsResponse.data);
        
        // Fetch conversations
        const conversationsResponse = await messageService.getConversations();
        setMessages(conversationsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <AlertMessage
          severity="error"
          message={error}
        />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}
        </Typography>
        
        <Grid container spacing={3}>
          {/* Quick actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/create-listing')}
              >
                Create New Listing
              </Button>
              <Button 
                variant="outlined"
                onClick={() => navigate('/inbox')}
              >
                Check Messages
              </Button>
              <Button 
                variant="outlined"
                onClick={() => navigate('/my-listings')}
              >
                My Listings
              </Button>
            </Paper>
          </Grid>
          
          {/* Recent listings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Your Recent Listings
              </Typography>
              
              {listings.length === 0 ? (
                <Typography>You don't have any listings yet.</Typography>
              ) : (
                listings.slice(0, 3).map(listing => (
                  <Card key={listing._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6">{listing.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {listing.description ? 
                          `${listing.description.substring(0, 100)}...` : 
                          'No description provided'}
                      </Typography>
                      <Typography variant="body2">
                        Status: {listing.status || 'Active'}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/edit-listing/${listing._id}`)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/listings/${listing._id}`)}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                ))
              )}
              
              {listings.length > 0 && (
                <Button 
                  variant="text" 
                  onClick={() => navigate('/my-listings')}
                  sx={{ mt: 1 }}
                >
                  View All Listings
                </Button>
              )}
            </Paper>
          </Grid>
          
          {/* Recent messages */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Messages
              </Typography>
              
              {messages.length === 0 ? (
                <Typography>You don't have any messages yet.</Typography>
              ) : (
                messages.slice(0, 3).map(conversation => (
                  <Card key={conversation._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6">
                        {conversation.otherUser?.name || 'Service Provider'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {conversation.lastMessage?.content ? 
                          `${conversation.lastMessage.content.substring(0, 100)}...` : 
                          'No messages yet'}
                      </Typography>
                      <Typography variant="body2">
                        {new Date(conversation.updatedAt).toLocaleString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/messages/${conversation._id}`)}
                      >
                        View Conversation
                      </Button>
                    </CardActions>
                  </Card>
                ))
              )}
              
              {messages.length > 0 && (
                <Button 
                  variant="text" 
                  onClick={() => navigate('/inbox')}
                  sx={{ mt: 1 }}
                >
                  View All Messages
                </Button>
              )}
            </Paper>
          </Grid>
          
          {/* Stats overview */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Overview
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{listings.length}</Typography>
                    <Typography variant="body2">Total Listings</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">
                      {listings.filter(l => l.status === 'open').length}
                    </Typography>
                    <Typography variant="body2">Active Listings</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{messages.length}</Typography>
                    <Typography variant="body2">Conversations</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CustomerDashboard; 