import React, { createContext, useMemo, useState, useContext, useEffect } from 'react';
import theme from '../styles/theme'; // Tema escuro
import lightTheme from '../styles/lightTheme'; // Tema claro

const ThemeModeContext = createContext();

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode deve ser usado dentro de um ThemeModeProvider');
  }
  return context;
}

export function ThemeModeProvider({ children }) {
  // Recupera a preferência salva ou usa 'dark' como padrão
  const [mode, setMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('themeMode');
      return savedMode || 'dark';
    } catch (error) {
      console.warn('Erro ao acessar localStorage:', error);
      return 'dark';
    }
  });

  const muiTheme = useMemo(() => {
    return mode === 'dark' ? theme : lightTheme;
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
  };

  // Salva a preferência no localStorage sempre que o modo mudar
  useEffect(() => {
    try {
      localStorage.setItem('themeMode', mode);
    } catch (error) {
      console.warn('Erro ao salvar no localStorage:', error);
    }
  }, [mode]);

  const value = {
    mode,
    toggleTheme,
    muiTheme,
  };

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
} 