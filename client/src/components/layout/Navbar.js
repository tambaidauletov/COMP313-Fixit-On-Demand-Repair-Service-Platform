import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import { Message } from '@mui/icons-material';
import { Badge, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Button
        component={Link}
        to="/messages"
        color="inherit"
        startIcon={<EmailIcon />}
      >
        Messages
      </Button>
      <IconButton color="inherit" onClick={() => navigate('/inbox')}>
        <Badge badgeContent={0} color="secondary">
          <Message />
        </Badge>
      </IconButton>
    </div>
  );
};

export default Navbar; 