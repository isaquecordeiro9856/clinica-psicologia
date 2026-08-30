'use client';

import { useAgenda } from './agenda-context';
import { useAppointments } from '@/hooks/use-appointments';
import { CalendarGrid } from './calendar-grid';
import { Skeleton } from '@/components/ui/skeleton';

interface DayViewProps {
  onAppointmentClick?: (id: string) => void;
  onSlotClick?: (date: Date) => void;
}

export function DayView({ onAppointmentClick, onSlotClick }: DayViewProps) {
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
      <div className="rounded-xl border bg-card p-4">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <CalendarGrid
      mode="day"
      currentDate={currentDate}
      appointments={appointments}
      onSlotClick={onSlotClick}
      onAppointmentClick={onAppointmentClick}
    />
  );
}
