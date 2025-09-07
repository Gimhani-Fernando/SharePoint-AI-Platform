import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  CloudDone,
  AccountCircle,
  Storage,
  Sync,
  Security,
  Speed,
} from '@mui/icons-material';
import { useOneDrive } from '../contexts/OneDriveContext';

const SharePointStatus: React.FC = () => {
  const { isAuthenticated, account, loading, error } = useOneDrive();

  const getConnectionStatus = () => {
    if (loading) return { color: 'warning' as const, text: 'Connecting...' };
    if (error) return { color: 'error' as const, text: 'Connection Error' };
    if (isAuthenticated) return { color: 'success' as const, text: 'Connected' };
    return { color: 'default' as const, text: 'Not Connected' };
  };

  const status = getConnectionStatus();

  const features = [
    {
      icon: <Storage color={isAuthenticated ? 'primary' : 'disabled'} />,
      primary: 'File Storage',
      secondary: 'Access your OneDrive files and folders',
      status: isAuthenticated ? 'Active' : 'Inactive',
      enabled: isAuthenticated,
    },
    {
      icon: <Sync color={isAuthenticated ? 'primary' : 'disabled'} />,
      primary: 'Real-time Sync',
      secondary: 'Automatic synchronization with OneDrive',
      status: isAuthenticated ? 'Enabled' : 'Disabled',
      enabled: isAuthenticated,
    },
    {
      icon: <Security color={isAuthenticated ? 'primary' : 'disabled'} />,
      primary: 'Secure Access',
      secondary: 'Microsoft OAuth 2.0 authentication',
      status: isAuthenticated ? 'Protected' : 'Not Protected',
      enabled: isAuthenticated,
    },
    {
      icon: <Speed color={isAuthenticated ? 'primary' : 'disabled'} />,
      primary: 'Fast Operations',
      secondary: 'Optimized file upload and download',
      status: isAuthenticated ? 'Optimized' : 'Unavailable',
      enabled: isAuthenticated,
    },
  ];

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CloudDone sx={{ mr: 2, fontSize: 32, color: status.color === 'success' ? 'success.main' : 'text.secondary' }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              OneDrive Integration Status
            </Typography>
            <Chip
              label={status.text}
              color={status.color}
              size="small"
            />
          </Box>
        </Box>

        {/* User Information */}
        {isAuthenticated && account && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                <AccountCircle />
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {account.name || account.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {account.username}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="error" sx={{ fontStyle: 'italic' }}>
              Error: {error}
            </Typography>
            <Divider sx={{ mt: 2, mb: 2 }} />
          </Box>
        )}

        {/* Feature Status */}
        <Typography variant="subtitle2" gutterBottom>
          Integration Features
        </Typography>
        
        <List dense>
          {features.map((feature, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                {feature.icon}
              </ListItemIcon>
              <ListItemText
                primary={feature.primary}
                secondary={feature.secondary}
              />
              <Chip
                label={feature.status}
                color={feature.enabled ? 'success' : 'default'}
                size="small"
              />
            </ListItem>
          ))}
        </List>

        {/* Integration Statistics */}
        {isAuthenticated && (
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Integration Details
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  Active
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Connection
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  OAuth 2.0
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Security
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  Graph API
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Integration
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Getting Started */}
        {!isAuthenticated && !loading && (
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Getting Started
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect your Microsoft OneDrive account to access file storage,
              real-time synchronization, and secure document management features.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SharePointStatus;