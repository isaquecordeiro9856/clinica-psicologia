'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePatients } from '@/hooks/use-patients';
import { useFinancialSummary } from '@/hooks/use-billing';
import { usePolling } from '@/hooks/use-polling';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Users, Calendar, DollarSign, Clock, Download, Loader2,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalPatients: number;
  newPatients: number;
  totalRevenue: number;
  avgSessionDuration: number;
}

export default function RelatoriosPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(() => {
    apiFetch<{ data: ReportStats }>('/reports/dashboard')
      .then((r) => { setStats(r.data); setError(null); })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  usePolling(fetchStats, 60000);

  const { data: patients } = usePatients({ limit: 100 });
  const { data: billings } = useFinancialSummary();

  const now = new Date();
  const monthStart = format(startOfMonth(now), 'dd/MM');
  const monthEnd = format(endOfMonth(now), 'dd/MM');

  return (
    <div className="animate-fade-in p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Panorama geral da prática clínica.</p>
        </div>
        <Button variant="outline" size="sm" className="h-9 rounded-lg gap-1.5">
          <Download className="h-4 w-4" /> Exportar
        </Button>
      </div>

      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium" style={{ background: 'var(--bg-subtle)', color: 'var(--fg-muted)' }}>
          <Calendar className="h-3 w-3" /> {monthStart} — {monthEnd} de {format(now, 'yyyy')}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border px-4 py-3 text-sm mb-8" style={{ borderColor: 'var(--danger)', background: 'rgba(239,68,68,0.05)', color: 'var(--danger)' }}>
          Erro ao carregar dados: {error}
          <button onClick={fetchStats} className="ml-2 underline font-medium">Tentar novamente</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Consultas realizadas', value: stats?.completedAppointments ?? 0, icon: Calendar, color: 'var(--indigo)' },
              { label: 'Pacientes ativos', value: patients.filter((p) => p.status === 'active').length, icon: Users, color: 'var(--violet)' },
              { label: 'Receita do mês', value: `R$ ${(billings?.totalRevenue ?? 0).toLocaleString('pt-BR')}`, icon: DollarSign, color: 'var(--teal)' },
              { label: 'Duração média', value: `${stats?.avgSessionDuration ?? 50}min`, icon: Clock, color: 'var(--amber)' },
            ].map((s) => (
              <div key={s.label} className="record-card">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}12` }}>
                    <s.icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium" style={{ color: 'var(--fg-muted)' }}>{s.label}</p>
                    <p className="text-xl font-bold">{s.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="record-card">
              <h3 className="text-sm font-semibold mb-4">Consultas por status</h3>
              <div className="space-y-3">
                {[
                  { label: 'Realizadas', value: stats?.completedAppointments ?? 0, total: stats?.totalAppointments ?? 1, color: 'var(--emerald)' },
                  { label: 'Canceladas', value: stats?.cancelledAppointments ?? 0, total: stats?.totalAppointments ?? 1, color: 'var(--rose)' },
                ].map((bar) => {
                  const pct = bar.total > 0 ? (bar.value / bar.total) * 100 : 0;
                  return (
                    <div key={bar.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{bar.label}</span>
                        <span className="text-xs font-semibold">{bar.value}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: bar.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="record-card">
              <h3 className="text-sm font-semibold mb-4">Visão financeira</h3>
              <div className="space-y-3">
                {[
                  { label: 'Recebido', value: `${billings?.paidCount ?? 0} cobranças`, color: 'var(--emerald)' },
                  { label: 'Pendente', value: `R$ ${(billings?.pendingAmount ?? 0).toLocaleString('pt-BR')}`, color: 'var(--amber)' },
                  { label: 'Atrasado', value: `R$ ${(billings?.overdueAmount ?? 0).toLocaleString('pt-BR')}`, color: 'var(--rose)' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{item.label}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
