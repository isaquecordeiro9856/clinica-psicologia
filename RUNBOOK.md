# Runbook - ClínicaPsi

Guia rápido para configurar, rodar e operar o sistema.

---

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker Desktop rodando

---

## 1. Primeira configuração (apenas uma vez)

```bash
# Instalar dependências
pnpm install

# Subir infraestrutura (PostgreSQL, Redis, MinIO, Mailhog)
docker compose up -d

# Gerar Prisma Client
pnpm --filter @repo/api db:generate

# Rodar migrations
pnpm --filter @repo/api db:deploy

# Popular banco com dados de demonstração
pnpm --filter @repo/api db:seed
```

---

## 2. Rodar em desenvolvimento

### Terminal 1 - API (porta 3001)
```bash
pnpm --filter @repo/api dev
```
- API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/docs

### Terminal 2 - Web (porta 3000)
```bash
pnpm --filter @repo/web dev
```
- Web: http://localhost:3000

### Ou ambos juntos
```bash
pnpm dev
```

---

## 3. Credenciais de teste (após seed)

| Perfil | Email | Senha |
|--------|-------|-------|
| Psicóloga | psi@clinica.app | Senha123! |
| Secretária | secretaria@clinica.app | Senha123! |
| Paciente | paciente@clinica.app | Senha123! |

---

## 4. Comandos úteis

### Testes
```bash
# Unit tests
pnpm test

# Integration tests (API)
pnpm test:integration

# E2E tests (Web - Playwright)
pnpm --filter @repo/web test:e2e
```

### Qualidade de código
```bash
pnpm run lint          # ESLint
pnpm run typecheck     # TypeScript check
pnpm run build         # Build de produção
pnpm run format        # Prettier
```

### Banco de dados
```bash
# Prisma Studio (interface visual)
pnpm --filter @repo/api db:studio

# Nova migration
pnpm --filter @repo/api db:generate
pnpm --filter @repo/api db:deploy

# Reset completo (cuidado: apaga dados)
docker compose down -v
docker compose up -d
pnpm --filter @repo/api db:deploy
pnpm --filter @repo/api db:seed
```

### Infraestrutura
```bash
# Ver status dos containers
docker compose ps

# Logs
docker compose logs -f postgres
docker compose logs -f redis

# Parar tudo
docker compose down

# Parar e remover volumes (reset total)
docker compose down -v
```

---

## 5. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

Principais variáveis:
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/clinica_psicologia
REDIS_URL=redis://localhost:6379

# JWT (gere com: node -e "console.log(require('crypto').randomBytes(48).toString('base64'))")
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

# Criptografia (gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_MASTER_KEY=
ENCRYPTION_HMAC_PEPPER=

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=clinica-documentos
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin

# Email (Brevo)
BREVO_API_KEY=
EMAIL_FROM=noreply@seudominio.com.br

# Telegram Bot
TELEGRAM_BOT_TOKEN=

# Pix
PIX_KEY=sua-chave-pix
PIX_RECEIVER_NAME=Nome Clinica
PIX_RECEIVER_CITY=Sao Paulo
```

---

## 6. Estrutura do projeto

```
clinica-psi/
├── apps/
│   ├── api/          # NestJS 11 - Backend
│   │   ├── src/
│   │   │   ├── modules/      # Módulos por domínio
│   │   │   ├── infra/        # Prisma, Redis, S3, Queue
│   │   │   └── common/       # Guards, Decorators, Logger
│   │   └── prisma/           # Schema + migrations
│   └── web/          # Next.js 15 - Frontend
│       ├── app/              # App Router (RSC)
│       ├── components/       # UI + Features
│       ├── hooks/            # React Query hooks
│       └── lib/              # API client
├── packages/
│   └── shared/       # Zod schemas + constantes
├── docs/             # Documentação
└── docker-compose.yml
```

---

## 7. Portas

| Serviço | Porta | URL |
|---------|-------|-----|
| Web (Next.js) | 3000 | http://localhost:3000 |
| API (NestJS) | 3001 | http://localhost:3001/api/v1 |
| Swagger | 3001 | http://localhost:3001/docs |
| PostgreSQL | 5432 | - |
| Redis | 6379 | - |
| MinIO API | 9000 | http://localhost:9000 |
| MinIO Console | 9001 | http://localhost:9001 |
| Mailhog SMTP | 1025 | - |
| Mailhog UI | 8025 | http://localhost:8025 |

---

## 8. Troubleshooting

### "Não foi possível conectar ao servidor"
```bash
# Verificar se API está rodando
curl http://localhost:3001/api/v1/health

# Verificar porta 3001
netstat -an | findstr 3001
# ou PowerShell:
Get-NetTCPConnection -LocalPort 3001 -State Listen
```

### Porta 3001 ocupada
```bash
# Matar processo na porta 3001 (PowerShell)
Get-NetTCPConnection -LocalPort 3001 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Banco não conecta
```bash
# Verificar container
docker compose ps

# Logs do postgres
docker compose logs postgres

# Reiniciar infra
docker compose restart
```

### Prisma errors
```bash
# Regenerar client
pnpm --filter @repo/api db:generate

# Reset migration state
pnpm --filter @repo/api db:deploy
```

---

## 9. Produção (Docker)

```bash
# Build e subir
docker compose -f docker-compose.prod.yml up -d --build

# Logs
docker compose -f docker-compose.prod.yml logs -f api

# Migrations em produção
docker compose -f docker-compose.prod.yml exec api pnpm db:deploy
```

---

## 10. Checklist de deploy

- [ ] `.env` configurado com secrets de produção
- [ ] `docker compose -f docker-compose.prod.yml up -d --build`
- [ ] `pnpm --filter @repo/api db:deploy` (migrations)
- [ ] Health check: `curl https://seudominio.com/api/v1/health`
- [ ] SSL/HTTPS configurado (reverse proxy nginx/traefik)
- [ ] Backups automáticos configurados (pg_dump + MinIO sync)
- [ ] Monitoramento (Sentry, UptimeRobot) ativo

---

## 10. Contatos / Referências

- **Documentação técnica**: `docs/DOCUMENTACAO.md`
- **PRD**: `docs/PRD.md`
- **Arquitetura**: `docs/DOCUMENTACAO.md` (seção arquitetura)
- **Swagger local**: http://localhost:3001/docs
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **Mailhog**: http://localhost:8025