import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import { primerService } from '../../services/api';
import PasswordConfirmation from '../PasswordConfirmation/PasswordConfirmation';

const PrimerImport = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showExample, setShowExample] = useState(false);
  
  // Estados para confirmação por senha
  const [passwordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();

  // Campos obrigatórios do CSV
  const requiredFields = [
    'label', 'foward_sequence', 'reverse_sequence', 'foward_temperature',
    'reverse_temperature', 'chr', 'transcrito', 'start', 'end', 'conditions',
    'exon', 'genome_version', 'bed', 'size'
  ];

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      setSelectedFile(csvFile);
      setError(null);
      setResult(null);
    } else {
      setError('Por favor, selecione um arquivo .csv');
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
        setResult(null);
      } else {
        setError('Por favor, selecione um arquivo .csv');
        setSelectedFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Nenhum arquivo selecionado');
      return;
    }

    // Abrir confirmação por senha
    setPendingImport(true);
    setPasswordConfirmOpen(true);
  };

  // Função para executar importação após confirmação de senha
  const executeImport = async () => {
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await primerService.importPrimersCSV(selectedFile);
      setResult(response);
      
      if (response.success) {
        // Limpar formulário após sucesso
        setTimeout(() => {
          setSelectedFile(null);
          // Reset do input file
          const fileInput = document.getElementById('csv-file-input');
          if (fileInput) fileInput.value = '';
        }, 2000);
      }
    } catch (err) {
      console.error('Erro na importação:', err);
      
      if (err.response?.data) {
        setError(err.response.data.errors || ['Erro na importação']);
      } else {
        setError(['Erro interno. Tente novamente.']);
      }
    } finally {
      setUploading(false);
    }
  };

  // Função para lidar com confirmação de senha
  const handlePasswordConfirm = async (password) => {
    if (pendingImport) {
      await executeImport();
      setPendingImport(false);
    }
  };

  // Função para cancelar confirmação de senha
  const handlePasswordCancel = () => {
    setPendingImport(false);
    setPasswordConfirmOpen(false);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    const fileInput = document.getElementById('csv-file-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <Box>
      {/* Cabeçalho */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Upload de Primers via CSV
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/primers')}
          >
            Voltar para Lista
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Área de Upload */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              border: isDragOver ? `2px dashed ${theme.palette.primary.main}` : `2px dashed ${theme.palette.divider}`,
              backgroundColor: isDragOver ? theme.palette.action.hover : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                border: `2px dashed ${theme.palette.primary.main}`,
                backgroundColor: theme.palette.action.hover,
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('csv-file-input').click()}
          >
            <Box textAlign="center">
              <CloudUploadIcon 
                sx={{ 
                  fontSize: 64, 
                  color: theme.palette.primary.main,
                  mb: 2 
                }} 
              />
              <Typography variant="h6" gutterBottom>
                Arraste e solte seu arquivo CSV aqui
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ou clique para selecionar um arquivo
              </Typography>
              
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{ mt: 2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  document.getElementById('csv-file-input').click();
                }}
              >
                Selecionar Arquivo CSV
              </Button>
            </Box>
          </Paper>

          {/* Arquivo Selecionado */}
          {selectedFile && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">
                      Arquivo Selecionado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={resetForm}
                    >
                      Remover
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleImport}
                      disabled={uploading}
                    >
                      {uploading ? 'Importando...' : 'Importar'}
                    </Button>
                  </Box>
                </Box>
                
                {uploading && (
                  <Box mt={2}>
                    <LinearProgress />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Processando arquivo... Isso pode levar alguns segundos.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resultados */}
          {result && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  {result.success ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                  <Typography variant="h6">
                    {result.success ? 'Importação Concluída!' : 'Importação com Problemas'}
                  </Typography>
                </Box>

                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {result.inserted_count || 0}
                      </Typography>
                      <Typography variant="caption">
                        Inseridos
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="info.main">
                        {result.updated_count || 0}
                      </Typography>
                      <Typography variant="caption">
                        Atualizados
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary.main">
                        {result.total_processed || 0}
                      </Typography>
                      <Typography variant="caption">
                        Total Processados
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="error.main">
                        {result.errors?.length || 0}
                      </Typography>
                      <Typography variant="caption">
                        Erros
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {result.errors && result.errors.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Problemas encontrados:
                    </Typography>
                    <List dense>
                      {result.errors.slice(0, 5).map((error, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemText 
                            primary={error}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                      {result.errors.length > 5 && (
                        <ListItem sx={{ py: 0 }}>
                          <ListItemText 
                            primary={`... e mais ${result.errors.length - 5} erro(s)`}
                            primaryTypographyProps={{ variant: 'body2', fontStyle: 'italic' }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Alert>
                )}

                {result.success && result.total_processed > 0 && (
                  <Box mt={2}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/primers')}
                    >
                      Ver Primers Importados
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Erros */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {Array.isArray(error) ? (
                <List dense>
                  {error.map((err, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemText primary={err} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                error
              )}
            </Alert>
          )}
        </Grid>

        {/* Informações e Instruções */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Instruções de Importação
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Formato do arquivo:</strong>
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Arquivo deve ter extensão .csv"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Primeira linha deve conter cabeçalhos"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Use codificação UTF-8"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" paragraph>
                <strong>Comportamento da importação:</strong>
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Primers com labels existentes serão atualizados"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Novos primers serão inseridos"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Operação é atômica (tudo ou nada)"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => setShowExample(true)}
              >
                Ver Campos Obrigatórios
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal com Campos Obrigatórios */}
      <Dialog
        open={showExample}
        onClose={() => setShowExample(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Campos Obrigatórios do CSV
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            O arquivo CSV deve conter exatamente estes campos no cabeçalho (primeira linha):
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            {requiredFields.map((field, index) => (
              <Chip
                key={field}
                label={field}
                size="small"
                sx={{ m: 0.5 }}
                color={['label', 'foward_sequence', 'reverse_sequence', 'chr'].includes(field) ? 'error' : 'default'}
              />
            ))}
          </Box>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Os campos <strong>label</strong>, <strong>foward_sequence</strong>, <strong>reverse_sequence</strong> e <strong>chr</strong> são obrigatórios e não podem estar vazios.
            </Typography>
          </Alert>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Exemplo de linha válida:</strong>
          </Typography>
          <Paper sx={{ p: 1, mt: 1, backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
            <Typography variant="caption" component="pre" sx={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>
              PRIMER001,ATCGATCG,CGTAGCTA,60.5,62.1,chr1,NM_001234,100000,100200,PCR,1,GRCh38,chr1:100000-100200,200
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExample(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmação por Senha */}
      <PasswordConfirmation
        open={passwordConfirmOpen}
        onClose={handlePasswordCancel}
        onConfirm={handlePasswordConfirm}
        title="Confirmação para Upload de CSV"
        message={`Para importar o arquivo "${selectedFile?.name}", digite sua senha:`}
        actionDescription="importar arquivo CSV"
      />
    </Box>
  );
};

export default PrimerImport; 