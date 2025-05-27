# Teste NeoGenomica

Este é um projeto full-stack que consiste em uma aplicação dividida em backend (Ruby on Rails) e frontend (React).

## 🚀 Estrutura do Projeto

O projeto está dividido em duas partes principais:

### Backend (Ruby on Rails)
- API RESTful desenvolvida em Ruby on Rails
- Localizada na pasta `meu_projeto_backend/`
- Configuração Docker para containerização
- Sistema de deploy automatizado com Kamal

### Frontend (React)
- Interface do usuário desenvolvida em React
- Localizada na raiz do projeto (pastas `src/`, `public/`)
- Gerenciamento de pacotes com npm
- Configurado para rodar na porta 3001

## 💻 Pré-requisitos

Para executar este projeto, você precisará ter instalado:

* Ruby (versão especificada em `.ruby-version`)
* Node.js e npm
* Docker (opcional, para containerização)
* PostgreSQL (banco de dados)

## 🔧 Configuração do Ambiente

### Backend

1. Entre no diretório do backend:
```bash
cd meu_projeto_backend
```

2. Instale as dependências:
```bash
bundle install
```

3. Configure o banco de dados:
```bash
rails db:create
rails db:migrate
```

4. Inicie o servidor:
```bash
rails server -p 3000
```

### Frontend

1. Na raiz do projeto, instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm start
```

O frontend será executado em `http://localhost:3001` e o backend em `http://localhost:3000`.

## 🐳 Docker

O projeto inclui configuração Docker para facilitar o deploy e a execução em ambiente containerizado. Para construir e executar o container:

```bash
cd meu_projeto_backend
docker build -t neogenomica .
docker run -p 3000:3000 neogenomica
```

## 🧪 Testes

Para executar os testes do backend:
```bash
cd meu_projeto_backend
rails test
```

Para executar os testes do frontend:
```bash
npm test
```

## 📦 Deploy

O projeto utiliza Kamal para automatizar o processo de deploy. Consulte a documentação em `.kamal/` para mais detalhes sobre o processo de deploy.

## 👥 Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
