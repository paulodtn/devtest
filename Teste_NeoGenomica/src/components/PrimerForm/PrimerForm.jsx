import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Snackbar,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { primerService } from '../../services/api';
import PasswordConfirmation from '../PasswordConfirmation/PasswordConfirmation';

const PrimerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);
  
  const [formData, setFormData] = useState({
    label: '',
    foward_sequence: '',
    reverse_sequence: '',
    foward_temperature: '',
    reverse_temperature: '',
    chr: '',
    transcrito: '',
    start: '',
    end: '',
    conditions: '',
    exon: '',
    genome_version: '',
    bed: '',
    size: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Estados para confirmação por senha
  const [passwordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const fetchPrimer = useCallback(async () => {
    try {
      setLoading(true);
      const data = await primerService.getPrimer(id);
      setFormData(data);
    } catch (err) {
      setValidationError('Erro ao carregar os dados do primer');
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados do primer',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPrimer();
    }
  }, [id, fetchPrimer]);

  const validateTemperature = (temp) => {
    const numTemp = parseFloat(temp);
    if (isNaN(numTemp) || numTemp < 0 || numTemp > 100) {
      return "Temperatura deve estar entre 0 e 100°C";
    }
    return null;
  };

  const validateNumeric = (value, field) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 0) {
      return `${field} deve ser um número positivo`;
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let error = null;
    let processedValue = value;
    
    if (name === 'foward_sequence' || name === 'reverse_sequence') {
      processedValue = value.replace(/[^ATGC]/gi, '').toUpperCase();
    } else if (name === 'foward_temperature' || name === 'reverse_temperature') {
      error = validateTemperature(value);
    } else if (name === 'start' || name === 'end') {
      error = validateNumeric(value, name === 'start' ? 'Início' : 'Fim');
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    setValidationError(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Abrir confirmação por senha
    setPendingSubmit(true);
    setPasswordConfirmOpen(true);
  };

  // Função para executar o submit após confirmação de senha
  const executeSubmit = async () => {
    setLoading(true);
    setFieldErrors({});
    setSnackbar({ open: false, message: '', severity: 'success' });

    try {
      if (id) {
        await primerService.updatePrimer(id, formData);
        setSnackbar({
          open: true,
          message: 'Primer atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        await primerService.createPrimer(formData);
        setSnackbar({
          open: true,
          message: 'Primer criado com sucesso!',
          severity: 'success'
        });
      }
      setTimeout(() => {
        navigate('/primers');
      }, 2000);
    } catch (err) {
      console.error('Erro ao salvar primer:', err);
      
      if (err.response?.status === 422) {
        const errorData = err.response.data.errors;
        const newFieldErrors = {};
        
        // Mapeia os campos para seus nomes em português
        const fieldNames = {
          label: 'Label',
          foward_sequence: 'Sequência Foward',
          reverse_sequence: 'Sequência Reverse',
          foward_temperature: 'Temperatura Foward',
          reverse_temperature: 'Temperatura Reverse',
          chr: 'Cromossomo',
          start: 'Início',
          end: 'Fim',
          bed: 'BED',
          size: 'Tamanho',
          base: 'Geral'
        };

        // Processa todos os erros de validação
        const duplicateFields = [];
        const validationErrors = [];
        
        console.log('Dados de erro recebidos:', errorData); // Debug
        
        for (const [field, messages] of Object.entries(errorData)) {
          const fieldLabel = fieldNames[field] || field;
          
          // Converte para array se for string
          const messageArray = Array.isArray(messages) ? messages : [messages];
          
          messageArray.forEach(message => {
            // Verifica se é erro de unicidade/duplicação
            if (message.includes('já está em uso') || 
                message.includes('já existe') || 
                message.includes('combinação') ||
                message.includes('duplicado') ||
                message.includes('has already been taken')) {
              duplicateFields.push(fieldLabel);
              newFieldErrors[field] = message;
            } else {
              // Outros erros de validação
              validationErrors.push(`${fieldLabel}: ${message}`);
              newFieldErrors[field] = message;
            }
          });
        }

        // Monta mensagem de erro detalhada
        let errorMessage = '';
        
        if (duplicateFields.length > 0) {
          errorMessage = `❌ ERRO DE DUPLICAÇÃO:\n\nOs seguintes campos já estão sendo usados por outro primer:\n• ${duplicateFields.join('\n• ')}\n\nCada primer deve ter valores únicos para estes campos.`;
        }
        
        if (validationErrors.length > 0) {
          if (errorMessage) errorMessage += '\n\n';
          errorMessage += `❌ ERROS DE VALIDAÇÃO:\n\n• ${validationErrors.join('\n• ')}`;
        }

        if (errorMessage) {
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error'
          });
        } else {
          // Fallback se não conseguir processar os erros
          setSnackbar({
            open: true,
            message: `❌ ERRO DE VALIDAÇÃO:\n\nExistem campos com valores duplicados ou inválidos. Verifique os dados inseridos.`,
            severity: 'error'
          });
        }

        setFieldErrors(newFieldErrors);
      } else {
        setSnackbar({
          open: true,
          message: err.message || 'Erro ao salvar primer',
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com confirmação de senha
  const handlePasswordConfirm = async (password) => {
    if (pendingSubmit) {
      await executeSubmit();
      setPendingSubmit(false);
    }
  };

  // Função para cancelar confirmação de senha
  const handlePasswordCancel = () => {
    setPendingSubmit(false);
    setPasswordConfirmOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading && !formData.label) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Editar Primer' : 'Novo Primer'}
        </Typography>

        {/* Alerta fixo no topo */}
        {validationError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, position: 'sticky', top: 16, zIndex: 1000 }}
          >
            {validationError}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Campos Únicos */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Campos Únicos
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Estes campos devem ser únicos para cada primer
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Label"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  error={!!fieldErrors.label}
                  helperText={fieldErrors.label || "Use apenas caracteres A, T, G, C"}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sequência Foward"
                  name="foward_sequence"
                  value={formData.foward_sequence}
                  onChange={handleChange}
                  error={!!fieldErrors.foward_sequence}
                  helperText={fieldErrors.foward_sequence || "Use apenas caracteres A, T, G, C"}
                  placeholder="Ex: ATCGATCGATCG"
                  inputProps={{
                    style: { fontFamily: 'monospace' }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sequência Reverse"
                  name="reverse_sequence"
                  value={formData.reverse_sequence}
                  onChange={handleChange}
                  error={!!fieldErrors.reverse_sequence}
                  helperText={fieldErrors.reverse_sequence || "Use apenas caracteres A, T, G, C"}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Temperatura Foward (°C)"
                  name="foward_temperature"
                  type="number"
                  value={formData.foward_temperature}
                  onChange={handleChange}
                  error={!!fieldErrors.foward_temperature}
                  helperText={fieldErrors.foward_temperature || "Temperatura deve estar entre 0 e 100°C"}
                  inputProps={{
                    min: 0,
                    max: 100,
                    step: 0.1
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Temperatura Reverse (°C)"
                  name="reverse_temperature"
                  type="number"
                  value={formData.reverse_temperature}
                  onChange={handleChange}
                  error={!!fieldErrors.reverse_temperature}
                  helperText={fieldErrors.reverse_temperature || "Temperatura deve estar entre 0 e 100°C"}
                  required
                  inputProps={{ step: "0.1", min: "0", max: "100" }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Início"
                  name="start"
                  type="number"
                  value={formData.start}
                  onChange={handleChange}
                  error={!!fieldErrors.start}
                  helperText={fieldErrors.start || "Início deve ser um número positivo"}
                  required
                  inputProps={{ min: "0" }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fim"
                  name="end"
                  type="number"
                  value={formData.end}
                  onChange={handleChange}
                  error={!!fieldErrors.end}
                  helperText={fieldErrors.end || "Fim deve ser um número positivo"}
                  required
                  inputProps={{ min: "0" }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="BED"
                  name="bed"
                  value={formData.bed}
                  onChange={handleChange}
                  error={!!fieldErrors.bed}
                  helperText={fieldErrors.bed || "BED deve ser um valor válido"}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tamanho"
                  name="size"
                  type="text"
                  value={formData.size}
                  onChange={handleChange}
                  error={!!fieldErrors.size}
                  helperText={fieldErrors.size || "Ex: 230pb, 150bp, etc."}
                  placeholder="230pb"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Campos Compartilháveis */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Campos Compartilháveis
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Estes campos podem ser compartilhados entre diferentes primers
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cromossomo"
                  name="chr"
                  value={formData.chr}
                  onChange={handleChange}
                  error={!!validationError}
                  helperText={validationError || "Cromossomo deve ser um valor válido"}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Transcrito"
                  name="transcrito"
                  value={formData.transcrito}
                  onChange={handleChange}
                  error={!!validationError}
                  helperText={validationError || "Transcrito deve ser um valor válido"}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Condições"
                  name="conditions"
                  value={formData.conditions}
                  onChange={handleChange}
                  error={!!validationError}
                  helperText={validationError || "Condições devem ser um valor válido"}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Éxon"
                  name="exon"
                  value={formData.exon}
                  onChange={handleChange}
                  error={!!validationError}
                  helperText={validationError || "Éxon deve ser um valor válido"}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="genome-version-label">Versão do Genoma</InputLabel>
                  <Select
                    labelId="genome-version-label"
                    id="genome-version"
                    name="genome_version"
                    value={formData.genome_version}
                    label="Versão do Genoma"
                    onChange={handleChange}
                    error={!!validationError}
                  >
                    <MenuItem value="hg19">hg19</MenuItem>
                    <MenuItem value="hg38">hg38</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Botões e Mensagem de Erro */}
              <Grid item xs={12}>
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Salvar'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/primers')}
                      size="large"
                    >
                      Cancelar
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>

      {/* Snackbar para feedback */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={snackbar.severity === 'error' ? 8000 : 4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%', 
            maxWidth: 600,
            whiteSpace: 'pre-line',
            fontSize: '0.95rem'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmação por Senha */}
      <PasswordConfirmation
        open={passwordConfirmOpen}
        onClose={handlePasswordCancel}
        onConfirm={handlePasswordConfirm}
        title={id ? "Confirmação para Editar Primer" : "Confirmação para Criar Primer"}
        message={id ? "Para editar este primer, digite sua senha:" : "Para criar um novo primer, digite sua senha:"}
        actionDescription={id ? "editar primer" : "criar primer"}
      />
    </Container>
  );
};

export default PrimerForm; 