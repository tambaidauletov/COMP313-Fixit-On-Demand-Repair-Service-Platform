import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Rating,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Build as BuildIcon,
} from '@mui/icons-material';

const mockListings = [
  {
    id: 1,
    title: 'Electrical Repairs & Installation',
    provider: 'John\'s Electric',
    rating: 4.8,
    reviews: 124,
    location: 'Toronto, ON',
    price: '$50-100/hr',
    image: 'https://source.unsplash.com/random/400x300/?electrician',
    tags: ['Electrical', '24/7 Available', 'Emergency Service']
  },
  {
    id: 2,
    title: 'Plumbing Services',
    provider: 'Pro Plumbers Co.',
    rating: 4.5,
    reviews: 89,
    location: 'Toronto, ON',
    price: '$75-150/hr',
    image: 'https://source.unsplash.com/random/400x300/?plumbing',
    tags: ['Plumbing', 'Emergency Service']
  },
  // Add more mock listings as needed
];

function Listings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceType, setServiceType] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleServiceTypeChange = (event) => {
    setServiceType(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Container maxWidth="lg">
        {/* Search and Filter Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search services..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Service Type</InputLabel>
                <Select
                  value={serviceType}
                  label="Service Type"
                  onChange={handleServiceTypeChange}
                >
                  <MenuItem value="all">All Services</MenuItem>
                  <MenuItem value="electrical">Electrical</MenuItem>
                  <MenuItem value="plumbing">Plumbing</MenuItem>
                  <MenuItem value="carpentry">Carpentry</MenuItem>
                  <MenuItem value="appliance">Appliance Repair</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={handleSortChange}
                >
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="reviews">Most Reviews</MenuItem>
                  <MenuItem value="price_low">Price: Low to High</MenuItem>
                  <MenuItem value="price_high">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Listings Grid */}
        <Grid container spacing={3}>
          {mockListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={listing.image}
                  alt={listing.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {listing.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {listing.provider}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={listing.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({listing.reviews} reviews)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{listing.location}</Typography>
                  </Box>
                  <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                    {listing.price}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {listing.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<BuildIcon />}
                  >
                    Book Service
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Listings; 