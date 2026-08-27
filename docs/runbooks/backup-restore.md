# Runbook — Backup & Restore

## Backup PostgreSQL

```bash
# Snapshot diário criptografado
pg_dump $DATABASE_URL | gpg --encrypt --recipient dpo@clinica.app > backup-$(date +%F).sql.gpg

# WAL contínuo (WAL-G para S3/R2)
wal-g backup-push
```

## Teste de Restore (mensal)

```bash
# Restaura em staging e valida
dropdb clinica_staging && createdb clinica_staging
gpg --decrypt backup-2026-08-27.sql.gpg | psql $STAGING_DATABASE_URL
psql $STAGING_DATABASE_URL -c "SELECT count(*) FROM patients;"
```

## RPO/RTO

- RPO 1h, RTO 4h (MVP)

## S3/R2

- Versionamento ligado, lifecycle para Glacier após 90 dias.
