import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há token salvo no localStorage ao inicializar
  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log('Inicializando autenticação...');
        
        // Verificar apenas se há token e dados do usuário salvos
        // Não fazer validação com servidor na inicialização para evitar carregamento infinito
        if (authService.isAuthenticated()) {
          console.log('Token e dados do usuário encontrados');
          setIsAuthenticated(true);
          setUser(authService.getUser());
        } else {
          console.log('Nenhum token encontrado');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const result = await authService.login(username, password);
      
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error 
        };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        error: 'Erro interno do sistema. Tente novamente.' 
      };
    }
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 