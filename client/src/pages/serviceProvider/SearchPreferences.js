import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, Chip, FormControlLabel, Switch, Stack } from '@mui/material';

const SearchPreferences = () => {
  const [preferences, setPreferences] = useState({
    categories: ['Plumbing', 'Electrical'],
    locations: ['New York', 'Boston'],
    keywords: ['urgent', 'weekend'],
    emailNotifications: true
  });
  
  const availableCategories = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Roofing', 
    'HVAC', 'Landscaping', 'Cleaning', 'Appliance Repair', 'Other'
  ];

  const handleCategoryChange = (event) => {
    setPreferences({
      ...preferences,
      categories: event.target.value
    });
  };

  const handleLocationChange = (event) => {
    const value = event.target.value;
    if (value.trim() !== '') {
      setPreferences({
        ...preferences,
        locations: [...preferences.locations, value]
      });
      event.target.value = '';
    }
  };

  const handleKeywordChange = (event) => {
    const value = event.target.value;
    if (value.trim() !== '' && event.key === 'Enter') {
      setPreferences({
        ...preferences,
        keywords: [...preferences.keywords, value]
      });
      event.target.value = '';
      event.preventDefault();
    }
  };

  const handleNotificationChange = () => {
    setPreferences({
      ...preferences,
      emailNotifications: !preferences.emailNotifications
    });
  };

  const removeLocation = (location) => {
    setPreferences({
      ...preferences,
      locations: preferences.locations.filter(loc => loc !== location)
    });
  };

  const removeKeyword = (keyword) => {
    setPreferences({
      ...preferences,
      keywords: preferences.keywords.filter(kw => kw !== keyword)
    });
  };

  const handleSave = () => {
    console.log('Saving preferences:', preferences);
    // API call would go here
    alert('Preferences saved!');
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Search Preferences
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Customize Your Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Set your preferences to receive notifications about new listings that match your skills and interests.
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="categories-label">Categories</InputLabel>
            <Select
              labelId="categories-label"
              multiple
              value={preferences.categories}
              onChange={handleCategoryChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {availableCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography variant="subtitle1" gutterBottom>
            Preferred Locations
          </Typography>
          <TextField
            fullWidth
            label="Add Location"
            placeholder="Type and press Enter"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLocationChange(e);
              }
            }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {preferences.locations.map((location) => (
              <Chip
                key={location}
                label={location}
                onDelete={() => removeLocation(location)}
              />
            ))}
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Keywords
          </Typography>
          <TextField
            fullWidth
            label="Add Keyword"
            placeholder="Type and press Enter"
            onKeyPress={handleKeywordChange}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {preferences.keywords.map((keyword) => (
              <Chip
                key={keyword}
                label={keyword}
                onDelete={() => removeKeyword(keyword)}
              />
            ))}
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={preferences.emailNotifications}
                onChange={handleNotificationChange}
              />
            }
            label="Receive email notifications for matching listings"
          />
        </Box>
        
        <Button
          variant="contained"
          onClick={handleSave}
        >
          Save Preferences
        </Button>
      </Paper>
    </Container>
  );
};

export default SearchPreferences; 