import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CloudUpload } from '@mui/icons-material';
import { listingService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import AlertMessage from '../../components/ui/AlertMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Categories for repair services
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

const CreateListing = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    deadline: null,
    images: []
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      deadline: date
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      
      // Set files to formData as well
      setFormData({
        ...formData,
        images: selectedFiles
      });
      
      // Create previews
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Add proper validation before submission
      if (!formData.title || !formData.description || !formData.category || !formData.location) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Create a new FormData object to properly handle file uploads
      const listingData = {
        ...formData,
        images: files // Use the files state rather than formData.images
      };
      
      // Submit the listing
      await listingService.createListing(listingData);
      setSuccess('Listing created successfully!');
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        navigate('/my-listings');
      }, 2000);
    } catch (err) {
      console.error("Error creating listing:", err);
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Repair Request
        </Typography>
        
        {error && <AlertMessage severity="error" message={error} />}
        {success && <AlertMessage severity="success" message={success} />}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                name="title"
                label="Title"
                placeholder="e.g., Leaking kitchen faucet"
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={4}
                placeholder="Describe the issue in detail"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {repairCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="location"
                name="location"
                label="Location"
                placeholder="e.g., Toronto, ON"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="budget"
                name="budget"
                label="Budget (optional)"
                type="number"
                placeholder="Budget in $"
                InputProps={{ inputProps: { min: 0 } }}
                value={formData.budget}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Deadline (optional)"
                value={formData.deadline}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined'
                  }
                }}
                minDate={new Date()}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ height: 56 }}
              >
                Upload Images (optional)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              <FormHelperText>You can upload up to 5 images</FormHelperText>
            </Grid>
            
            {previews.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Image Previews:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  {previews.map((preview, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={preview}
                      alt={`Preview ${index}`}
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
              >
                Create Listing
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateListing; 