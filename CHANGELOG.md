# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [2.3.0] - 2025-10-09

### ✨ Adicionado

- **Limite de payload para requisições**: Configurado limite de 1000mb (1GB) para processar grandes volumes de dados
  - `express.json({ limit: "1000mb" })` - Suporta grandes payloads JSON
  - `express.urlencoded({ limit: "1000mb", extended: true })` - Suporta grandes payloads URL-encoded
  - Permite backups de coleções com milhares de documentos
  - Elimina erro "PayloadTooLargeError" em requisições grandes

### 📝 Melhorado

- **Capacidade de backup**: Agora suporta backups de datasets muito maiores
- **Flexibilidade**: Sistema preparado para processar grandes volumes de dados sem falhas

### 🎯 Impacto

- Usuários podem enviar backups de coleções com milhares de registros em uma única requisição
- Melhora significativa na capacidade de processamento de dados
- Ideal para backups de bases de dados volumosas

## [2.2.1] - 2025-10-08

### 🐛 Corrigido

- **Health check no Dockerfile**: Agora usa variável de ambiente `PORT` dinamicamente ao invés de porta hardcoded
  - Antes: `http://localhost:3000/api/health`
  - Agora: `http://localhost:${PORT}/api/health`
  - Permite flexibilidade na configuração da porta

- **Inicialização do servidor**: Removida verificação de conexão MongoDB no startup
  - Conexão é testada apenas quando necessária (lazy connection)
  - Reduz tempo de inicialização e melhora reliability
  - Servidor não falha mais no startup se MongoDB estiver temporariamente indisponível

### 🗑️ Removido

- **Função `testConnection`**: Removida de `createConnection.ts`
  - Simplifica lógica de inicialização
  - Conexão é estabelecida sob demanda
  - Reduz complexidade e overhead desnecessário

### 📝 Melhorado

- **docker-compose.yml**: Ajustes no health check e formatação
  - Health check usa variável `$PORT` dinâmica
  - Melhor consistência com configurações do Dockerfile
  - Configuração de rede externa otimizada

- **Inicialização do servidor**: Refatorada para ser mais simples e resiliente
  - Função `startServer` assíncrona separada
  - Melhor tratamento de erros
  - Logs mais claros

## [2.2.0] - 2025-10-07

### 🐳 Adicionado

- **Suporte completo ao Docker**:
  - Dockerfile otimizado com multi-stage build
  - docker-compose.yml para orquestração
  - .dockerignore para otimização do build
  - Health checks configurados no container
  
- **Configuração para MongoDB Externo**:
  - Conexão via domínio/URI externa
  - Suporte a MongoDB Atlas, Cloud e servidores remotos
  - Variável MONGO_URI configurável via .env

- **Scripts NPM para Docker**:
  - `npm run docker:up` - Inicia containers
  - `npm run docker:down` - Para containers
  - `npm run docker:logs` - Visualiza logs
  - `npm run docker:build` - Reconstrói imagens
  - `npm run docker:restart` - Reinicia containers

### 📝 Melhorado

- Documentação simplificada no README.md
- Seção de uso rápido com Docker
- .env.example atualizado com exemplos de MONGO_URI
- Instruções de deploy atualizadas

### 🗑️ Removido

- Arquivos de documentação redundantes (DOCKER.md, DOCKER-QUICKSTART.md)
- Configuração de MongoDB em container (agora apenas externo)
- Volumes e networks desnecessários do docker-compose

### 🔧 Modificado

- docker-compose.yml simplificado (apenas API, MongoDB externo)
- .env.example com foco em MongoDB externo
- README.md com seção Docker concisa

## [2.1.0] - 2025-10-07

### ✨ Adicionado

- **Endpoint POST `/api/recover`**: Recupera todos os dados de uma coleção específica
  - Parâmetros: `database` e `collectionName`
  - Retorna: contagem de documentos e array com todos os documentos
  - Controller: `recoverData.controller.ts`
  - Service: método `recoverData` no `BackupService`

- **Endpoint POST `/api/logs`**: Lista todos os logs de backup de um database
  - Parâmetro: `database`
  - Retorna: contagem de logs e array com todos os registros de backup
  - Controller: `getLogs.controller.ts`
  - Service: método `getLogs` no `BackupService`

- **Endpoint GET `/api/databases`**: Lista todos os databases do MongoDB
  - Sem parâmetros (requer autenticação)
  - Retorna: lista com nome, tamanho e status de cada database
  - Controller: `getDatabases.controller.ts`
  - Service: método `getDatabases` no `BackupService`

- **Novos DTOs**:
  - `RecoverDataDTO`: Interface para recuperação de dados
  - `GetLogsDTO`: Interface para consulta de logs

### 🧪 Testes

- Adicionados 10 testes para `saveBackup.controller.test.ts`
- Adicionados 6 testes para `recoverData.controller.test.ts`
- Adicionados 6 testes para `getLogs.controller.test.ts`
- Adicionados 6 testes para `getDatabases.controller.test.ts`
- Adicionados 10 testes no `backup.service.test.ts` para os novos métodos
- **Total: 49 testes** (eram 11, agora são 49)
- **Taxa de sucesso: 100%**

