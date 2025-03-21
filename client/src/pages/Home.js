import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from '@mui/material';
import { Build, ElectricBolt, Plumbing, Carpenter } from '@mui/icons-material';

const services = [
  {
    title: 'Electrical Repair',
    icon: <ElectricBolt sx={{ fontSize: 40 }} />,
    description: 'Professional electrical repair and installation services',
  },
  {
    title: 'Plumbing',
    icon: <Plumbing sx={{ fontSize: 40 }} />,
    description: 'Expert plumbing repair and maintenance services',
  },
  {
    title: 'Appliance Repair',
    icon: <Build sx={{ fontSize: 40 }} />,
    description: 'Repair services for all home appliances',
  },
  {
    title: 'Carpentry',
    icon: <Carpenter sx={{ fontSize: 40 }} />,
    description: 'Custom carpentry and furniture repair services',
  },
];

function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            Your Trusted Repair Service
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mb: 4 }}>
            Professional repairs for your home and business needs
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mr: 2 }}
          >
            Book a Service
          </Button>
          <Button variant="outlined" color="inherit" size="large">
            Learn More
          </Button>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Our Services
        </Typography>
        <Grid container spacing={4}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={3} key={service.title}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    transition: 'transform 0.3s ease-in-out',
                  },
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  }}
                >
                  {service.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
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
    </Box>
  );
}

export default Home; 