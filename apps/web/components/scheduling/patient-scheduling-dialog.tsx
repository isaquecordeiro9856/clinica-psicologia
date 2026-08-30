'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User, Stethoscope, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePatientAvailability, useCreatePatientAppointment, AvailableSlot } from '@/hooks/use-patient-scheduling';

interface PatientSchedulingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PatientSchedulingDialog({ open, onOpenChange, onSuccess }: PatientSchedulingDialogProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const { mutate: createAppointment, loading } = useCreatePatientAppointment();

  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 1 });
  const from = weekStart.toISOString().split('T')[0];
  const to = weekEnd.toISOString().split('T')[0];

  const { data: slots, loading: slotsLoading } = usePatientAvailability(undefined, from, to);

  const availableDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const slotsForDate = (date: Date) => {
    return slots.filter((slot) => isSameDay(parseISO(slot.startAt), date));
  };

  async function handleSubmit() {
    if (!selectedSlot) {
      toast.error('Selecione um horário');
      return;
    }

    try {
      await createAppointment({
        psychologistId: selectedSlot.psychologistId,
        serviceId: selectedSlot.serviceId,
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
      });
      toast.success('Consulta agendada com sucesso!');
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error handled by hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Nova Consulta</DialogTitle>
          <DialogDescription>
            Escolha a data, horário e profissional para sua consulta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w - 1)} disabled={weekOffset <= 0}>
              <Calendar className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="font-medium">
                {format(weekStart, 'd MMM', { locale: ptBR })} - {format(weekEnd, 'd MMM yyyy', { locale: ptBR })}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w + 1)}>
              <Calendar className="h-4 w-4" />
            </Button>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-7 gap-2">
            {availableDates.map((date) => {
              const isToday = isSameDay(date, today);
              const isSelected = isSameDay(date, selectedDate);
              const isPast = isBefore(date, today);
              const hasSlots = slotsForDate(date).length > 0;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !isPast && hasSlots && setSelectedDate(date)}
                  disabled={isPast || !hasSlots || slotsLoading}
                  className={`h-20 flex flex-col items-center justify-center gap-1 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : isPast || !hasSlots
                      ? 'border-muted text-muted-foreground/50 opacity-50'
                      : 'border-muted hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                    {format(date, 'EEE', { locale: ptBR })}
                  </span>
                  <span className={`text-2xl font-bold ${isToday ? 'text-primary' : ''}`}>
                    {format(date, 'd', { locale: ptBR })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {slotsForDate(date).length} horários
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Horários disponíveis para {format(selectedDate, 'd MMMM yyyy', { locale: ptBR })}
                </h3>
              </div>
              {slotsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : slotsForDate(selectedDate).length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum horário disponível para esta data</p>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {slotsForDate(selectedDate).map((slot) => (
                    <button
                      key={slot.startAt}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-lg border transition-all text-left ${
                        selectedSlot?.startAt === slot.startAt
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:border-primary/50 hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{slot.psychologistName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(parseISO(slot.startAt), 'HH:mm', { locale: ptBR })} -{' '}
                          {format(parseISO(slot.endAt), 'HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <User className="h-3 w-3" />
                        <span>{slot.serviceName} ({slot.durationMinutes}min)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        R$ {slot.price.toFixed(2).replace('.', ',')}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Confirmation */}
          {selectedSlot && (
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <CardTitle className="text-success">Horário Selecionado</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Profissional</Label>
                    <p>{selectedSlot.psychologistName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Data</Label>
                    <p>{format(parseISO(selectedSlot.startAt), 'd MMMM yyyy', { locale: ptBR })}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Horário</Label>
                    <p>
                      {format(parseISO(selectedSlot.startAt), 'HH:mm', { locale: ptBR })} -{' '}
                      {format(parseISO(selectedSlot.endAt), 'HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Serviço</Label>
                    <p>{selectedSlot.serviceName} ({selectedSlot.durationMinutes}min)</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Valor</Label>
                    <p className="font-semibold text-primary">R$ {selectedSlot.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                    <X className="h-4 w-4 mr-2" />
                    Alterar
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Confirmar Agendamento'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedSlot && !slotsLoading && (
            <p className="text-center text-sm text-muted-foreground">
              Selecione uma data e um horário para continuar
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}