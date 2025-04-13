import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Box, 
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import AlertMessage from '../../components/ui/AlertMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');

  const { register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setAlertMessage('Passwords do not match');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }

    try {
      // Call register from AuthContext
      const userData = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      // Redirect based on role
      if (userData.role === 'service_provider') {
        navigate('/service-provider/dashboard');
      } else if (userData.role === 'customer') {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (err) {
      setAlertMessage(err.response?.data?.message || 'Registration failed');
      setAlertSeverity('error');
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
          Create an Account
        </Typography>
        
        {alertOpen && (
          <AlertMessage
            severity={alertSeverity}
            message={alertMessage}
            onClose={() => setAlertOpen(false)}
          />
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">Account Type</FormLabel>
            <RadioGroup
              row
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <FormControlLabel
                value="customer"
                control={<Radio />}
                label="Customer"
              />
              <FormControlLabel
                value="service_provider"
                control={<Radio />}
                label="Service Provider"
              />
            </RadioGroup>
          </FormControl>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
          
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button 
                variant="text" 
                onClick={() => navigate('/login')}
              >
                Already have an account? Sign in
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 