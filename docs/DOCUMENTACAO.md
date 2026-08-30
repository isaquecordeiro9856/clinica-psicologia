# Roadmap Completo — ClínicaPsi

**Versão:** 2.0  
**Data:** 28 de agosto de 2026  
**Autor:** Equipe de Desenvolvimento  
**Status:** Aprovado para execução  

---

## Sumário Executivo

O ClínicaPsi é um sistema de gestão para clínicas de psicologia que visa concorrer com plataformas como SimplePractice ($39-59/mo), Jane App (~$54/mo) e Pebble (~$29/mo). Este documento estabelece o plano de evolução do sistema de um MVP funcional para um produto comercial viável, com **restrição orçamentária zero** — todas as integrações e serviços utilizados devem ser 100% gratuitos.

O roadmap está dividido em 8 fases incrementais, com estimativas de esforço baseadas em pontos de história (story points) e dependências mapeadas. Cada fase é entregável de forma independente, permitindo validação contínua.

---

## 1. Introdução

### 1.1 Visão do Produto

ClínicaPsi é uma plataforma web completa para gestão de clínicas de psicologia, atendendo três perfis de usuário:

- **Psicóloga/CEO:** Dashboard executivo, gestão de pacientes, agenda, prontuário eletrônico, financeiro
- **Secretária:** Check-in, agendamento, confirmação de consultas, cobrança
- **Paciente:** Acesso próprio via portal (agenda, pagamentos, histórico)

### 1.2 Objetivos do Produto

| Objetivo | Métrica | Meta |
|----------|---------|------|
| Reduzir tempo de agendamento | Tempo médio de booking | < 2 minutos |
| Eliminar no-shows | Taxa de comparecimento | > 90% |
| Automatizar cobrança | % de pagamentos digitais | > 80% |
| Garantir compliance LGPD | Auditoria de segurança | 0 violações |
| Escalar para 50+ pacientes/psicóloga | Performance API | < 200ms p95 |

### 1.3 Restrições do Projeto

- **Orçamento:** R$ 0 — todas as integrações devem ser gratuitas
- **Stack tecnológica:** Next.js 15, NestJS 11, PostgreSQL 16, Prisma, Redis, BullMQ
- **Equipe:** Desenvolvimento solo ou pequena equipe
- **Prazo:** Execução incremental, entregas a cada 2 semanas

### 1.4 Referências Normativas

- **IEEE 830-1998:** Especificação de Requisitos de Software
- **PMBOK 7ª Edição:** Guia do Corpo de Conhecimento em Gestão de Projetos
- **Scrum Guide 2020:** Framework de desenvolvimento ágil
- **LGPD (Lei 13.709/2018):** Lei Geral de Proteção de Dados
- **Manual de Padrões para Iniciação do Pix — BCB v2.9.0:** Padrão de QR Code

---

## 2. Análise do Estado Atual

### 2.1 Arquitetura do Sistema

```
ClinicaPsi
├── apps/web      → Next.js 15 (SSR + Client Components)
├── apps/api      → NestJS 11 (modular monolith)
├── packages/shared → Schemas Zod + constantes
└── infra         → Docker Compose (Postgres, Redis, MinIO, Mailhog)
```

**Padrão:** Monolito modular com separação por domínio (Scheduling, Billing, Patients, Clinical Records, Auth).

### 2.2 Módulos Implementados

| Módulo | Status | Testes | Observações |
|--------|--------|--------|-------------|
| **Auth** | ✅ Funcional | Parcial | JWT + refresh token, registro, login |
| **Patients** | ✅ Funcional | 7 testes | CRUD, criptografia AES-256-GCM, exportação |
| **Scheduling** | ✅ Funcional | 12 testes | Criar, cancelar, confirmar, completar, no-show |
| **Billing** | ⚠️ Parcial | Nenhum | Fake PIX provider, sem webhook real |
| **Clinical Records** | ⚠️ Parcial | Nenhum | Modelo existe, sem testes |
| **Secretaries** | ✅ Funcional | Nenhum | RBAC configurado |
| **Frontend** | ⚠️ Parcial | 5 E2E | Layouts prontos, dados mockados |

### 2.3 Componentes Frontend Implementados

| Componente | Localização | Status |
|------------|-------------|--------|
| Header (auth-aware) | `components/layout/header.tsx` | ✅ |
| Sidebar (colapsável) | `components/layout/sidebar.tsx` | ✅ |
| SecretarySidebar | `components/layout/secretary-sidebar.tsx` | ✅ |
| PatientLayout (mobile) | `components/layout/patient-layout.tsx` | ✅ |
| PageHeader | `components/shared/page-header.tsx` | ✅ |
| StatusBadge | `components/shared/status-badge.tsx` | ✅ |
| EmptyState | `components/shared/empty-state.tsx` | ✅ |
| StatsCard | `components/shared/stats-card.tsx` | ✅ |
| PatientTable | `components/patients/patient-table.tsx` | ✅ |
| PatientForm | `components/patients/patient-form.tsx` | ✅ |
| WeekView/DayView | `components/scheduling/` | ✅ |
| RecordList/Form | `components/clinical/` | ✅ |
| BillingTable | `components/financial/billing-table.tsx` | ✅ |
| FinancialChart | `components/financial/financial-chart.tsx` | ✅ |
| TodayAppointments | `components/dashboard/today-appointments.tsx` | ✅ |
| RecentAlerts | `components/dashboard/recent-alerts.tsx` | ✅ |
| OccupancyChart | `components/dashboard/occupancy-chart.tsx` | ✅ |

