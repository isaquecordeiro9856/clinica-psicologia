'use client';

import { cn } from '@/lib/utils';

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmado', color: 'var(--emerald)', bg: 'rgba(16,185,129,0.1)' },
  pending_payment: { label: 'Pendente', color: 'var(--amber)', bg: 'rgba(245,158,11,0.1)' },
  completed: { label: 'Realizado', color: 'var(--indigo)', bg: 'rgba(99,102,241,0.1)' },
  cancelled: { label: 'Cancelado', color: 'var(--rose)', bg: 'rgba(244,63,94,0.1)' },
  no_show: { label: 'Ausente', color: 'var(--rose)', bg: 'rgba(244,63,94,0.1)' },
  paid: { label: 'Pago', color: 'var(--emerald)', bg: 'rgba(16,185,129,0.1)' },
  pending: { label: 'Pendente', color: 'var(--amber)', bg: 'rgba(245,158,11,0.1)' },
  overdue: { label: 'Atrasado', color: 'var(--rose)', bg: 'rgba(244,63,94,0.1)' },
  active: { label: 'Ativo', color: 'var(--teal)', bg: 'rgba(20,184,166,0.1)' },
  inactive: { label: 'Inativo', color: 'var(--fg-faint)', bg: 'var(--bg-subtle)' },
  discharged: { label: 'Alta', color: 'var(--violet)', bg: 'rgba(139,92,246,0.1)' },
};

export function StatusDot({ status, className }: { status: string; className?: string }) {
  const s = statusMap[status] ?? { color: 'var(--fg-faint)', bg: 'var(--bg-subtle)' };
  return <span className={cn('inline-block h-2 w-2 rounded-full', className)} style={{ background: s.color }} />;
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = statusMap[status] ?? { label: status, color: 'var(--fg-muted)', bg: 'var(--bg-subtle)' };
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium', className)}
      style={{ color: s.color, background: s.bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}
