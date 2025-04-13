import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Button, TextField, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';

const Qualifications = () => {
  const [qualifications, setQualifications] = useState([
    { id: 1, title: 'Plumbing License', description: 'State certified', isApproved: true },
    { id: 2, title: 'Electrical Certificate', description: 'Level 2 certification', isApproved: false }
  ]);
  
  const [newQualification, setNewQualification] = useState({
    title: '',
    description: ''
  });

  const handleChange = (e) => {
    setNewQualification({
      ...newQualification,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const qualification = {
      id: Date.now(),
      title: newQualification.title,
      description: newQualification.description,
      isApproved: false
    };
    
    setQualifications([...qualifications, qualification]);
    setNewQualification({ title: '', description: '' });
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        My Qualifications
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New Qualification
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Qualification Title"
            name="title"
            value={newQualification.title}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={newQualification.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            required
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Add Qualification
          </Button>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          My Qualifications
        </Typography>
        
        {qualifications.length === 0 ? (
          <Typography color="text.secondary">
            You haven't added any qualifications yet.
          </Typography>
        ) : (
          <List>
            {qualifications.map((qualification, index) => (
              <React.Fragment key={qualification.id}>
                <ListItem
                  secondaryAction={
                    <Chip
                      label={qualification.isApproved ? 'Approved' : 'Pending'}
                      color={qualification.isApproved ? 'success' : 'warning'}
                      size="small"
                    />
                  }
                >
                  <ListItemText
                    primary={qualification.title}
                    secondary={qualification.description}
                  />
                </ListItem>
                {index < qualifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default Qualifications; 