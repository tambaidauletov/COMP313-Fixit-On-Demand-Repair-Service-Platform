import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Layout from './components/Layout';

// Client Pages
import ClientDashboard from './pages/dashboard/ClientDashboard';
import ClientRequests from './pages/client/Requests';
import CreateRequest from './pages/client/CreateRequest';
import ClientMessages from './pages/client/Messages';
import FindProviders from './pages/client/FindProviders';
import ClientReports from './pages/client/Reports';
import ClientSettings from './pages/client/Settings';

// Provider Pages
import ProviderDashboard from './pages/dashboard/ProviderDashboard';
import AvailableJobs from './pages/provider/AvailableJobs';
import MyJobs from './pages/provider/MyJobs';
import ProviderMessages from './pages/provider/Messages';
import Qualifications from './pages/provider/Qualifications';
import SavedSearches from './pages/provider/SavedSearches';
import ProviderSettings from './pages/provider/Settings';

// Manager Pages
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import ManagerReports from './pages/manager/Reports';
import UserManagement from './pages/manager/UserManagement';
import ModeratorManagement from './pages/manager/ModeratorManagement';
import QualificationReview from './pages/manager/QualificationReview';
import ExportData from './pages/manager/ExportData';
import ManagerSettings from './pages/manager/Settings';

// Moderator Pages
import ModeratorDashboard from './pages/dashboard/ModeratorDashboard';
import ModeratorReports from './pages/moderator/Reports';
import ContentReview from './pages/moderator/ContentReview';
import ModeratorQualifications from './pages/moderator/Qualifications';
import ModeratorSettings from './pages/moderator/Settings';

// Admin Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import SystemSettings from './pages/admin/SystemSettings';
import AdminUserManagement from './pages/admin/UserManagement';
import AccessControl from './pages/admin/AccessControl';
import SystemLogs from './pages/admin/SystemLogs';

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
              
              {/* Client Routes */}
              <Route path="/client/*">
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="requests"
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="create-request"
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <CreateRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="messages"
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientMessages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="providers"
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <FindProviders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientSettings />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Provider Routes */}
              <Route path="/provider/*">
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="available-jobs"
                  element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <AvailableJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="my-jobs"
                  element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <MyJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="messages"
                  element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderMessages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="qualifications"
                  element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <Qualifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="saved-searches"
                  element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <SavedSearches />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderSettings />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Manager Routes */}
              <Route path="/manager/*">
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ManagerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ManagerReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="moderators"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ModeratorManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="qualifications"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <QualificationReview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="export"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ExportData />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ManagerSettings />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Moderator Routes */}
              <Route path="/moderator/*">
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['moderator']}>
                      <ModeratorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute allowedRoles={['moderator']}>
                      <ModeratorReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="content"
                  element={
                    <ProtectedRoute allowedRoles={['moderator']}>
                      <ContentReview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="qualifications"
                  element={
                    <ProtectedRoute allowedRoles={['moderator']}>
                      <ModeratorQualifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute allowedRoles={['moderator']}>
                      <ModeratorSettings />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/*">
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <SystemSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminUserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="access"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AccessControl />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="logs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <SystemLogs />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Legacy route - redirect to role-specific dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Navigate to="/client/dashboard" replace />
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
