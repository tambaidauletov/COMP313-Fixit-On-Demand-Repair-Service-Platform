import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import ProviderDashboard from './pages/dashboard/ProviderDashboard';
import CreateListing from './pages/CreateListing';
import Listings from './pages/Listings';
import Home from './pages/Home';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role === 'client') {
    return <ClientDashboard />;
  } else if (user.role === 'provider') {
    return <ProviderDashboard />;
  }

  return <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />
              
              {/* Client Routes */}
              <Route
                path="/create-request"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <CreateListing />
                  </ProtectedRoute>
                }
              />
              
              {/* Provider Routes */}
              <Route
                path="/available-requests"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <Listings />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
