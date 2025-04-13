import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Box, TextField, Button, Alert, CircularProgress, MenuItem } from '@mui/material';
import { listingService } from '../../services/api';

const repairCategories = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Appliance',
  'Heating & Cooling',
  'Painting',
  'Roofing',
  'Landscaping',
  'Flooring',
  'Other'
];

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: ''
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await listingService.getListingById(id);
        const listing = response.data;
        setFormData({
          title: listing.title,
          description: listing.description,
          category: listing.category,
          location: listing.location,
          budget: listing.budget
        });
      } catch (err) {
        setError('Failed to fetch listing details');
        console.error('Error fetching listing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await listingService.updateListing(id, formData);
      navigate('/my-listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Listing
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            required
          />
          
          <TextField
            fullWidth
            select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            margin="normal"
            required
          >
            {repairCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Budget"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={handleChange}
            margin="normal"
            InputProps={{ inputProps: { min: 0 } }}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              Update Listing
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/my-listings')}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditListing; 