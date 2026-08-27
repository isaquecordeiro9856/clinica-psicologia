# RIPD — Relatório de Impacto à Proteção de Dados

> Template inicial — preencher com DPO/advogado antes de produção.

## 1. Controlador e Encarregado

- Controlador: Clínica [Nome], CNPJ, contato
- Encarregado (DPO): [nome, e-mail dpo@clinica.app]

## 2. Necessidade e proporcionalidade

- Finalidades: gestão de agenda, prontuário psicológico, faturamento.
- Base legal por tratamento: ver `00-ARQUITETURA...md` §7.1
- Dados minimizados: CPF só se necessário para recibo; prontuário só texto + anexos autorizados.

## 3. Fluxo de dados sensíveis

Paciente → API (TLS) → App criptografa (AES-GCM) → PG → S3 (SSE) → só psicóloga dona decifra.

## 4. Riscos e medidas

| Risco | Medida |
|---|---|
| Vazamento de prontuário | Criptografia por paciente, RBAC, audit log, pentest |
| Acesso indevido secretaria | Guard hard 403 + testes |
| Perda de dados | WAL + PITR + teste mensal |

## 5. Retenção

- Prontuário 5 anos pós último atendimento (CFP 001/2009) — prevalece sobre pedido de eliminação.
- Financeiro 5 anos (fiscal).

## 6. Direitos do titular

Exportação, correção, eliminação/anonimização, revogação de consentimento — SLA 15 dias.

## 7. Aprovação

Assinado por DPO e responsável técnico em ___/___/___.
