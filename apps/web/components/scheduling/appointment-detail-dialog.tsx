'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { Calendar, Clock, User, Video, CheckCircle, XCircle, Trash2, Pencil, CalendarClock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { usePolling } from '@/hooks/use-polling';
import { useDeleteAppointment } from '@/hooks/use-appointments';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentDetail {
  id: string;
  patientId: string;
  psychologistId: string;
  startAt: string;
  endAt: string;
  status: string;
  modality?: string;
  cancelReason?: string;
  patient?: { id?: string; name?: string; email?: string; phone?: string };
  psychologist?: { name?: string };
  service?: { id?: string; name?: string; durationMinutes?: number; price?: number };
}

interface AppointmentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string | null;
  onUpdated?: () => void;
  onEdit?: (appointment: AppointmentDetail) => void;
  onReschedule?: (appointment: AppointmentDetail) => void;
}

export function AppointmentDetailDialog({ open, onOpenChange, appointmentId, onUpdated, onEdit, onReschedule }: AppointmentDetailDialogProps) {
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { mutate: deleteAppointment, loading: deleting } = useDeleteAppointment();

  const fetchAppointment = async () => {
    if (!appointmentId || !open) return;
    setLoading(true);
    try {
      const res = await apiFetch<{ data: AppointmentDetail }>(`/appointments/${appointmentId}`);
      setAppointment(res.data);
    } catch {
      toast.error('Erro ao carregar detalhes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && appointmentId) {
      fetchAppointment();
    } else {
      setAppointment(null);
    }
  }, [open, appointmentId]);

  usePolling(() => {
    if (open && appointmentId) fetchAppointment();
  }, 30000, open && !!appointmentId);

  async function handleAction(action: string, body?: Record<string, unknown>) {
    if (!appointmentId) return;
    setActionLoading(action);
    try {
      await apiFetch(`/appointments/${appointmentId}/${action}`, {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      });
      toast.success(getSuccessMessage(action));
      fetchAppointment();
      onUpdated?.();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  function getSuccessMessage(action: string) {
    const messages: Record<string, string> = {
      confirm: 'Consulta confirmada!',
      complete: 'Consulta finalizada!',
      'no-show': 'Paciente marcado como ausente!',
      cancel: 'Consulta cancelada!',
    };
    return messages[action] ?? 'Acao realizada!';
  }

  function getActions() {
    if (!appointment) return [];
    const actions: Array<{
      label: string;
      icon: React.ElementType;
      onClick: () => void;
      variant: 'default' | 'outline' | 'destructive';
      action: string;
    }> = [];

    if (appointment.status === 'pending_payment' || appointment.status === 'confirmed') {
      actions.push({
        label: 'Confirmar',
        icon: CheckCircle,
        onClick: () => handleAction('confirm'),
        variant: 'default',
        action: 'confirm',
      });
    }

    if (appointment.status === 'confirmed') {
      actions.push({
        label: 'Finalizada',
        icon: CheckCircle,
        onClick: () => handleAction('complete'),
        variant: 'default',
        action: 'complete',
      });
      actions.push({
        label: 'Ausente',
        icon: XCircle,
        onClick: () => handleAction('no-show'),
        variant: 'outline',
        action: 'no-show',
      });
    }

    if (appointment.status !== 'cancelled' && appointment.status !== 'completed') {
      if (onEdit) {
        actions.push({
          label: 'Editar',
          icon: Pencil,
          onClick: () => onEdit(appointment),
          variant: 'outline',
          action: 'edit',
        });
      }
      if (onReschedule) {
        actions.push({
          label: 'Reagendar',
          icon: CalendarClock,
          onClick: () => onReschedule(appointment),
          variant: 'outline',
          action: 'reschedule',
        });
      }
      actions.push({
        label: 'Cancelar',
        icon: Trash2,
        onClick: () => handleAction('cancel'),
        variant: 'destructive',
        action: 'cancel',
      });
    }

    return actions;
  }

  async function handleDelete() {
    if (!appointmentId) return;
    setActionLoading('delete');
    try {
      await deleteAppointment(appointmentId);
      toast.success('Agendamento removido');
      onOpenChange(false);
      onUpdated?.();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : appointment ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={appointment.status} />
              <span className="text-xs text-muted-foreground">
                {format(new Date(appointment.startAt), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{appointment.patient?.name ?? 'Paciente'}</p>
                  <p className="text-xs text-muted-foreground">{appointment.patient?.email ?? ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium capitalize">
                    {format(new Date(appointment.startAt), "EEEE", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(appointment.startAt), 'HH:mm')}
                    {' — '}
                    {format(new Date(appointment.endAt), 'HH:mm')}
                  </p>
                </div>
              </div>

              {appointment.service && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{appointment.service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.service.durationMinutes} minutos
                      {appointment.service.price && (
                        <span> · R$ {Number(appointment.service.price).toLocaleString('pt-BR')}</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {appointment.modality === 'online' && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Teleatendimento</p>
                    <p className="text-xs text-muted-foreground">Sessao online</p>
                  </div>
                </div>
              )}

              {appointment.cancelReason && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <p className="text-xs font-medium text-destructive">Motivo do cancelamento:</p>
                  <p className="text-sm text-muted-foreground">{appointment.cancelReason}</p>
                </div>
              )}
            </div>

            {getActions().length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3 border-t">
                {getActions().map((action) => {
                  const Icon = action.icon;
                  const isLoading = actionLoading === action.action;
                  return (
                    <Button
                      key={action.label}
                      variant={action.variant}
                      size="sm"
                      onClick={action.onClick}
                      disabled={actionLoading !== null}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="mr-1 h-4 w-4" />
                      )}
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            )}

            {appointment.status === 'cancelled' && (
              <div className="pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'delete' ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1 h-4 w-4" />
                  )}
                  Remover agendamento
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">Agendamento nao encontrado</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
