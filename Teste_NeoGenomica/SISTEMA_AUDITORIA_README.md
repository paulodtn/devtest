# Sistema de Auditoria - NeoGenômica

## 📋 Visão Geral

Sistema completo de auditoria para rastreamento de ações dos usuários no sistema NeoGenômica. Registra automaticamente todas as operações realizadas pelos usuários para fins de compliance e rastreabilidade.

## 🎯 Funcionalidades Implementadas

### Ações Registradas Automaticamente:

1. **✅ Criar Primer** - Registra nome do primer criado
2. **✅ Editar Primer** - Registra nome do primer editado e dados anteriores
3. **✅ Excluir Primer** - Registra nome do primer excluído
4. **✅ Exportar arquivo .bed** - Registra quantidade de primers exportados
5. **✅ Exportar arquivo CSV** - Registra quantidade de primers exportados
6. **✅ Upload de arquivo CSV** - Registra detalhes da importação (criados/atualizados)

## 🗄️ Estrutura do Backend (Rails)

### 1. Tabela de Auditoria (`audit_logs`)

```sql
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY,
  action VARCHAR NOT NULL,              -- Tipo de ação
  entity_type VARCHAR NOT NULL,         -- Tipo da entidade (Primer)
  entity_id INTEGER,                    -- ID da entidade (quando aplicável)
  entity_name VARCHAR,                  -- Nome/label da entidade
  user_id VARCHAR NOT NULL,             -- ID do usuário
  user_name VARCHAR NOT NULL,           -- Nome do usuário
  details TEXT,                         -- Detalhes em JSON
  performed_at TIMESTAMP NOT NULL,      -- Data e hora da ação
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_performed_at ON audit_logs(performed_at);
CREATE INDEX idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);
```

### 2. Modelo AuditLog

**Arquivo:** `app/models/audit_log.rb`

```ruby
class AuditLog < ApplicationRecord
  # Validações
  validates :action, :entity_type, :user_id, :user_name, :performed_at, presence: true
  
  # Scopes para facilitar consultas
  scope :recent, -> { order(performed_at: :desc) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }
  scope :by_entity_type, ->(type) { where(entity_type: type) }
  scope :by_action, ->(action) { where(action: action) }
  
  # Método para criar log de auditoria
  def self.log_action(action:, entity_type:, entity_id: nil, entity_name: nil, user_id:, user_name:, details: nil)
    create!(
      action: action,
      entity_type: entity_type,
      entity_id: entity_id,
      entity_name: entity_name,
      user_id: user_id,
      user_name: user_name,
      details: details&.to_json,
      performed_at: Time.current
    )
  end
  
  # Método para formatar a ação para exibição
  def formatted_action
    case action
    when 'create_primer'
      "Criou primer: #{entity_name}"
    when 'update_primer'
      "Editou primer: #{entity_name}"
    when 'delete_primer'
      "Excluiu primer: #{entity_name}"
    when 'export_bed'
      details_hash = parsed_details
      count = details_hash['primers_count'] || 0
      "Exportou #{count} primer(s) para arquivo .bed"
    when 'export_csv'
      details_hash = parsed_details
      count = details_hash['primers_count'] || 0
      "Exportou #{count} primer(s) para arquivo CSV"
    when 'import_csv'
      details_hash = parsed_details
      created = details_hash['created_count'] || 0
      updated = details_hash['updated_count'] || 0
      "Upload CSV: #{created} criados, #{updated} atualizados"
    else
      action.humanize
    end
  end
  
  # Método para formatar data em português
  def formatted_date
    performed_at.strftime('%d/%m/%Y às %H:%M')
  end
end
```

### 3. Concern Auditable

**Arquivo:** `app/controllers/concerns/auditable.rb`

```ruby
module Auditable
  extend ActiveSupport::Concern
  
  private
  
  def log_audit_action(action:, entity_type:, entity_id: nil, entity_name: nil, details: nil)
    # Por enquanto, vamos usar dados fixos do usuário
    # Quando implementarmos autenticação real, isso virá do current_user
    user_id = 'admin_1'
    user_name = 'Administrador'
    
    AuditLog.log_action(
      action: action,
      entity_type: entity_type,
      entity_id: entity_id,
      entity_name: entity_name,
      user_id: user_id,
      user_name: user_name,
      details: details
    )
  rescue => e
    # Log do erro mas não falha a operação principal
    Rails.logger.error "Erro ao registrar auditoria: #{e.message}"
  end
end
```

### 4. Controllers Atualizados

#### PrimersController

**Arquivo:** `app/controllers/api/v1/primers_controller.rb`

