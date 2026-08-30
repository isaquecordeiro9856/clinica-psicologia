'use client';

import { useBillings } from '@/hooks/use-billing';
import { StatusBadge } from '@/components/shared/status-badge';
import { format } from 'date-fns';

interface BillingTableProps {
  billings?: any[];
  patientId?: string;
}

export function BillingTable({ billings: propBillings, patientId }: BillingTableProps) {
  const { data: hookBillings, loading } = useBillings({ patientId, limit: 100 });
  const billings = propBillings ?? hookBillings;

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
        ))}
      </div>
    );
  }

  if (billings.length === 0) {
    return (
      <div className="empty-state py-12">
        <p className="text-sm font-medium">Nenhuma cobrança encontrada</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--bg-subtle)' }}>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-faint)' }}>Valor</th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-faint)' }}>Paciente</th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-faint)' }}>Vencimento</th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-faint)' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {billings.map((b) => (
            <tr key={b.id} className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <td className="px-4 py-3 font-semibold">R$ {Number(b.amount).toLocaleString('pt-BR')}</td>
              <td className="px-4 py-3" style={{ color: 'var(--fg-muted)' }}>{b.patient?.name ?? '---'}</td>
              <td className="px-4 py-3" style={{ color: 'var(--fg-muted)' }}>
                {b.dueDate ? format(new Date(b.dueDate), 'dd/MM/yyyy') : '---'}
              </td>
              <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
