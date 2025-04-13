import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Box, 
  Paper,
  Grid
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import AlertMessage from '../../components/ui/AlertMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Log the credentials being sent
      console.log('Attempting login with:', {
        email: formData.email,
        password: formData.password
      });

      const userData = await login(formData);
      
      if (userData.token) {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect based on user role
        if (userData.role === 'service_provider') {
          navigate('/service-provider/dashboard');
        } else if (userData.role === 'admin' || userData.role === 'manager') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setAlertMessage(err.response?.data?.msg || 'Login failed. Please check your credentials.');
      setAlertOpen(true);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Sign In
        </Typography>
        
        {alertOpen && (
          <AlertMessage
            severity="error"
            message={alertMessage}
            onClose={() => setAlertOpen(false)}
          />
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          
          <Grid container>
            <Grid item xs>
              <Button 
                variant="text" 
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="text" 
                onClick={() => navigate('/register')}
              >
                Don't have an account? Sign Up
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 