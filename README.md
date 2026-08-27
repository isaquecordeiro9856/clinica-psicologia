# Clínica de Psicologia — Sistema de Gestão

Monorepo com **Next.js 15 (web)** + **NestJS 11 (api)** + **PostgreSQL 16 + Prisma** + **Redis/BullMQ**, conforme `00-ARQUITETURA-CLINICA-PSICOLOGIA.md`.

## Stack
- `apps/web` — Next.js 15 App Router, Tailwind, shadcn/ui
- `apps/api` — NestJS, Prisma, JWT (access 15m + refresh httpOnly 7d), RBAC, criptografia AES-256-GCM
- `packages/shared` — Zod schemas compartilhados
- Infra: Docker Compose (Postgres, Redis, MinIO S3, Mailhog)

## Como rodar local

```bash
# 1. Requisitos: Node 22+, pnpm 9+, Docker
pnpm -v  # se faltar: npm i -g pnpm

# 2. Clone e instale
pnpm install

# 3. Env
cp .env.example .env
# edite JWT_* e ENCRYPTION_* se quiser (já funciona com valores de dev)

# 4. Suba Postgres/Redis/MinIO/Mailhog
docker compose up -d
docker compose ps  # aguarde healthy

# 5. Banco
pnpm --filter @repo/api db:generate
pnpm --filter @repo/api db:deploy    # ou: pnpm --filter @repo/api exec prisma migrate dev --name init
pnpm --filter @repo/api db:seed

# 6. Rodar web + api
pnpm dev
# web: http://localhost:3000
# api: http://localhost:3001/api/v1  | docs: http://localhost:3001/docs
# mailhog: http://localhost:8025
# minio: http://localhost:9001 (minioadmin/minioadmin)
```

## Credenciais seed

- Psicóloga: `psi@clinica.app` / `Senha123!` (CRP 06/123456)
- Secretária: `secretaria@clinica.app` / `Senha123!`
- Paciente: `paciente@clinica.app` / `Senha123!`

## Estrutura

```
/apps/web/app
  (public)/         # landing
  (auth)/login      # login real conectado na API
  (psychologist)/dashboard|pacientes|prontuario|agenda|financeiro
  (patient)/agenda|historico|pagamentos
/apps/api/src/modules
  auth, users, patients, scheduling, clinical-records, billing, notifications, documents, reports, audit
/prisma/schema.prisma  # 16 models + enums
/docs # arquitetura, runbooks, ripd
```

## Scripts

```bash
pnpm dev              # turbo: web + api em paralelo
pnpm build            # build todos
pnpm --filter @repo/api db:studio  # Prisma Studio
docker compose down -v  # zera bancos
```

## Próximos passos (roadmap §13)

1. Endpoints faltantes: `PATCH /appointments/:id/reschedule`, `POST /patients/:id/consents`, 2FA
2. Fila BullMQ + Redis lock para agendamento (evitar double-booking)
3. Providers reais: EFI/Mercado Pago (PIX), Resend, WhatsApp Cloud API, Daily.co
4. Testes: `apps/api/test` (vitest) + `apps/web/e2e` (playwright)
5. Observabilidade: Sentry + Grafana

## Segurança (LGPD)

- Campos sensíveis criptografados (AES-256-GCM + HMAC para busca)
- Prontuário só para `role=psychologist` (guard `ClinicalAccessGuard`)
- `audit_logs` append-only
- Veja checklist em `00-ARQUITETURA-CLINICA-PSICOLOGIA.md:600`

## Licença

Privado — clínica.
