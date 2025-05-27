import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Security } from '@mui/icons-material';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const PasswordConfirmation = ({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Confirmação de Segurança",
  message = "Para continuar com esta ação, digite sua senha de confirmação:",
  actionDescription = "executar esta ação"
}) => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('A senha é obrigatória');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validar senha de confirmação com o backend
      const result = await authService.validatePassword(password);
      
      if (result.success) {
        await onConfirm(password);
        handleClose();
      } else {
        setError(result.error || 'Senha de confirmação incorreta. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro na validação:', err);
      setError('Erro ao validar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    setError('');
    setLoading(false);
    onClose();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: '2px solid #00B8C4'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        backgroundColor: '#161b22',
        borderBottom: '1px solid #2a3441'
      }}>
        <Security color="primary" />
        {title}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {message}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Esta ação será registrada no histórico de auditoria para {actionDescription}.
          </Typography>
          
          {/* Dica da senha baseada no usuário */}
          {user && (
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 1, 
              backgroundColor: 'rgba(0, 184, 196, 0.1)',
              border: '1px solid rgba(0, 184, 196, 0.3)'
            }}>
              <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                💡 Dica: Use sua senha de confirmação individual
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {user.username === 'admin_1' && 'Usuário admin_1: senha de confirmação específica'}
                {user.username === 'demo' && 'Usuário demo: senha de confirmação simples'}
              </Typography>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Senha de Confirmação"
            placeholder="Digite sua senha de confirmação individual"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            autoFocus
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </form>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        backgroundColor: '#161b22',
        borderTop: '1px solid #2a3441'
      }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          variant="contained"
          sx={{
            backgroundColor: '#d32f2f',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#b71c1c',
            },
            '&:disabled': {
              backgroundColor: '#666',
              color: '#999',
            }
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !password.trim()}
          color="primary"
        >
          {loading ? 'Validando...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordConfirmation; 