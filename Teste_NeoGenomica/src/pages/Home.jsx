import React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { Person, Science, Assignment } from '@mui/icons-material';

const statsCards = [
  {
    title: 'Pacientes',
    value: '150+',
    icon: <Person sx={{ fontSize: 40 }} />,
    color: '#2196f3',
  },
  {
    title: 'Exames',
    value: '300+',
    icon: <Science sx={{ fontSize: 40 }} />,
    color: '#f50057',
  },
  {
    title: 'Laudos',
    value: '450+',
    icon: <Assignment sx={{ fontSize: 40 }} />,
    color: '#4caf50',
  },
];

export default function Home() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bem-vindo ao Sistema NeoGenomica
      </Typography>
      <Typography variant="body1" paragraph>
        Gerencie seus pacientes e exames de forma eficiente e segura.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {statsCards.map((card) => (
          <Grid item xs={12} sm={4} key={card.title}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: card.color, mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h5" component="div">
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 