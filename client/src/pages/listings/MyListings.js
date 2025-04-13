import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Grid, 
  Chip, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { listingService } from '../../services/api';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [solveDialogOpen, setSolveDialogOpen] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchMyListings = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching my listings...');
        const response = await listingService.getMyListings();
        console.log('Listings response:', response);
        setListings(response.data);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError(error.response?.data?.message || 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyListings();
  }, []);
  
  const handleCreateListing = () => {
    navigate('/create-listing');
  };
  
  const handleEditListing = (id) => {
    navigate(`/edit-listing/${id}`);
  };
  
  const handleDeleteClick = (listing) => {
    setSelectedListing(listing);
    setDeleteDialogOpen(true);
  };
  
  const handleSolveClick = (listing) => {
    setSelectedListing(listing);
    setSolveDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await listingService.deleteListing(selectedListing._id);
      setListings(listings.filter(listing => listing._id !== selectedListing._id));
      setDeleteDialogOpen(false);
      setSelectedListing(null);
    } catch (error) {
      console.error('Error deleting listing:', error);
      // Handle error
    }
  };
  
  const handleSolveConfirm = async () => {
    try {
      const updatedListing = await listingService.markAsSolved(selectedListing._id);
      setListings(listings.map(listing => 
        listing._id === selectedListing._id 
          ? { ...updatedListing.data }
          : listing
      ));
      setSolveDialogOpen(false);
      setSelectedListing(null);
    } catch (error) {
      console.error('Error marking listing as solved:', error);
      // Handle error
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'primary';
      case 'in_progress': return 'warning';
      case 'solved': return 'success';
      case 'closed': return 'error';
      default: return 'default';
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Listings</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleCreateListing}
        >
          Create New Listing
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : listings.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 5, p: 3, backgroundColor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            You don't have any listings yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create your first listing to start finding service providers.
          </Typography>
          <Button 
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateListing}
          >
            Create Listing
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {listings.map((listing) => (
            <Grid item xs={12} key={listing._id}>
              <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                <CardContent sx={{ flex: '1 1 auto', p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {listing.title}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {listing.description}
                      </Typography>
                    </Box>
                    <Chip 
                      label={listing.status.replace('_', ' ')} 
                      color={getStatusColor(listing.status)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Category
                      </Typography>
                      <Typography variant="body2">
                        {listing.category}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body2">
                        {listing.location}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Budget
                      </Typography>
                      <Typography variant="body2">
                        ${listing.budget}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    Created on {formatDate(listing.createdAt)}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ 
                  p: 2, 
                  borderLeft: { sm: '1px solid rgba(0, 0, 0, 0.12)' },
                  borderTop: { xs: '1px solid rgba(0, 0, 0, 0.12)', sm: 'none' },
                  alignSelf: 'stretch', 
                  display: 'flex', 
                  flexDirection: { xs: 'row', sm: 'column' },
                  justifyContent: { xs: 'center', sm: 'center' },
                  gap: 1
                }}>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => handleEditListing(listing._id)}
                    disabled={listing.status === 'solved' || listing.status === 'closed'}
                    variant="outlined"
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(listing)}
                    color="error"
                    variant="outlined"
                    fullWidth
                  >
                    Delete
                  </Button>
                  {listing.status === 'open' || listing.status === 'in_progress' ? (
                    <Button
                      startIcon={<CheckIcon />}
                      onClick={() => handleSolveClick(listing)}
                      color="success"
                      variant="outlined"
                      fullWidth
                    >
                      Mark as Solved
                    </Button>
                  ) : null}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Listing</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedListing?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Solve Confirmation Dialog */}
      <Dialog
        open={solveDialogOpen}
        onClose={() => setSolveDialogOpen(false)}
      >
        <DialogTitle>Mark as Solved</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark "{selectedListing?.title}" as solved?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSolveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSolveConfirm} color="success" variant="contained">
            Mark as Solved
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyListings; 