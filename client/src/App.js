import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import ProtectedRoute from './components/routing/ProtectedRoute';
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Listing Pages
import Home from './pages/Home';
import Listings from './pages/listings/Listings';
import ListingDetails from './pages/listings/ListingDetails';
import CreateListing from './pages/listings/CreateListing';
import EditListing from './pages/listings/EditListing';
import MyListings from './pages/listings/MyListings';

// Message Pages
import Inbox from './pages/messages/Inbox';
import Conversation from './pages/messages/Conversation';
import Messages from './pages/messages/Messages';

// Profile Pages
import Profile from './pages/profile/Profile';
import EditProfile from './pages/profile/EditProfile';

// Service Provider Pages
import ServiceProviderDashboard from './pages/dashboard/ServiceProviderDashboard';
import Qualifications from './pages/serviceProvider/Qualifications';
import SearchPreferences from './pages/serviceProvider/SearchPreferences';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ReportManagement from './pages/admin/ReportManagement';

// Other Pages
import NotFound from './pages/NotFound';
import CustomerDashboard from './pages/customer/CustomerDashboard';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/listings/:id" element={<ListingDetails />} />
                
                {/* Protected Routes - For all authenticated users */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  <Route path="/inbox" element={<Inbox />} />
                  <Route path="/messages/:conversationId" element={<Conversation />} />
                </Route>
                
                {/* Customer Routes */}
                <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                  <Route path="/dashboard" element={<CustomerDashboard />} />
                  <Route path="/create-listing" element={<CreateListing />} />
                  <Route path="/edit-listing/:id" element={<EditListing />} />
                  <Route path="/my-listings" element={<MyListings />} />
                </Route>
                
                {/* Service Provider Routes */}
                <Route element={<ProtectedRoute allowedRoles={['service_provider']} />}>
                  <Route path="/service-provider/dashboard" element={<ServiceProviderDashboard />} />
                  <Route path="/service-provider/qualifications" element={<Qualifications />} />
                  <Route path="/service-provider/preferences" element={<SearchPreferences />} />
                  {/* Service provider uses the same profile and edit profile components */}
                  <Route path="/service-provider/profile" element={<Profile />} />
                </Route>
                
                {/* Admin & Manager Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/reports" element={<ReportManagement />} />
                </Route>
                
                {/* Messages Route */}
                <Route path="/messages" element={<Messages />} />
                
                {/* Fallback route for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;