'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { usePatients } from '@/hooks/use-patients';
import { useCreateAppointment, useUpdateAppointment } from '@/hooks/use-appointments';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeSlotPicker } from './time-slot-picker';
import { ConflictAlert } from './conflict-alert';
import { toast } from 'sonner';
import { format, addMinutes, parseISO, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  durationMinutes?: number;
}

interface AppointmentFormProps {
  mode?: 'create' | 'edit' | 'reschedule';
  initialDate?: Date;
  initialData?: {
    id: string;
    patientId: string;
    serviceId?: string;
    startAt: string;
    endAt: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

function generateTimeSlots(date: Date, durationMinutes: number): Array<{ time: string; available: boolean }> {
  const slots: Array<{ time: string; available: boolean }> = [];
  for (let h = 7; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      const slotEnd = h * 60 + m + durationMinutes;
      if (slotEnd > 19 * 60) continue;
      slots.push({
        time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        available: true,
      });
    }
  }
  return slots;
}

export function AppointmentForm({ mode = 'create', initialDate, initialData, onSuccess, onCancel }: AppointmentFormProps) {
  const { data: patients, loading: patientsLoading } = usePatients({ limit: 100 });
  const { mutate: createAppointment, loading: creating } = useCreateAppointment();
  const { mutate: updateAppointment, loading: updating } = useUpdateAppointment();

  const [services, setServices] = useState<Service[]>([]);
  const [patientId, setPatientId] = useState(initialData?.patientId ?? '');
  const [serviceId, setServiceId] = useState(initialData?.serviceId ?? '');
  const [date, setDate] = useState(
    initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [startTime, setStartTime] = useState(
    initialDate ? format(initialDate, 'HH:mm') : '09:00'
  );
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);

  const loading = creating || updating;

  const selectedService = services.find((s) => s.id === serviceId);
  const durationMin = selectedService?.durationMinutes ?? 50;

  const endTime = (() => {
    const [h, m] = startTime.split(':').map(Number);
    const total = h * 60 + m + durationMin;
    const endH = Math.floor(total / 60) % 24;
    const endM = total % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  })();

  const timeSlots = generateTimeSlots(new Date(date), durationMin);

  useEffect(() => {
    apiFetch<{ data: Service[] }>('/appointments/services')
      .then((res) => {
        setServices(res.data);
        if (!serviceId && res.data.length > 0) {
          setServiceId(res.data[0].id);
        }
      })
      .catch(() => toast.error('Erro ao carregar servicos'));
  }, []);

  useEffect(() => {
    if (initialDate) {
      setDate(format(initialDate, 'yyyy-MM-dd'));
      setStartTime(format(initialDate, 'HH:mm'));
    }
  }, [initialDate]);

  useEffect(() => {
    if (initialData) {
      setPatientId(initialData.patientId);
      if (initialData.serviceId) setServiceId(initialData.serviceId);
      if (initialData.startAt) {
        const d = parseISO(initialData.startAt);
        setDate(format(d, 'yyyy-MM-dd'));
        setStartTime(format(d, 'HH:mm'));
      }
    }
  }, [initialData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictMsg(null);

    if (!patientId) { toast.error('Selecione um paciente'); return; }
    if (!serviceId) { toast.error('Selecione um servico'); return; }

    const startAt = new Date(`${date}T${startTime}:00`);
    const endAt = addMinutes(startAt, durationMin);

    try {
      if (mode === 'edit' && initialData?.id) {
        await updateAppointment({ id: initialData.id, data: { patientId, serviceId, startAt: startAt.toISOString(), endAt: endAt.toISOString() } });
        toast.success('Agendamento atualizado!');
      } else {
        await createAppointment({ patientId, serviceId, startAt: startAt.toISOString(), endAt: endAt.toISOString() });
        toast.success(mode === 'reschedule' ? 'Consulta reagendada!' : 'Agendamento criado!');
      }
      onSuccess?.();
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.toLowerCase().includes('conflit') || msg.toLowerCase().includes('overlap')) {
        setConflictMsg(msg);
      } else {
        toast.error(msg);
      }
    }
  }, [patientId, serviceId, date, startTime, durationMin, mode, initialData, createAppointment, updateAppointment, onSuccess]);

  const displayDate = format(new Date(date + 'T12:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Paciente *</Label>
          <Select value={patientId} onValueChange={setPatientId} disabled={patientsLoading || mode === 'reschedule'}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name ?? 'Sem nome'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Servico *</Label>
          <Select value={serviceId} onValueChange={setServiceId} disabled={mode === 'reschedule'}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um servico" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} {s.durationMinutes ? `(${s.durationMinutes}min)` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Data</Label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900"
          />
          <span className="text-sm text-muted-foreground capitalize">{displayDate}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Horario de inicio — {durationMin}min</Label>
        <TimeSlotPicker
          slots={timeSlots}
          selected={startTime}
          onSelect={setStartTime}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Fim: <span className="font-medium text-foreground">{endTime}</span>
        </p>
      </div>

      {conflictMsg && <ConflictAlert message={conflictMsg} />}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'edit' ? 'Salvar alteracoes' : mode === 'reschedule' ? 'Reagendar' : 'Agendar'}
        </Button>
      </div>
    </form>
  );
}
