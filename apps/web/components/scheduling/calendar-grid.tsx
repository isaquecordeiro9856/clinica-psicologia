'use client';

import { useMemo, useRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { addDays, format, startOfMonth, endOfMonth, isToday as checkIsToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getStartOfWeek } from './agenda-context';
import { AppointmentCard } from './appointment-card';
import { CurrentTimeIndicator } from './current-time-indicator';
import type { Appointment } from '@/hooks/use-appointments';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7);
const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

interface CalendarGridProps {
  mode: 'month' | 'week' | 'day';
  currentDate: Date;
  appointments: Appointment[];
  onSlotClick?: (date: Date) => void;
  onAppointmentClick?: (id: string) => void;
}

export function CalendarGrid({ mode, currentDate, appointments, onSlotClick, onAppointmentClick }: CalendarGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      const key = format(new Date(apt.startAt), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    });
    return map;
  }, [appointments]);

  const appointmentsByHour = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      const d = new Date(apt.startAt);
      const key = `${format(d, 'yyyy-MM-dd')}-${d.getHours()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    });
    return map;
  }, [appointments]);

  if (mode === 'month') return <MonthGrid currentDate={currentDate} appointmentsByDate={appointmentsByDate} onSlotClick={onSlotClick} onAppointmentClick={onAppointmentClick} />;
  if (mode === 'week') return <WeekGrid ref={scrollRef} currentDate={currentDate} appointmentsByHour={appointmentsByHour} appointmentsByDate={appointmentsByDate} onSlotClick={onSlotClick} onAppointmentClick={onAppointmentClick} />;
  return <DayGrid ref={scrollRef} currentDate={currentDate} appointmentsByHour={appointmentsByHour} onSlotClick={onSlotClick} onAppointmentClick={onAppointmentClick} />;
}

function MonthGrid({
  currentDate, appointmentsByDate, onSlotClick, onAppointmentClick,
}: {
  currentDate: Date;
  appointmentsByDate: Map<string, Appointment[]>;
  onSlotClick?: (date: Date) => void;
  onAppointmentClick?: (id: string) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = getStartOfWeek(monthStart);
  const gridEnd = new Date(gridStart);
  gridEnd.setDate(gridEnd.getDate() + 41);

  const days: Date[] = [];
  const d = new Date(gridStart);
  while (d <= gridEnd) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={label} className={cn(
            'p-2.5 text-center text-[11px] font-semibold uppercase tracking-wider',
            i >= 5 ? 'text-muted-foreground/50' : 'text-muted-foreground',
          )}>
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayAppts = appointmentsByDate.get(key) ?? [];
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isDayToday = checkIsToday(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <div
              key={i}
              onClick={() => onSlotClick?.(day)}
              className={cn(
                'min-h-[100px] cursor-pointer border-b border-r p-1.5 transition-colors last:border-r-0',
                isWeekend && 'bg-muted/15',
                !isCurrentMonth && 'opacity-30',
                isDayToday && 'bg-primary/[0.03]',
                'hover:bg-muted/30',
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium',
                  isDayToday && 'bg-primary text-primary-foreground',
                  !isDayToday && isWeekend && 'text-muted-foreground/50',
                  !isDayToday && !isWeekend && 'text-muted-foreground',
                )}>
                  {format(day, 'd')}
                </span>
                {dayAppts.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{dayAppts.length - 3}</span>
                )}
              </div>
              <div className="space-y-0.5">
                {dayAppts.slice(0, 3).map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    variant="compact"
                    onClick={(e) => { e?.stopPropagation(); onAppointmentClick?.(apt.id); }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const WeekGrid = forwardRef<HTMLDivElement, {
  currentDate: Date;
  appointmentsByHour: Map<string, Appointment[]>;
  appointmentsByDate: Map<string, Appointment[]>;
  onSlotClick?: (date: Date) => void;
  onAppointmentClick?: (id: string) => void;
}>(({ currentDate, appointmentsByHour, onSlotClick, onAppointmentClick }, ref) => {
  const weekStart = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-muted/30">
        <div className="border-r p-2" />
        {weekDays.map((day, i) => {
          const isDayToday = checkIsToday(day);
          const isWeekend = i >= 5;
          return (
            <div key={i} className={cn('border-r p-2 text-center last:border-r-0', isWeekend && 'bg-muted/15')}>
              <p className={cn('text-[10px] font-medium uppercase tracking-wider', isWeekend ? 'text-muted-foreground/50' : 'text-muted-foreground')}>
                {format(day, 'EEE', { locale: ptBR })}
              </p>
              <p className={cn(
                'text-lg font-bold',
                isDayToday && 'text-primary',
                isWeekend && !isDayToday && 'text-muted-foreground/50',
              )}>
                {format(day, 'd')}
              </p>
            </div>
          );
        })}
      </div>

      <div ref={ref} className="relative overflow-y-auto max-h-[calc(100vh-320px)]">
        <CurrentTimeIndicator />
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {HOURS.map((hour) => (
            <div key={hour} className="contents">
              <div className="border-r border-b px-1 py-2 text-right text-[10px] font-medium text-muted-foreground">
                {String(hour).padStart(2, '0')}:00
              </div>
              {weekDays.map((day, dayIndex) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const slotKey = `${dateKey}-${hour}`;
                const slotAppts = appointmentsByHour.get(slotKey) ?? [];
                const isWeekend = dayIndex >= 5;

                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    onClick={() => {
                      const d = new Date(day);
                      d.setHours(hour, 0, 0, 0);
                      onSlotClick?.(d);
                    }}
                    className={cn(
                      'min-h-[64px] border-b border-r p-1 last:border-r-0 transition-colors cursor-pointer',
                      isWeekend && 'bg-muted/10',
                      'hover:bg-muted/25',
                    )}
                  >
                    {slotAppts.map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        variant="compact"
                        onClick={(e) => { e?.stopPropagation(); onAppointmentClick?.(apt.id); }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
WeekGrid.displayName = 'WeekGrid';

const DayGrid = forwardRef<HTMLDivElement, {
  currentDate: Date;
  appointmentsByHour: Map<string, Appointment[]>;
  onSlotClick?: (date: Date) => void;
  onAppointmentClick?: (id: string) => void;
}>(({ currentDate, appointmentsByHour, onSlotClick, onAppointmentClick }, ref) => {
  const dateKey = format(currentDate, 'yyyy-MM-dd');
  const isDayToday = checkIsToday(currentDate);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className={cn('border-b px-4 py-3', isDayToday && 'bg-primary/[0.03]')}>
        <p className="text-[13px] font-semibold capitalize">
          {format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      <div ref={ref} className="relative overflow-y-auto max-h-[calc(100vh-320px)]">
        <CurrentTimeIndicator />
        <div className="grid grid-cols-[60px_1fr]">
          {HOURS.map((hour) => {
            const slotKey = `${dateKey}-${hour}`;
            const slotAppts = appointmentsByHour.get(slotKey) ?? [];

            return (
              <div key={hour} className="contents">
                <div className="border-r border-b px-1 py-2 text-right text-[10px] font-medium text-muted-foreground">
                  {String(hour).padStart(2, '0')}:00
                </div>
                <div
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setHours(hour, 0, 0, 0);
                    onSlotClick?.(d);
                  }}
                  className="min-h-[60px] border-b p-1 transition-colors cursor-pointer hover:bg-muted/25"
                >
                  {slotAppts.map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      variant="list"
                      onClick={(e) => { e?.stopPropagation(); onAppointmentClick?.(apt.id); }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
DayGrid.displayName = 'DayGrid';
