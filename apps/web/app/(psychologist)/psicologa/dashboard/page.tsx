'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTodayAppointments } from '@/hooks/use-appointments';
import { usePatients } from '@/hooks/use-patients';
import { useFinancialSummary } from '@/hooks/use-billing';
import { usePolling } from '@/hooks/use-polling';
import { apiFetch } from '@/lib/api';
import { StatusDot } from '@/components/shared/status-badge';
import {
  Calendar, Users, DollarSign, Clock, Plus, ArrowRight,
  CheckCircle2, AlertTriangle, FileText, UserPlus, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Stats {
  todayAppointments: number;
  completedToday: number;
  pendingToday: number;
  totalPatients: number;
  pendingBillings: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = useCallback(() => {
    apiFetch<{ data: Stats }>('/reports/dashboard')
      .then((r) => { setStats(r.data); setStatsError(null); })
      .catch((err) => setStatsError((err as Error).message))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  usePolling(fetchStats, 60000);

  const { data: appointments, loading: appointmentsLoading } = useTodayAppointments();
  const { data: patients } = usePatients({ limit: 100 });
  const { data: summary } = useFinancialSummary();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const name = user?.name?.split(' ')[0] ?? 'Psi';
  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const pending = appointments.filter((a) => a.status === 'pending_payment').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const activePatients = patients.filter((p) => p.status === 'active').length;
  const nextApt = appointments.find((a) => a.status !== 'completed' && a.status !== 'cancelled');

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="px-8 pt-8 pb-6">
        <p className="text-sm capitalize" style={{ color: 'var(--fg-muted)' }}>{today}</p>
        <h1 className="text-3xl font-bold mt-1">{greeting}, <span style={{ color: 'var(--accent)' }}>{name}</span></h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
          {appointmentsLoading ? (
            <span className="inline-flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Carregando agenda...</span>
          ) : appointments.length === 0 ? (
            'Nenhuma consulta agendada para hoje.'
          ) : (
            `${appointments.length} consulta${appointments.length > 1 ? 's' : ''} no dia. ${nextApt ? `Próxima às ${format(new Date(nextApt.startAt), 'HH:mm')}.` : ''}`
          )}
        </p>
      </div>

      {/* Error banner */}
      {statsError && (
        <div className="mx-8 mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: 'var(--danger)', background: 'rgba(239,68,68,0.05)', color: 'var(--danger)' }}>
          Erro ao carregar estatísticas: {statsError}
          <button onClick={fetchStats} className="ml-2 underline font-medium">Tentar novamente</button>
        </div>
      )}

      {/* Metrics row */}
      <div className="px-8 pb-6">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { label: 'Consultas', value: stats?.todayAppointments ?? 0, icon: Calendar, color: 'var(--indigo)' },
            { label: 'Confirmadas', value: confirmed, icon: CheckCircle2, color: 'var(--emerald)' },
            { label: 'Pendentes', value: pending, icon: Clock, color: 'var(--amber)' },
            { label: 'Pacientes', value: activePatients, icon: Users, color: 'var(--violet)' },
            { label: 'Receita', value: `R$ ${(summary?.totalRevenue ?? 0).toLocaleString('pt-BR')}`, icon: DollarSign, color: 'var(--teal)' },
            { label: 'Pendências', value: `R$ ${(summary?.pendingAmount ?? 0).toLocaleString('pt-BR')}`, icon: AlertTriangle, color: 'var(--rose)' },
          ].map((m) => (
            <div key={m.label} className="metric-pill shrink-0 min-w-[160px]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${m.color}15` }}>
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
              </div>
              <div>
                <p className="text-[11px] font-medium" style={{ color: 'var(--fg-muted)' }}>{m.label}</p>
                <p className="text-lg font-bold leading-tight">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="px-8 pb-8">
        <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 320px)' }}>
          {/* Left: Today's timeline */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Agenda de hoje</h2>
              <Link href="/psicologa/agenda" className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                Ver completa <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {appointmentsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="record-card flex flex-col items-center py-12">
                <Calendar className="h-8 w-8 mb-3" style={{ color: 'var(--fg-faint)' }} />
                <p className="text-sm font-medium">Agenda livre</p>
                <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>Nenhuma consulta para hoje.</p>
                <Link href="/psicologa/agenda" className="mt-4 rounded-lg px-4 py-2 text-xs font-medium text-white" style={{ background: 'var(--accent)' }}>
                  Abrir agenda
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {appointments.map((apt, i) => {
                  const time = format(new Date(apt.startAt), 'HH:mm');
                  const end = format(new Date(apt.endAt), 'HH:mm');
                  const isNext = i === 0 && apt.status !== 'completed';
                  return (
                    <Link
                      key={apt.id}
                      href="/psicologa/agenda"
                      className="record-card flex items-center gap-4 group cursor-pointer"
                      style={isNext ? { borderColor: 'var(--accent)', background: 'rgba(14,165,233,0.03)' } : {}}
                    >
                      <div className="w-16 text-center shrink-0">
                        <p className="text-sm font-bold tabular-nums">{time}</p>
                        <p className="text-[10px]" style={{ color: 'var(--fg-faint)' }}>{end}</p>
                      </div>
                      <div className="h-8 w-px" style={{ background: 'var(--border-subtle)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{apt.patient?.name ?? 'Paciente'}</p>
                          {isNext && (
                            <span className="text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5" style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--accent)' }}>
                              Próxima
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
                          {apt.service?.name ?? 'Consulta'} · {apt.service?.durationMinutes ?? 50}min
                        </p>
                      </div>
                      <StatusDot status={apt.status} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Side panel */}
          <div className="w-80 shrink-0 space-y-5">
            {/* Quick actions */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--fg-faint)' }}>Ações rápidas</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: UserPlus, label: 'Novo paciente', href: '/psicologa/pacientes', color: 'var(--violet)' },
                  { icon: Plus, label: 'Agendar', href: '/psicologa/agenda', color: 'var(--accent)' },
                  { icon: FileText, label: 'Prontuário', href: '/psicologa/prontuario', color: 'var(--teal)' },
                  { icon: DollarSign, label: 'Cobrança', href: '/psicologa/financeiro', color: 'var(--amber)' },
                ].map((a) => (
                  <Link key={a.label} href={a.href} className="record-card flex items-center gap-2.5 group">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}12` }}>
                      <a.icon className="h-3.5 w-3.5" style={{ color: a.color }} />
                    </div>
                    <span className="text-xs font-medium">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Today summary */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--fg-faint)' }}>Resumo</h3>
              <div className="record-card space-y-2.5">
                {[
                  { label: 'Total', value: stats?.todayAppointments ?? 0, color: 'var(--fg)' },
                  { label: 'Confirmadas', value: confirmed, color: 'var(--emerald)' },
                  { label: 'Pendentes', value: pending, color: 'var(--amber)' },
                  { label: 'Realizadas', value: completed, color: 'var(--indigo)' },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{r.label}</span>
                    <span className="text-sm font-bold" style={{ color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent patients */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-faint)' }}>Pacientes</h3>
                <Link href="/psicologa/pacientes" className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>Ver todos</Link>
              </div>
              <div className="space-y-1">
                {patients.filter((p) => p.status === 'active').slice(0, 5).map((p) => (
                  <Link key={p.id} href="/psicologa/pacientes" className="record-card flex items-center gap-3 py-2.5 px-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: 'var(--violet)', color: 'white' }}>
                      {p.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.name ?? 'Sem nome'}</p>
                      <p className="text-[10px]" style={{ color: 'var(--fg-faint)' }}>Ativo</p>
                    </div>
                    <StatusDot status={p.status ?? 'active'} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
