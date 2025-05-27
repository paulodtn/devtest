import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976D2', // Azul que contrasta melhor com a logo #00D5E2
      light: '#42A5F5',
      dark: '#1565C0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f5f5f5',
      light: '#ffffff',
      dark: '#e0e0e0',
      contrastText: '#333',
    },
    background: {
      default: '#f5f5f5', // Fundo principal claro
      paper: '#ffffff',   // Cartões e papéis em branco
    },
    text: {
      primary: '#131C2F', // Texto escuro para contraste
      secondary: '#4f5b62',
      disabled: '#9e9e9e',
    },
    divider: '#e0e0e0', // Cor para divisores e bordas no tema claro
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0', // Borda sutil para destacar
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderColor: '#e0e0e0',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5',
          '& .MuiTableCell-root': {
            backgroundColor: '#f5f5f5',
            borderColor: '#e0e0e0',
            fontWeight: 600,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0', // Borda para cards
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Sombra sutil
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

export default lightTheme; 