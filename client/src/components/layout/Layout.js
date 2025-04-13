import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  CssBaseline,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Container,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Dashboard,
  Build,
  Description,
  Message,
  Person,
  Settings,
  AdminPanelSettings,
  Login,
  Logout,
  SupervisorAccount,
  AddCircle,
  Notifications
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import CustomAvatar from '../Avatar';

// Drawer width
const drawerWidth = 240;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const { user, isAuthenticated, logout, isAdmin, isManager, isModerator, isServiceProvider, isCustomer } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    // Common items for all authenticated users
    const commonItems = [
      { text: 'Home', icon: <Home />, path: '/' },
      { text: 'All Listings', icon: <Description />, path: '/listings' },
    ];

    // Customer specific items
    const customerItems = [
      { text: 'My Listings', icon: <Description />, path: '/my-listings' },
      { text: 'Create Listing', icon: <AddCircle />, path: '/create-listing' },
    ];

    // Service Provider specific items
    const serviceProviderItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/service-provider/dashboard' },
      { text: 'Qualifications', icon: <Build />, path: '/service-provider/qualifications' },
      { text: 'Search Preferences', icon: <Settings />, path: '/service-provider/preferences' },
    ];

    // Admin specific items
    const adminItems = [
      { text: 'Admin Dashboard', icon: <AdminPanelSettings />, path: '/admin/dashboard' },
      { text: 'User Management', icon: <Person />, path: '/admin/users' },
      { text: 'Reports', icon: <SupervisorAccount />, path: '/admin/reports' },
    ];

    // Build the navigation based on user role
    let navigationItems = [...commonItems];

    if (isAuthenticated) {
      navigationItems.push({ text: 'Inbox', icon: <Message />, path: '/inbox' });
      
      if (isCustomer) {
        navigationItems = [...navigationItems, ...customerItems];
      } else if (isServiceProvider) {
        navigationItems = [...navigationItems, ...serviceProviderItems];
      } else if (isAdmin || isManager || isModerator) {
        navigationItems = [...navigationItems, ...adminItems];
      }
    }

    return navigationItems;
  };

  const navigationItems = getNavigationItems();

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
            }}
          >
            Fixit
          </Typography>

          {isAuthenticated ? (
            <>
              <IconButton color="inherit" onClick={() => navigate('/inbox')}>
                <Badge badgeContent={0} color="secondary">
                  <Message />
                </Badge>
              </IconButton>
              <IconButton color="inherit">
                <Badge badgeContent={0} color="secondary">
                  <Notifications />
                </Badge>
              </IconButton>
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ ml: 1 }}
              >
                <CustomAvatar
                  user={user}
                  size={32}
                  onClick={handleProfileMenuOpen}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    handleProfileMenuClose();
                    navigate('/profile');
                  }}
                >
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleProfileMenuClose();
                    navigate('/edit-profile');
                  }}
                >
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                startIcon={<Login />}
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/register"
                variant="outlined"
                sx={{ ml: 1 }}
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 