import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { messageService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ContactButton = ({ listing }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleContact = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      const response = await messageService.startConversation({
        recipientId: listing.creator._id,
        listingId: listing._id,
        initialMessage: message
      });

      // Navigate to the conversation
      navigate(`/messages/${response.data._id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      // Handle error (show notification, etc.)
    } finally {
      setSending(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
      >
        Contact
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Contact Service Provider</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleContact}
            color="primary"
            disabled={!message.trim() || sending}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ContactButton; 