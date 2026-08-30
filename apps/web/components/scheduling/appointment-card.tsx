'use client';

import { StatusBadge } from '@/components/shared/status-badge';
import { Clock, Video, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Appointment } from '@/hooks/use-appointments';

const statusStyles: Record<string, { border: string; bg: string; hover: string }> = {
  confirmed:      { border: 'border-l-emerald-500', bg: 'bg-emerald-50/80 dark:bg-emerald-950/20', hover: 'hover:bg-emerald-100/80 dark:hover:bg-emerald-950/30' },
  pending_payment: { border: 'border-l-amber-500',   bg: 'bg-amber-50/80 dark:bg-amber-950/20',   hover: 'hover:bg-amber-100/80 dark:hover:bg-amber-950/30' },
  completed:      { border: 'border-l-primary',     bg: 'bg-primary/5',                            hover: 'hover:bg-primary/10' },
  cancelled:      { border: 'border-l-destructive/20', bg: 'bg-destructive/5 opacity-40',           hover: '' },
  no_show:        { border: 'border-l-destructive/20', bg: 'bg-destructive/5 opacity-40',           hover: '' },
};

interface AppointmentCardProps {
  appointment: Appointment;
  variant?: 'grid' | 'list' | 'compact';
  onClick?: (e?: React.MouseEvent) => void;
  className?: string;
}

export function AppointmentCard({ appointment, variant = 'grid', onClick, className }: AppointmentCardProps) {
  const startTime = format(new Date(appointment.startAt), 'HH:mm');
  const endTime = format(new Date(appointment.endAt), 'HH:mm');
  const patientName = appointment.patient?.name ?? 'Paciente';
  const serviceName = appointment.service?.name;
  const durationMin = appointment.service?.durationMinutes;
  const style = statusStyles[appointment.status] ?? { border: 'border-l-muted', bg: 'bg-muted/5', hover: '' };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full rounded border-l-2 px-1.5 py-1 text-left transition-colors cursor-pointer overflow-hidden',
          style.border, style.bg, style.hover,
          className,
        )}
      >
        <p className="text-[11px] font-semibold leading-tight truncate">{patientName}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">{startTime}</p>
      </button>
    );
  }

  if (variant === 'list') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-left transition-colors cursor-pointer',
          style.border, style.bg, style.hover,
          className,
        )}
      >
        <div className="w-14 shrink-0 text-center">
          <p className="text-[13px] font-bold tabular-nums">{startTime}</p>
          <p className="text-[10px] text-muted-foreground">{endTime}</p>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate">{patientName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {serviceName && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                {serviceName}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
              <Clock className="h-3 w-3" />
              {durationMin ?? 50}min
            </span>
            {appointment.modality === 'online' && (
              <span className="flex items-center gap-1 text-[11px] text-primary shrink-0">
                <Video className="h-3 w-3" />
                Online
              </span>
            )}
          </div>
        </div>

        <StatusBadge status={appointment.status} className="shrink-0" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full flex-col gap-px rounded border-l-2 px-1.5 py-1 text-left transition-colors cursor-pointer overflow-hidden',
        style.border, style.bg, style.hover,
        className,
      )}
    >
      <p className="text-[10px] font-semibold truncate leading-tight">{patientName}</p>
      <p className="text-[9px] text-muted-foreground leading-tight">
        {startTime} · {serviceName ?? `${durationMin ?? 50}min`}
      </p>
    </button>
  );
}
