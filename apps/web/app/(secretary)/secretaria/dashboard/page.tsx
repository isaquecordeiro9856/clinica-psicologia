'use client';

import { SecretaryLayout } from '@/components/layout/secretary-layout';
import { StatsCard } from '@/components/shared/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Calendar, DollarSign, CheckCircle, Clock, ArrowRight, Bell, UserPlus } from 'lucide-react';
import { useTodayAppointments } from '@/hooks/use-appointments';
import { useFinancialSummary } from '@/hooks/use-billing';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SecretaryDashboardPage() {
  const { data: appointments, loading } = useTodayAppointments();
  const { data: summary } = useFinancialSummary();
  const { user } = useAuth();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  function getDisplayName() {
    return user?.name ?? user?.email?.split('@')[0] ?? 'Secretaria';
  }

  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const pending = appointments.filter((a) => a.status === 'pending_payment' || a.status === 'pending').length;

  return (
    <SecretaryLayout>
      <div className="space-y-6">
        <div>
          <Breadcrumbs items={[{ label: 'Dashboard' }]} />
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{getGreeting()}, {getDisplayName()}</h1>
          <p className="text-sm text-muted-foreground">Painel da secretaria</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Consultas hoje" value={appointments.length} description={`${confirmed} confirmadas, ${pending} pendentes`} icon={Calendar} accent="blue" />
          <StatsCard title="Check-ins" value={`${confirmed}/${appointments.length}`} description="pacientes confirmaram" icon={CheckCircle} accent="green" />
          <StatsCard title="Cobrancas pendentes" value={summary?.pendingCount ?? 0} description={`R$ ${(summary?.pendingAmount ?? 0).toLocaleString('pt-BR')}`} icon={DollarSign} accent="amber" />
          <StatsCard title="Proximo horario" value={appointments[0] ? new Date(appointments[0].startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '---'} description={appointments[0]?.patient?.name ?? 'Nenhum'} icon={Clock} accent="blue" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-healthcare">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Agenda de Hoje</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{confirmed} confirmados · {pending} pendentes</p>
              </div>
              <Link href="/secretaria/agenda">
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                  Ver completa <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}
                </div>
              ) : appointments.length === 0 ? (
                <EmptyState title="Nenhuma consulta hoje" icon={<Calendar className="h-6 w-6 text-muted-foreground" />} />
              ) : (
                <div className="space-y-2">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {apt.patient?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '??'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{apt.patient?.name ?? 'Paciente'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(apt.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Acoes Rapidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { icon: CheckCircle, title: 'Confirmar presencas', description: 'Enviar confirmacao para pacientes', action: () => toast.success('Confirmacoes enviadas!') },
                { icon: DollarSign, title: 'Gerar cobrancas', description: 'Criar PIX para pendentes', action: () => toast.success('Cobrancas geradas!') },
                { icon: Bell, title: 'Enviar lembretes', description: 'Lembrete para consultas de amanha', action: () => toast.success('Lembretes enviados!') },
                { icon: UserPlus, title: 'Encaixar paciente', description: 'Ver horarios disponiveis', action: () => toast.info('Funcionalidade em desenvolvimento') },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={action.action}
                    className="w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </SecretaryLayout>
  );
}
