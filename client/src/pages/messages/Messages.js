import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Send as SendIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { messageService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import { format } from 'date-fns';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await messageService.getConversations();
        setConversations(response.data);
      } catch (err) {
        setError('Failed to load conversations');
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

      try {
        const response = await messageService.getMessages(selectedConversation._id);
        setMessages(response.data);
      } catch (err) {
        setError('Failed to load messages');
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await messageService.sendMessage({
        conversationId: selectedConversation._id,
        content: newMessage
      });

      // Add new message to the list
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const formatMessageTime = (date) => {
    return format(new Date(date), 'MMM d, h:mm a');
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={2} sx={{ height: '70vh' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              Conversations
            </Typography>
            <List>
              {conversations.map((conversation) => (
                <ListItem
                  key={conversation._id}
                  button
                  selected={selectedConversation?._id === conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <ListItemAvatar>
                    <Avatar src={conversation.otherUser.avatar}>
                      {conversation.otherUser.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conversation.otherUser.name}
                    secondary={conversation.lastMessage?.content || 'No messages yet'}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Messages */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Message Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    sx={{ display: { md: 'none' }, mr: 1 }}
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Avatar src={selectedConversation.otherUser.avatar} sx={{ mr: 2 }}>
                    {selectedConversation.otherUser.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h6">
                    {selectedConversation.otherUser.name}
                  </Typography>
                </Box>

                {/* Messages List */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  {messages.map((message) => (
                    <Box
                      key={message._id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender === user._id ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          backgroundColor: message.sender === user._id ? 'primary.main' : 'grey.200',
                          color: message.sender === user._id ? 'white' : 'text.primary',
                          borderRadius: 2,
                          p: 2
                        }}
                      >
                        <Typography variant="body1">{message.content}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
                          {formatMessageTime(message.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Grid container spacing={2}>
                    <Grid item xs>
                      <TextField
                        fullWidth
                        placeholder="Type a message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <Button
                        variant="contained"
                        endIcon={<SendIcon />}
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        Send
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </>
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Typography variant="h6" color="text.secondary">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Messages; 