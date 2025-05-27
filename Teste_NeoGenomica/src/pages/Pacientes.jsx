import React from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// Dados de exemplo
const pacientes = [
  {
    id: 1,
    nome: 'João Silva',
    cpf: '123.456.789-00',
    dataNascimento: '15/05/1980',
    telefone: '(11) 98765-4321',
  },
  {
    id: 2,
    nome: 'Maria Santos',
    cpf: '987.654.321-00',
    dataNascimento: '22/08/1992',
    telefone: '(11) 91234-5678',
  },
  // Adicione mais pacientes conforme necessário
];

export default function Pacientes() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Pacientes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => alert('Implementar cadastro de paciente')}
        >
          Novo Paciente
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Data de Nascimento</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pacientes.map((paciente) => (
              <TableRow key={paciente.id}>
                <TableCell>{paciente.nome}</TableCell>
                <TableCell>{paciente.cpf}</TableCell>
                <TableCell>{paciente.dataNascimento}</TableCell>
                <TableCell>{paciente.telefone}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    onClick={() => alert(`Editar paciente ${paciente.id}`)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => alert(`Excluir paciente ${paciente.id}`)}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 