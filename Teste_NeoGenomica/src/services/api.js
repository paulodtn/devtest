import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 segundos de timeout
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    console.log('📤 Fazendo requisição para:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const primerService = {
  // Listar todos os primers (com filtros opcionais)
  listPrimers: async (filters = {}) => {
    try {
      // Construir parâmetros de filtro
      const params = new URLSearchParams();
      
      // Filtros básicos
      if (filters.search) params.append('search', filters.search);
      if (filters.chr) params.append('chr', filters.chr);
      if (filters.start_min) params.append('start_min', filters.start_min);
      if (filters.start_max) params.append('start_max', filters.start_max);
      if (filters.end_min) params.append('end_min', filters.end_min);
      if (filters.end_max) params.append('end_max', filters.end_max);
      if (filters.temp_min) params.append('temp_min', filters.temp_min);
      if (filters.temp_max) params.append('temp_max', filters.temp_max);
      if (filters.transcrito) params.append('transcrito', filters.transcrito);
      if (filters.exon) params.append('exon', filters.exon);
      if (filters.genome_version) params.append('genome_version', filters.genome_version);
      if (filters.foward_sequence) params.append('foward_sequence', filters.foward_sequence);
      if (filters.reverse_sequence) params.append('reverse_sequence', filters.reverse_sequence);
      
      // Filtro de região genômica
      if (filters.region_chr) params.append('region_chr', filters.region_chr);
      if (filters.region_start) params.append('region_start', filters.region_start);
      if (filters.region_end) params.append('region_end', filters.region_end);
      
      const queryString = params.toString();
      const url = queryString ? `/primers?${queryString}` : '/primers';
      
      const response = await api.get(url);
      console.log('📦 Resposta completa da API:', response);
      console.log('📦 Dados recebidos da API:', response.data);
      
      // Verifica se response.data é um array ou se está dentro de alguma propriedade
      let primers = [];
      if (Array.isArray(response.data)) {
        primers = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Verifica se os dados estão dentro da propriedade 'primers'
        if (response.data.primers && Array.isArray(response.data.primers)) {
          primers = response.data.primers;
        } else {
          // Verifica se os dados estão dentro de alguma outra propriedade
          primers = response.data.data || [];
          
          // Se não encontrou em nenhuma propriedade, tenta usar o próprio objeto
          if (primers.length === 0 && response.data.id) {
            primers = [response.data];
          }
        }
      }
      
      console.log('📦 Primers processados:', primers);
      return primers;
    } catch (error) {
      console.error('💥 Erro ao buscar primers:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao carregar primers');
    }
  },

  // Buscar um primer específico
  getPrimer: async (id) => {
    try {
      console.log('🔍 Buscando primer com ID:', id);
      const response = await api.get(`/primers/${id}`);
      console.log('📦 Resposta completa da API:', response);
      console.log('📦 Dados recebidos da API:', response.data);
      
      // Verifica se os dados estão dentro de alguma propriedade do objeto
      let primer = response.data;
      if (response.data && typeof response.data === 'object') {
        primer = response.data.primer || response.data.data || response.data;
      }
      
      console.log('📦 Primer processado:', primer);
      return primer;
    } catch (error) {
      console.error('💥 Erro ao buscar primer:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao carregar primer');
    }
  },

  // Criar um novo primer
  createPrimer: async (primerData) => {
    try {
      console.log('📝 Criando novo primer:', primerData);
      const response = await api.post('/primers', { primer: primerData });
      console.log('✅ Primer criado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 Erro ao criar primer:', error);
      
      // Se for um erro de validação (422), propaga o erro com a mensagem do backend
      if (error.response?.status === 422) {
        throw error;
      }
      
      // Para outros erros, lança uma mensagem genérica
      throw new Error('Erro ao criar primer. Por favor, tente novamente.');
    }
  },

  // Atualizar um primer existente
  updatePrimer: async (id, primerData) => {
    try {
      console.log('📝 Atualizando primer:', { id, primerData });
      const response = await api.put(`/primers/${id}`, { primer: primerData });
      console.log('✅ Primer atualizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 Erro ao atualizar primer:', error);
      
      // Se for um erro de validação (422), propaga o erro com a mensagem do backend
      if (error.response?.status === 422) {
        throw error;
      }
      
      // Para outros erros, lança uma mensagem genérica
      throw new Error('Erro ao atualizar primer. Por favor, tente novamente.');
    }
  },

  // Excluir um primer
  deletePrimer: async (id) => {
    try {
      await api.delete(`/primers/${id}`);
      return true;
    } catch (error) {
      console.error('💥 Erro ao excluir primer:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao excluir primer');
    }
  },

  // Importar primers via CSV
  importPrimersCSV: async (file) => {
    try {
      console.log('📤 Iniciando importação CSV:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/primer_imports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000 // 60 segundos para upload e processamento
      });
      
      console.log('✅ Importação CSV concluída:', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 Erro na importação CSV:', error);
      
      // Se for um erro com dados específicos do backend, propaga
      if (error.response?.data) {
        throw error;
      }
      
      // Para outros erros, lança uma mensagem genérica
      throw new Error('Erro na importação. Por favor, tente novamente.');
    }
  }
};

export const auditService = {
  // Listar histórico de auditoria
  listAuditLogs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.user_id) queryParams.append('user_id', params.user_id);
      if (params.entity_type) queryParams.append('entity_type', params.entity_type);
      if (params.action) queryParams.append('action_filter', params.action);
      if (params.page) queryParams.append('page', params.page);
      if (params.per_page) queryParams.append('per_page', params.per_page);
      
      const url = queryParams.toString() 
        ? `/audit_logs?${queryParams.toString()}`
        : `/audit_logs`;
        
      const response = await api.get(url);
      
      // Garantir que sempre retornamos um array
      let auditLogs = [];
      if (Array.isArray(response.data)) {
        auditLogs = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Verificar se os dados estão dentro de alguma propriedade
        if (response.data.audit_logs && Array.isArray(response.data.audit_logs)) {
          auditLogs = response.data.audit_logs;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          auditLogs = response.data.data;
        } else {
          // Se não encontrou em nenhuma propriedade, retorna array vazio
          auditLogs = [];
        }
      }
      
      console.log('📦 Audit logs processados:', auditLogs);
      return auditLogs;
    } catch (error) {
      console.error('Erro ao buscar histórico de auditoria:', error);
      throw error;
    }
  },

  // Obter detalhes de um log específico
  getAuditLog: async (id) => {
    try {
      const response = await api.get(`/audit_logs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar log de auditoria:', error);
      throw error;
    }
  },

  // Registrar exportação BED (chamado do frontend)
  logBedExport: async (primersCount, selectedPrimers) => {
    try {
      const response = await api.post('/audit_logs/log_bed_export', {
        primers_count: primersCount,
        selected_primers: selectedPrimers
      });
      
      console.log('Exportação BED registrada:', response.data);
      return response.data.success;
    } catch (error) {
      console.error('Erro ao registrar exportação BED:', error);
      return false;
    }
  },

  // Registrar exportação CSV (chamado do frontend)
  logCsvExport: async (primersCount, selectedPrimers) => {
    try {
      const response = await api.post('/audit_logs/log_csv_export', {
        primers_count: primersCount,
        selected_primers: selectedPrimers
      });
      
      console.log('Exportação CSV registrada:', response.data);
      return response.data.success;
    } catch (error) {
      console.error('Erro ao registrar exportação CSV:', error);
      return false;
    }
  }
};

export default api; 