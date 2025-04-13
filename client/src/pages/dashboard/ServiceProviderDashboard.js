import React from 'react';
import { Container, Typography, Grid, Paper, Box, Card, CardContent, List, ListItem, ListItemText, Divider } from '@mui/material';

const ServiceProviderDashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Service Provider Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Earnings
              </Typography>
              <Typography variant="h3" color="primary">
                $1,250
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Jobs Completed
              </Typography>
              <Typography variant="h3" color="primary">
                8
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Rating
              </Typography>
              <Typography variant="h3" color="primary">
                4.7
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Messages */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Messages
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Jane Smith"
                  secondary="Can you come check the sink tomorrow?"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Mike Johnson"
                  secondary="Thanks for the quick repair!"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Recent Listings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recommended Listings
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Leaky Faucet Repair"
                  secondary="Downtown - Plumbing - $150"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Electrical Outlet Installation"
                  secondary="Uptown - Electrical - $200"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Bathroom Sink Replacement"
                  secondary="Midtown - Plumbing - $300"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Calendar Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Schedule
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body1" align="center" color="text.secondary">
                This is a placeholder for a calendar view that would show upcoming appointments.
                In a complete implementation, this would be integrated with a calendar component.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ServiceProviderDashboard; 