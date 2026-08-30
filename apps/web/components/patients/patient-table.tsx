'use client';

import { usePatients, Patient } from '@/hooks/use-patients';
import { StatusBadge } from '@/components/shared/status-badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientTableProps {
  patients?: Patient[];
  onSelect?: (patient: Patient) => void;
  onChanged?: () => void;
  selectedId?: string | null;
  loading?: boolean;
}

export function PatientTable({ patients: propPatients, onSelect, onChanged, selectedId, loading: propLoading }: PatientTableProps) {
  const { data: hookPatients, loading: hookLoading } = usePatients({ limit: 100 });
  const patients = propPatients ?? hookPatients;
  const loading = propLoading ?? hookLoading;

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="empty-state py-12">
        <p className="text-sm font-medium">Nenhum paciente encontrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--bg-subtle)' }}>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-faint)' }}>Nome</th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-faint)' }}>E-mail</th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-faint)' }}>Telefone</th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-faint)' }}>Status</th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-faint)' }}>Cadastro</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr
              key={p.id}
              className="border-t cursor-pointer transition-colors"
              style={{ borderColor: 'var(--border-subtle)', background: selectedId === p.id ? 'var(--surface-overlay)' : 'transparent' }}
              onClick={() => onSelect?.(p)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--bg-subtle)' }}>
                    {p.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '??'}
                  </div>
                  <span className="font-medium">{p.name ?? 'Sem nome'}</span>
                </div>
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--fg-muted)' }}>{p.email ?? '---'}</td>
              <td className="px-4 py-3" style={{ color: 'var(--fg-muted)' }}>{p.phone ?? '---'}</td>
              <td className="px-4 py-3"><StatusBadge status={p.status ?? 'active'} /></td>
              <td className="px-4 py-3" style={{ color: 'var(--fg-muted)' }}>{format(new Date(p.createdAt), 'dd/MM/yyyy')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
