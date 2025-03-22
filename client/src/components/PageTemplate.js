import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const PageTemplate = ({ title, children }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Box>
          {children || (
            <Typography variant="body1" color="text.secondary">
              This page is under construction.
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default PageTemplate; 