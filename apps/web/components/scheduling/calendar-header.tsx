'use client';

import { useAgenda } from './agenda-context';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from 'lucide-react';

const viewLabels: Record<string, string> = {
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  list: 'Lista',
};

export function CalendarHeader({ onNewAppointment }: { onNewAppointment?: () => void }) {
  const { viewMode, setViewMode, navigate, goToToday, formatDisplayDate } = useAgenda();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-0.5">
        {(Object.keys(viewLabels) as Array<keyof typeof viewLabels>).map((key) => (
          <button
            key={key}
            onClick={() => setViewMode(key as 'month' | 'week' | 'day' | 'list')}
            className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-all ${
              viewMode === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {viewLabels[key]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={goToToday} className="gap-1.5 h-8 text-[13px]">
            <CalendarDays className="h-3.5 w-3.5" />
            Hoje
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <span className="hidden sm:block min-w-[220px] text-center text-[13px] font-medium capitalize">
          {formatDisplayDate()}
        </span>

        {onNewAppointment && (
          <Button size="sm" onClick={onNewAppointment} className="gap-1.5 h-8 text-[13px] px-3">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Novo agendamento</span>
          </Button>
        )}
      </div>
    </div>
  );
}