### 📚 Documentação

- README.md atualizado com documentação completa dos novos endpoints
- Exemplos de uso adicionados para cada endpoint
- Tabela de endpoints atualizada com os 5 endpoints disponíveis
- Características atualizadas com as novas funcionalidades

### 🔄 Modificado

- Estrutura de testes melhorada com cobertura completa de controllers
- Interfaces organizadas no arquivo `backupDataInput.dto.ts`

---

## [2.0.1] - 2025-10-07

### 🐛 Corrigido

- **Deprecation Warning**: Substituído `collection.insert` (deprecated) por `insertMany` e `insertOne`
  - Arrays agora usam `insertMany` para melhor performance
  - Objetos únicos usam `insertOne`
- **Erro de chave $numberDecimal**: Implementada sanitização automática de dados
  - Remove chaves que começam com `$` (reservadas pelo MongoDB)
  - Resolve erro: "key $numberDecimal must not start with '$'"
  - Suporta estruturas aninhadas de forma recursiva

### ✨ Adicionado

- Função `sanitizeData` para limpar dados antes da inserção
- Tratamento especial para arrays vazios (retorna `itemCount: 0`)
- Logs mais detalhados identificando a coleção em cada etapa

### 🧪 Testes

- Adicionado teste para backup com objeto único
- Adicionado teste para sanitização de dados com chaves `$`
- Todos os 11 testes passando com sucesso

## [2.0.0] - 2025-10-07

### 💥 Breaking Changes

- **Resposta da API alterada**: A resposta do endpoint `/api/backup` agora retorna `itemCount` (quantidade de itens) ao invés dos dados completos
  - **Antes**: `{ status, statusCode, message, data: { ...todosOsDados, log } }`
  - **Agora**: `{ status, statusCode, message, data: { itemCount, log } }`
  - **Motivo**: Melhor performance, menor consumo de banda e maior segurança
  - **Migração**: Clientes que dependiam dos dados na resposta devem ajustar para ler apenas `itemCount`

### ✨ Adicionado

- Campo `database` adicionado aos logs da coleção `backup_logs`
- Campo `itemCount` na resposta da API indicando quantidade de documentos salvos
- Sistema de contagem automática de itens:
  - Arrays: retorna o tamanho do array (`array.length`)
  - Objetos: retorna `1`
- Documentação atualizada com exemplos do novo formato de resposta

### 🔄 Modificado

- Logs agora armazenam quatro campos: `database`, `collectionsName`, `date` e `timestamp`
- Resposta da API otimizada para retornar apenas metadados essenciais
- Testes atualizados para refletir as novas estruturas de dados

### 🧪 Testes

- Atualizado mock de `insertOne` para `insert` no teste do serviço
- Adicionado teste para verificar `itemCount` na resposta
- Adicionado teste para verificar campo `database` nos logs
- Todos os 9 testes passando com sucesso

---

## [1.0.0] - 2025-10-07

### ✨ Adicionado

- Sistema de backup automatizado para coleções MongoDB
- Autenticação Basic Auth para proteção de endpoints
- Endpoint `/api/health` para monitoramento de saúde da API
- Endpoint `/api/backup` para salvar backups
- Sistema de logs separado em coleção `backup_logs`
- Substituição automática de backups (drop e insert)
- Suporte a múltiplos bancos de dados via parâmetro `database`
- Testes unitários com Jest:
  - Testes de autenticação (auth.middleware.test.ts)
  - Testes do serviço de backup (backup.service.test.ts)
- Documentação completa em README.md:
  - Guia de instalação
  - Documentação da API
  - Exemplos de uso (cURL, JavaScript, Node.js, Python, PowerShell)
  - Guia de segurança
  - Instruções de deploy

### 🔧 Configuração

- TypeScript 5.9+ para tipagem forte
- Express 5.1 como framework web
- Mongoose 5.13 para conexão MongoDB
- Jest 30+ para testes
- Suporte a variáveis de ambiente via dotenv

### 📝 Documentação

- README.md completo com badges, exemplos e guias
- Licença MIT
- Estrutura do projeto documentada
- Exemplos de uso em múltiplas linguagens

---

## Tipos de Mudanças

- ✨ **Adicionado** - Para novas funcionalidades
- 🔄 **Modificado** - Para mudanças em funcionalidades existentes
- 🗑️ **Depreciado** - Para funcionalidades que serão removidas em breve
- 🚫 **Removido** - Para funcionalidades removidas
- 🐛 **Corrigido** - Para correção de bugs
- 🔒 **Segurança** - Para correções de vulnerabilidades
- 💥 **Breaking Changes** - Para mudanças incompatíveis com versões anteriores
- 🧪 **Testes** - Para mudanças relacionadas a testes

---

[2.3.0]: https://github.com/GabrielFinotti/api-backup-service/compare/v2.2.1...v2.3.0
[2.2.1]: https://github.com/GabrielFinotti/api-backup-service/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/GabrielFinotti/api-backup-service/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/GabrielFinotti/api-backup-service/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/GabrielFinotti/api-backup-service/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/GabrielFinotti/api-backup-service/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/GabrielFinotti/api-backup-service/releases/tag/v1.0.0
