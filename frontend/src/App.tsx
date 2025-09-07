import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DashboardHome from './components/DashboardHome';
import AssignmentManager from './components/AssignmentManager';
import AIChat from './components/AIChat';
import DocumentManager from './components/DocumentManager';
import OneDriveIntegration from './components/OneDriveIntegration';
import OneDriveCallback from './components/OneDriveCallback';
import SharePointStatus from './components/SharePointStatus';
import Settings from './components/Settings';
import LoginForm from './components/LoginForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OneDriveProvider } from './contexts/OneDriveContext';
import { Typography, Box, CircularProgress } from '@mui/material';

const About = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h4" gutterBottom>About SharePoint AI</Typography>
    <Typography variant="body1" color="text.secondary" paragraph>
      SharePoint AI Platform is a comprehensive solution for managing assignments, 
      documents, and team collaboration with AI-powered assistance.
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Built with React, Material-UI, and Supabase.
    </Typography>
  </Box>
);

const Help = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h4" gutterBottom>Help & Support</Typography>
    <Typography variant="body1" color="text.secondary">
      Need help? Check out our documentation or contact support.
    </Typography>
  </Box>
);

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Dashboard>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/assignments" element={<AssignmentManager />} />
        <Route path="/chat" element={<AIChat />} />
        <Route path="/documents" element={<DocumentManager />} />
        <Route path="/onedrive" element={<OneDriveIntegration />} />
        <Route path="/sharepoint-status" element={<SharePointStatus />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </Dashboard>
  );
};

function App() {
  return (
    <AuthProvider>
      <OneDriveProvider>
        <Router>
          <Routes>
            {/* OneDrive callback route - outside of main dashboard */}
            <Route path="/onedrive-callback" element={<OneDriveCallback />} />
            {/* All other routes */}
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </Router>
      </OneDriveProvider>
    </AuthProvider>
  );
}

export default App;
