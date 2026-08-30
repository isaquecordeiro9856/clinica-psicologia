'use client';

import { useAgenda } from './agenda-context';
import { useAppointments } from '@/hooks/use-appointments';
import { CalendarGrid } from './calendar-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfMonth, endOfMonth } from 'date-fns';

interface MonthViewProps {
  onAppointmentClick?: (id: string) => void;
  onSlotClick?: (date: Date) => void;
}

export function MonthView({ onAppointmentClick, onSlotClick }: MonthViewProps) {
  const { currentDate, refreshKey } = useAgenda();
  const from = startOfMonth(currentDate);
  const to = endOfMonth(currentDate);

  const { data: appointments, loading } = useAppointments({
    from: from.toISOString(),
    to: to.toISOString(),
    limit: 200,
    pollInterval: 60000,
  });

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <CalendarGrid
      mode="month"
      currentDate={currentDate}
      appointments={appointments}
      onSlotClick={onSlotClick}
      onAppointmentClick={onAppointmentClick}
    />
  );
}
