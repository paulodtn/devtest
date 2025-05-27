import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';
import { auditService } from '../../services/api';

const AuditHistory = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    entity_type: '',
    action: '',
    user_id: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 20;

  const theme = useTheme();

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        per_page: perPage,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      };

      console.log('🔍 Buscando audit logs com parâmetros:', params);
      const data = await auditService.listAuditLogs(params);
      
      // Garantir que data seja sempre um array
      const logsArray = Array.isArray(data) ? data : [];
      console.log('📋 Audit logs recebidos:', logsArray);
      
      setAuditLogs(logsArray);
      
      // Calcular total de páginas (estimativa baseada no número de resultados)
      // Em uma implementação real, a API deveria retornar metadados de paginação
      setTotalPages(logsArray.length === perPage ? page + 1 : page);
      
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setError(err.message || 'Erro ao carregar histórico de auditoria');
      setAuditLogs([]); // Garantir que seja um array mesmo em caso de erro
    } finally {
      setLoading(false);
    }
  }, [page, filters, perPage]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(1); // Resetar para primeira página ao filtrar
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create_primer':
        return 'success';
      case 'update_primer':
        return 'warning';
      case 'delete_primer':
        return 'error';
      case 'export_bed':
      case 'export_csv':
        return 'info';
      case 'import_csv':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Carregando histórico de auditoria...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Verifique se o servidor está funcionando e tente novamente.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" component="h2">
          Histórico de Ações
        </Typography>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: theme.palette.background.paper }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tipo de Entidade</InputLabel>
            <Select
              value={filters.entity_type}
              label="Tipo de Entidade"
              onChange={(e) => handleFilterChange('entity_type', e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Primer">Primer</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Ação</InputLabel>
            <Select
              value={filters.action}
              label="Ação"
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="create_primer">Criar Primer</MenuItem>
              <MenuItem value="update_primer">Editar Primer</MenuItem>
              <MenuItem value="delete_primer">Excluir Primer</MenuItem>
              <MenuItem value="export_bed">Exportar BED</MenuItem>
              <MenuItem value="export_csv">Exportar CSV</MenuItem>
              <MenuItem value="import_csv">Upload CSV</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="ID do Usuário"
            value={filters.user_id}
            onChange={(e) => handleFilterChange('user_id', e.target.value)}
            sx={{ minWidth: 150 }}
          />
        </Box>
      </Paper>

      {/* Tabela de Histórico */}
      {!Array.isArray(auditLogs) || auditLogs.length === 0 ? (
        <Alert severity="info">
          {!Array.isArray(auditLogs) 
            ? 'Erro no formato dos dados recebidos' 
            : 'Nenhum registro encontrado no histórico'
          }
        </Alert>
      ) : (
        <>
          <TableContainer 
            component={Paper} 
            sx={{ 
              backgroundColor: theme.palette.background.paper,
              '& .MuiTableCell-root': {
                borderColor: theme.palette.divider,
              },
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '60px' }}>ID</TableCell>
                  <TableCell sx={{ width: '400px' }}>Ação</TableCell>
                  <TableCell sx={{ width: '120px' }}>Usuário</TableCell>
                  <TableCell sx={{ width: '180px' }}>Data e Hora</TableCell>
                  <TableCell sx={{ width: '100px' }}>Tipo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={log.action?.replace('_', ' ').toUpperCase() || 'N/A'}
                          color={getActionColor(log.action)}
                          size="small"
                        />
                        <Typography variant="body2">
                          {log.formatted_action || log.action || 'Ação não especificada'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {log.user_name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {log.user_id || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.formatted_date || log.performed_at || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {log.entity_type || 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginação */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AuditHistory; 