import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppNavbar from './AppNavbar';
import SideMenu from './SideMenu';
import AppTheme from '../theme/AppTheme';

interface DashboardLayoutProps {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
}

export default function Dashboard({ children, ...props }: DashboardLayoutProps) {
  return (
    <AppTheme {...props}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
        <SideMenu />
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0, // Allow flex child to shrink below its content size
          width: '100%'
        }}>
          <AppNavbar />
          {/* Main content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              backgroundColor: 'background.default',
              overflow: 'auto',
              p: { xs: 1, sm: 2, md: 3 }, // Reduced padding
              width: '100%',
              minWidth: 0 // Allow content to shrink
            }}
          >
            <Box sx={{ 
              width: '100%',
              maxWidth: 'none', // Remove max-width constraint
              margin: 0 // Remove any margin
            }}>
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}