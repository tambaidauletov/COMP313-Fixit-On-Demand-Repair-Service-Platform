import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondary,
  Avatar,
  TextField,
  IconButton,
  Button,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Report as ReportIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { messageService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState('ALL');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      console.log('Conversations response:', response);
      setConversations(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await messageService.getMessages(conversationId);
      setMessages(response.data);
      // Mark conversation as read
      await messageService.markAsRead(conversationId);
      // Update conversations list to reflect read status
      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await messageService.sendMessage({
        conversationId: selectedConversation._id,
        content: newMessage
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleMessageMenu = (event, message) => {
    setSelectedMessage(message);
    setMessageMenuAnchor(event.currentTarget);
  };

  const handleReportMessage = () => {
    setMessageMenuAnchor(null);
    setReportDialogOpen(true);
  };

  const handleSubmitReport = async () => {
    try {
      await messageService.reportMessage(selectedMessage._id, reportReason);
      setReportDialogOpen(false);
      setReportReason('');
      setError('');
      // Show success message
      alert('Message reported successfully');
    } catch (err) {
      console.error('Error reporting message:', err);
      setError('Failed to report message');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredConversations = conversations.filter(conv => {
    switch (tabValue) {
      case 'UNREAD':
        return conv.unreadCount > 0;
      case 'SERVICE_PROVIDERS':
        return conv.participant?.role === 'service_provider';
      case 'CUSTOMERS':
        return conv.participant?.role === 'customer';
      default:
        return true;
    }
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab value="ALL" label="All" />
          <Tab value="UNREAD" label="Unread" />
          <Tab value="SERVICE_PROVIDERS" label="Service Providers" />
          <Tab value="CUSTOMERS" label="Customers" />
        </Tabs>
      </Paper>

      <Grid container spacing={2}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '70vh', overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredConversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No conversations found
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredConversations.map((conversation) => (
                  <React.Fragment key={conversation._id}>
                    <ListItem
                      button
                      selected={selectedConversation?._id === conversation._id}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conversation.unreadCount}
                          color="primary"
                          invisible={!conversation.unreadCount}
                        >
                          <Avatar src={conversation.participant?.avatar} />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography>
                            {conversation.participant?.name}
                            <Typography
                              component="span"
                              variant="caption"
                              color="textSecondary"
                              sx={{ ml: 1 }}
                            >
                              ({conversation.participant?.role === 'service_provider' ? 'Service Provider' : 'Customer'})
                            </Typography>
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="textPrimary"
                            >
                              {conversation.listing?.title}
                            </Typography>
                            {conversation.lastMessage && (
                              <Typography
                                component="span"
                                variant="body2"
                                color="textSecondary"
                              >
                                {` — ${conversation.lastMessage.content.substring(0, 30)}...`}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Messages */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">
                    {selectedConversation.participant?.name}
                    <Typography
                      component="span"
                      variant="body2"
                      color="textSecondary"
                      sx={{ ml: 1 }}
                    >
                      ({selectedConversation.participant?.role === 'service_provider' ? 'Service Provider' : 'Customer'})
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedConversation.listing?.title}
                  </Typography>
                </Box>

                {/* Messages List */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  {messages.map((message) => (
                    <Box
                      key={message._id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender._id === user._id ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          backgroundColor: message.sender._id === user._id ? 'primary.main' : 'grey.200',
                          color: message.sender._id === user._id ? 'white' : 'text.primary',
                          borderRadius: 2,
                          p: 2,
                          position: 'relative'
                        }}
                      >
                        {message.sender._id !== user._id && (
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0
                            }}
                            onClick={(e) => handleMessageMenu(e, message)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                        <Typography variant="body1">
                          {message.content}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                          {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Message Input */}
                <Box
                  component="form"
                  onSubmit={handleSendMessage}
                  sx={{
                    p: 2,
                    backgroundColor: 'background.default',
                    borderTop: 1,
                    borderColor: 'divider'
                  }}
                >
                  <Grid container spacing={1}>
                    <Grid item xs>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                    </Grid>
                    <Grid item>
                      <IconButton
                        color="primary"
                        type="submit"
                        disabled={!newMessage.trim()}
                      >
                        <SendIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography color="textSecondary">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Message Menu */}
      <Menu
        anchorEl={messageMenuAnchor}
        open={Boolean(messageMenuAnchor)}
        onClose={() => setMessageMenuAnchor(null)}
      >
        <MenuItem onClick={handleReportMessage}>
          <ListItemIcon>
            <FlagIcon fontSize="small" />
          </ListItemIcon>
          Report Message
        </MenuItem>
      </Menu>

      {/* Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Report Message
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for reporting"
            fullWidth
            multiline
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReport}
            color="primary"
            disabled={!reportReason.trim()}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Inbox; 