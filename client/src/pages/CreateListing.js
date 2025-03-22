import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const serviceCategories = [
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Appliance Repair',
  'HVAC',
  'Painting',
  'General Maintenance',
];

const availableTags = [
  '24/7 Available',
  'Emergency Service',
  'Same Day Service',
  'Licensed',
  'Insured',
  'Free Estimates',
  'Senior Discount',
  'Commercial',
  'Residential',
];

function CreateListing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    priceRange: '',
    location: '',
    experience: '',
    tags: [],
    images: [],
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTagsChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
      ...prev,
      tags: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    // Here you would typically upload these files to your server
    // For now, we'll just store them in the state
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.priceRange) newErrors.priceRange = 'Price range is required';
    if (!formData.location) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Here you would typically make an API call to create the listing
      console.log('Submitting listing:', formData);
      
      // Redirect to listings page after successful creation
      navigate('/listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to create listing. Please try again.'
      }));
    }
  };

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Create New Service Listing
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Service Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    {serviceCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <FormHelperText>{errors.category}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Price Range"
                  name="priceRange"
                  placeholder="e.g., $50-100/hr"
                  value={formData.priceRange}
                  onChange={handleChange}
                  error={!!errors.priceRange}
                  helperText={errors.priceRange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={!!errors.location}
                  helperText={errors.location}
                  placeholder="e.g., Toronto, ON"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Service Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Service Tags</InputLabel>
                  <Select
                    multiple
                    value={formData.tags}
                    onChange={handleTagsChange}
                    input={<OutlinedInput label="Service Tags" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {availableTags.map((tag) => (
                      <MenuItem key={tag} value={tag}>
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                >
                  Upload Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                {formData.images.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formData.images.length} images selected
                  </Typography>
                )}
              </Grid>

              {errors.submit && (
                <Grid item xs={12}>
                  <Typography color="error">{errors.submit}</Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/listings')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Create Listing
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default CreateListing; 