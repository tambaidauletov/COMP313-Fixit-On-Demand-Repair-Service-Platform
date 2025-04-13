import React, { useState, useEffect } from 'react';
import { Avatar as MuiAvatar, Skeleton } from '@mui/material';
import { authService } from '../services/api';

// Create a cache for avatar URLs
const avatarCache = new Map();

const CustomAvatar = ({ user, size = 40, onClick }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvatar = async () => {
      if (user?.avatar) {
        try {
          setLoading(true);
          const filename = user.avatar.split('/').pop();
          
          // Check if the avatar URL is already cached
          if (avatarCache.has(filename)) {
            console.log('Using cached avatar URL for:', filename);
            setImageUrl(avatarCache.get(filename));
            setError(false);
            setLoading(false);
            return;
          }

          console.log('Loading avatar for filename:', filename);
          const response = await authService.getImage(filename);
          
          if (response.status === 200) {
            const blob = new Blob([response.data], { 
              type: response.headers['content-type'] 
            });
            const url = URL.createObjectURL(blob);
            console.log('Avatar loaded successfully:', url);
            
            // Cache the URL
            avatarCache.set(filename, url);
            
            setImageUrl(url);
            setError(false);
          }
        } catch (error) {
          console.error('Error loading avatar:', error);
          setError(true);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadAvatar();

    // Only revoke the URL if it's not in the cache
    return () => {
      if (imageUrl && !avatarCache.has(user?.avatar?.split('/').pop())) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [user?.avatar]);

  if (loading) {
    return (
      <Skeleton
        variant="circular"
        width={size}
        height={size}
      />
    );
  }

  return (
    <MuiAvatar
      src={imageUrl}
      alt={user?.name || 'User'}
      sx={{ 
        width: size, 
        height: size,
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: error ? 'grey.300' : undefined 
      }}
      onClick={onClick}
    >
      {(error || !imageUrl) && user?.name?.charAt(0).toUpperCase()}
    </MuiAvatar>
  );
};

export default CustomAvatar; 