# Estágio de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
COPY tsconfig*.json ./

# Instala todas as dependências (incluindo dev)
RUN npm ci

# Copia o código fonte
COPY src ./src

# Compila o TypeScript
RUN npm run build

# Estágio de produção
FROM node:18-alpine AS production

WORKDIR /app

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copia apenas as dependências de produção
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copia os arquivos compilados do estágio de build
COPY --from=builder /app/dist ./dist

# Muda para o usuário não-root
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]
