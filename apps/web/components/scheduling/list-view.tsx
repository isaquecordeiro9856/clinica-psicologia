'use client';

import { useAgenda } from './agenda-context';
import { useAppointments } from '@/hooks/use-appointments';
import { AppointmentCard } from './appointment-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ListViewProps {
  onAppointmentClick?: (id: string) => void;
}

export function ListView({ onAppointmentClick }: ListViewProps) {
  const { currentDate } = useAgenda();
  const from = new Date(currentDate);
  from.setHours(0, 0, 0, 0);
  const to = new Date(currentDate);
  to.setHours(23, 59, 59, 999);

  const { data: appointments, loading } = useAppointments({
    from: from.toISOString(),
    to: to.toISOString(),
    limit: 100,
    pollInterval: 30000,
  });

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={<Clock className="h-6 w-6" />}
        title="Nenhum agendamento para este dia"
        description="Clique em um horário vazio na agenda ou em 'Novo agendamento' para criar."
      />
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="border-b px-4 py-3">
        <h3 className="text-[13px] font-semibold">
          {appointments.length} consulta{appointments.length !== 1 ? 's' : ''} —{' '}
          {isToday(currentDate) ? 'Hoje' : format(currentDate, "dd 'de' MMM", { locale: ptBR })}
        </h3>
      </div>
      <div className="divide-y divide-border/60">
        {appointments.map((apt) => (
          <div key={apt.id} className="px-3 py-1">
            <AppointmentCard
              appointment={apt}
              variant="list"
              onClick={() => onAppointmentClick?.(apt.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
