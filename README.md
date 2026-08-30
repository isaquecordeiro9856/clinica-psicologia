# ClínicaPsi

Sistema de gestão para clínica de psicologia, organizado como monorepo:

- `apps/api`: API NestJS, Prisma, PostgreSQL, Redis e BullMQ.
- `apps/web`: interface Next.js.
- `packages/shared`: schemas e constantes compartilhados.
- `docs`: documentação do software, checklist, roadmap e runbooks.

## Requisitos

- Node.js 20+
- pnpm 9+
- Docker Desktop

## Executar localmente

```bash
pnpm install
docker compose up -d
pnpm --filter @repo/api db:generate
pnpm --filter @repo/api db:deploy
pnpm --filter @repo/api db:seed
pnpm dev
```

Aplicação: http://localhost:3000  
API: http://localhost:3001/api/v1  
Swagger: http://localhost:3001/docs

## Credenciais de demonstração

`psi@clinica.app`, `secretaria@clinica.app` e `paciente@clinica.app` usam a senha `Senha123!` após executar o seed.

## Comandos úteis

```bash
pnpm build
pnpm typecheck
pnpm --filter @repo/api test:unit
pnpm --filter @repo/web test:e2e
```

Para entender o estado do produto e o que falta integrar, consulte [docs/README.md](./docs/README.md).
