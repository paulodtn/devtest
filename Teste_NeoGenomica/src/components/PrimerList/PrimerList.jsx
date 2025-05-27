import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Collapse,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadIcon from '@mui/icons-material/Upload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearIcon from '@mui/icons-material/Clear';
import TableViewIcon from '@mui/icons-material/TableView';
import { useNavigate } from 'react-router-dom';
import { primerService, auditService } from '../../services/api';
import PasswordConfirmation from '../PasswordConfirmation/PasswordConfirmation';

const PrimerList = () => {
  const [primers, setPrimers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedPrimers, setSelectedPrimers] = useState(new Set());
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [fileName, setFileName] = useState('primers_export');
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Estados para filtros avançados
  const [genomicFilterOpen, setGenomicFilterOpen] = useState(false);
  const [genomicFilters, setGenomicFilters] = useState({
    chr: '',
    start_min: '',
    end_max: ''
  });
  const [appliedGenomicFilters, setAppliedGenomicFilters] = useState({});
  const [isFilteringGenomics, setIsFilteringGenomics] = useState(false);
  
  // Estados para exportação CSV
  const [csvExportModalOpen, setCsvExportModalOpen] = useState(false);
  const [csvFileName, setCsvFileName] = useState('primers_export');
  
  // Estados para menu de exportação
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const exportMenuOpen = Boolean(exportMenuAnchor);
  
  // Estados para confirmação por senha
  const [passwordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  const navigate = useNavigate();
  const theme = useTheme();

  // Função para limpar coordenadas genômicas
  const cleanGenomicCoordinate = (value) => {
    return value.replace(/[^0-9]/g, '');
  };

  // Função para buscar primers (movida para antes dos useEffects)
  const fetchPrimers = useCallback(async (filterParams = {}, showMainLoading = true) => {
    try {
      if (showMainLoading) {
        setLoading(true);
      }
      setError(null);
      console.log('🔄 Iniciando busca de primers com filtros:', filterParams);
      
      // Usar apenas filtros genômicos - search agora funciona sempre localmente
      const allFilters = { ...filterParams };
      
      // Remove campos vazios
      Object.keys(allFilters).forEach(key => {
        if (!allFilters[key] || allFilters[key] === '') {
          delete allFilters[key];
        }
      });
      
      const data = await primerService.listPrimers(allFilters);
      console.log('📋 Dados recebidos no componente:', data);
      
      if (!data || data.length === 0) {
        console.log('⚠️ Nenhum dado recebido da API');
        setPrimers([]);
      } else {
        console.log('✅ Dados processados com sucesso');
        setPrimers(data);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar primers:', err);
      setError(err.message);
      setPrimers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrimers();
  }, [fetchPrimers]);

  // useEffect para filtros genômicos com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const hasGenomicFilters = Object.keys(genomicFilters).some(key => genomicFilters[key]);
      
      if (hasGenomicFilters) {
        setIsFilteringGenomics(true);
        
        // Limpar coordenadas antes de enviar
        const cleanedFilters = {
          chr: genomicFilters.chr,
          start_min: genomicFilters.start_min ? cleanGenomicCoordinate(genomicFilters.start_min) : '',
          end_max: genomicFilters.end_max ? cleanGenomicCoordinate(genomicFilters.end_max) : ''
        };
        
        // Remove campos vazios
        Object.keys(cleanedFilters).forEach(key => {
          if (!cleanedFilters[key] || cleanedFilters[key] === '') {
            delete cleanedFilters[key];
          }
        });
        
        setAppliedGenomicFilters(cleanedFilters);
        fetchPrimers(cleanedFilters, false).finally(() => {
          setIsFilteringGenomics(false);
        });
      } else {
        // Se não há filtros, buscar todos os primers
        setAppliedGenomicFilters({});
        fetchPrimers({}, false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [genomicFilters, fetchPrimers]);

  useEffect(() => {
    if (exportSuccess) {
      const timer = setTimeout(() => {
        setExportSuccess(false);
      }, 5000); // Esconde após 5 segundos
      return () => clearTimeout(timer);
    }
  }, [exportSuccess]);

  const handleDelete = async (id) => {
    // Encontrar o primer para obter o nome
    const primer = primers.find(p => p.id === id);
    const primerName = primer ? primer.label : `ID ${id}`;
    
    // Configurar ação pendente e abrir confirmação por senha
    setPendingAction({
      type: 'delete_primer',
      primerId: id,
      primerName: primerName,
      title: 'Confirmação para Excluir Primer',
      message: `Para excluir o primer "${primerName}", digite sua senha:`,
      actionDescription: 'excluir primer'
    });
    setPasswordConfirmOpen(true);
  };

  // Função para executar exclusão após confirmação de senha
  const executeDelete = async (primerId) => {
    try {
      await primerService.deletePrimer(primerId);
      fetchPrimers();
    } catch (err) {
      console.error('Erro ao excluir primer:', err);
      setError(err.message);
    }
  };

  // Função para lidar com confirmação de senha
  const handlePasswordConfirm = async (password) => {
    if (!pendingAction) return;

    try {
      switch (pendingAction.type) {
        case 'bed_export':
          setExportModalOpen(true);
          break;
        case 'csv_export':
          setCsvExportModalOpen(true);
          break;
        case 'delete_primer':
          await executeDelete(pendingAction.primerId);
          break;
        default:
          console.error('Ação não reconhecida:', pendingAction.type);
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    } finally {
      setPendingAction(null);
    }
  };

  // Função para cancelar confirmação de senha
  const handlePasswordCancel = () => {
    setPendingAction(null);
    setPasswordConfirmOpen(false);
  };

  // Função para gerenciar seleção individual
  const handleSelectPrimer = (primerId) => {
    const newSelected = new Set(selectedPrimers);
    if (newSelected.has(primerId)) {
      newSelected.delete(primerId);
    } else {
      newSelected.add(primerId);
    }
    setSelectedPrimers(newSelected);
  };

  // Função para selecionar/deselecionar todos
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = new Set(filteredPrimers.map(primer => primer.id));
      setSelectedPrimers(allIds);
    } else {
      setSelectedPrimers(new Set());
    }
  };

  // Função para gerar arquivo .bed
  const generateBedFile = () => {
    if (selectedPrimers.size === 0) {
      alert('Selecione pelo menos um primer para exportar.');
      return;
    }
    
    // Configurar ação pendente e abrir confirmação por senha
    setPendingAction({
      type: 'bed_export',
      title: 'Confirmação para Exportação BED',
      message: 'Para exportar o arquivo .bed dos primers selecionados, digite sua senha:',
      actionDescription: 'exportar arquivo .bed'
    });
    setPasswordConfirmOpen(true);
  };

  // Função para exportar CSV
  const generateCsvFile = () => {
    if (selectedPrimers.size === 0) {
      alert('Selecione pelo menos um primer para exportar.');
      return;
    }
    
    // Configurar ação pendente e abrir confirmação por senha
    setPendingAction({
      type: 'csv_export',
      title: 'Confirmação para Exportação CSV',
      message: 'Para exportar o arquivo CSV dos primers selecionados, digite sua senha:',
      actionDescription: 'exportar arquivo CSV'
    });
    setPasswordConfirmOpen(true);
  };

  // Função para executar a exportação após confirmação
  const executeExport = async () => {
    const selectedPrimerData = primers.filter(primer => selectedPrimers.has(primer.id));
    
    const bedContent = selectedPrimerData.map(primer => {
      // Formatar cromossomo (adicionar 'chr' se não estiver presente)
      const chromosome = primer.chr.startsWith('chr') ? primer.chr : `chr${primer.chr}`;
      
      // Usar start e end diretamente (assumindo que já estão no formato correto)
      const start = primer.start;
      const end = primer.end;
      
      // Formatar o nome no padrão LABEL_TRANSCRITO_exonÉXON
      const name = `${primer.label}_${primer.transcrito}_exon${primer.exon}`;
      
      // Retornar linha do .bed (separada por tabs)
      return `${chromosome}\t${start}\t${end}\t${name}`;
    }).join('\n');

    // Criar e baixar o arquivo
    const blob = new Blob([bedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.bed`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Registrar auditoria da exportação
    try {
      await auditService.logBedExport(selectedPrimers.size, Array.from(selectedPrimers));
    } catch (error) {
      console.error('Erro ao registrar auditoria de exportação BED:', error);
    }

    // Limpar seleção e fechar modal
    setSelectedPrimers(new Set());
    setExportModalOpen(false);
    setFileName('primers_export');
    setExportSuccess(true);
  };

  // Função para cancelar exportação
  const cancelExport = () => {
    setExportModalOpen(false);
    setFileName('primers_export');
  };

  // Filtro de primers conforme busca
  const filteredPrimers = primers.filter((primer) => {
    const searchLower = search.toLowerCase();
    return (
      primer.label?.toLowerCase().includes(searchLower) ||
      primer.foward_sequence?.toLowerCase().includes(searchLower) ||
      primer.reverse_sequence?.toLowerCase().includes(searchLower)
    );
  });

  // Função para contar filtros ativos
  const getActiveFiltersCount = () => {
    const genomicCount = Object.keys(appliedGenomicFilters).length;
    const searchCount = search.trim() ? 1 : 0;
    return genomicCount + searchCount;
  };

  // Função para verificar se há algum filtro ativo
  const hasAnyActiveFilter = () => {
    return Object.keys(appliedGenomicFilters).length > 0 || search.trim();
  };

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setSearch('');
    setGenomicFilters({
      chr: '',
      start_min: '',
      end_max: ''
    });
    setAppliedGenomicFilters({});
    fetchPrimers({}, true);
  };

  // Função para lidar com mudanças nos filtros genômicos
  const handleGenomicFilterChange = (field, value) => {
    setGenomicFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para executar exportação CSV
  const executeCsvExport = async () => {
    const selectedPrimerData = primers.filter(primer => selectedPrimers.has(primer.id));
    
    // Cabeçalho do CSV
    const headers = [
      'id', 'label', 'foward_sequence', 'reverse_sequence', 
      'foward_temperature', 'reverse_temperature', 'chr', 'transcrito',
      'start', 'end', 'conditions', 'exon', 'genome_version', 'bed', 'size'
    ];
    
    // Dados do CSV
    const csvContent = [
      headers.join(','),
      ...selectedPrimerData.map(primer => 
        headers.map(header => {
          const value = primer[header] || '';
          // Escapar aspas duplas e envolver em aspas se contém vírgula
          const escapedValue = String(value).replace(/"/g, '""');
          return escapedValue.includes(',') ? `"${escapedValue}"` : escapedValue;
        }).join(',')
      )
    ].join('\n');

    // Criar e baixar o arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${csvFileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Registrar auditoria da exportação
    try {
      await auditService.logCsvExport(selectedPrimers.size, Array.from(selectedPrimers));
    } catch (error) {
      console.error('Erro ao registrar auditoria de exportação CSV:', error);
    }

    // Limpar seleção e fechar modal
    setSelectedPrimers(new Set());
    setCsvExportModalOpen(false);
    setCsvFileName('primers_export');
    setExportSuccess(true);
  };

  // Função para cancelar exportação CSV
  const cancelCsvExport = () => {
    setCsvExportModalOpen(false);
    setCsvFileName('primers_export');
  };

  // Funções para menu de exportação
  const handleExportMenuOpen = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleBedExport = () => {
    handleExportMenuClose();
    generateBedFile();
  };

  const handleCsvExport = () => {
    handleExportMenuClose();
    generateCsvFile();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchPrimers}
          style={{ marginTop: '10px' }}
        >
          Tentar Novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Lista de Primers
        </Typography>
        <Box display="flex" gap={2}>
          {selectedPrimers.size > 0 && (
            <>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportMenuOpen}
                endIcon={<ExpandMoreIcon />}
              >
                Exportar {selectedPrimers.size} primer{selectedPrimers.size > 1 ? 's' : ''}
              </Button>
              <Menu
                anchorEl={exportMenuAnchor}
                open={exportMenuOpen}
                onClose={handleExportMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <MenuItem onClick={handleBedExport}>
                  <ListItemIcon>
                    <FileDownloadIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Arquivo .bed" />
                </MenuItem>
                <MenuItem onClick={handleCsvExport}>
                  <ListItemIcon>
                    <TableViewIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Arquivo CSV" />
                </MenuItem>
              </Menu>
            </>
          )}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<UploadIcon />}
            onClick={() => navigate('/primers/import')}
          >
            Upload de CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/primers/new')}
          >
            Novo Primer
          </Button>
        </Box>
      </Box>

      {exportSuccess && (
        <Alert 
          severity="success" 
          onClose={() => setExportSuccess(false)}
          sx={{ mb: 2 }}
        >
          Arquivo .bed exportado com sucesso! O download deve ter iniciado automaticamente.
        </Alert>
      )}

      <Box mb={2}>
        <Box display="flex" gap={1} alignItems="center">
          <TextField
            label="Buscar por Label, Foward ou Reverse"
            variant="outlined"
            fullWidth
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ 
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.light,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
            InputProps={{ 
              style: { 
                color: theme.palette.text.primary 
              } 
            }}
          />
          
          {hasAnyActiveFilter() && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<ClearIcon />}
              onClick={clearAllFilters}
              sx={{ 
                minWidth: 'auto', 
                whiteSpace: 'nowrap',
                fontWeight: 600
              }}
            >
              Limpar Filtros ({getActiveFiltersCount()})
            </Button>
          )}
        </Box>
      </Box>

      {/* Filtro Avançado */}
      <Box mb={3}>
        <Paper sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                endIcon={genomicFilterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setGenomicFilterOpen(!genomicFilterOpen)}
              >
                Filtro Avançado
                {isFilteringGenomics && (
                  <CircularProgress 
                    size={16} 
                    sx={{ ml: 1, color: 'primary.main' }} 
                  />
                )}
              </Button>
              
              {hasAnyActiveFilter() && (
                <Chip
                  label={`${getActiveFiltersCount()} filtro${getActiveFiltersCount() > 1 ? 's' : ''} ativo${getActiveFiltersCount() > 1 ? 's' : ''}`}
                  color="primary"
                  size="small"
                />
              )}
            </Box>
          </Box>

          <Collapse in={genomicFilterOpen}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cromossomo"
                  value={genomicFilters.chr}
                  onChange={(e) => handleGenomicFilterChange('chr', e.target.value)}
                  placeholder="Ex: 1, 2, X, Y, MT"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Posição Inicial (mínima)"
                  value={genomicFilters.start_min}
                  onChange={(e) => handleGenomicFilterChange('start_min', e.target.value)}
                  placeholder="Ex: 48520301"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Posição Final (máxima)"
                  value={genomicFilters.end_max}
                  onChange={(e) => handleGenomicFilterChange('end_max', e.target.value)}
                  placeholder="Ex: 48530000"
                  size="small"
                />
              </Grid>

              {/* Status da busca */}
              <Grid item xs={12}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'block', 
                    textAlign: 'center', 
                    mt: 1,
                    fontStyle: 'italic'
                  }}
                >
                  {isFilteringGenomics ? (
                    <>🔄 Buscando primers...</>
                  ) : (
                    <>⚡ Busca automática ativa - resultados atualizados em tempo real</>
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Collapse>
        </Paper>
      </Box>

      {primers.length === 0 ? (
        <Alert severity="info">Nenhum primer encontrado</Alert>
      ) : filteredPrimers.length === 0 ? (
        <Alert severity="warning">Nenhum primer corresponde à busca realizada</Alert>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            backgroundColor: theme.palette.background.paper,
            '& .MuiTableCell-root': {
              borderColor: theme.palette.divider,
              padding: { xs: '8px 4px', sm: '16px' },
            },
            overflowX: 'auto',
          }}
        >
          <Table sx={{ tableLayout: 'fixed', minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '60px' }}>
                  <Checkbox
                    indeterminate={selectedPrimers.size > 0 && selectedPrimers.size < filteredPrimers.length}
                    checked={filteredPrimers.length > 0 && selectedPrimers.size === filteredPrimers.length}
                    onChange={handleSelectAll}
                    inputProps={{ 'aria-label': 'Selecionar todos os primers' }}
                  />
                </TableCell>
                <TableCell sx={{ width: '50px' }}>ID</TableCell>
                <TableCell sx={{ width: '130px' }}>Label</TableCell>
                <TableCell sx={{ width: '180px' }}>Sequência Foward</TableCell>
                <TableCell sx={{ width: '180px' }}>Sequência Reverse</TableCell>
                <TableCell align="center" sx={{ width: '100px' }}>Cromossomo</TableCell>
                <TableCell align="center" sx={{ width: '160px' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPrimers.map((primer) => (
                <TableRow key={primer.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPrimers.has(primer.id)}
                      onChange={() => handleSelectPrimer(primer.id)}
                      inputProps={{ 'aria-label': `Selecionar primer ${primer.label}` }}
                    />
                  </TableCell>
                  <TableCell>{primer.id}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {primer.label}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'help'
                      }}
                      title={primer.foward_sequence}
                    >
                      {primer.foward_sequence}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'help'
                      }}
                      title={primer.reverse_sequence}
                    >
                      {primer.reverse_sequence}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {primer.chr}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/primers/${primer.id}`)}
                        title="Ver detalhes"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/primers/${primer.id}/edit`)}
                        title="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(primer.id)}
                        title="Excluir"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de Exportação BED */}
      <Dialog 
        open={exportModalOpen} 
        onClose={cancelExport}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Exportar Primers para Arquivo .bed
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedPrimers.size} primer{selectedPrimers.size > 1 ? 's' : ''} selecionado{selectedPrimers.size > 1 ? 's' : ''} para exportação.
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Nome do arquivo (sem extensão)"
            type="text"
            fullWidth
            variant="outlined"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="primers_export"
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            O arquivo será salvo como: <strong>{fileName}.bed</strong>
          </Typography>

          {selectedPrimers.size > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview do arquivo .bed:
              </Typography>
              <Paper 
                sx={{ 
                  p: 2, 
                  backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                  maxHeight: '200px',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                {primers
                  .filter(primer => selectedPrimers.has(primer.id))
                  .slice(0, 5) // Mostrar apenas as primeiras 5 linhas
                  .map(primer => {
                    const chromosome = primer.chr.startsWith('chr') ? primer.chr : `chr${primer.chr}`;
                    const name = `${primer.label}_${primer.transcrito}_exon${primer.exon}`;
                    return (
                      <Typography 
                        key={primer.id}
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.75rem',
                          lineHeight: 1.4,
                          color: theme.palette.text.primary
                        }}
                      >
                        {chromosome}	{primer.start}	{primer.end}	{name}
                      </Typography>
                    );
                  })}
                {selectedPrimers.size > 5 && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontStyle: 'italic', 
                      color: 'text.secondary',
                      display: 'block',
                      mt: 1
                    }}
                  >
                    ... e mais {selectedPrimers.size - 5} linha{selectedPrimers.size - 5 > 1 ? 's' : ''}
                  </Typography>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelExport} color="secondary">
            Cancelar
          </Button>
          <Button 
            onClick={executeExport} 
            variant="contained" 
            color="primary"
            disabled={!fileName.trim()}
            startIcon={<FileDownloadIcon />}
          >
            Exportar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Exportação CSV */}
      <Dialog 
        open={csvExportModalOpen} 
        onClose={cancelCsvExport}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Exportar Primers para Arquivo CSV
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedPrimers.size} primer{selectedPrimers.size > 1 ? 's' : ''} selecionado{selectedPrimers.size > 1 ? 's' : ''} para exportação.
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Nome do arquivo (sem extensão)"
            type="text"
            fullWidth
            variant="outlined"
            value={csvFileName}
            onChange={(e) => setCsvFileName(e.target.value)}
            placeholder="primers_export"
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            O arquivo será salvo como: <strong>{csvFileName}.csv</strong>
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Campos incluídos no CSV:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
              id, label, foward_sequence, reverse_sequence, foward_temperature, reverse_temperature, 
              chr, transcrito, start, end, conditions, exon, genome_version, bed, size
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelCsvExport} color="secondary">
            Cancelar
          </Button>
          <Button 
            onClick={executeCsvExport} 
            variant="contained" 
            color="primary"
            disabled={!csvFileName.trim()}
            startIcon={<FileDownloadIcon />}
          >
            Exportar CSV
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmação por Senha */}
      <PasswordConfirmation
        open={passwordConfirmOpen}
        onClose={handlePasswordCancel}
        onConfirm={handlePasswordConfirm}
        title={pendingAction?.title}
        message={pendingAction?.message}
        actionDescription={pendingAction?.actionDescription}
      />
    </Box>
  );
};

export default PrimerList; 