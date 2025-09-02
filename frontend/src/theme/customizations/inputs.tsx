import { Theme, Components } from '@mui/material/styles';

export const inputsCustomizations: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        textTransform: 'none',
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiOutlinedInput-root': {
          borderRadius: theme.shape.borderRadius,
        },
      }),
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
};