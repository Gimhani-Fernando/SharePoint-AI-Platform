import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';

const OneDriveCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('Processing OneDrive authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have URL parameters indicating success or error
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(errorDescription || `Authentication error: ${error}`);
          
          // Redirect to OneDrive page after showing error for a few seconds
          setTimeout(() => {
            navigate('/onedrive');
          }, 3000);
          return;
        }

        // If no error, the MSAL library will handle the token exchange automatically
        // We just need to indicate success and redirect
        setStatus('success');
        setMessage('OneDrive authentication successful! Redirecting...');
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Redirect to OneDrive page
        setTimeout(() => {
          navigate('/onedrive');
        }, 2000);

      } catch (err: any) {
        console.error('OneDrive callback error:', err);
        setStatus('error');
        setMessage(err.message || 'An unexpected error occurred during authentication');
        
        // Redirect to OneDrive page after showing error
        setTimeout(() => {
          navigate('/onedrive');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" sx={{ fontSize: 64 }} />;
      case 'error':
        return <Error color="error" sx={{ fontSize: 64 }} />;
      default:
        return <CircularProgress size={64} />;
    }
  };

  const getAlertSeverity = () => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Box sx={{ mb: 3 }}>
            {getIcon()}
          </Box>

          <Typography variant="h5" gutterBottom>
            OneDrive Authentication
          </Typography>

          <Alert severity={getAlertSeverity()} sx={{ mb: 3 }}>
            {message}
          </Alert>

          <Typography variant="body2" color="text.secondary">
            {status === 'processing' && 'Please wait while we complete your OneDrive connection...'}
            {status === 'success' && 'You will be redirected to the OneDrive integration page shortly.'}
            {status === 'error' && 'You will be redirected back to try again.'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OneDriveCallback;