```ruby
class Api::V1::PrimersController < ApplicationController
  include Auditable
  
  # POST /api/v1/primers
  def create
    @primer = Primer.new(primer_params)
    
    if @primer.save
      # Log da auditoria
      log_audit_action(
        action: 'create_primer',
        entity_type: 'Primer',
        entity_id: @primer.id,
        entity_name: @primer.label
      )
      
      render json: @primer, status: :created
    else
      # ... tratamento de erros
    end
  end

  # PATCH/PUT /api/v1/primers/:id
  def update
    old_label = @primer.label # Guardar o label original
    
    if @primer.update(primer_params)
      # Log da auditoria
      log_audit_action(
        action: 'update_primer',
        entity_type: 'Primer',
        entity_id: @primer.id,
        entity_name: @primer.label,
        details: { previous_label: old_label }
      )
      
      render json: @primer
    else
      # ... tratamento de erros
    end
  end

  # DELETE /api/v1/primers/:id
  def destroy
    primer_label = @primer.label # Guardar o label antes de excluir
    primer_id = @primer.id
    
    @primer.destroy
    
    # Log da auditoria
    log_audit_action(
      action: 'delete_primer',
      entity_type: 'Primer',
      entity_id: primer_id,
      entity_name: primer_label
    )
    
    head :no_content
  end
end
```

#### PrimerImportsController

**Arquivo:** `app/controllers/api/v1/primer_imports_controller.rb`

```ruby
class Api::V1::PrimerImportsController < ApplicationController
  include Auditable
  
  def create
    # ... processamento do CSV
    
    # Log da auditoria se houve sucesso
    if errors.empty? || (inserted_count > 0 || updated_count > 0)
      log_audit_action(
        action: 'import_csv',
        entity_type: 'Primer',
        details: {
          filename: file.original_filename,
          total_rows: csv_data.size,
          created_count: inserted_count,
          updated_count: updated_count,
          errors_count: errors.size
        }
      )
    end
  end
end
```

#### AuditLogsController

**Arquivo:** `app/controllers/api/v1/audit_logs_controller.rb`

```ruby
class Api::V1::AuditLogsController < ApplicationController
  include Auditable
  
  # GET /api/v1/audit_logs
  def index
    @audit_logs = AuditLog.recent
    
    # Filtros opcionais
    @audit_logs = @audit_logs.by_user(params[:user_id]) if params[:user_id].present?
    @audit_logs = @audit_logs.by_entity_type(params[:entity_type]) if params[:entity_type].present?
    @audit_logs = @audit_logs.by_action(params[:action]) if params[:action].present?
    
    # Paginação
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 50
    per_page = [per_page, 100].min # Máximo 100 por página
    
    @audit_logs = @audit_logs.limit(per_page).offset((page - 1) * per_page)
    
    render json: @audit_logs, each_serializer: AuditLogSerializer
  end

  # POST /api/v1/audit_logs/log_bed_export
  def log_bed_export
    primers_count = params[:primers_count]&.to_i || 0
    selected_primers = params[:selected_primers] || []
    
    log_audit_action(
      action: 'export_bed',
      entity_type: 'Primer',
      details: {
        primers_count: primers_count,
        selected_primer_ids: selected_primers,
        export_format: 'bed'
      }
    )
    
    render json: { success: true, message: 'Exportação BED registrada com sucesso' }
  end

  # POST /api/v1/audit_logs/log_csv_export
  def log_csv_export
    primers_count = params[:primers_count]&.to_i || 0
    selected_primers = params[:selected_primers] || []
    
    log_audit_action(
      action: 'export_csv',
      entity_type: 'Primer',
      details: {
        primers_count: primers_count,
        selected_primer_ids: selected_primers,
        export_format: 'csv'
      }
    )
    
    render json: { success: true, message: 'Exportação CSV registrada com sucesso' }
  end
end
```

### 5. Serializer

**Arquivo:** `app/serializers/audit_log_serializer.rb`

```ruby
class AuditLogSerializer < ActiveModel::Serializer
  attributes :id, :action, :entity_type, :entity_id, :entity_name, 
             :user_id, :user_name, :details, :performed_at, 
             :formatted_action, :formatted_date, :parsed_details

  def parsed_details
    object.parsed_details
  end
end
```

### 6. Rotas

**Arquivo:** `config/routes.rb`

```ruby
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Rotas completas para primers (CRUD)
      resources :primers
      
      # Rota para importação de primers via CSV
      resources :primer_imports, only: [:create]
      
      # Rotas para histórico de auditoria
      resources :audit_logs, only: [:index, :show] do
        collection do
          post :log_bed_export
          post :log_csv_export
        end
      end
    end
  end
end
```

