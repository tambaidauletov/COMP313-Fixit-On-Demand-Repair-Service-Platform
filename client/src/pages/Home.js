import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Service cards data
const services = [
  {
    title: 'Electrical Repair',
    description: 'Professional electrical repair and installation services',
    icon: '⚡',
    image: '/images/electrical.jpg'
  },
  {
    title: 'Plumbing',
    description: 'Expert plumbing repair and maintenance services',
    icon: '🔧',
    image: '/images/plumbing.jpg'
  },
  {
    title: 'Appliance Repair',
    description: 'Repair services for all home appliances',
    icon: '🔨',
    image: '/images/appliance.jpg'
  },
  {
    title: 'Carpentry',
    description: 'Custom carpentry and furniture repair services',
    icon: '🪚',
    image: '/images/carpentry.jpg'
  }
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAction = () => {
    if (!user) {
      navigate('/register');
    } else {
      switch (user.role) {
        case 'client':
          navigate('/client/dashboard');
          break;
        case 'provider':
          navigate('/provider/dashboard');
          break;
        case 'manager':
          navigate('/manager/dashboard');
          break;
        case 'moderator':
          navigate('/moderator/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  fontSize: isMobile ? '2.5rem' : '3.5rem'
                }}
              >
                Your Trusted Repair Service
              </Typography>
              <Typography
                variant="h5"
                sx={{ mb: 4, opacity: 0.9 }}
              >
                Professional repairs for your home and business needs
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={handleAction}
                sx={{
                  mr: 2,
                  px: 4,
                  py: 1.5
                }}
              >
                {!user ? 'Get Started' : 'Go to Dashboard'}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => navigate('/about')}
                sx={{
                  px: 4,
                  py: 1.5
                }}
              >
                Learn More
              </Button>
            </Grid>
            {!isMobile && (
              <Grid item md={6}>
                <Box
                  component="img"
                  src="/images/hero.jpg"
                  alt="Repair Service"
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    boxShadow: 3
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Our Services
        </Typography>
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
                <CardMedia
                  component="div"
                  sx={{
                    pt: '56.25%',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem'
                  }}
                >
                  {service.icon}
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3">
                    {service.title}
                  </Typography>
                  <Typography>
                    {service.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'grey.100',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" gutterBottom>
                Ready to get started?
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                Join our platform today and experience hassle-free repair services.
              </Typography>
              {!user ? (
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ mr: 2 }}
                  >
                    Sign Up Now
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 