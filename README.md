<div align="center">

# 🗄️ API Backup Service

### Serviço de Backup Automatizado para MongoDB

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.x-brightgreen.svg)](https://www.mongodb.com/)

[Características](#-características) •
[Instalação](#-instalação) •
[Uso](#-guia-de-uso-rápido) •
[API](#-documentação-da-api) •
[Exemplos](#-exemplos-de-uso) •
[Contribuir](#-contribuindo)

</div>

---

## 📋 Sobre o Projeto

**API Backup Service** é uma solução RESTful robusta e segura para realizar backups automatizados de coleções MongoDB. Este serviço atua como uma ponte de backup, permitindo que você preserve snapshots de seus dados de forma centralizada e organizada.

### 💡 O que faz?

- ✅ Recebe dados de coleções MongoDB via API REST
- ✅ Armazena backups em banco de dados dedicado
- ✅ Adiciona metadados automáticos (data, URL, etc.)
- ✅ Protege endpoints com autenticação Basic Auth
- ✅ Oferece endpoint de health check para monitoramento

### 🎯 Casos de Uso

- Backup automatizado de dados críticos
- Sincronização de dados entre ambientes
- Histórico de snapshots para auditoria
- Disaster recovery e continuidade de negócio

---

## ✨ Características

### Recursos Principais

| Recurso | Descrição |
|---------|-----------|
| 🔐 **Autenticação Segura** | Basic Auth para proteger todos os endpoints |
| 📊 **Metadados Automáticos** | Data e URL adicionados automaticamente aos backups |
| 🔄 **Substituição Inteligente** | Sobrescreve backups antigos automaticamente |
| 🏥 **Health Check** | Endpoint dedicado para monitoramento |
| 📝 **TypeScript** | Código totalmente tipado para maior segurança |
| ✅ **Testado** | Suíte de testes com Jest |

### Stack Tecnológica

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Node.js** | 18+ | Runtime JavaScript |
| **TypeScript** | 5.9+ | Superset JavaScript tipado |
| **Express** | 5.1 | Framework web minimalista |
| **MongoDB** | 5.x | Banco de dados NoSQL |
| **Mongoose** | 5.13 | ODM para MongoDB |
| **Jest** | 30+ | Framework de testes |

---

## 📦 Instalação

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [MongoDB](https://www.mongodb.com/) (versão 5.x ou superior)
- [Git](https://git-scm.com/)

### Passos de Instalação

**1.** Clone o repositório:

```bash
git clone https://github.com/GabrielFinotti/api-backup-service.git
cd api-backup-service
```

**2.** Instale as dependências:

```bash
npm install
```

**3.** Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações do Servidor
PORT=3000

# Credenciais de Autenticação
SECRET_USER=seu_usuario
SECRET_PASS=sua_senha

# Conexão MongoDB
MONGODB_URI=mongodb://localhost:27017
```

> ⚠️ **Importante**: Nunca commite o arquivo `.env` no repositório. Ele já está incluído no `.gitignore`.

---

## 🚀 Guia de Uso Rápido

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor em modo de desenvolvimento com hot-reload |
| `npm run build` | Compila o projeto TypeScript para JavaScript |
| `npm start` | Inicia o servidor em modo produção |
| `npm test` | Executa a suíte de testes |

### Desenvolvimento

Inicie o servidor em modo de desenvolvimento:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

### Produção

Para executar em produção:

```bash
# Compila o projeto
npm run build

# Inicia o servidor
npm start
```

### Executando Testes

```bash
npm test
```

---

## 📚 Documentação da API

### 🌐 Base URL

```text
http://localhost:3000/api
```

### 🔐 Autenticação

Todos os endpoints (exceto `/health`) requerem **autenticação Basic Auth**.

#### Como Autenticar

1. Combine suas credenciais no formato: `usuario:senha`
2. Codifique em Base64
3. Adicione no header: `Authorization: Basic <base64>`

**Exemplo de Codificação:**

```bash
# Credenciais: admin:password123
# Base64: YWRtaW46cGFzc3dvcmQxMjM=
Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=
```

**Gerando Base64:**

```bash
# Linux/Mac
echo -n "admin:password123" | base64

# Windows PowerShell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("admin:password123"))
```

---

### 📍 Endpoints Disponíveis

<details>
<summary><strong>GET</strong> <code>/api/health</code> - Health Check</summary>

<br>

Verifica se a API está funcionando corretamente.

**Autenticação:** ❌ Não requerida

**Resposta de Sucesso (200):**

```json
{
  "status": "ok",
  "timestamp": "2025-10-07T14:30:00.000Z"
}
```

**Exemplo cURL:**

```bash
curl -X GET http://localhost:3000/api/health
```

**Exemplo JavaScript:**

```javascript
fetch('http://localhost:3000/api/health')
  .then(response => response.json())
  .then(data => console.log(data));
```

</details>

---

<details>
<summary><strong>POST</strong> <code>/api/backup</code> - Salvar Backup</summary>

<br>

Realiza o backup de uma coleção MongoDB.

**Autenticação:** ✅ Requerida (Basic Auth)

**Headers:**

```http
Content-Type: application/json
Authorization: Basic <credenciais_base64>
```

**Body (JSON):**

```json
{
  "database": "nome_do_banco",
  "collectionsName": "nome_da_colecao",
  "data": {
    // Seus dados aqui (qualquer estrutura JSON válida)
  }
}
```

**Parâmetros:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|:-----------:|
| `database` | `string` | Nome do banco de dados MongoDB de destino | ✅ |
| `collectionsName` | `string` | Nome da coleção onde o backup será salvo | ✅ |
| `data` | `any` | Dados a serem salvos no backup | ✅ |

**Respostas:**

<details>
<summary>✅ <strong>200 OK</strong> - Backup salvo com sucesso</summary>

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Backup salvo com sucesso",
  "data": {
    "database": "nome_do_banco",
    "collectionsName": "nome_da_colecao",
    "data": { /* seus dados */ },
    "date": "07/10/2025",
    "url": "http://localhost:3000/api/backup"
  }
}
```

</details>

<details>
<summary>❌ <strong>400 Bad Request</strong> - Requisição inválida</summary>

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Requisição inválida",
  "data": null
}
```

</details>

<details>
<summary>🔒 <strong>401 Unauthorized</strong> - Não autorizado</summary>

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Não autorizado",
  "data": null
}
```

</details>

<details>
<summary>💥 <strong>500 Internal Server Error</strong> - Erro interno</summary>

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Ocorreu um erro interno no servidor",
  "data": null
}
```

</details>

</details>

---

## 💻 Exemplos de Uso

### cURL

```bash
curl -X POST http://localhost:3000/api/backup \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=" \
  -d '{
    "database": "meu_backup_db",
    "collectionsName": "usuarios_backup",
    "data": {
      "usuarios": [
        { "id": 1, "nome": "João Silva", "email": "joao@example.com" },
        { "id": 2, "nome": "Maria Santos", "email": "maria@example.com" }
      ],
      "total": 2
    }
  }'
```

### JavaScript (Fetch API)

```javascript
const username = 'admin';
const password = 'password123';
const credentials = btoa(`${username}:${password}`);

const backupData = {
  database: 'meu_backup_db',
  collectionsName: 'usuarios_backup',
  data: {
    usuarios: [
      { id: 1, nome: 'João Silva', email: 'joao@example.com' },
      { id: 2, nome: 'Maria Santos', email: 'maria@example.com' }
    ],
    total: 2
  }
};

fetch('http://localhost:3000/api/backup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${credentials}`
  },
  body: JSON.stringify(backupData)
})
  .then(response => response.json())
  .then(data => console.log('✅ Backup realizado:', data))
  .catch(error => console.error('❌ Erro:', error));
```

### Node.js (Axios)

```javascript
const axios = require('axios');

const username = 'admin';
const password = 'password123';
const credentials = Buffer.from(`${username}:${password}`).toString('base64');

const backupData = {
  database: 'meu_backup_db',
  collectionsName: 'usuarios_backup',
  data: {
    usuarios: [
      { id: 1, nome: 'João Silva', email: 'joao@example.com' },
      { id: 2, nome: 'Maria Santos', email: 'maria@example.com' }
    ],
    total: 2
  }
};

axios.post('http://localhost:3000/api/backup', backupData, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${credentials}`
  }
})
  .then(response => console.log('✅ Backup realizado:', response.data))
  .catch(error => console.error('❌ Erro:', error.response?.data || error.message));
```

### Python (Requests)

```python
import requests
from base64 import b64encode

# Configuração
username = 'admin'
password = 'password123'
credentials = b64encode(f'{username}:{password}'.encode()).decode()

url = 'http://localhost:3000/api/backup'

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Basic {credentials}'
}

data = {
    'database': 'meu_backup_db',
    'collectionsName': 'usuarios_backup',
    'data': {
        'usuarios': [
            {'id': 1, 'nome': 'João Silva', 'email': 'joao@example.com'},
            {'id': 2, 'nome': 'Maria Santos', 'email': 'maria@example.com'}
        ],
        'total': 2
    }
}

# Realizar backup
response = requests.post(url, headers=headers, json=data)

if response.status_code == 200:
    print('✅ Backup realizado:', response.json())
else:
    print('❌ Erro:', response.json())
```

### PowerShell

```powershell
# Configuração
$username = "admin"
$password = "password123"
$credentials = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${username}:${password}"))

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Basic $credentials"
}

$body = @{
    database = "meu_backup_db"
    collectionsName = "usuarios_backup"
    data = @{
        usuarios = @(
            @{ id = 1; nome = "João Silva"; email = "joao@example.com" }
            @{ id = 2; nome = "Maria Santos"; email = "maria@example.com" }
        )
        total = 2
    }
} | ConvertTo-Json -Depth 10

# Realizar backup
Invoke-RestMethod -Uri "http://localhost:3000/api/backup" -Method Post -Headers $headers -Body $body
```

---

## 🔒 Segurança

### Medidas Implementadas

| Aspecto | Implementação |
|---------|---------------|
| **Autenticação** | Basic Auth em todos os endpoints protegidos |
| **Variáveis de Ambiente** | Credenciais armazenadas em `.env` (não versionado) |
| **Validação** | Middleware valida credenciais antes de processar requisições |
| **Headers** | Verificação de headers de autenticação obrigatórios |

### Recomendações para Produção

- ✅ **Use HTTPS**: Sempre use HTTPS em produção para criptografar credenciais na transmissão
- ✅ **Credenciais Fortes**: Use senhas complexas e únicas
- ✅ **Rotação de Credenciais**: Altere senhas periodicamente
- ✅ **Rate Limiting**: Considere implementar rate limiting para prevenir ataques de força bruta
- ✅ **Logs de Auditoria**: Monitore logs para detectar tentativas de acesso não autorizado
- ✅ **Firewall**: Configure firewall para permitir apenas IPs confiáveis

---

## ⚙️ Comportamento do Backup

### Como Funciona

```mermaid
graph LR
    A[Cliente] -->|POST /api/backup| B[API]
    B -->|Autentica| C{Válido?}
    C -->|Não| D[401 Unauthorized]
    C -->|Sim| E[Conecta MongoDB]
    E --> F[Drop Coleção de Dados]
    F --> G[Insere Dados]
    G --> H[Atualiza backup_logs]
    H --> I[200 Success]
```

### Características do Backup

| Característica | Descrição |
|----------------|-----------|
| **Substituição Automática** | A coleção de dados é **dropada** antes de inserir novos dados (sobrescreve backup anterior) |
| **Separação de Dados e Logs** | Dados são salvos na coleção especificada, logs em `backup_logs` |
| **Logs Persistentes** | A coleção `backup_logs` é atualizada (upsert) a cada backup bem-sucedido |
| **Metadados de Log** | Armazena `date`, `url`, `collectionsName` e `timestamp` na coleção de logs |
| **Formato da Data** | DD/MM/YYYY (formato brasileiro) |
| **Dados Puros** | Apenas os dados (arrays/objetos) são salvos na coleção principal |

### Exemplo de Dados Armazenados

**Entrada:**

```json
{
  "database": "backup_db",
  "collectionsName": "users",
  "data": {
    "users": [{"id": 1, "name": "João"}]
  }
}
```

**Armazenado na Coleção `users` (dados apenas):**

```json
{
  "users": [{"id": 1, "name": "João"}]
}
```

**Armazenado na Coleção `backup_logs` (metadados):**

```json
{
  "collectionsName": "users",
  "date": "07/10/2025",
  "url": "http://localhost:3000/api/backup",
  "timestamp": "2025-10-07T14:30:00.000Z"
}
```

---

## 🧪 Testes

### Cobertura de Testes

O projeto inclui testes unitários para componentes críticos:

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| **Auth Middleware** | `auth.middleware.test.ts` | Testa autenticação Basic Auth |
| **Backup Service** | `backup.service.test.ts` | Testa lógica de backup |

### Executando os Testes

```bash
# Executar todos os testes
npm test

# Executar em modo watch
npm test -- --watch

# Executar com cobertura
npm test -- --coverage
```

### Estrutura de Testes

```text
test/
├── middlewares/
│   └── auth.middleware.test.ts    # Testes de autenticação
└── services/
    └── backup.service.test.ts     # Testes do serviço de backup
```

---

## 📁 Estrutura do Projeto

```text
api-backup-service/
├── src/                        # Código fonte
│   ├── controllers/            # Controladores da API
│   │   └── saveBackup.controller.ts
│   ├── database/               # Configuração do banco de dados
│   │   └── config/
│   │       └── createConnection.ts
│   ├── interface/              # DTOs e interfaces TypeScript
│   │   └── backupDataInput.dto.ts
│   ├── middlewares/            # Middlewares Express
│   │   └── auth.middleware.ts
│   ├── routes/                 # Definição de rotas
│   │   └── backup.route.ts
│   ├── services/               # Lógica de negócio
│   │   └── backup.service.ts
│   └── server.ts               # Ponto de entrada da aplicação
│
├── test/                       # Testes unitários
│   ├── middlewares/
│   │   └── auth.middleware.test.ts
│   └── services/
│       └── backup.service.test.ts
│
├── .env                        # Variáveis de ambiente (não versionado)
├── .gitignore                  # Arquivos ignorados pelo Git
├── jest.config.mjs             # Configuração do Jest
├── LICENSE                     # Licença MIT
├── package.json                # Dependências e scripts
├── README.md                   # Este arquivo
├── tsconfig.json               # Configuração TypeScript
└── tsconfig.test.json          # Configuração TypeScript para testes
```

---

## 🚀 Deploy

### Variáveis de Ambiente

Certifique-se de configurar as seguintes variáveis no ambiente de produção:

```env
PORT=3000
SECRET_USER=seu_usuario_seguro
SECRET_PASS=sua_senha_complexa
MONGODB_URI=mongodb://seu-servidor:27017
```

### Docker (Opcional)

<details>
<summary>Exemplo de Dockerfile</summary>

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

</details>

<details>
<summary>Exemplo de docker-compose.yml</summary>

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - SECRET_USER=${SECRET_USER}
      - SECRET_PASS=${SECRET_PASS}
      - MONGODB_URI=mongodb://mongo:27017
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

</details>

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Este projeto segue o padrão de [Conventional Commits](https://www.conventionalcommits.org/).

### Como Contribuir

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/api-backup-service.git`
3. **Crie uma branch** para sua feature: `git checkout -b feature/minha-feature`
4. **Commit** suas mudanças: `git commit -m 'feat: adiciona nova feature'`
5. **Push** para a branch: `git push origin feature/minha-feature`
6. Abra um **Pull Request**

### Padrão de Commits

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Alterações na documentação
- `style:` Formatação, ponto e vírgula, etc
- `refactor:` Refatoração de código
- `test:` Adição ou correção de testes
- `chore:` Atualizações de build, configs, etc

### Diretrizes

- Mantenha o código limpo e bem documentado
- Adicione testes para novas funcionalidades
- Siga o estilo de código existente
- Atualize a documentação quando necessário

---

## 📝 Changelog

### [1.0.0] - 2025-10-07

#### Adicionado

- Sistema de backup automatizado para MongoDB
- Autenticação Basic Auth
- Endpoint de health check
- Testes unitários com Jest
- Documentação completa

---

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento. Se encontrar algum bug, por favor [abra uma issue](https://github.com/GabrielFinotti/api-backup-service/issues).

---

## 💬 Suporte

Se você tiver dúvidas ou precisar de ajuda:

- 📧 Abra uma [issue](https://github.com/GabrielFinotti/api-backup-service/issues)
- 💡 Consulte a [documentação](#-documentação-da-api)
- 🌟 Dê uma estrela no projeto se ele foi útil!

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

**TL;DR**: Você pode usar, copiar, modificar, distribuir e até vender este software, desde que mantenha o aviso de copyright original.

---

## 👤 Autor

**Gabriel H. Finotti**

- GitHub: [@GabrielFinotti](https://github.com/GabrielFinotti)
- Projeto: [api-backup-service](https://github.com/GabrielFinotti/api-backup-service)

---

<div align="center">

### ⭐ Se este projeto foi útil, considere dar uma estrela

**Feito com ❤️ e TypeScript**

</div>
