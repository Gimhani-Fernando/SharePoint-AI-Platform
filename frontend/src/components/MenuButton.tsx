import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Button, { ButtonProps } from '@mui/material/Button';

const MenuButton = styled(Button)<ButtonProps>(({ theme }) => ({
  width: '100%',
  height: '40px',
  borderRadius: '10px',
  border: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.3),
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  '&.Mui-focusVisible': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

export default MenuButton;