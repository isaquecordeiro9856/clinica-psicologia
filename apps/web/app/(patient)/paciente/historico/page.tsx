'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, History } from 'lucide-react';
import { PatientLayout } from '@/components/layout/patient-layout';
import { EmptyState } from '@/components/shared/empty-state';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { useAppointments } from '@/hooks/use-appointments';

export default function HistoricoPage() {
  const { data: appointments, loading } = useAppointments({ status: 'completed' });

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div>
          <Breadcrumbs items={[{ label: 'Histórico' }]} />
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Histórico</h1>
          <p className="text-sm text-muted-foreground">Suas sessões anteriores.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            title="Nenhuma sessão registrada"
            description="Suas sessões anteriores aparecerão aqui."
            icon={<History className="h-6 w-6 text-muted-foreground" />}
          />
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => {
              const date = new Date(apt.startAt);
              const day = date.toLocaleDateString('pt-BR', { day: '2-digit' });
              const month = date.toLocaleDateString('pt-BR', { month: 'short' });
              const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

              return (
                <Card key={apt.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primary/10 shrink-0">
                      <span className="text-xs font-medium text-primary uppercase">{month}</span>
                      <span className="text-sm font-bold text-primary">{day}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Sessão individual</p>
                        <Badge variant={apt.status === 'completed' ? 'default' : 'destructive'}>
                          {apt.status === 'completed' ? 'Realizada' : 'Não compareceu'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {time}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
