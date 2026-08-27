# Runbook — Incidente LGPD

1. **Detectar**: alerta Sentry/Grafana ou reporte manual.
2. **Conter**: revogar tokens, rotacionar `ENCRYPTION_MASTER_KEY` (KEK), bloquear IP.
3. **Preservar evidências**: snapshot de logs, dump de `audit_logs`, não apagar nada.
4. **Avaliar risco**: DPO classifica (alto risco = notificar ANPD em 72h + titulares).
5. **Notificar**: ANPD (art. 48) e titulares com escopo, mitigação e contato DPO.
6. **Corrigir**: patch + teste de regressão + revisão de RBAC.
7. **Registrar**: RIPD atualizado, post-mortem em `docs/incidentes/AAAA-MM-DD.md`.
