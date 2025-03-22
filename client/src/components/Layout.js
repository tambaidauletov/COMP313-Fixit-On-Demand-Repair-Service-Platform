import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleCloseUserMenu();
  };

  const getNavItems = () => {
    if (!user) return [];

    if (user.role === 'client') {
      return [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'My Requests', path: '/my-requests' },
        { label: 'New Request', path: '/create-request' },
      ];
    }

    if (user.role === 'provider') {
      return [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Available Jobs', path: '/available-requests' },
        { label: 'My Jobs', path: '/my-jobs' },
      ];
    }

    return [];
  };

  // Check if current route is allowed for user's role
  const isRouteAllowed = (path) => {
    if (!user) return true; // Allow public routes
    
    const clientRoutes = ['/dashboard', '/my-requests', '/create-request'];
    const providerRoutes = ['/dashboard', '/available-requests', '/my-jobs'];
    
    if (user.role === 'client' && providerRoutes.includes(path)) {
      return false;
    }
    
    if (user.role === 'provider' && clientRoutes.includes(path)) {
      return false;
    }
    
    return true;
  };

  // Redirect if current route is not allowed
  React.useEffect(() => {
    if (!isRouteAllowed(location.pathname)) {
      navigate('/dashboard');
    }
  }, [location.pathname, user]);

  const navItems = getNavItems();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo/Brand - Desktop */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              FixIt
            </Typography>

            {/* Mobile menu */}
            {isMobile && user && (
              <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                  size="large"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleOpenNavMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: { xs: 'block', md: 'none' },
                  }}
                >
                  {navItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        handleCloseNavMenu();
                      }}
                    >
                      <Typography textAlign="center">{item.label}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            )}

            {/* Logo/Brand - Mobile */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              FixIt
            </Typography>

            {/* Desktop menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    handleCloseNavMenu();
                  }}
                  sx={{ 
                    my: 2, 
                    color: 'white', 
                    display: 'block',
                    ...(location.pathname === item.path && {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    })
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* User menu */}
            <Box sx={{ flexGrow: 0 }}>
              {user ? (
                <>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar alt={user.name} src="/static/images/avatar/2.jpg" />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem onClick={() => {
                      navigate('/profile');
                      handleCloseUserMenu();
                    }}>
                      <Typography textAlign="center">
                        {user.role === 'client' ? 'My Profile' : 'Provider Profile'}
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    color="inherit"
                    variant="outlined"
                    onClick={() => navigate('/register')}
                    sx={{
                      borderColor: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} FixIt. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 