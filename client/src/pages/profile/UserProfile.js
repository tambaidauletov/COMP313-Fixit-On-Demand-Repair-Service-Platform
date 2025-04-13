import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box, Avatar, Grid, Divider, Rating, Chip, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { userService } from '../../services/api';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await userService.getUserById(id);
        setUser(res.data);
      } catch (err) {
        setError('Failed to load user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [id]);
  
  if (loading) {
    return <CircularProgress />;
  }
  
  if (error || !user) {
    return <Typography color="error">{error || 'User not found'}</Typography>;
  }
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{ width: 150, height: 150, mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>{user.name}</Typography>
            <Chip
              label={user.role.replace('_', ' ')}
              color="primary"
              sx={{ textTransform: 'capitalize', mb: 2 }}
            />
            {user.role === 'service_provider' && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={user.averageRating || 0} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({user.averageRating || '0'})
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Contact Information</Typography>
            <Box sx={{ mb: 3 }}>
              {user.role === 'service_provider' && (
                <>
                  <Typography variant="body1">
                    <strong>Email:</strong> {user.email}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Phone:</strong> {user.phone || 'Not provided'}
                  </Typography>
                </>
              )}
              <Typography variant="body1">
                <strong>Member since:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
            
            {user.role === 'service_provider' && user.specializations && (
              <>
                <Typography variant="h6" gutterBottom>Specializations</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {user.specializations.map((specialization, index) => (
                    <Chip key={index} label={specialization} />
                  ))}
                </Box>
              </>
            )}
          </Grid>
          
          {user.role === 'service_provider' && user.ratings && user.ratings.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Reviews</Typography>
              <List>
                {user.ratings.map((review, index) => (
                  <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1">{review.fromUser?.name || 'Customer'}</Typography>
                          <Rating value={review.rating} readOnly size="small" sx={{ ml: 2 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {new Date(review.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                      secondary={review.review}
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

export default UserProfile; 