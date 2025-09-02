import * as React from 'react';
import { Theme, Components, alpha } from '@mui/material/styles';
import { listItemButtonClasses } from '@mui/material/ListItemButton';

export const navigationCustomizations: Components<Theme> = {
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
        padding: '6px 8px',
        [`&.${listItemButtonClasses.selected}`]: {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
          },
        },
      }),
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
        [`&.${listItemButtonClasses.selected}`]: {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
          },
        },
      }),
    },
  },
};