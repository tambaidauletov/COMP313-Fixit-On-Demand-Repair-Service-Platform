import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, CardActionArea, Box, TextField, MenuItem, InputAdornment, Pagination, CircularProgress } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { listingService } from '../../services/api';

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();
  
  // Categories for dropdown
  const categories = [
    'All Categories',
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'Roofing',
    'HVAC',
    'Landscaping',
    'Cleaning',
    'Appliance Repair',
    'Other'
  ];

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = {
          page,
          limit: 6, // Adjust as needed
        };
        
        if (category) params.category = category;
        if (location) params.location = location;
        if (searchTerm) params.search = searchTerm;
        
        const response = await listingService.getListings(params);
        setListings(response.data.listings);
        setTotalPages(response.data.pages);
      } catch (error) {
        console.error('Error fetching listings:', error);
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, [page, category, location, searchTerm]);
  
  const handleListingClick = (id) => {
    navigate(`/listings/${id}`);
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Available Repair Listings
      </Typography>
      
      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((option) => (
                <MenuItem key={option} value={option === 'All Categories' ? '' : option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Downtown"
            />
          </Grid>
        </Grid>
      </Box>
      
      {/* Listings */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : listings.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 5 }}>
          <Typography variant="h6" color="text.secondary">
            No listings found matching your criteria
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {listings.map((listing) => (
              <Grid item key={listing._id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: '0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardActionArea onClick={() => handleListingClick(listing._id)}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={listing.images[0] || 'https://via.placeholder.com/300x160?text=No+Image'}
                      alt={listing.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2" noWrap>
                        {listing.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {listing.description.substring(0, 80)}...
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="primary">
                          ${listing.budget}
                        </Typography>
                        <Typography variant="body2">
                          {listing.location}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {listing.category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default Listings; 