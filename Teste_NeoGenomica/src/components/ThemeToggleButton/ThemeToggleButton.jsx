import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';

export default function ThemeToggleButton() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={mode === 'dark' ? 'Alterar para tema claro' : 'Alterar para tema escuro'}>
      <IconButton 
        color="inherit" 
        onClick={toggleTheme}
        sx={{ ml: 1 }}
      >
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
} 