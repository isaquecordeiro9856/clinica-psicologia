# Projeto de software — ClínicaPsi

## Objetivo

O ClínicaPsi é um sistema web para gestão de clínicas de psicologia, com agenda, pacientes, prontuário, financeiro, documentos e teleatendimento.

## Organização do repositório

```text
apps/
  api/       NestJS, Prisma, autenticação e regras de negócio
  web/       Next.js, telas por perfil e componentes de interface
packages/
  shared/    Schemas e constantes compartilhados
docs/        Documentação do produto e operação
```

## Arquitetura

- Frontend: Next.js App Router, React, Tailwind CSS e componentes reutilizáveis.
- API: NestJS com módulos por domínio, DTOs e guards de autorização.
- Persistência: PostgreSQL acessado por Prisma.
- Infraestrutura: Redis para cache/locks e BullMQ para tarefas assíncronas.
- Arquivos: S3/MinIO para documentos.
- Segurança: JWT, Argon2, AES-256-GCM, HMAC e auditoria.

## Módulos de negócio

| Módulo | Responsabilidade |
|---|---|
| Auth | Login, cadastro, refresh e logout |
| Patients | Cadastro, busca, edição, exclusão lógica e consentimentos |
| Scheduling | Agendamentos, disponibilidade, conflitos e status |
| Clinical records | Evoluções e dados clínicos protegidos |
| Billing | Cobranças, PIX e estados de pagamento |
| Documents | Metadados e armazenamento de documentos |
| Notifications | Fila e envio de notificações |
| Reports | Indicadores operacionais e financeiros |
| Audit | Registro das ações sensíveis |

## Perfis

- Psicóloga: acesso clínico e administrativo da própria clínica.
- Secretária: agenda, pacientes não clínicos, financeiro e check-in.
- Paciente: seus agendamentos, histórico e pagamentos.
- Administrador: gestão global, conforme regras a implementar.

## Convenções

- Cada domínio deve manter controller, service, DTOs e testes próximos.
- Campos sensíveis não devem ser armazenados em texto puro.
- Toda consulta deve respeitar o escopo do usuário autenticado.
- Operações destrutivas em dados clínicos devem ser exclusão lógica ou versionamento.
- Alterações de API devem atualizar este diretório e os testes correspondentes.
