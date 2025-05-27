import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  LinearProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/neogenomica.png';
import ThemeToggleButton from '../ThemeToggleButton/ThemeToggleButton';

const Login = () => {
  const theme = useTheme();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(3);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro quando usuário começar a digitar
    if (error) setError('');
  };

  // Contador regressivo para desbloqueio
  useEffect(() => {
    let interval;
    if (blocked && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            setBlocked(false);
            setError('');
            setRemainingAttempts(3);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [blocked, remainingTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Não permitir login se estiver bloqueado
    if (blocked) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      if (!result.success) {
        setError(result.error);
        
        // Atualizar estado de bloqueio
        if (result.blocked) {
          setBlocked(true);
          setRemainingTime(result.remaining_time);
        } else if (result.remaining_attempts !== undefined) {
          setRemainingAttempts(result.remaining_attempts);
        }
      } else {
        // Login bem-sucedido - resetar estados
        setBlocked(false);
        setRemainingTime(0);
        setRemainingAttempts(3);
        setError('');
      }
    } catch (err) {
      setError('Erro interno do sistema. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0D1117 0%, #161b22 50%, #21262d 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: 2
      }}
    >
      {/* Botão de alternância de tema no canto superior direito */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        <ThemeToggleButton />
      </Box>

      <Container maxWidth="sm">
        <Paper
          elevation={theme.palette.mode === 'dark' ? 8 : 4}
          sx={{
            padding: 4,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            border: theme.palette.mode === 'dark' 
              ? `1px solid ${theme.palette.divider}` 
              : 'none',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 184, 196, 0.1)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4
            }}
          >
            <img 
              src={logo} 
              alt="NeoGenômica Logo" 
              style={{ 
                height: 60,
                marginBottom: 24,
                filter: theme.palette.mode === 'dark' ? 'brightness(1.1)' : 'none'
              }} 
            />
          </Box>

          {/* Formulário de Login */}
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert 
                severity={blocked ? "warning" : "error"}
                sx={{ 
                  mb: 3,
                  borderRadius: 2
                }}
              >
                {error}
              </Alert>
            )}

            {/* Barra de progresso do bloqueio */}
            {blocked && remainingTime > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="warning.main" fontWeight="600">
                    Usuário bloqueado
                  </Typography>
                  <Typography variant="body2" color="warning.main" fontWeight="600">
                    {remainingTime}s
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(10 - remainingTime) * 10}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.warning.main,
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            )}

            {/* Indicador de tentativas restantes */}
            {!blocked && remainingAttempts < 3 && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2
                }}
              >
                Atenção: Restam {remainingAttempts} tentativa(s) antes do bloqueio
              </Alert>
            )}

            <TextField
              fullWidth
              label="Usuário"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Senha"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !formData.username || !formData.password || blocked}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1.1rem',
                textTransform: 'none',
                background: blocked 
                  ? theme.palette.grey[400]
                  : theme.palette.mode === 'dark'
                    ? `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`
                    : theme.palette.primary.main,
                '&:hover': !blocked ? {
                  background: theme.palette.mode === 'dark'
                    ? `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`
                    : theme.palette.primary.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 184, 196, 0.3)'
                } : {},
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : blocked ? (
                `Bloqueado (${remainingTime}s)`
              ) : (
                'Acessar Sistema'
              )}
            </Button>
          </Box>


        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 