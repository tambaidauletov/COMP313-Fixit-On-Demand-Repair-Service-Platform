import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import { Avatar } from '@mui/material';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load and verify user data
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
          // First set the stored user with avatar URL
          let parsedUser = JSON.parse(storedUser);
          parsedUser = await authService.verifyAndPreloadAvatar(parsedUser);
          setUser(parsedUser);

          try {
            // Then fetch fresh data
            const res = await authService.getCurrentUser();
            const freshUser = await authService.verifyAndPreloadAvatar(res.data);
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          } catch (err) {
            if (err.response?.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('Error initializing user:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await authService.register(userData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await authService.login(credentials);
      const userData = await authService.verifyAndPreloadAvatar(res.data);
      
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Update user profile with immediate avatar URL update
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await authService.updateProfile(userData);
      const updatedUser = await authService.verifyAndPreloadAvatar(res.data.user);
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle user state updates
  const updateUserState = (userData) => {
    console.log('Updating user state with:', userData);
    if (userData) {
      // Always ensure the avatar URL is properly constructed
      const processedUserData = {
        ...userData,
        avatar: userData.avatar ? authService.getAvatarUrl(userData) : ''
      };
      setUser(processedUserData);
      localStorage.setItem('user', JSON.stringify(processedUserData));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'manager',
        isModerator: user?.role === 'moderator',
        isServiceProvider: user?.role === 'service_provider',
        isCustomer: user?.role === 'customer',
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 