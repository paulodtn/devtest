import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { ThemeModeProvider, useThemeMode } from './context/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Importando as páginas
import Home from './pages/Home';
import Pacientes from './pages/Pacientes';
import Exames from './pages/Exames';

// Importando os componentes dos primers
import PrimerList from './components/PrimerList/PrimerList';
import PrimerDetail from './components/PrimerDetail/PrimerDetail';
import PrimerForm from './components/PrimerForm/PrimerForm';
import PrimerImport from './components/PrimerImport/PrimerImport';
import AuditHistory from './components/AuditHistory/AuditHistory';

function AppRoutes() {
  const { muiTheme } = useThemeMode();
  
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/pacientes" element={<Pacientes />} />
                  <Route path="/exames" element={<Exames />} />
                  <Route path="/primers" element={<PrimerList />} />
                  <Route path="/primers/new" element={<PrimerForm />} />
                  <Route path="/primers/import" element={<PrimerImport />} />
                  <Route path="/primers/:id" element={<PrimerDetail />} />
                  <Route path="/primers/:id/edit" element={<PrimerForm />} />
                  <Route path="/historico" element={<AuditHistory />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeModeProvider>
        <AppRoutes />
      </ThemeModeProvider>
    </AuthProvider>
  );
}

export default App; 