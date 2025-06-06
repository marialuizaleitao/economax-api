# Economax API

API para controle de despesas mensais desenvolvida em Node.js com TypeScript.

## 📋 Funcionalidades

- **Autenticação de usuários** (signup, signin, profile)
- **Controle de despesas** (CRUD com validações de data)
- **Controle de limites mensais** (CRUD com validações de unicidade)
- **Dashboard** com feedback sobre economia mensal
- **Validações** para impedir alterações em meses passados
- **Autenticação JWT** para rotas protegidas

## 🚀 Como executar

### Pré-requisitos

- Node.js (versão 16 ou superior)
- MySQL (versão 5.7 ou superior)
- npm ou yarn

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/marialuizaleitao/economax-api.git
cd economax-api

# Instale as dependências
npm install
```

### 2. Configuração do Banco de Dados

1. Crie um banco MySQL chamado `economax`
2. Configure as variáveis de ambiente no arquivo `.env`:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=jwt_key
JWT_EXPIRES_IN=7d

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=economax
```

### 3. Executar Migrações

```bash
# Criar as tabelas do banco
npm run migrate
```

### 4. Iniciar o Servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

A API estará disponível em `http://localhost:3000`

## 📚 Documentação da API

### Autenticação

#### POST /api/auth/signup
Criar nova conta de usuário.

**Body:**
```json
{
  "name": "Max Verstappen",
  "email": "max@redbull.com",
  "birth_date": "1997-01-30",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "Usuário criado com sucesso",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Max Verstappen",
    "email": "max@redbull.com",
    "birth_date": "1997-01-30",
  }
}
```

#### POST /api/auth/signin
Fazer login.

**Body:**
```json
{
  "email": "max@redbull.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Max Verstappen",
    "email": "max@redbull.com",
    "birth_date": "1997-01-30",
  }
}
```

#### GET /api/auth/profile
Obter dados do usuário logado.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "Max Verstappen",
    "email": "max@redbull.com",
    "birth_date": "1997-01-30",
  }
}
```

### Despesas

#### POST /api/expenses
Criar nova despesa.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Body:**
```json
{
  "description": "Jato Particular",
  "amount": 150.50,
  "reference_month": "2024-12"
}
```

#### GET /api/expenses
Listar despesas (com filtro opcional por mês).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `month` (opcional): Filtrar por mês (formato: YYYY-MM)

**Response:**
```json
{
  "expenses": [
    {
      "id": 1,
      "description": "Jato Particular",
      "amount": 150.50,
      "reference_month": "2024-12",
      "created_at": "2024-12-01T10:00:00.000Z"
    }
  ]
}
```

#### PUT /api/expenses/:id
Atualizar despesa.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Body:**
```json
{
  "description": "Jato Particular Atualizado",
  "amount": 200.00,
  "reference_month": "2024-12"
}
```

#### DELETE /api/expenses/:id
Excluir despesa.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Limites

#### POST /api/limits
Criar novo limite mensal.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Body:**
```json
{
  "amount": 1000.00,
  "reference_month": "2024-12"
}
```

#### GET /api/limits
Listar limites (com filtro opcional por mês).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `month` (opcional): Filtrar por mês (formato: YYYY-MM)

#### PUT /api/limits/:id
Atualizar limite.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Body:**
```json
{
  "amount": 1200.00,
  "reference_month": "2024-12"
}
```

#### DELETE /api/limits/:id
Excluir limite.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Dashboard

#### GET /api/dashboard
Obter dados do dashboard com feedback sobre economia.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `month` (opcional): Mês para análise (formato: YYYY-MM, padrão: mês atual)

**Response:**
```json
{
  "month": "2024-12",
  "totalExpenses": 750.00,
  "limit": 1000.00,
  "progressPercentage": 75,
  "isCompletedMonth": false,
  "feedback": {
    "type": "on_track",
    "message": "Você está no caminho certo! Ainda pode gastar R$ 250.00 este mês.",
    "showAddLimitButton": false
  }
}
```

**Tipos de feedback:**
- `no_limit`: Nenhum limite cadastrado
- `success`: Meta atingida (mês finalizado)
- `exceeded`: Limite ultrapassado (mês finalizado)
- `on_track`: Dentro do limite (mês atual)
- `over_limit`: Limite ultrapassado (mês atual)

## 🔒 Segurança

- Senhas são criptografadas com bcrypt
- Autenticação via JWT
- Validação de dados de entrada
- Proteção contra SQL injection
- Rotas protegidas por middleware de autenticação

## 🗃️ Estrutura do Banco de Dados

### Tabela `users`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `name` (VARCHAR(100), NOT NULL)
- `email` (VARCHAR(100), UNIQUE, NOT NULL)
- `birth_date` (DATE, NOT NULL)
- `password` (VARCHAR(255), NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabela `expenses`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `user_id` (INT, FOREIGN KEY)
- `description` (VARCHAR(255), NOT NULL)
- `amount` (DECIMAL(10,2), NOT NULL)
- `reference_month` (VARCHAR(7), NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabela `limits`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `user_id` (INT, FOREIGN KEY)
- `amount` (DECIMAL(10,2), NOT NULL)
- `reference_month` (VARCHAR(7), NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- UNIQUE KEY `unique_user_month` (`user_id`, `reference_month`)

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset do JavaScript
- **Express** - Framework web
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação
- **Bcrypt** - Criptografia de senhas
- **Joi** - Validação de dados
- **CORS** - Controle de acesso

## 📝 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Executa em modo produção
- `npm run migrate` - Executa as migrações do banco

## 🚨 Validações Implementadas

- **Usuários**: Email único, senha mínima de 6 caracteres
- **Despesas**: Não permite criação/edição para meses passados
- **Limites**: Apenas um limite por mês por usuário, não permite criação/edição para meses passados
- **Autenticação**: Token JWT obrigatório para rotas protegidas

## 🔄 Status Codes

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Token inválido
- `404` - Recurso não encontrado
- `500` - Erro interno do servido