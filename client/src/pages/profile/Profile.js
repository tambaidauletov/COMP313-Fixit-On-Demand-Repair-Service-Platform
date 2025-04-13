import React, { useContext, useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Avatar, Button, Grid, Divider, Rating, Chip, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CustomAvatar from '../../components/Avatar';
import { serviceProviderService } from '../../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [spData, setSpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Debug log to check user data
    console.log('Current user data:', user);

    // Only fetch additional data if user is a service provider
    const fetchServiceProviderData = async () => {
      if (user?.role === 'service_provider') {
        setLoading(true);
        try {
          const response = await serviceProviderService.getProfile();
          setSpData(response.data);
        } catch (error) {
          console.error('Error fetching service provider data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchServiceProviderData();
  }, [user]);

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Combine user data with service provider specific data if available
  const userData = user.role === 'service_provider' ? { ...user, ...spData } : user;

  // Ensure these arrays exist with default empty arrays
  const categories = userData.categories || [];
  const ratings = userData.ratings || [];
  const qualifications = userData.qualifications || [];

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Profile</Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate('/edit-profile')}
          >
            Edit Profile
          </Button>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CustomAvatar user={userData} size={100} />
            <Typography variant="h5" gutterBottom>{userData.name || 'No Name'}</Typography>
            <Chip
              label={(userData.role || '').replace('_', ' ')}
              color="primary"
              sx={{ textTransform: 'capitalize', mb: 2 }}
            />
            {userData.role === 'service_provider' && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={userData.averageRating || 0} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({userData.averageRating || '0'})
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Contact Information</Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1">
                <strong>Email:</strong> {userData.email || 'No email provided'}
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong> {userData.phone || 'Not provided'}
              </Typography>
              <Typography variant="body1">
                <strong>Address:</strong> {userData.address || 'Not provided'}
              </Typography>
              <Typography variant="body1">
                <strong>Member since:</strong> {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
            
            {userData.role === 'service_provider' && (
              <>
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <>
                    {/* Service Provider Specific Sections */}
                    {qualifications.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Qualifications</Typography>
                        {qualifications.map((qual, index) => (
                          <Box key={index} sx={{ mb: 2 }}>
                            <Typography variant="subtitle1">{qual.title || 'Untitled'}</Typography>
                            <Typography variant="body2">{qual.description || 'No description'}</Typography>
                            <Chip 
                              size="small"
                              label={qual.isApproved ? 'Verified' : 'Pending'}
                              color={qual.isApproved ? 'success' : 'warning'}
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Categories/Specializations Section */}
                    {categories.length > 0 && (
                      <>
                        <Typography variant="h6" gutterBottom>Specializations</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                          {categories.map((category, index) => (
                            <Chip key={index} label={category} />
                          ))}
                        </Box>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </Grid>
          
          {/* Reviews Section - Only for service providers */}
          {userData.role === 'service_provider' && ratings.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Reviews</Typography>
              <List>
                {ratings.map((review, index) => (
                  <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1">{review.from || 'Anonymous'}</Typography>
                          <Rating value={review.rating || 0} readOnly size="small" sx={{ ml: 2 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {review.date ? new Date(review.date).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </Box>
                      }
                      secondary={review.review || 'No comment provided'}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile; 