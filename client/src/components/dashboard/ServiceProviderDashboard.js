import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { Line, Doughnut } from 'react-chartjs-2';
import { users } from '../../services/api';

const ServiceProviderDashboard = () => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedJobs: 0,
    averageRating: 0,
    activeListings: 0
  });

  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await users.getDashboard();
        setStats(response.data.stats);
        setRevenueData(response.data.revenueData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Earnings</Typography>
            <Typography variant="h4">${stats.totalEarnings}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Completed Jobs</Typography>
            <Typography variant="h4">{stats.completedJobs}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Average Rating</Typography>
            <Typography variant="h4">{stats.averageRating.toFixed(1)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Active Listings</Typography>
            <Typography variant="h4">{stats.activeListings}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Revenue Over Time</Typography>
            <Line data={revenueData} options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Job Categories</Typography>
            <Doughnut data={stats.categoryData} options={{
              responsive: true,
              maintainAspectRatio: false
            }} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServiceProviderDashboard; 