### 2.4 Design System

| Token | Valor | Uso |
|-------|-------|-----|
| `primary` (calm blue) | `#2D9CDB` | Botões principais, sidebar active |
| `accent` (healing sage) | `#6B9E8A` | Destaques, badges |
| `surface` (warm off-white) | `#F7F5F2` | Fundo geral |
| `card` (cream) | `#FDFBF9` | Cards, sidebar, header |
| `warning` (amber) | `#F2994A` | Status pendente |
| `destructive` (muted red) | `#EB5757` | Erros, cancelado |
| `success` | `#10B981` | Status confirmado, pago |
| Fonte | Inter (Google Fonts) | Tipografia |

### 2.5 Infraestrutura

| Serviço | Imagem | Porta | Uso |
|---------|--------|-------|-----|
| PostgreSQL | postgres:16-alpine | 5432 | Banco principal |
| Redis | redis:7-alpine | 6379 | Cache, locks, BullMQ |
| MinIO | minio/minio | 9000/9025 | Storage S3-compatible |
| Mailhog | mailhog/mailhog | 1025/8025 | Teste de email (dev) |

### 2.6 Testes

| Tipo | Ferramenta | Cobertura | Meta |
|------|-----------|-----------|------|
| Unit | Vitest | 19 testes (Scheduling + Patients) | > 80% dos services |
| E2E | Playwright | 5 testes (Auth) | Fluxos críticos |
| Lint | ESLint | Configurado | 0 erros |
| TypeCheck | TypeScript | Configurado | 0 erros |

---

## 3. Análise de Mercado

### 3.1 Concorrentes Diretos

| Plataforma | Preço | Público-alvo | Diferenciais | Fraquezas |
|------------|-------|-------------|--------------|-----------|
| **SimplePractice** | $39-59/mo | EUA/Canadá | EHR completo, billing, telehealth | Caro, não adaptado ao Brasil |
| **Jane App** | ~$54/mo | Internacional | UI limpa, telehealth embutido | Preço elevado, sem Pix |
| **Pebble** | ~$29/mo | Pequenas clínicas | Design moderno, fluxos simples | Funcionalidades limitadas |
| **Agendado** | Grátis | Brasil | Gratuito, agendamento básico | Sem prontuário, sem financeiro |
| **clinicorp** | Sob consulta | Brasil | Odontologia + psicologia | Foco em odontologia |
| **Matervida** | Sob consulta | Brasil | Gestão de clínicas | Sem portal do paciente |

### 3.2 Análise SWOT

| | Positivo | Negativo |
|---|----------|----------|
| **Interno** | **Forças:** Stack moderna, design system profissional, RBAC robusto, criptografia de dados sensíveis, portal do paciente | **Fraquezas:** Sem integrações reais, dados mockados, sem testes de integração, sem monitoramento |
| **Externo** | **Oportunidades:** Mercado brasileiro em crescimento, LGPD como diferencial, Pix como meio de pagamento dominante, telehealth em alta | **Ameaças:** Concorrentes estabelecidos, mudança de preços de APIs free tier, dependência de serviços gratuitos |

### 3.3 Proposta de Valor

**ClínicaPsi** se diferencia por:

1. **100% gratuito para a clínica** — Sem mensalidade, sem taxa por transação (Pix estático)
2. **Compliance LGPD nativo** — Criptografia AES-256-GCM, consentimento granular, portabilidade de dados
3. **Portal do paciente** — App mobile-first com agenda, pagamentos e histórico
4. **Telehealth integrado** — Videochamadas sem custo adicional (Jitsi)
5. **Notificações inteligentes** — Lembretes via Telegram (100% gratuito)
6. **Financeiro simplificado** — QR Code Pix estático, sem necessidade de maquininha

### 3.4 Posicionamento

```
                    Mais funcionalidades
                           │
         SimplePractice ●  │  ● Jane App
                           │
    Menos ●────────────────┼────────────────● Mais
    econômico              │              econômico
                           │
           ● ClínicaPsi    │  ● Agendado
         (Grátis + Completo)│
                           │
                    Menos funcionalidades
```

---

## 4. Stack 100% Gratuita — Mapeamento de Integrações

### 4.1 Visão Geral

Todas as integrações selecionadas são gratuitas em sua camada essencial. A tabela abaixo resume cada serviço, sua limitação gratuita e a alternativa caso o limite seja atingido.

