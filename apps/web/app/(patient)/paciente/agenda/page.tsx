'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Plus, CalendarDays } from 'lucide-react';
import { PatientLayout } from '@/components/layout/patient-layout';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { useAppointments } from '@/hooks/use-appointments';
import { PatientSchedulingDialog } from '@/components/scheduling/patient-scheduling-dialog';

export default function AgendaPacientePage() {
  const [schedulingOpen, setSchedulingOpen] = useState(false);
  const { data: appointments, loading, refetch } = useAppointments();

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumbs items={[{ label: 'Minha Agenda' }]} />
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Minha Agenda</h1>
            <p className="text-sm text-muted-foreground">Visualize e gerencie suas consultas.</p>
          </div>
          <Button onClick={() => setSchedulingOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Agendar consulta</span>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            title="Nenhuma consulta agendada"
            description="Agende sua primeira consulta para comecar."
            icon={<CalendarDays className="h-6 w-6 text-muted-foreground" />}
            action={{ label: 'Agendar consulta', onClick: () => setSchedulingOpen(true) }}
          />
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => {
              const date = new Date(apt.startAt);
              const day = date.toLocaleDateString('pt-BR', { day: '2-digit' });
              const month = date.toLocaleDateString('pt-BR', { month: 'short' });
              const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

              return (
                <Card key={apt.id} className="card-healthcare transition-all hover:scale-[1.005]">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-primary/10 shrink-0">
                      <span className="text-[10px] font-medium text-primary uppercase">{month}</span>
                      <span className="text-lg font-bold text-primary">{day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">Sessão individual</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {time}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={apt.status} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <PatientSchedulingDialog
          open={schedulingOpen}
          onOpenChange={setSchedulingOpen}
          onSuccess={refetch}
        />
      </div>
    </PatientLayout>
  );
}
