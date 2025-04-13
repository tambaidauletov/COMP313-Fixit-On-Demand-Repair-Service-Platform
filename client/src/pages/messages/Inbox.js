import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Badge,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  FiberManualRecord as UnreadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { messageService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import AlertMessage from '../../components/ui/AlertMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await messageService.getConversations();
        setConversations(res.data);
        setFilteredConversations(res.data);
      } catch (err) {
        setAlertMessage('Failed to load conversations');
        setAlertSeverity('error');
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredConversations(
        conversations.filter(
          (conv) =>
            conv.withUser.name.toLowerCase().includes(query) ||
            conv.listing.title.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, conversations]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getFilteredByTab = () => {
    if (activeTab === 0) {
      return filteredConversations;
    }
    // Filter by unread
    if (activeTab === 1) {
      return filteredConversations.filter(
        (conv) => conv.unreadCount > 0
      );
    }
    // Filter by listing status
    return filteredConversations.filter(
      (conv) => conv.listing.status === (activeTab === 2 ? 'open' : 'solved')
    );
  };

  const displayedConversations = getFilteredByTab();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Inbox
        </Typography>

        {alertOpen && (
          <AlertMessage
            severity={alertSeverity}
            message={alertMessage}
            onClose={() => setAlertOpen(false)}
          />
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="inbox tabs"
          >
            <Tab label="All" />
            <Tab label="Unread" />
            <Tab label="Open Listings" />
            <Tab label="Solved Listings" />
          </Tabs>
        </Box>

        {displayedConversations.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary">
              {searchQuery.trim() !== ''
                ? 'No conversations match your search'
                : activeTab === 1
                ? 'No unread messages'
                : 'No conversations found'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {displayedConversations.map((conversation, index) => (
              <React.Fragment key={conversation._id}>
                <ListItem
                  alignItems="flex-start"
                  button
                  onClick={() => navigate(`/messages/${conversation._id}`)}
                  sx={{
                    bgcolor: conversation.unreadCount > 0 ? 'action.hover' : 'transparent',
                    py: 2,
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        conversation.unreadCount > 0 ? (
                          <UnreadIcon
                            fontSize="small"
                            color="primary"
                          />
                        ) : null
                      }
                    >
                      <Avatar
                        alt={conversation.withUser.name}
                        src={conversation.withUser.avatar}
                      />
                    </Badge>
                  </ListItemAvatar>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={8}>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            fontWeight={conversation.unreadCount > 0 ? 'bold' : 'normal'}
                          >
                            {conversation.withUser.name}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              variant="body2"
                              color="text.primary"
                              noWrap
                              sx={{ maxWidth: '200px' }}
                            >
                              {conversation.lastMessage.content}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              Re: {conversation.listing.title}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
                      <Typography variant="caption" color="text.secondary">
                        {format(
                          new Date(conversation.lastMessage.createdAt),
                          'MMM dd, yyyy · HH:mm'
                        )}
                      </Typography>
                      <Box display="flex" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }} mt={1}>
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: conversation.listing.status === 'solved'
                              ? 'success.light'
                              : 'primary.light',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          {conversation.listing.status === 'solved' ? 'Solved' : 'Open'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </ListItem>
                {index < displayedConversations.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default Inbox; 