| Necessidade | Serviço | Tier Gratuito | Limite | Custo se exceder |
|-------------|---------|---------------|--------|------------------|
| **Email transacional** | Brevo (Sendinblue) | Free forever | 300 emails/dia (~9.000/mês) | $25/mo para 20k |
| **Notificações push** | Telegram Bot API | 100% gratuito | 30 msgs/seg, 1 msg/seg/chat | Nenhum (escala via infra) |
| **Pagamentos (Pix)** | Gerador EMVCo (local) | 100% gratuito | Sem limite | Nenhum |
| **Videochamada (Telehealth)** | Jitsi Meet (self-hosted) | Open-source | Sem limite | Nenhum (custo de infra) |
| **Validação CEP/CNPJ** | BrasilAPI | Gratuito | Rate limit razoável | Nenhum |
| **Monitoramento de erros** | Sentry | Developer | 5k erros/mês, 1 usuário | $26/mo para 50k |
| **Storage de arquivos** | MinIO (self-hosted) | Open-source | Sem limite | Nenhum (custo de disco) |
| **Queue/Background jobs** | BullMQ + Redis | Open-source | Sem limite | Nenhum |

### 4.2 Detalhamento por Serviço

#### 4.2.1 Email — Brevo (Sendinblue)

**Por que Brevo e não Resend:**
- Brevo: 300 emails/dia = ~9.000/mês (mais generoso)
- Resend: 100 emails/dia = 3.000/mês (limite diário muito baixo)
- Ambos: Sem cartão de crédito, tier gratuito permanente

**Capacidades do tier gratuito:**
- API REST + SMTP relay
- Webhooks de entrega
- Templates de email
- Tracking de abertura e clique
- DKIM/SPF/DMARC inclusos
- 1 domínio verificado

**Uso no projeto:**
- Confirmação de agendamento
- Lembrete de consulta (24h antes)
- Recibo de pagamento
- Notificação de cancelamento
- Reset de senha

**Limitações a considerar:**
- 300 emails/dia pode ser insuficiente em dias de pico
- Sem dedicated IP (pode afetar deliverability)
- Logs de 30 dias apenas

**Plano de migração:** Se a clínica crescer para > 300 emails/dia, migrar para Resend Pro ($20/mo para 50k/mês).

#### 4.2.2 Notificações — Telegram Bot API

**Por que Telegram e não WhatsApp:**
- WhatsApp cobra por mensagem após outubro 2026 (R$0,035/utilidade, R$0,32/marketing)
- Telegram Bot API é 100% gratuito, sem limite de mensagens
- Telegram tem 800M+ de usuários ativos globalmente
- Suporte a botões inline, web apps, pagamentos integrados

**Capacidades do Bot API gratuito:**
- Mensagens de texto, foto, vídeo, arquivo
- Botões inline e teclados de resposta
- Callback queries e fluxos de conversação
- Web Apps (telas cheias dentro do Telegram)
- Comandos de bot e sugestões
- Upload de arquivos até 50MB
- Group e channel administration

**Limitações de rate limit:**
- ~30 mensagens/segundo (total global)
- 1 mensagem/segundo por chat
- 20 mensagens/minuto por grupo

**Uso no projeto:**
- Lembrete de consulta (24h e 1h antes)
- Confirmação de agendamento
- Notificação de pagamento confirmado
- Notificação de cancelamento
- Comunicação secretária ↔ paciente

**Fluxo de integração:**
1. Paciente cadastra seu Telegram no perfil
2. Bot envia lembretes automáticos
3. Paciente pode confirmar/cancelar via botões inline
4. Secretária recebe notificação de confirmação

**Plano de migração:** Se necessário no futuro, considerar WhatsApp Business API (pagar por mensagem) ou manter Telegram como canal primário.

#### 4.2.3 Pagamentos — Pix Estático (EMVCo)

**Por que Pix estático e não API de PSP:**
- Todas as APIs Pix cobram ~1,19% por transação (Efí, Cielo, Bradesco)
- Pix estático é gerado localmente, sem custo
- Paciente paga pelo app bancário, sem intermediário
- Confirmacao manual via comprovante (secretária valida)

**Padrão técnico — EMVCo BR Code:**
O QR Code Pix segue o padrão EMV Merchant-Presented Mode (MPM), adotado pelo Banco Central do Brasil. O payload é composto por campos TLV (Tag-Length-Value) com checksum CRC-16.

**Campos do payload:**
| Tag | Campo | Descrição |
|-----|-------|-----------|
| 00 | Payload Format | Versão do layout (sempre "01") |
| 26 | Merchant Account | GUID `BR.GOV.BCB.PIX` + chave Pix |
| 52 | MCC | Código de categoria (0000) |
| 53 | Moeda | ISO 4217 do Real (986) |
| 54 | Valor | Valor da transação (opcional) |
| 58 | País | Código do país (BR) |
| 59 | Nome | Nome do beneficiário (até 25 chars) |
| 60 | Cidade | Cidade do beneficiário (até 15 chars) |
| 62 | Dados adicionais | TxID (identificador da transação) |
| 63 | CRC16 | Checksum de integridade |

**Fluxo de pagamento:**
1. Sistema gera QR Code estático com chave Pix da clínica
2. Paciente escaneia pelo app bancário
3. Paciente envia comprovante via Telegram/email
4. Secretária confirma pagamento no sistema
5. Status do agendamento atualiza para "pago"

**Vantagens:**
- Zero custo de transação para a clínica
- Sem necessidade de conta PJ em PSP
- Compatível com todos os bancos brasileiros
- QR Code reutilizável (estático)