## 🎨 Frontend (React)

### 1. Serviço de Auditoria

**Arquivo:** `src/services/api.js`

```javascript
export const auditService = {
  // Listar histórico de auditoria
  listAuditLogs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.user_id) queryParams.append('user_id', params.user_id);
      if (params.entity_type) queryParams.append('entity_type', params.entity_type);
      if (params.action) queryParams.append('action', params.action);
      if (params.page) queryParams.append('page', params.page);
      if (params.per_page) queryParams.append('per_page', params.per_page);
      
      const url = queryParams.toString() 
        ? `/audit_logs?${queryParams.toString()}`
        : `/audit_logs`;
        
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de auditoria:', error);
      throw error;
    }
  },

  // Registrar exportação BED
  logBedExport: async (primersCount, selectedPrimers) => {
    try {
      const response = await api.post('/audit_logs/log_bed_export', {
        primers_count: primersCount,
        selected_primers: selectedPrimers
      });
      
      return response.data.success;
    } catch (error) {
      console.error('Erro ao registrar exportação BED:', error);
      return false;
    }
  },

  // Registrar exportação CSV
  logCsvExport: async (primersCount, selectedPrimers) => {
    try {
      const response = await api.post('/audit_logs/log_csv_export', {
        primers_count: primersCount,
        selected_primers: selectedPrimers
      });
      
      return response.data.success;
    } catch (error) {
      console.error('Erro ao registrar exportação CSV:', error);
      return false;
    }
  }
};
```

### 2. Componente AuditHistory

**Arquivo:** `src/components/AuditHistory/AuditHistory.jsx`

```javascript
import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, CircularProgress, Alert, TextField,
  MenuItem, FormControl, InputLabel, Select, Pagination, Chip
} from '@mui/material';
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
  const perPage = 20;

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

      const data = await auditService.listAuditLogs(params);
      setAuditLogs(data);
      
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filters, perPage]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const getActionColor = (action) => {
    switch (action) {
      case 'create_primer': return 'success';
      case 'update_primer': return 'warning';
      case 'delete_primer': return 'error';
      case 'export_bed':
      case 'export_csv': return 'info';
      case 'import_csv': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" mb={3}>
        Histórico de Ações
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filtros</Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tipo de Entidade</InputLabel>
            <Select
              value={filters.entity_type}
              label="Tipo de Entidade"
              onChange={(e) => setFilters(prev => ({...prev, entity_type: e.target.value}))}
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
              onChange={(e) => setFilters(prev => ({...prev, action: e.target.value}))}
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
        </Box>
      </Paper>

      {/* Tabela de Histórico */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Ação</TableCell>
              <TableCell>Usuário</TableCell>
              <TableCell>Data e Hora</TableCell>
              <TableCell>Tipo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={log.action.replace('_', ' ').toUpperCase()}
                      color={getActionColor(log.action)}
                      size="small"
                    />
                    <Typography variant="body2">
                      {log.formatted_action}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {log.user_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {log.user_id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {log.formatted_date}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {log.entity_type}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuditHistory;
```

### 3. Integração com PrimerList

**Arquivo:** `src/components/PrimerList/PrimerList.jsx`

```javascript
import { primerService, auditService } from '../../services/api';

// Função para executar a exportação BED
const executeExport = async () => {
  // ... código de exportação ...

  // Registrar auditoria da exportação
  try {
    await auditService.logBedExport(selectedPrimers.size, Array.from(selectedPrimers));
  } catch (error) {
    console.error('Erro ao registrar auditoria de exportação BED:', error);
  }

  // ... resto do código ...
};

// Função para executar exportação CSV
const executeCsvExport = async () => {
  // ... código de exportação ...

  // Registrar auditoria da exportação
  try {
    await auditService.logCsvExport(selectedPrimers.size, Array.from(selectedPrimers));
  } catch (error) {
    console.error('Erro ao registrar auditoria de exportação CSV:', error);
  }

  // ... resto do código ...
};
```

### 4. Rotas do Frontend

**Arquivo:** `src/App.jsx`

```javascript
import AuditHistory from './components/AuditHistory/AuditHistory';

function AppRoutes() {
  return (
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
  );
}
```

### 5. Menu de Navegação

**Arquivo:** `src/components/Layout/Layout.jsx`

