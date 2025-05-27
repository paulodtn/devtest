# NeoGenômica - Sistema de Análise Genômica

<div align="center">

![NeoGenômica Logo](https://img.shields.io/badge/NeoGen%C3%B4mica-Sistema%20de%20An%C3%A1lise%20Gen%C3%B4mica-00D6E4?style=for-the-badge)

[![Ruby](https://img.shields.io/badge/Ruby-3.4.4-CC342D?style=flat-square&logo=ruby&logoColor=white)](https://www.ruby-lang.org/)
[![Rails](https://img.shields.io/badge/Rails-8.0.2-CC0000?style=flat-square&logo=rubyonrails&logoColor=white)](https://rubyonrails.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.15.10-0081CB?style=flat-square&logo=material-ui&logoColor=white)](https://mui.com/)

</div>

## Sobre o Projeto

O **NeoGenômica** é uma aplicação web full-stack desenvolvida para análise e gerenciamento de dados genômicos, especificamente focada no gerenciamento de primers para sequenciamento genético. O sistema oferece uma interface moderna e intuitiva para visualização, filtros avançados, importação/exportação de dados genômicos e auditoria completa de operações.

### Principais Funcionalidades

- **Visualização de Primers**: Interface responsiva para navegação e visualização de dados genômicos
- **Filtros Avançados**: Sistema de filtros estilo IGV (Integrative Genomics Viewer) para análise genômica
- **Importação/Exportação**: Suporte para arquivos CSV e formato BED
- **Sistema de Autenticação Avançado**: Login seguro com bloqueio automático contra ataques de força bruta
- **Proteção contra Força Bruta**: Bloqueio temporário após 3 tentativas falhadas de login
- **Auditoria Completa**: Rastreamento de todas as operações realizadas no sistema
- **Interface Moderna**: Design responsivo com Material-UI e tema escuro/claro
- **API RESTful**: Backend robusto com endpoints bem documentados

## Demonstração

### Demonstração da Aplicação em Funcionamento
![Demonstração NeoGenômica](assets/demo.gif)

*GIF demonstrando as principais funcionalidades do sistema: navegação, CRUD de primers e exportação de dados.*

### Sistema de Filtros Avançados
![Demonstração dos Filtros](assets/filtros-demo.gif)

*GIF demonstrando o sistema de filtros avançados: busca por texto, filtros genômicos por cromossomo e coordenadas.*

> **Nota**: Para uma demonstração completa, acesse o sistema localmente seguindo as instruções de instalação abaixo.

## Tecnologias Utilizadas

### Frontend
- **React** 18.2.0 - Biblioteca para construção da interface
- **Material-UI** 5.15.10 - Componentes de interface moderna
- **React Router DOM** 6.22.1 - Roteamento da aplicação
- **Axios** 1.6.7 - Cliente HTTP para comunicação com a API
- **Emotion** - Estilização CSS-in-JS

### Backend
- **Ruby** 3.4.4 - Linguagem de programação
- **Ruby on Rails** 8.0.2 - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Devise** - Sistema de autenticação
- **Devise-JWT** - Autenticação baseada em tokens JWT
- **Rack-CORS** - Configuração de CORS para API
- **Active Model Serializers** - Serialização de dados JSON
- **Kaminari** - Paginação de dados

### Ferramentas de Desenvolvimento
- **Docker** - Containerização da aplicação
- **Kamal** - Deploy automatizado
- **RuboCop** - Linter para Ruby
- **RSwag** - Documentação da API
- **VSCode** - Ambiente de desenvolvimento integrado

## Instalação e Configuração

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- **Ruby** 3.4.4 ou superior
- **Node.js** 16.0 ou superior
- **npm** ou **yarn**
- **PostgreSQL** 12.0 ou superior
- **Git**

### Configuração do Backend

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/neogenomica.git
   cd neogenomica
   ```

2. **Configure o backend**
   ```bash
   cd meu_projeto_backend
   ```

3. **Instale as dependências**
   ```bash
   bundle install
   ```

4. **Configure o banco de dados**
   ```bash
   # Crie o arquivo .env com suas configurações
   cp .env.example .env
   
   # Configure as variáveis de ambiente no .env:
   # DATABASE_URL=postgresql://[usuario]:[senha]@localhost:5432/neogenomica_development
   # SECRET_KEY_BASE=[sua_chave_secreta_gerada]
   # 
   # Para gerar uma chave secreta, execute:
   # rails secret
   ```

5. **Execute as migrações**
   ```bash
   rails db:create
   rails db:migrate
   rails db:seed
   ```

6. **Configure a autenticação (Opcional)**
   ```bash
   # Para configurar usuários administrativos, consulte a documentação
   # ou entre em contato com o administrador do sistema
   ```

7. **Inicie o servidor backend**
   ```bash
   rails server -p 3000
   ```

### Configuração do Frontend

1. **Na raiz do projeto, instale as dependências**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   # Crie o arquivo .env na raiz do projeto
   echo "REACT_APP_API_URL=http://localhost:3000" > .env
   
   # Adicione outras variáveis conforme necessário:
   # REACT_APP_API_URL=http://localhost:3000
   # REACT_APP_ENVIRONMENT=development
   ```

3. **Inicie o servidor frontend**
   ```bash
   npm start
   ```

### Usando Docker (Opcional)

```bash
# Backend
cd meu_projeto_backend
docker build -t neogenomica-backend .
docker run -p 3000:3000 neogenomica-backend

# Frontend
docker build -t neogenomica-frontend .
docker run -p 3001:3001 neogenomica-frontend
```

## Como Usar

1. **Acesse a aplicação**
   - Frontend: `http://localhost:3001`
   - Backend API: `http://localhost:3000`

2. **Faça login no sistema**
   - Use as credenciais fornecidas pelo administrador do sistema
   - O sistema possui proteção contra força bruta (máximo 3 tentativas por 10 segundos)
   - Interface visual mostra tentativas restantes e tempo de bloqueio

3. **Explore as funcionalidades**
   - Navegue pelos primers na página principal
   - Use os filtros avançados para análise genômica
   - Importe/exporte dados em formato CSV ou BED
   - Visualize o histórico de auditoria

## Documentação da API

A API RESTful está disponível em `http://localhost:3000/api/v1/` com os seguintes endpoints:

### Primers
- `GET /api/v1/primers` - Lista todos os primers
- `GET /api/v1/primers/:id` - Busca primer específico
- `POST /api/v1/primers` - Cria novo primer
- `PUT /api/v1/primers/:id` - Atualiza primer
- `DELETE /api/v1/primers/:id` - Remove primer

### Importação
- `POST /api/v1/primer_imports` - Importa primers via CSV

### Autenticação
- `POST /api/v1/auth/login` - Realiza login com proteção contra força bruta
- `POST /api/v1/auth/logout` - Realiza logout do sistema
- `GET /api/v1/auth/me` - Valida token e retorna dados do usuário
- `POST /api/v1/auth/validate_password` - Valida senha de confirmação

### Auditoria
- `GET /api/v1/audit_logs` - Lista logs de auditoria
- `POST /api/v1/audit_logs/log_bed_export` - Registra exportação BED
- `POST /api/v1/audit_logs/log_csv_export` - Registra exportação CSV

## Sistema de Segurança e Autenticação

### Proteção contra Ataques de Força Bruta

O NeoGenômica implementa um sistema robusto de proteção contra ataques de força bruta no login:

#### Características do Sistema de Bloqueio:
- **Limite de Tentativas**: Máximo de 3 tentativas de login por usuário/IP
- **Bloqueio Temporário**: 10 segundos de bloqueio após esgotar as tentativas
- **Controle por IP**: Rastreamento individual por combinação usuário + endereço IP
- **Cache Inteligente**: Sistema de cache com expiração automática
- **Interface Visual**: Contador regressivo e barra de progresso durante bloqueio

#### Como Funciona:
1. **1ª Tentativa Falhada**: "Restam 2 tentativa(s)" - Status 401
2. **2ª Tentativa Falhada**: "Restam 1 tentativa(s)" - Status 401  
3. **3ª Tentativa Falhada**: Bloqueio por 10 segundos - Status 429
4. **Durante Bloqueio**: "Tente novamente em Xs segundos" - Status 429
5. **Login Bem-sucedido**: Limpa automaticamente o contador de tentativas

#### Interface do Usuário:
- **Alertas Visuais**: Avisos sobre tentativas restantes
- **Barra de Progresso**: Indicador visual do tempo de bloqueio
- **Contador Regressivo**: Atualização em tempo real do tempo restante
- **Botão Inteligente**: Desabilitado durante bloqueio com texto dinâmico

### Configuração de Segurança

#### Variáveis de Ambiente
Certifique-se de configurar adequadamente as seguintes variáveis de ambiente:

- **DATABASE_URL**: String de conexão com o banco de dados
- **SECRET_KEY_BASE**: Chave secreta para criptografia (use `rails secret` para gerar)
- **RAILS_ENV**: Ambiente de execução (development, test, production)

#### Autenticação JWT
- **Tokens JWT**: Autenticação baseada em tokens seguros
- **Expiração**: Tokens expiram em 24 horas
- **Validação**: Verificação automática de tokens em todas as requisições protegidas
- **Logout Seguro**: Invalidação adequada de sessões

#### Boas Práticas Implementadas
- **Controle de Tentativas**: Prevenção contra ataques de força bruta
- **Cache Seguro**: Armazenamento temporário com expiração automática
- **Logs de Segurança**: Rastreamento de tentativas de login
- **Validação de IP**: Controle por endereço IP do cliente
- **Interface Responsiva**: Feedback visual claro para o usuário
- **Limpeza Automática**: Reset de contadores após login bem-sucedido

### Exemplo de configuração segura:
```bash
# .env (nunca commitar este arquivo - deve estar no .gitignore)
DATABASE_URL=postgresql://user:password@localhost:5432/neogenomica_development
SECRET_KEY_BASE=sua_chave_secreta_muito_longa_e_aleatoria
RAILS_ENV=development
```

> **Importante**: Nunca commite arquivos `.env` ou credenciais no repositório. Certifique-se de que estão listados no `.gitignore`.

## Executando Testes

### Backend
```bash
cd meu_projeto_backend
rails test
```

### Testes do Sistema de Bloqueio
O projeto inclui scripts de teste específicos para o sistema de bloqueio:

```bash
# Teste completo do sistema de bloqueio
ruby test_login_blocking.rb

# Teste de tentativa única
ruby test_single_attempt.rb

# Teste de login bem-sucedido
ruby test_login_direct.rb

# Teste de limpeza após login bem-sucedido
ruby test_login_success.rb
```

### Frontend
```bash
npm test
```

## Como Contribuir

Contribuições são sempre bem-vindas! Para contribuir:

1. **Fork o projeto**
2. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/MinhaNovaFeature
   ```
3. **Commit suas mudanças**
   ```bash
   git commit -m 'Adiciona MinhaNovaFeature'
   ```
4. **Push para a branch**
   ```bash
   git push origin feature/MinhaNovaFeature
   ```
5. **Abra um Pull Request**

### Diretrizes de Contribuição

- Siga os padrões de código estabelecidos (RuboCop para Ruby, ESLint para JavaScript)
- Escreva testes para novas funcionalidades
- Documente mudanças significativas
- Use mensagens de commit descritivas



## Autores e Créditos

- **Desenvolvedor Principal** - [Paulo de Tarso Nascimento Filho](https://github.com/paulodtn)




---

<div align="center">

**[Voltar ao topo](#neogenômica---sistema-de-análise-genômica)**



</div> 