**Desvantagens:**
- Sem confirmação automática (requer validação manual)
- Sem webhook de pagamento
- Sem geração de relatórios financeiros automáticos

**Plano de migração:** Para confirmação automática, integrar Efí Bank API (~1,19% por transação) ou Asaas (taxa fixa por boleto).

#### 4.2.4 Telehealth — Jitsi Meet

**Por que Jitsi e não Daily.co:**
- Daily.co: 10.000 minutos/mês grátis, depois $0,004/min
- Jitsi: Open-source, self-hosted, sem limite de minutos
- Jitsi: Suporte a gravação, compartilhamento de tela, chat
- Jitsi: Compliance HIPAA possível com configuração correta

**Capacidades do Jitsi:**
- Videochamadas 1:1 e em grupo
- Compartilhamento de tela
- Gravação de chamadas
- Chat durante a chamada
- Knock/lock de sala
- Transcrição (via integração)
- End-to-end encryption (E2EE)

**Requisitos de infraestrutura:**
- Servidor com 2+ CPUs, 4GB RAM
- Largura de banda: ~1 Mbps por participante (SD)
- Dominio com HTTPS (Let's Encrypt gratuito)
- TURN server para NAT traversal (coturn, open-source)

**Uso no projeto:**
- Consultas de teleconsulta 1:1
- Sala de espera virtual
- Gravação opcional (consentimento do paciente)

**Plano de migração:** Se a demanda de videochamadas crescer, considerar LiveKit Cloud ($0,0004/min) ou manter Jitsi self-hosted.

#### 4.2.5 Validação — BrasilAPI

**Serviços disponíveis gratuitamente:**
- `/api/cep/v1/{cep}` — Consulta CEP com geolocalização
- `/api/cnpj/v1/{cnpj}` — Dados de empresa
- `/api/banks/v1` — Lista de bancos
- `/api/ddd/v1` — Códigos de área
- `/api/feriados/v1/{ano}` — Feriados nacionais

**Uso no projeto:**
- Auto-preenchimento de endereço a partir do CEP
- Validação de CNPJ (se aplicável)
- Verificação de feriados para agendamento

#### 4.2.6 Monitoramento — Sentry

**Tier gratuito (Developer):**
- 5.000 erros/mês
- 5 milhões de tracing spans
- 50 session replays
- 1 usuário
- 30 dias de retenção
- Email alerts

**Uso no projeto:**
- Tracking de erros em produção
- Performance monitoring
- Release tracking
- Alertas via email

#### 4.2.7 Storage — MinIO

**Já configurado no docker-compose:**
- Porta 9000 (API) / 9025 (Console)
- S3-compatible API
- Sem limite de armazenamento (limitado pelo disco)

**Uso no projeto:**
- Upload de documentos de pacientes
- Armazenamento de comprovantes de pagamento
- Backup de prontuários
- Anexos de evolução clínica

### 4.3 Resumo de Custos

| Serviço | Custo Mensal | Custo Anual |
|---------|-------------|-------------|
| Brevo (Email) | R$ 0 | R$ 0 |
| Telegram Bot | R$ 0 | R$ 0 |
| Pix Estático | R$ 0 | R$ 0 |
| Jitsi Meet | R$ 0 (self-hosted) | R$ 0 |
| BrasilAPI | R$ 0 | R$ 0 |
| Sentry | R$ 0 (Developer) | R$ 0 |
| MinIO | R$ 0 (self-hosted) | R$ 0 |
| **Total** | **R$ 0** | **R$ 0** |

---

## 5. Roadmap Priorizado

### 5.1 Metodologia de Estimativa

- **Story Points (SP):** 1 SP ≈ 1 dia de trabalho efetivo para um desenvolvedor sênior
- **Priorização:** Matriz de Impacto × Esforço (Impact/Effort Matrix)
- **Dependências:** Tarefas bloqueantes são explicitamente mapeadas
- **Definição de Pronto (DoD):** Código review, testes unitários passando, build limpo, documentação atualizada

### 5.2 Fase 1 — Segurança Crítica e Bugs (Semana 1)

**Objetivo:** Eliminar vulnerabilidades de segurança críticas que impedem deploy em produção.

| ID | Tarefa | SP | Dependências | Prioridade |
|----|--------|-----|-------------|------------|
| 1.1 | Remover `.env` do git, rotacionar todos os secrets | 1 | Nenhuma | Crítica |
| 1.2 | Gerar chave de criptografia forte (32 bytes aleatórios) | 0.5 | 1.1 | Crítica |
| 1.3 | Adicionar auth guard no endpoint `/patients/:id/export` | 0.5 | Nenhuma | Crítica |
| 1.4 | Instalar e configurar `@nestjs/throttler` (rate limiting) | 1 | Nenhuma | Alta |
| 1.5 | Configurar Helmet, CORS e CSP headers | 1 | Nenhuma | Alta |
| 1.6 | Corrigir `.env.example` com variáveis obrigatórias documentadas | 0.5 | 1.1 | Alta |
| 1.7 | Verificar que nenhum segredo está em logs ou responses | 0.5 | Nenhuma | Alta |

**Total Fase 1:** 5 SP (1 semana)

**Critérios de aceite:**
- [ ] `.env` não está no repositório git
- [ ] Chave de criptografia é aleatória e forte
- [ ] Endpoint de exportação requer autenticação
- [ ] Rate limiting ativo em todas as rotas públicas
- [ ] Headers de segurança configurados
- [ ] Nenhum segredo exposto em logs

### 5.3 Fase 2 — Segurança e Compliance (Semanas 2-3)

**Objetivo:** Hardening de segurança e compliance com LGPD.

| ID | Tarefa | SP | Dependências | Prioridade |
|----|--------|-----|-------------|------------|
| 2.1 | Implementar DTOs com `class-validator` para todos os endpoints | 3 | Nenhuma | Alta |
| 2.2 | Verificar HMAC verification no webhook de Pagamento | 1 | Nenhuma | Alta |
| 2.3 | Mover refresh token para httpOnly cookie | 1.5 | Nenhuma | Alta |
| 2.4 | Adicionar testes de integração com supertest (endpoints críticos) | 2 | 2.1 | Alta |
| 2.5 | Testes de RBAC (garantir isolamento entre roles) | 1.5 | 2.1 | Alta |
| 2.6 | Adicionar logging estruturado (Winston/Pino) | 1 | Nenhuma | Média |
| 2.7 | Configurar health check real (PostgreSQL + Redis) | 0.5 | Nenhuma | Média |

**Total Fase 2:** 10 SP (2 semanas)

**Critérios de aceite:**
- [ ] Todos os endpoints têm DTOs validados
- [ ] Webhook de pagamento valida assinatura HMAC
- [ ] Refresh token em httpOnly cookie (não acessível via JS)
- [ ] Testes de integração passando para endpoints críticos
- [ ] Testes de RBAC garantem isolamento
- [ ] Logs estruturados com request ID

### 5.4 Fase 3 — Integrações Gratuitas (Semanas 4-6)

**Objetivo:** Substituir mocks por integrações reais usando serviços 100% gratuitos.

| ID | Tarefa | SP | Dependências | Prioridade |
|----|--------|-----|-------------|------------|
| 3.1 | Integrar Brevo (email transacional) — confirmação de agendamento | 2 | Provider interface | Alta |
| 3.2 | Integrar Telegram Bot — lembretes automáticos | 3 | Nenhuma | Alta |
| 3.3 | Implementar gerador de QR Code Pix (EMVCo padrão BCB) | 2 | Nenhuma | Alta |
| 3.4 | Integrar BrasilAPI — auto-preenchimento de CEP | 1 | Nenhuma | Média |
| 3.5 | Implementar confirmação manual de pagamento (secretária) | 1.5 | 3.3 | Alta |
| 3.6 | Gerar PDF de recibo (pdfkit) | 1.5 | 3.5 | Média |
| 3.7 | Integrar Sentry (error monitoring) | 1 | Nenhuma | Média |
| 3.8 | Configurar MinIO para upload de documentos | 1 | Nenhuma | Média |

**Total Fase 3:** 13 SP (2.5 semanas)

**Critérios de aceite:**
- [ ] Email de confirmação enviado via Brevo ao criar agendamento
- [ ] Lembrete Telegram enviado 24h e 1h antes da consulta
- [ ] QR Code Pix gerado corretamente (validado por app bancário)
- [ ] CEP auto-preenche endereço no formulário de paciente
- [ ] Secretária pode marcar pagamento como "pago" após receber comprovante
- [ ] PDF de recibo gerado corretamente
- [ ] Erros de produção visíveis no Sentry

### 5.5 Fase 4 — Frontend Funcional (Semanas 7-9)

**Objetivo:** Conectar todo o frontend à API real, remover todos os dados mockados.

| ID | Tarefa | SP | Dependências | Prioridade |
|----|--------|-----|-------------|------------|
| 4.1 | Hook `usePatients` (list, create, get, update) | 1 | API patients | Alta |
| 4.2 | Hook `useAppointments` (list, create, cancel, confirm) | 1 | API scheduling | Alta |
| 4.3 | Hook `useBilling` (list, createPix, markPaid) | 1 | API billing | Alta |
| 4.4 | Hook `useClinicalRecords` (list, create) | 1 | API clinical | Alta |
| 4.5 | Conectar PatientTable à API real | 1 | 4.1 | Alta |
| 4.6 | Conectar Agenda à API real | 2 | 4.2 | Alta |
| 4.7 | Conectar Financeiro à API real | 1 | 4.3 | Alta |
| 4.8 | Conectar Prontuário à API real | 2 | 4.4 | Alta |
| 4.9 | Loading skeletons em todas as páginas | 1 | Nenhuma | Média |
| 4.10 | Paginação real no frontend | 2 | API pagination | Média |
| 4.11 | Formulários com validação e mensagens de erro | 1.5 | DTOs | Média |
| 4.12 | Página de configurações do psicólogo | 1.5 | Nenhuma | Baixa |

**Total Fase 4:** 16 SP (3 semanas)

**Critérios de aceite:**
- [ ] Nenhum dado mockado permanece no frontend
- [ ] Todas as páginas carregam dados da API
- [ ] Loading states funcionais em todas as páginas
- [ ] Paginação funcional com navegação
- [ ] Formulários validam input e mostram erros

### 5.6 Fase 5 — Telehealth (Semanas 10-11)

**Objetivo:** Implementar videochamadas integradas para teleconsulta.

| ID | Tarefa | SP | Dependências | Prioridade |
|----|--------|-----|-------------|------------|
| 5.1 | Instalar e configurar Jitsi Meet (self-hosted) | 2 | Infraestrutura | Alta |
| 5.2 | Criar componente de videochamada (React) | 2 | 5.1 | Alta |
| 5.3 | Integrar com agendamento (criar sala por consulta) | 1.5 | 5.2, API scheduling | Alta |
| 5.4 | Sala de espera virtual (paciente aguarda psicóloga) | 1 | 5.2 | Média |
| 5.5 | Gravação de chamadas (consentimento) | 1.5 | 5.2 | Média |
| 5.6 | Chat durante a chamada | 1 | 5.2 | Baixa |

**Total Fase 5:** 9 SP (2 semanas)

**Critérios de aceite:**
- [ ] Videochamada 1:1 funciona entre psicóloga e paciente
- [ ] Sala criada automaticamente para cada agendamento
- [ ] Sala de espera virtual funciona
- [ ] Gravação funciona com consentimento
- [ ] Chat funciona durante a chamada

### 5.7 Fase 6 — Funcionalidades Avançadas (Semanas 12-14)

**Objetivo:** Diferenciação no mercado com funcionalidades avançadas.

| ID | Tarefa | SP | Dependências | Prioridade |
|----|--------|-----|-------------|------------|
| 6.1 | Autenticação 2FA (TOTP) | 2 | Nenhuma | Alta |
| 6.2 | Fila de espera inteligente | 2 | Waitlist model | Média |
| 6.3 | Escalas psicométricas digitais (PHQ-9, GAD-7) | 3 | FormTemplate model | Média |
| 6.4 | Assinatura digital de documentos | 2 | Nenhuma | Baixa |
| 6.5 | Dashboard financeiro com gráficos reais | 1.5 | API billing | Média |
| 6.6 | Exportação de relatórios (PDF/CSV) | 1.5 | API endpoints | Média |

**Total Fase 6:** 12 SP (2.5 semanas)

### 5.8 Fase 7 — Produção e Operações (Semanas 15-16)

**Objetivo:** Operationalizar para produção com monitoramento e CI/CD.

| ID | Tarefa | SP | Dependências | Prioridade |
|----|--------|-----|-------------|------------|
| 7.1 | CI/CD completo (GitHub Actions) | 2 | Nenhuma | Alta |
| 7.2 | Backup automático (pg_dump + MinIO) | 1.5 | Nenhuma | Alta |
| 7.3 | Documentação de API (Swagger completo) | 2 | DTOs | Média |
| 7.4 | Load testing (k6/artillery) | 1.5 | Nenhuma | Média |
| 7.5 | Runbook de operações | 1 | Nenhuma | Média |
| 7.6 | Monitoramento de uptime | 0.5 | Nenhuma | Alta |

**Total Fase 7:** 8.5 SP (1.5 semanas)

### 5.9 Fase 8 — Escala e Diferenciação (Semanas 17-20)

**Objetivo:** Funcionalidades de escala e diferenciação de mercado.

| ID | Tarefa | SP | Dependências | Prioridade |
|----|--------|-----|-------------|------------|
| 8.1 | Multi-tenant (múltiplas clínicas) | 3 | Arquitetura | Baixa |
| 8.2 | Analytics e relatórios avançados | 2 | Dados acumulados | Baixa |
| 8.3 | Dashboard de auditoria (log de ações) | 1.5 | AuditInterceptor | Média |
| 8.4 | Portal LGPD (portabilidade, esquecimento) | 2 | LGPD | Média |
| 8.5 | App mobile (React Native ou PWA) | 3 | Frontend funcional | Baixa |
| 8.6 | Google Calendar 2-way sync | 2 | Google API | Baixa |

**Total Fase 8:** 13.5 SP (2.5 semanas)

### 5.10 Resumo do Roadmap

| Fase | Título | SP | Semanas | Dependências Críticas |
|------|--------|-----|---------|----------------------|
| 1 | Segurança Crítica | 5 | 1 | Nenhuma |
| 2 | Segurança e Compliance | 10 | 2 | DTOs |
| 3 | Integrações Gratuitas | 13 | 2.5 | Provider interfaces |
| 4 | Frontend Funcional | 16 | 3 | API endpoints |
| 5 | Telehealth | 9 | 2 | Jitsi infra |
| 6 | Funcionalidades Avançadas | 12 | 2.5 | Fases 1-4 |
| 7 | Produção e Operações | 8.5 | 1.5 | Fases 1-4 |
| 8 | Escala e Diferenciação | 13.5 | 2.5 | Fases 1-7 |
| **Total** | | **87 SP** | **~17 semanas** | |

---

## 6. Matriz de Riscos

### 6.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Brevo atinge limite de 300 emails/dia | Média | Alto | Implementar fila de prioridade; migrar para Resend Pro se necessário |
| Telegram muda política de bots | Baixa | Alto | Manter email como fallback; monitorar changelog |
| Jitsi self-hosted com problemas de performance | Média | Médio | Configurar TURN server; testar com múltiplos participantes |
| Prisma ORM com queries lentas | Média | Médio | Usar raw SQL para queries complexas; indices no banco |
| Redis cair em produção | Baixa | Alto | Failover Redis; cache com TTL curto |
| PostgreSQL com locks de concorrência | Baixa | Alto | Usar SELECT FOR UPDATE; transações curtas |

### 6.2 Riscos de Segurança

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Secrets expostos no repositório | Média | Crítico | pre-commit hooks, git-secrets, rotação regular |
| Ataque brute force no login | Alta | Alto | Rate limiting, CAPTCHA após 5 tentativas |
| XSS via inputs do paciente | Média | Alto | Validação server-side, sanitização de output |
| SQL injection | Baixa | Crítico | Prisma parameterized queries |
| Session fixation | Baixa | Alto | Regenerar session ID após login |
| Dados sensíveis em logs | Média | Crítico | Máscara de CPF/email em logs; revisão de código |

### 6.3 Riscos de Negócio

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Concorrente lança funcionalidade similar | Alta | Médio | Foco em UX e compliance LGPD |
| Mudança de preços em APIs free tier | Média | Alto | Arquitetura de ports; fácil troca de provider |
| Baixa adoção de telehealth | Média | Médio | Oferecer como opcional, não obrigatório |
| LGPD mais rigorosa no futuro | Média | Alto | Já implementado compliance básico |

### 6.4 Matriz de Risco (Heat Map)

```
                    Impacto
              Baixo  Médio  Alto  Crítico
         ┌──────┬──────┬──────┬──────┐
  Alta   │      │      │Brute │      │
         │      │      │Force │      │
  Prob.  ├──────┼──────┼──────┼──────┤
  Média  │      │Perf. │Secret│XSS   │
         │      │Redis │Leaked│      │
         ├──────┼──────┼──────┼──────┤
  Baixa  │      │      │Redis │SQL   │
         │      │      │Down  │Inject│
         └──────┴──────┴──────┴──────┘
```

---

## 7. Métricas de Sucesso

### 7.1 Métricas Técnicas

| Métrica | Meta | Como medir |
|---------|------|------------|
| Cobertura de testes unitários | > 80% dos services | `vitest --coverage` |
| Cobertura de testes E2E | Fluxos críticos | Playwright reports |
| Lighthouse score | > 90 em todas categorias | Lighthouse CI |
| Tempo de resposta API (p95) | < 200ms | Sentry Performance |
| Uptime | > 99.5% | Uptime monitoring |
| Vulnerabilidades conhecidas | 0 high/critical | `npm audit`, Sentry |
| Build time | < 3 minutos | CI/CD metrics |
| Bundle size (initial load) | < 200KB gzipped | Next.js build analyzer |

### 7.2 Métricas de Produto

| Métrica | Meta (3 meses) | Meta (6 meses) |
|---------|----------------|----------------|
| Pacientes cadastrados | 50 | 200 |
| Agendamentos/mês | 100 | 500 |
| Taxa de comparecimento | > 85% | > 90% |
| Pagamentos digitais | > 60% | > 80% |
| Teleconsultas realizadas | 20 | 100 |
| Satisfação do usuário (NPS) | > 7 | > 8 |

### 7.3 Métricas de Negócio

| Métrica | Meta (6 meses) | Meta (12 meses) |
|---------|----------------|-----------------|
| Clínicas ativas | 3 | 10 |
| Usuários ativos/mês | 15 | 50 |
| MRR (se monetizado) | R$ 0 | R$ 500+ |
| Churn rate | < 10% | < 5% |

---

## 8. Decisões de Arquitetura (ADRs)

### ADR-001: Brevo para Email Transacional

**Status:** Aprovado  
**Contexto:** O sistema precisa enviar emails transacionais (confirmação, lembrete, recibo).  
**Decisão:** Usar Brevo (Sendinblue) com tier gratuito (300 emails/dia).  
**Consequências:**
- Positivo: Sem custo, API simples, webhooks de entrega
- Negativo: Limite de 300 emails/dia pode ser insuficiente
- Neutral: Sem dedicated IP no tier gratuito

### ADR-002: Telegram para Notificações

**Status:** Aprovado  
**Contexto:** O sistema precisa enviar notificações push para pacientes.  
**Decisão:** Usar Telegram Bot API (100% gratuito) em vez de WhatsApp (pago após outubro 2026).  
**Consequências:**
- Positivo: Zero custo, suporte a botões inline, web apps
- Negativo: Nem todos os pacientes usam Telegram
- Neutral: Necessário cadastro do Telegram no perfil do paciente

### ADR-003: Pix Estático para Pagamentos

**Status:** Aprovado  
**Contexto:** O sistema precisa processar pagamentos de consultas.  
**Decisão:** Usar QR Code Pix estático (padrão EMVCo BCB) sem API de PSP.  
**Consequências:**
- Positivo: Zero custo de transação, sem necessidade de conta PJ
- Negativo: Confirmação manual de pagamento (secretária valida)
- Neutral: Compatível com todos os bancos brasileiros

### ADR-004: Jitsi Meet para Telehealth

**Status:** Aprovado  
**Contexto:** O sistema precisa suportar videochamadas para teleconsulta.  
**Decisão:** Usar Jitsi Meet self-hosted (open-source, gratuito).  
**Consequências:**
- Positivo: Sem limite de minutos, gravação inclusa, E2EE disponível
- Negativo: Requer infraestrutura própria (servidor, bandwidth)
- Neutral: Necessário manter e atualizar o servidor

### ADR-005: MinIO para Storage

**Status:** Aprovado  
**Contexto:** O sistema precisa armazenar documentos e comprovantes.  
**Decisão:** Usar MinIO já configurado no docker-compose (S3-compatible).  
**Consequências:**
- Positivo: API S3-compatible, sem custo, self-hosted
- Negativo: Limitado pelo disco do servidor
- Neutral: Backup necessário

---

## 9. Plano de Execução

### 9.1 Configuração do Projeto

**Branches:**
- `main` — Produção estável
- `develop` — Integração contínua
- `feature/fase-X` — Features por fase
- `hotfix/*` — Correções urgentes

**Commits:**
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- Máximo 500 linhas por PR
- Code review obrigatório

**CI/CD:**
- GitHub Actions
- Lint → TypeCheck → Test → Build → Deploy
- Deploy automático em `main` após merge

### 9.2 Cadência de Entregas

| Entrega | Fase | Frequência |
|---------|------|------------|
| Sprint Review | Todas | A cada 2 semanas |
| Demo para stakeholders | Todas | A cada 2 semanas |
| Retrospectiva | Todas | A cada 2 semanas |
| Deploy para produção | Fase 7+ | Semanal |
| Auditoria de segurança | Todas | Mensal |

### 9.3 Definição de Pronto (DoD)

Uma tarefa está Pronta quando:
- [ ] Código implementado e funcionando
- [ ] Testes unitários escritos e passando
- [ ] Code review aprovado
- [ ] Build limpo (sem erros de TypeScript/ESLint)
- [ ] Documentação atualizada (se aplicável)
- [ ] Sem regressão em testes existentes

---

## 10. Anexo A — Comandos Úteis

### Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Rodar testes
pnpm test

# Rodar testes com coverage
pnpm test:coverage

# Lint
pnpm lint

# TypeCheck
pnpm typecheck

# Build
pnpm build
```

### Infraestrutura

```bash
# Subir serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Backup do banco
docker-compose exec postgres pg_dump -U postgres clinica > backup.sql
```

### Telegram Bot

```bash
# Criar bot via @BotFather no Telegram
# /newbot → seguir instruções → obter token

# Configurar no .env
TELEGRAM_BOT_TOKEN=seu_token_aqui
```

### Brevo

```bash
# Criar conta em https://app.brevo.com
# Settings → SMTP & API → API Keys → Generate
# Configurar no .env
BREVO_API_KEY=sua_chave_aqui
```

---

## 11. Anexo B — Variáveis de Ambiente

```bash
# === BANCO DE DADOS ===
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinica

# === REDIS ===
REDIS_HOST=localhost
REDIS_PORT=6379

# === JWT ===
JWT_SECRET=<gerar 64 caracteres aleatórios>
JWT_REFRESH_SECRET=<gerar 64 caracteres aleatórios>

# === CRIPTOGRAFIA ===
ENCRYPTION_KEY=<gerar 32 bytes aleatórios em hex>
HMAC_PEPPER=<gerar 32 bytes aleatórios em hex>

# === EMAIL (Brevo) ===
BREVO_API_KEY=<obter em app.brevo.com>
BREVO_FROM_EMAIL=clinica@seudominio.com.br
BREVO_FROM_NAME=ClínicaPsi

# === TELEGRAM ===
TELEGRAM_BOT_TOKEN=<obter via @BotFather>

# === PIX ===
PIX_KEY=<chave Pix da clínica>
PIX_RECEIVER_NAME=<nome do beneficiário>
PIX_RECEIVER_CITY=<cidade do beneficiário>

# === MINIO ===
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=clinica-docs

# === SENTRY ===
SENTRY_DSN=<obter em sentry.io>

# === APP ===
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000
```

---

## 12. Anexo C — Referências

### Documentação Técnica

- [Manual de Padrões para Iniciação do Pix — BCB](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf)
- [Manual BR Code — BCB v2.0.1](https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf)
- [EMV QRCPS-MPM Specification](https://www.emvco.com/emv-technologies/qr-codes/)
- [Brevo API Documentation](https://developers.brevo.com/reference)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Jitsi Meet Documentation](https://jitsi.github.io/handbook/)
- [BrasilAPI](https://brasilapi.com.br/docs)
- [Sentry Documentation](https://docs.sentry.io/)

### Padrões e Normas

- [IEEE 830-1998 — Especificação de Requisitos](https://ieeexplore.ieee.org/document/12987)
- [PMBOK 7ª Edição](https://www.pmi.org/pmbok-guide-standards)
- [Scrum Guide 2020](https://scrumguides.org/)
- [LGPD — Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

**Fim do documento — ROADMAP-COMPLETO v2.0**
