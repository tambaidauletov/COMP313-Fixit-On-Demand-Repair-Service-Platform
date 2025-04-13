import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Report as ReportIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { messageService, listingService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import AlertMessage from '../../components/ui/AlertMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Conversation = () => {
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [listing, setListing] = useState(null);
  
  const messagesEndRef = useRef(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await messageService.getMessages(conversationId);
        setMessages(res.data.messages);
        setConversation(res.data.conversation);
        
        // Fetch listing details
        const listingRes = await listingService.getListingById(res.data.conversation.listing);
        setListing(listingRes.data);
      } catch (err) {
        setAlertMessage('Failed to load conversation');
        setAlertSeverity('error');
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await messageService.sendMessage({
        conversationId,
        content: newMessage
      });
      
      // Add the new message to the list
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      setAlertMessage('Failed to send message');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const openReportDialog = (message) => {
    setSelectedMessage(message);
    setReporting(true);
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;

    try {
      await messageService.reportMessage(selectedMessage._id, reportReason);
      setReporting(false);
      setReportReason('');
      setSelectedMessage(null);
      setAlertMessage('Message reported successfully');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage('Failed to report message');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!conversation || !listing) {
    return (
      <Container maxWidth="md">
        <AlertMessage
          severity="error"
          message="Conversation not found"
        />
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/inbox')}
          sx={{ mt: 2 }}
        >
          Back to Inbox
        </Button>
      </Container>
    );
  }

  const otherUser = conversation.participants.find(p => p._id !== user._id);

  return (
    <Container maxWidth="md">
      {alertOpen && (
        <AlertMessage
          severity={alertSeverity}
          message={alertMessage}
          onClose={() => setAlertOpen(false)}
        />
      )}

      <Paper elevation={3} sx={{ my: 4, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              onClick={() => navigate('/inbox')}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Avatar
              src={otherUser.avatar}
              alt={otherUser.name}
              sx={{ mr: 2 }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">{otherUser.name}</Typography>
              <Typography variant="body2">
                {otherUser.role === 'customer' ? 'Customer' : 'Service Provider'}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<DescriptionIcon />}
              onClick={() => navigate(`/listings/${listing._id}`)}
              sx={{ ml: 2 }}
            >
              View Listing
            </Button>
          </Box>
        </Box>

        <Divider />

        {/* Listing info summary */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {listing.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {listing.category} · {listing.location}
            </Typography>
          </Box>
          <Chip
            label={listing.status}
            color={listing.status === 'solved' ? 'success' : 'primary'}
            size="small"
          />
        </Box>

        <Divider />

        {/* Messages */}
        <Box
          sx={{
            height: 400,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
              }}
            >
              <Typography variant="body1" color="text.secondary">
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.sender._id === user._id;
              
              return (
                <Box
                  key={message._id}
                  sx={{
                    display: 'flex',
                    flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 1
                  }}
                >
                  <Avatar
                    src={message.sender.avatar}
                    alt={message.sender.name}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box
                    sx={{
                      maxWidth: '75%',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isCurrentUser ? 'primary.light' : 'grey.100',
                      color: isCurrentUser ? 'white' : 'inherit',
                      position: 'relative'
                    }}
                  >
                    <Typography variant="body1">{message.content}</Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 1
                      }}
                    >
                      <Typography variant="caption" color={isCurrentUser ? 'inherit' : 'text.secondary'}>
                        {format(new Date(message.createdAt), 'MMM dd, HH:mm')}
                      </Typography>
                      
                      {!isCurrentUser && (
                        <IconButton
                          size="small"
                          onClick={() => openReportDialog(message)}
                          sx={{
                            ml: 1,
                            color: isCurrentUser ? 'inherit' : 'action.active',
                            opacity: 0.7,
                            '&:hover': {
                              opacity: 1
                            }
                          }}
                        >
                          <ReportIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Message input */}
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs>
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                variant="outlined"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSend}
                disabled={!newMessage.trim()}
              >
                Send
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Report dialog */}
      <Dialog open={reporting} onClose={() => setReporting(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Message</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please provide a reason for reporting this message:
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            placeholder="Explain why you're reporting this message..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReporting(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleReport}
            disabled={!reportReason.trim()}
          >
            Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Conversation; 