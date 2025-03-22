import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const CustomerDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            My Recent Requests
          </Typography>
          <List>
            {[1, 2, 3].map((item) => (
              <React.Fragment key={item}>
                <ListItem>
                  <ListItemIcon>
                    <BuildIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Repair Request #${item}`}
                    secondary="Status: In Progress"
                  />
                  <Button size="small" onClick={() => navigate('/request/' + item)}>
                    View Details
                  </Button>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => navigate('/create-request')}
          >
            New Repair Request
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate('/browse-services')}
          >
            Browse Services
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );

  const ServiceProviderDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Active Jobs
          </Typography>
          <List>
            {[1, 2, 3].map((item) => (
              <React.Fragment key={item}>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Job #${item}`}
                    secondary="Scheduled for Today"
                  />
                  <Button size="small" onClick={() => navigate('/job/' + item)}>
                    Manage
                  </Button>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Reviews
          </Typography>
          <List>
            {[1, 2].map((item) => (
              <React.Fragment key={item}>
                <ListItem>
                  <ListItemIcon>
                    <StarIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Great service!"
                    secondary="★★★★★ - Customer Name"
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Business Stats
            </Typography>
            <Typography variant="body1">
              Completed Jobs: 45
            </Typography>
            <Typography variant="body1">
              Average Rating: 4.8
            </Typography>
            <Typography variant="body1">
              Active Requests: 3
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={() => navigate('/analytics')}>
              View Full Analytics
            </Button>
          </CardActions>
        </Card>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => navigate('/manage-listings')}
          >
            Manage Services
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<MessageIcon />}
            onClick={() => navigate('/messages')}
          >
            Messages
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        {user?.role === 'service_provider' ? (
          <ServiceProviderDashboard />
        ) : (
          <CustomerDashboard />
        )}
      </Container>
    </Box>
  );
}

export default Dashboard; 