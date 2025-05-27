import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { primerService } from '../../services/api';
import PasswordConfirmation from '../PasswordConfirmation/PasswordConfirmation';

const PrimerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [primer, setPrimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para confirmação por senha
  const [passwordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);

  const fetchPrimerDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Iniciando busca de detalhes do primer...');
      const data = await primerService.getPrimer(id);
      console.log('📋 Dados recebidos no componente:', data);
      
      if (!data) {
        console.log('⚠️ Nenhum dado recebido da API');
        setPrimer(null);
      } else {
        console.log('✅ Dados processados com sucesso');
        setPrimer(data);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar detalhes do primer:', err);
      setError(err.message);
      setPrimer(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPrimerDetails();
  }, [fetchPrimerDetails]);

  const handleDelete = async () => {
    // Configurar ação pendente e abrir confirmação por senha
    setPendingDelete(true);
    setPasswordConfirmOpen(true);
  };

  // Função para executar exclusão após confirmação de senha
  const executeDelete = async () => {
    try {
      await primerService.deletePrimer(id);
      navigate('/primers');
    } catch (err) {
      setError(err.message);
    }
  };

  // Função para lidar com confirmação de senha
  const handlePasswordConfirm = async (password) => {
    if (pendingDelete) {
      await executeDelete();
      setPendingDelete(false);
    }
  };

  // Função para cancelar confirmação de senha
  const handlePasswordCancel = () => {
    setPendingDelete(false);
    setPasswordConfirmOpen(false);
  };

  // Função para formatar data e hora em português
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        console.log('❌ Data inválida:', dateString);
        return 'Data inválida';
      }
      
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      });
      
    } catch (error) {
      console.error('❌ Erro ao formatar data:', error, 'String original:', dateString);
      return 'Erro na data';
    }
  };

  // Verifica se o primer foi editado
  const wasEdited = primer && primer.created_at !== primer.updated_at;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!primer) {
    return (
      <Alert severity="info">
        Primer não encontrado
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Detalhes do Primer
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/primers/${id}/edit`)}
            sx={{ 
              mr: 1,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              }
            }}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            sx={{
              backgroundColor: '#d32f2f',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#b71c1c',
              }
            }}
          >
            Excluir
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" color="text.secondary">
            ID
          </Typography>
          <Typography variant="body1" gutterBottom>
            {primer.id}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" color="text.secondary">
            Label
          </Typography>
          <Typography variant="body1" gutterBottom>
            {primer.label}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Sequência Foward
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              backgroundColor: theme.palette.mode === 'dark' ? '#1a1f2a' : '#f5f5f5',
              padding: 2,
              borderRadius: 1,
              wordBreak: 'break-all',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            {primer.foward_sequence}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Sequência Reverse
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              backgroundColor: theme.palette.mode === 'dark' ? '#1a1f2a' : '#f5f5f5',
              padding: 2,
              borderRadius: 1,
              wordBreak: 'break-all',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            {primer.reverse_sequence}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            Temperatura Foward
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
            {primer.foward_temperature}°C
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            Temperatura Reverse
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
            {primer.reverse_temperature}°C
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" color="text.secondary">
            Cromossomo
          </Typography>
          <Typography variant="body1" gutterBottom>
            {primer.chr}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" color="text.secondary">
            Transcrito
          </Typography>
          <Typography variant="body1" gutterBottom>
            {primer.transcrito}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" color="text.secondary">
            Início
          </Typography>
          <Typography variant="body1" gutterBottom>
            {primer.start}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" color="text.secondary">
            Fim
          </Typography>
          <Typography variant="body1" gutterBottom>
            {primer.end}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" color="text.secondary">
            Condições
          </Typography>
          <Typography variant="body1" gutterBottom>
            {primer.conditions}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" color="text.secondary">
            Éxon
          </Typography>
          <Typography variant="body1" gutterBottom>
            {primer.exon}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" color="text.secondary">
            Versão do Genoma
          </Typography>
          <Typography variant="body1" gutterBottom>
            {primer.genome_version}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" color="text.secondary">
            BED
          </Typography>
          <Typography variant="body1" gutterBottom>
            {primer.bed}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" color="text.secondary">
            Tamanho
          </Typography>
          <Typography variant="body1" gutterBottom>
            {primer.size} bp
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" color="text.secondary">
            Criado em
          </Typography>
          <Typography variant="body1" gutterBottom>
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {formatDateTime(primer.created_at)}
            </Box>
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" color="text.secondary">
            Editado em
          </Typography>
          <Typography 
            variant="body1" 
            gutterBottom 
            color={wasEdited ? 'text.primary' : 'text.secondary'}
            sx={{
              fontWeight: wasEdited ? 400 : 400,
              opacity: wasEdited ? 1 : 0.7
            }}
          >
            {wasEdited ? (
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {formatDateTime(primer.updated_at)}
              </Box>
            ) : (
              'Não foi editado'
            )}
          </Typography>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/primers')}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            }
          }}
        >
          Voltar para a lista
        </Button>
      </Box>

      <PasswordConfirmation
        open={passwordConfirmOpen}
        onClose={handlePasswordCancel}
        onConfirm={handlePasswordConfirm}
        title="Confirmação para Excluir Primer"
        message={`Para excluir o primer "${primer?.label}", digite sua senha:`}
        actionDescription="excluir primer"
      />
    </Paper>
  );
};

export default PrimerDetail; 