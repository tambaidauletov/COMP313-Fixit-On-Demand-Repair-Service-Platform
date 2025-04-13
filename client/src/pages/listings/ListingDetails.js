import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Divider,
  Avatar,
  Rating,
  Card,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogContent,
  TextField
} from '@mui/material';
import {
  LocationOn,
  Category,
  AttachMoney,
  Event,
  Message,
  Check,
  Report
} from '@mui/icons-material';
import { format } from 'date-fns';
import { AuthContext } from '../../context/AuthContext';
import { listingService, messageService, reportService, serviceProviderService } from '../../services/api';
import AlertMessage from '../../components/ui/AlertMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ListingDetails = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchListing = async () => {
    try {
      const res = await listingService.getListingById(id);
      setListing(res.data);
    } catch (err) {
      console.error('Error fetching listing:', err);
      setAlertMessage('Error loading listing details');
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      console.log('Sending initial message to listing creator');
      await messageService.sendMessage({
        recipient: listing.creator._id,
        listingId: listing._id,
        content: message
      });

      setMessage('');
      setMessageDialogOpen(false);
      setAlertMessage('Message sent successfully! Check your messages to continue the conversation.');
      setAlertSeverity('success');
      setAlertOpen(true);

      // Redirect to messages page after a short delay
      setTimeout(() => {
        navigate('/messages');
      }, 2000);
    } catch (err) {
      console.error('Error sending message:', err);
      setAlertMessage('Failed to send message. Please try again.');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleReportListing = async () => {
    if (!reportReason.trim()) return;

    try {
      await reportService.createReport({
        contentType: 'listing',
        contentId: listing._id,
        reason: reportReason
      });

      setReportReason('');
      setReportDialogOpen(false);
      setAlertMessage('Listing reported successfully');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage('Failed to report listing');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleMarkAsSolved = async () => {
    try {
      const res = await listingService.markAsSolved(id);
      setListing(res.data);
      setAlertMessage('Listing marked as solved');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage('Failed to mark listing as solved');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating) return;
    
    setSubmitLoading(true);
    try {
      await serviceProviderService.submitReview({
        providerId: listing.serviceProvider?._id,
        listingId: listing._id,
        rating,
        review
      });
      
      setSuccessMessage('Review submitted successfully!');
      setRating(0);
      setReview('');
      
      // Refresh listing data to show the review
      fetchListing();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!listing) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <AlertMessage
          severity="error"
          message="Listing not found"
        />
        <Button
          variant="contained"
          onClick={() => navigate('/listings')}
          sx={{ mt: 2 }}
        >
          Back to Listings
        </Button>
      </Container>
    );
  }

  const isOwner = user && listing.creator._id === user._id;
  const canContact = isAuthenticated && !isOwner && user?.role === 'service_provider';
  const canSolve = isOwner && listing.status === 'open';

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {alertOpen && (
        <AlertMessage
          severity={alertSeverity}
          message={alertMessage}
          onClose={() => setAlertOpen(false)}
        />
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Listing Images */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              {listing.images && listing.images.length > 0 ? (
                <>
                  <Card sx={{ mb: 2 }}>
                    <CardMedia
                      component="img"
                      height="300"
                      image={listing.images[0]}
                      alt={listing.title}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedImage(listing.images[0]);
                        setImageDialogOpen(true);
                      }}
                    />
                  </Card>
                  {listing.images.length > 1 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {listing.images.slice(1).map((image, index) => (
                        <Box
                          key={index}
                          component="img"
                          src={image}
                          alt={`Image ${index + 2}`}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setSelectedImage(image);
                            setImageDialogOpen(true);
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    height: 300,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary">
                    No images available
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Listing Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="h1">
                {listing.title}
              </Typography>
              <Chip
                label={listing.status.replace('_', ' ')}
                color={
                  listing.status === 'solved'
                    ? 'success'
                    : listing.status === 'open'
                    ? 'primary'
                    : 'default'
                }
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">{listing.location}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Category color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">{listing.category}</Typography>
            </Box>

            {listing.budget > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">${listing.budget}</Typography>
              </Box>
            )}

            {listing.deadline && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Event color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Deadline: {format(new Date(listing.deadline), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {listing.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* User Info */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={listing.creator.avatar}
                alt={listing.creator.name}
                sx={{ width: 56, height: 56, mr: 2 }}
              />
              <Box>
                <Typography variant="subtitle1">
                  Posted by {listing.creator.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating
                    value={listing.creator.averageRating || 0}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({listing.creator.averageRating || 0})
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Posted on {format(new Date(listing.createdAt), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {canContact && (
                <Button
                  variant="contained"
                  startIcon={<Message />}
                  fullWidth
                  onClick={() => setMessageDialogOpen(true)}
                >
                  Contact
                </Button>
              )}

              {canSolve && (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<Check />}
                  fullWidth
                  onClick={handleMarkAsSolved}
                >
                  Mark as Solved
                </Button>
              )}

              {isAuthenticated && !isOwner && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Report />}
                  fullWidth
                  onClick={() => setReportDialogOpen(true)}
                >
                  Report
                </Button>
              )}

              {isOwner && listing.status === 'open' && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(`/edit-listing/${listing._id}`)}
                >
                  Edit
                </Button>
              )}
            </Box>

            {listing.isCompleted && user && user.role === 'customer' && listing.userId === user.id && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Rate Service Provider
                </Typography>
                
                <Paper sx={{ p: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    How would you rate {listing.serviceProvider?.name || 'the service provider'}?
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating
                      name="rating"
                      value={rating}
                      onChange={(event, newValue) => {
                        setRating(newValue);
                      }}
                      precision={0.5}
                    />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      {rating || 0}/5
                    </Typography>
                  </Box>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Your Review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  
                  <Button 
                    variant="contained" 
                    color="primary"
                    disabled={!rating || submitLoading}
                    onClick={handleSubmitReview}
                  >
                    {submitLoading ? <CircularProgress size={24} /> : 'Submit Review'}
                  </Button>
                </Paper>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Message Dialog */}
      <Dialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Send Message to {listing.creator.name}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setMessageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              Send
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Report Listing
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Please explain why you're reporting this listing..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setReportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleReportListing}
              disabled={!reportReason.trim()}
            >
              Submit Report
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="lg"
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Enlarged view"
              style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ListingDetails; 