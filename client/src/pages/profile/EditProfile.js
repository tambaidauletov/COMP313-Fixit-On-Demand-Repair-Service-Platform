import React, { useState, useContext, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Avatar, 
  IconButton, 
  Alert,
  CircularProgress
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { Avatar as MuiAvatar } from '@mui/material';
import CustomAvatar from '../../components/Avatar';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageBlob, setImageBlob] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = React.useRef(null);
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);
  
  useEffect(() => {
    const loadImage = async () => {
      if (user?.avatar) {
        try {
          const filename = user.avatar.split('/').pop();
          console.log('Loading image:', filename);
          const response = await authService.getImage(filename);
          
          if (response.status === 200) {
            const blob = new Blob([response.data], { 
              type: response.headers['content-type'] 
            });
            const imageUrl = URL.createObjectURL(blob);
            console.log('Image loaded successfully:', imageUrl);
            setImageUrl(imageUrl);
            setImageError(false);
          } else {
            throw new Error(`Failed to load image: ${response.status}`);
          }
        } catch (error) {
          console.error('Error loading image:', error);
          setImageError(true);
        }
      }
    };

    loadImage();

    return () => {
      // Cleanup
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [user?.avatar]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      console.log('Selected file:', file);
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      if (formData.phone) formDataToSend.append('phone', formData.phone);
      if (formData.address) formDataToSend.append('address', formData.address);
      
      if (formData.currentPassword && formData.newPassword) {
        formDataToSend.append('currentPassword', formData.currentPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }
      
      if (avatarFile) {
        console.log('Appending avatar file:', avatarFile);
        formDataToSend.append('avatar', avatarFile);
      }

      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'avatar' ? 'File' : pair[1]));
      }

      const updatedUser = await updateProfile(formDataToSend);
      console.log('Profile updated:', updatedUser);
      
      setSuccess('Profile updated successfully');
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    console.error('Image load error. URL:', imageUrl);
    setImageError(true);
    setAvatarPreview('');
  };

  if (!user) {
    return <Typography>Loading profile...</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Profile
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} encType="multipart/form-data">
          <Grid container spacing={3}>
            <Grid item xs={12} display="flex" justifyContent="center" mb={2}>
              <Box position="relative">
                {previewFile ? (
                  <Avatar
                    src={URL.createObjectURL(previewFile)}
                    alt="Preview"
                    sx={{ width: 100, height: 100 }}
                  />
                ) : (
                  <CustomAvatar 
                    user={user} 
                    size={100} 
                    onClick={() => fileInputRef.current?.click()} 
                  />
                )}
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'white'
                  }}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleAvatarChange}
                    name="avatar"
                    ref={fileInputRef}
                  />
                  <PhotoCamera />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Change Password
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Profile'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/profile')}
                disabled={loading}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Box>
        {process.env.NODE_ENV === 'development' && (
          <Box mt={2}>
            <Typography variant="caption" display="block">
              Debug Info:
            </Typography>
            <Typography variant="caption" display="block">
              Image URL: {imageUrl}
            </Typography>
            <Typography variant="caption" display="block">
              Avatar from user: {user?.avatar}
            </Typography>
            <Button
              size="small"
              onClick={() => {
                fetch(`${process.env.REACT_APP_API_URL}/api/debug/files`)
                  .then(res => res.json())
                  .then(files => {
                    console.log('GridFS files:', files);
                  });
              }}
            >
              Check GridFS Files
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default EditProfile; 