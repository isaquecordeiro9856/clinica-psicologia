'use client';

import { useAgenda, getStartOfWeek } from './agenda-context';
import { useAppointments } from '@/hooks/use-appointments';
import { CalendarGrid } from './calendar-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays } from 'date-fns';

interface WeekViewProps {
  onAppointmentClick?: (id: string) => void;
  onSlotClick?: (date: Date) => void;
}

export function WeekView({ onAppointmentClick, onSlotClick }: WeekViewProps) {
  const { currentDate } = useAgenda();
  const weekStart = getStartOfWeek(currentDate);
  const weekEnd = addDays(weekStart, 6);

  const { data: appointments, loading } = useAppointments({
    from: weekStart.toISOString(),
    to: new Date(weekEnd.setHours(23, 59, 59, 999)).toISOString(),
    pollInterval: 30000,
  });

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <CalendarGrid
      mode="week"
      currentDate={currentDate}
      appointments={appointments}
      onSlotClick={onSlotClick}
      onAppointmentClick={onAppointmentClick}
    />
  );
}
