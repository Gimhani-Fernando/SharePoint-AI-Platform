import * as React from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import ColorModeIconDropdown from '../theme/ColorModeIconDropdown';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  position: 'static',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'none',
  backgroundImage: 'none',
  color: theme.palette.text.primary,
}));

interface AppNavbarProps {
  open?: boolean;
  toggleDrawer?: (open: boolean) => void;
}

export default function AppNavbar({ open, toggleDrawer }: AppNavbarProps) {
  return (
    <StyledAppBar>
      <Toolbar
        variant="dense"
        disableGutters
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          p: '12px',
          gap: '12px',
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => toggleDrawer?.(!open)}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="text.primary"
            sx={{ 
              display: { xs: 'none', md: 'block' },
              fontWeight: 600 
            }}
          >
            SharePoint AI Platform
          </Typography>
        </Stack>
        
        <Stack direction="row" sx={{ gap: 1 }}>
          <IconButton size="small" sx={{ color: 'text.primary' }}>
            <Badge color="error" variant="dot">
              <NotificationsRoundedIcon />
            </Badge>
          </IconButton>
          <ColorModeIconDropdown />
        </Stack>
      </Toolbar>
    </StyledAppBar>
  );
}