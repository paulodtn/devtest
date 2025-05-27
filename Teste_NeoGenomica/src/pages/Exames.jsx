import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
  Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// Dados de exemplo
const exames = [
  {
    id: 1,
    tipo: 'Sequenciamento Completo',
    paciente: 'João Silva',
    status: 'Em Análise',
    dataColeta: '10/05/2024',
    previsaoEntrega: '20/05/2024',
  },
  {
    id: 2,
    tipo: 'Painel Genético',
    paciente: 'Maria Santos',
    status: 'Concluído',
    dataColeta: '05/05/2024',
    previsaoEntrega: '15/05/2024',
  },
  // Adicione mais exames conforme necessário
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Em Análise':
      return 'warning';
    case 'Concluído':
      return 'success';
    default:
      return 'default';
  }
};

export default function Exames() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Exames</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => alert('Implementar cadastro de exame')}
        >
          Novo Exame
        </Button>
      </Box>

      <Grid container spacing={3}>
        {exames.map((exame) => (
          <Grid item xs={12} sm={6} md={4} key={exame.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {exame.tipo}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Paciente: {exame.paciente}
                </Typography>
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Chip
                    label={exame.status}
                    color={getStatusColor(exame.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2">
                  Data da Coleta: {exame.dataColeta}
                </Typography>
                <Typography variant="body2">
                  Previsão de Entrega: {exame.previsaoEntrega}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Ver Detalhes</Button>
                <Button size="small" color="primary">
                  Editar
                </Button>
                <Button size="small" color="error">
                  Excluir
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 