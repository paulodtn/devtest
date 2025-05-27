import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00B8C4', // Cor de destaque
      light: '#33cdd3',
      dark: '#008a91',
      contrastText: '#fff',
    },
    secondary: {
      main: '#6c757d', // Cor cinza visível para botões secondary
      light: '#adb5bd',
      dark: '#495057',
      contrastText: '#fff',
    },
    background: {
      default: '#0D1117', // Fundo principal
      paper: '#0D1117',   // Cartões e papéis alterado para #0D1117
    },
    text: {
      primary: '#fff',
      secondary: '#b0bec5',
      disabled: '#7b8fa1',
    },
    divider: '#2a3441', // Cor para divisores e bordas
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
          backgroundColor: '#0D1117', // Adicionado para garantir que todos os Papers usem #0D1117
          border: '1px solid #2a3441', // Borda sutil para destacar do fundo
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          backgroundColor: '#0D1117', // Adicionado para células da tabela
          borderColor: '#2a3441', // Borda mais visível
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#161b22', // Cabeçalho da tabela um pouco mais claro
          '& .MuiTableCell-root': {
            backgroundColor: '#161b22',
            borderColor: '#2a3441',
            fontWeight: 600,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#0D1117',
          border: '1px solid #2a3441', // Borda para cards
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#0D1117',
        },
      },
    },
  },
});

export default theme; 