```javascript
import { History as HistoryIcon } from '@mui/icons-material';

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Pacientes', icon: <PersonIcon />, path: '/pacientes' },
  { text: 'Exames', icon: <ScienceIcon />, path: '/exames' },
  { text: 'Primers', icon: <BiotechIcon />, path: '/primers' },
  { text: 'Histórico', icon: <HistoryIcon />, path: '/historico' },
];
```

## 🔒 Características de Segurança

### Imutabilidade
- **Registros não podem ser modificados ou excluídos**
- Apenas operações de leitura são permitidas via API
- Estrutura de dados preserva integridade histórica

### Rastreabilidade Completa
- **Usuário**: ID e nome do usuário que executou a ação
- **Timestamp**: Data e hora exata da ação
- **Entidade**: Tipo e ID da entidade afetada
- **Detalhes**: Informações adicionais em JSON
- **Ação**: Tipo específico da operação realizada

### Performance Otimizada
- **Índices estratégicos** para consultas frequentes
- **Paginação** para grandes volumes de dados
- **Filtros eficientes** por usuário, tipo e ação
- **Consultas otimizadas** com scopes do ActiveRecord

## 📊 Tipos de Ações Registradas

| Ação | Descrição | Detalhes Registrados |
|------|-----------|---------------------|
| `create_primer` | Criação de novo primer | ID e nome do primer |
| `update_primer` | Edição de primer existente | ID, nome atual e anterior |
| `delete_primer` | Exclusão de primer | ID e nome do primer excluído |
| `export_bed` | Exportação arquivo .bed | Quantidade e IDs dos primers |
| `export_csv` | Exportação arquivo CSV | Quantidade e IDs dos primers |
| `import_csv` | Upload arquivo CSV | Nome do arquivo, criados, atualizados |

## 🚀 Como Usar

### Para Desenvolvedores

1. **Incluir auditoria em novos controllers:**
```ruby
class MeuController < ApplicationController
  include Auditable
  
  def minha_acao
    # ... lógica da ação ...
    
    log_audit_action(
      action: 'minha_acao',
      entity_type: 'MinhaEntidade',
      entity_id: @entidade.id,
      entity_name: @entidade.nome,
      details: { info_adicional: 'valor' }
    )
  end
end
```

2. **Consultar histórico via API:**
```bash
# Listar todos os logs
GET /api/v1/audit_logs

# Filtrar por usuário
GET /api/v1/audit_logs?user_id=admin_1

# Filtrar por ação
GET /api/v1/audit_logs?action=create_primer

# Paginação
GET /api/v1/audit_logs?page=2&per_page=20
```

### Para Usuários Finais

1. **Acessar histórico**: Menu lateral → "Histórico"
2. **Visualizar ações**: Todas as ações são registradas automaticamente
3. **Filtrar resultados**: Use os filtros para encontrar ações específicas
4. **Navegar páginas**: Use a paginação para ver mais registros

## 🔧 Instalação e Configuração

### Backend

1. **Executar migration:**
```bash
cd meu_projeto_backend
rails db:migrate
```

2. **Verificar tabela criada:**
```bash
rails console
AuditLog.count
```

### Frontend

1. **Componente já integrado** no sistema de rotas
2. **Menu já configurado** na sidebar
3. **Serviços já implementados** para comunicação com API

## 📝 Logs de Exemplo

```json
{
  "id": 1,
  "action": "create_primer",
  "entity_type": "Primer",
  "entity_id": 123,
  "entity_name": "PRIMER_001",
  "user_id": "admin_1",
  "user_name": "Administrador",
  "details": null,
  "performed_at": "2025-05-26T05:15:30.000Z",
  "formatted_action": "Criou primer: PRIMER_001",
  "formatted_date": "26/05/2025 às 02:15"
}
```

```json
{
  "id": 2,
  "action": "export_bed",
  "entity_type": "Primer",
  "entity_id": null,
  "entity_name": null,
  "user_id": "admin_1",
  "user_name": "Administrador",
  "details": "{\"primers_count\":5,\"selected_primer_ids\":[1,2,3,4,5],\"export_format\":\"bed\"}",
  "performed_at": "2025-05-26T05:20:45.000Z",
  "formatted_action": "Exportou 5 primer(s) para arquivo .bed",
  "formatted_date": "26/05/2025 às 02:20"
}
```

## 🎯 Próximos Passos

1. **Integração com autenticação real** - Substituir usuário fixo por current_user
2. **Relatórios avançados** - Gráficos e estatísticas de uso
3. **Exportação de logs** - Permitir download do histórico
4. **Alertas automáticos** - Notificações para ações críticas
5. **Retenção de dados** - Política de arquivamento de logs antigos

---

**Desenvolvido para NeoGenômica** - Sistema de Auditoria v1.0 