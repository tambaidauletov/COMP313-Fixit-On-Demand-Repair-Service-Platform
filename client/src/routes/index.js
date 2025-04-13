import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Inbox from '../pages/messages/Inbox';
// ... other imports

const AppRoutes = () => {
  return (
    <Routes>
      {/* ... other routes */}
      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <Inbox />
          </PrivateRoute>
        }
      />
      {/* ... other routes */}
    </Routes>
  );
};

export default AppRoutes; 