import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DashboardHome from './components/DashboardHome';
import AssignmentManager from './components/AssignmentManager';
import AIChat from './components/AIChat';
import DocumentManager from './components/DocumentManager';
import SharePointSync from './components/SharePointSync';
import Settings from './components/Settings';
import { Typography, Box } from '@mui/material';

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

function App() {
  return (
    <Router>
      <Dashboard>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/assignments" element={<AssignmentManager />} />
          <Route path="/chat" element={<AIChat />} />
          <Route path="/documents" element={<DocumentManager />} />
          <Route path="/sharepoint" element={<SharePointSync />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </Dashboard>
    </Router>
  );
}

export default App;
