import React from 'react';
import { Alert, AlertTitle, Collapse } from '@mui/material';

const AlertMessage = ({ severity, title, message, onClose, open = true }) => {
  return (
    <Collapse in={open}>
      <Alert severity={severity} onClose={onClose}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Collapse>
  );
};

export default AlertMessage; 