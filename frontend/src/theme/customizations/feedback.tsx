import * as React from 'react';
import { Theme, Components } from '@mui/material/styles';
import { alertClasses } from '@mui/material/Alert';

export const feedbackCustomizations: Components<Theme> = {
  MuiAlert: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 10,
        [`&.${alertClasses.colorInfo}`]: {
          backgroundColor: theme.palette.info.main,
        },
      }),
    },
  },
  MuiDialog: {
    styleOverrides: {
      root: ({ theme }) => ({
        [`& .${alertClasses.root}`]: {
          borderRadius: theme.shape.borderRadius,
        },
      }),
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: ({ theme }) => ({
        height: 8,
        borderRadius: 8,
        backgroundColor: theme.palette.grey[200],
        ...theme.applyStyles('dark', {
          backgroundColor: theme.palette.grey[800],
        }),
      }),
    },
  },
};