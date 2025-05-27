import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class AuthService {
  constructor() {
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Interceptor para adicionar token automaticamente
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para lidar com respostas de erro
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
          console.log('Token expirado, fazendo logout...');
          this.logout();
          // Evitar redirecionamento se já estiver na página de login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async login(username, password) {
    try {
      console.log('Tentando fazer login...');
      const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
        username,
        password
      }, {
        timeout: 10000 // 10 segundos de timeout
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Salvar token e dados do usuário
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        return {
          success: true,
          user,
          token
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Erro no login',
          blocked: response.data.blocked || false,
          remaining_time: response.data.remaining_time || 0,
          remaining_attempts: response.data.remaining_attempts || 0
        };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data.error || 'Erro no login',
          blocked: error.response.data.blocked || false,
          remaining_time: error.response.data.remaining_time || 0,
          remaining_attempts: error.response.data.remaining_attempts || 0
        };
      }
      
      return {
        success: false,
        error: 'Erro de conexão com o servidor'
      };
    }
  }

  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        await axios.post(`${API_URL}/api/v1/auth/logout`);
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Sempre limpar dados locais
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }

  async validateToken() {
    try {
      const token = this.getToken();
      if (!token) {
        console.log('Nenhum token para validar');
        return false;
      }

      console.log('Validando token com o servidor...');
      const response = await axios.get(`${API_URL}/api/v1/auth/me`, {
        timeout: 10000 // 10 segundos de timeout
      });
      
      if (response.data.success) {
        console.log('Token validado com sucesso');
        // Atualizar dados do usuário se necessário
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        return true;
      }
      
      console.log('Resposta do servidor indica token inválido');
      return false;
    } catch (error) {
      console.error('Erro na validação do token:', error);
      if (error.code === 'ECONNABORTED') {
        console.error('Timeout na validação do token');
      }
      this.logout();
      return false;
    }
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  getUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  async validatePassword(password) {
    try {
      console.log('Validando senha de confirmação...');
      const response = await axios.post(`${API_URL}/api/v1/auth/validate_password`, {
        password
      }, {
        timeout: 10000
      });
      
      if (response.data.success) {
        console.log('Senha de confirmação validada com sucesso');
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.error || 'Senha incorreta'
        };
      }
    } catch (error) {
      console.error('Erro na validação da senha:', error);
      
      if (error.response?.data?.error) {
        return {
          success: false,
          error: error.response.data.error
        };
      }
      
      return {
        success: false,
        error: 'Erro de conexão com o servidor'
      };
    }
  }
}

const authServiceInstance = new AuthService();
export default authServiceInstance; 