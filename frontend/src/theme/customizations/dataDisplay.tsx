import { Theme, Components } from '@mui/material/styles';

const green = {
  50: '#f0f9f0',
  100: '#dcf4dc',
  200: '#c2f0c2',
  300: '#9ae69a',
  400: '#6dd36d',
  500: '#4ade4a',
  600: '#36a936',
  700: '#2f7d2f',
  800: '#29682a',
  900: '#245524',
};

const red = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
  600: '#e11d48',
  700: '#be123c',
  800: '#9f1239',
  900: '#881337',
};

export const dataDisplayCustomizations: Components<Theme> = {
  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundImage: 'none',
        backgroundColor: theme.palette.background.paper,
      }),
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
      }),
    },
  },
  MuiChip: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.MuiChip-colorSuccess': {
          backgroundColor: green[100],
          color: green[800],
          '&:hover': {
            backgroundColor: green[200],
          },
        },
        '&.MuiChip-colorError': {
          backgroundColor: red[100],
          color: red[800],
          '&:hover': {
            backgroundColor: red[200],
          },
        },
      }),
    },
  },
};