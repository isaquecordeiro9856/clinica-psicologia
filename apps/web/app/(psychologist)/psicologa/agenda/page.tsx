'use client';

import { useState, useMemo } from 'react';
import { useAppointments } from '@/hooks/use-appointments';
import { AppointmentForm } from '@/components/scheduling/appointment-form';
import { AppointmentDetailDialog } from '@/components/scheduling/appointment-detail-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import {
  ChevronLeft, ChevronRight, Plus, Calendar, MoreVertical,
} from 'lucide-react';
import {
  format, startOfWeek, endOfWeek, eachDayOfInterval,
  addWeeks, subWeeks, addDays, subDays,
  isSameDay, isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewMode = 'day' | 'week' | 'month';
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  confirmed: { label: 'Confirmada', color: '#16a34a', bg: '#f0fdf4', border: '#16a34a' },
  pending_payment: { label: 'Pendente', color: '#d97706', bg: '#fffbeb', border: '#d97706' },
  completed: { label: 'Realizada', color: '#6366f1', bg: '#eef2ff', border: '#6366f1' },
  cancelled: { label: 'Cancelada', color: '#dc2626', bg: '#fef2f2', border: '#dc2626' },
};

function getStatusConfig(status: string) {
  return statusConfig[status] ?? { label: status, color: '#6b7280', bg: '#f9fafb', border: '#6b7280' };
}

export default function AgendaPage() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('day');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: appointments, loading: appointmentsLoading } = useAppointments({
    from: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0).toISOString(),
    to: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString(),
  });

  const dayAppointments = useMemo(() => {
    return appointments.filter((a) => isSameDay(new Date(a.startAt), date));
  }, [appointments, date]);

  const todayCount = dayAppointments.length;
  const confirmedCount = dayAppointments.filter((a) => a.status === 'confirmed').length;
  const pendingCount = dayAppointments.filter((a) => a.status === 'pending_payment').length;

  const nextApts = appointments
    .filter((a) => new Date(a.startAt) > new Date() && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 5);

  function navigateDate(dir: number) {
    if (view === 'day') setDate((d) => dir > 0 ? addDays(d, 1) : subDays(d, 1));
    else if (view === 'week') setDate((d) => dir > 0 ? addWeeks(d, 1) : subWeeks(d, 1));
    else setDate((d) => dir > 0 ? addWeeks(d, 4) : subWeeks(d, 4));
  }

  return (
    <div className="flex h-full animate-fade-in">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-9 rounded-lg text-sm font-medium" onClick={() => setDate(new Date())}>
              Hoje
            </Button>
            <div className="flex items-center gap-1">
              <button onClick={() => navigateDate(-1)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors">
                <ChevronLeft className="h-4 w-4 text-neutral-600" />
              </button>
              <button onClick={() => navigateDate(1)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors">
                <ChevronRight className="h-4 w-4 text-neutral-600" />
              </button>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-base font-semibold text-neutral-900">
                {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
              <Calendar className="h-4 w-4 text-neutral-400" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
              {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    background: view === v ? '#f0f9ff' : 'white',
                    color: view === v ? '#0ea5e9' : '#6b7280',
                    borderBottom: view === v ? '2px solid #0ea5e9' : '2px solid transparent',
                  }}
                >
                  {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
                </button>
              ))}
            </div>
            <Button className="h-9 rounded-lg gap-1.5 bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Nova consulta
            </Button>
          </div>
        </div>

        {/* Loading */}
        {appointmentsLoading ? (
          <div className="flex-1 p-6 space-y-3">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
              <span className="text-sm text-neutral-500">Carregando agenda...</span>
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl animate-pulse bg-neutral-100" />
            ))}
          </div>
        ) : view === 'day' ? (
          <DayView
            date={date}
            appointments={dayAppointments}
            onAppointmentClick={(id) => { setSelectedId(id); setShowDetail(true); }}
            onNewAppointment={() => setShowForm(true)}
          />
        ) : view === 'week' ? (
          <WeekView
            days={days}
            appointments={appointments}
            onAppointmentClick={(id) => { setSelectedId(id); setShowDetail(true); }}
          />
        ) : (
          <MonthView
            date={date}
            appointments={appointments}
            onDayClick={(d) => { setDate(d); setView('day'); }}
          />
        )}
      </div>

      {/* Right sidebar */}
      <div className="w-[280px] shrink-0 border-l overflow-y-auto" style={{ borderColor: '#e5e7eb', background: '#fafafa' }}>
        {/* Mini calendar */}
        <div className="p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
          <MiniCalendar date={date} onSelect={setDate} />
        </div>

        {/* Upcoming */}
        <div className="p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">Próximas consultas</h3>
          {nextApts.length === 0 ? (
            <p className="text-xs text-neutral-400">Nenhuma consulta agendada.</p>
          ) : (
            <div className="space-y-3">
              {nextApts.map((apt) => {
                const start = new Date(apt.startAt);
                const st = getStatusConfig(apt.status);
                return (
                  <div key={apt.id} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full shrink-0" style={{ background: st.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-900">{format(start, 'HH:mm')}</p>
                      <p className="text-xs font-semibold text-neutral-900 truncate">{apt.patient?.name ?? 'Paciente'}</p>
                      <p className="text-[11px] text-neutral-400">{apt.service?.name ?? 'Consulta'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button className="mt-3 text-xs font-medium text-violet-600 hover:text-violet-700">
            Ver agenda completa
          </button>
        </div>

        {/* Stats */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">Estatísticas do dia</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Consultas', value: todayCount, color: '#0ea5e9', bg: '#f0f9ff' },
              { label: 'Confirmadas', value: confirmedCount, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Pendentes', value: pendingCount, color: '#d97706', bg: '#fffbeb' },
            ].map((s) => (
              <div key={s.label} className="text-center rounded-xl p-3" style={{ background: s.bg }}>
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] font-medium text-neutral-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail dialog */}
      <AppointmentDetailDialog
        open={showDetail}
        onOpenChange={setShowDetail}
        appointmentId={selectedId}
      />

      {/* Create form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Consulta</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            initialDate={date}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DayView({ date, appointments, onAppointmentClick, onNewAppointment }: {
  date: Date;
  appointments: any[];
  onAppointmentClick: (id: string) => void;
  onNewAppointment: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Day header */}
      <div className="px-6 py-3 border-b" style={{ borderColor: '#e5e7eb' }}>
        <p className="text-sm font-medium text-neutral-900 capitalize">
          {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* Time slots */}
      <div className="relative">
        {HOURS.map((h) => {
          const hourAppts = appointments.filter((a) => {
            const start = new Date(a.startAt);
            return start.getHours() === h;
          });

          return (
            <div key={h} className="flex border-b" style={{ borderColor: '#f0f0f0', minHeight: 80 }}>
              {/* Time label */}
              <div className="w-20 shrink-0 py-3 pr-3 text-right">
                <span className="text-xs font-medium text-neutral-400">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 py-2 pl-4">
                {hourAppts.length > 0 ? (
                  hourAppts.map((apt) => {
                    const start = new Date(apt.startAt);
                    const end = new Date(apt.endAt);
                    const st = getStatusConfig(apt.status);
                    return (
                      <div
                        key={apt.id}
                        className="flex items-center gap-4 rounded-xl px-4 py-3 mb-2 cursor-pointer transition-all hover:shadow-md"
                        style={{
                          background: 'white',
                          borderLeft: `4px solid ${st.border}`,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        }}
                        onClick={() => onAppointmentClick(apt.id)}
                      >
                        <span className="text-xs font-medium text-neutral-500 w-24 shrink-0">
                          {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 truncate">
                            {apt.patient?.name ?? 'Paciente'}
                          </p>
                          <p className="text-xs text-neutral-400 truncate">
                            {apt.service?.name ?? 'Consulta'}
                          </p>
                        </div>
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {st.label}
                        </span>
                        <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 shrink-0">
                          <MoreVertical className="h-4 w-4 text-neutral-400" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="flex items-center justify-center gap-2 rounded-xl px-4 py-4 mb-2 border-2 border-dashed border-neutral-200 cursor-pointer hover:border-violet-300 hover:bg-violet-50 transition-colors"
                    onClick={onNewAppointment}
                  >
                    <Plus className="h-4 w-4 text-neutral-400" />
                    <span className="text-xs font-medium text-neutral-400">Agendar</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ days, appointments, onAppointmentClick }: {
  days: Date[];
  appointments: any[];
  onAppointmentClick: (id: string) => void;
}) {
  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex min-w-[900px]">
        {/* Time column */}
        <div className="w-16 shrink-0">
          {HOURS.map((h) => (
            <div key={h} className="h-16 border-b border-neutral-100 flex items-start pt-2">
              <span className="text-[10px] font-medium text-neutral-400 pl-3">
                {String(h).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const dayAppts = appointments.filter((a: any) => isSameDay(new Date(a.startAt), day));
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className="flex-1 border-l border-neutral-100">
              <div className="text-center py-2 border-b border-neutral-100 sticky top-0 bg-white z-10">
                <p className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
                  {format(day, 'EEE', { locale: ptBR })}
                </p>
                <p className={`text-sm font-bold mt-0.5 ${today ? 'inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white' : 'text-neutral-900'}`}>
                  {format(day, 'd')}
                </p>
              </div>
              <div className="relative" style={{ height: HOURS.length * 64 }}>
                {HOURS.map((h) => (
                  <div key={h} className="h-16 border-b border-neutral-100" />
                ))}
                {dayAppts.map((apt: any) => {
                  const start = new Date(apt.startAt);
                  const end = new Date(apt.endAt);
                  const startMin = start.getHours() * 60 + start.getMinutes();
                  const duration = (end.getTime() - start.getTime()) / 60000;
                  const topPx = ((startMin - HOURS[0] * 60) / 60) * 64;
                  const heightPx = Math.max((duration / 60) * 64, 24);
                  const st = getStatusConfig(apt.status);
                  return (
                    <div
                      key={apt.id}
                      className="absolute left-1 right-1 rounded-lg px-2 py-1 cursor-pointer text-[10px] font-medium truncate"
                      style={{
                        top: topPx,
                        height: heightPx,
                        background: st.bg,
                        borderLeft: `3px solid ${st.border}`,
                        color: st.color,
                      }}
                      onClick={() => onAppointmentClick(apt.id)}
                    >
                      <span className="truncate">{apt.patient?.name?.split(' ')[0] ?? '?'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({ date, appointments, onDayClick }: {
  date: Date;
  appointments: any[];
  onDayClick: (d: Date) => void;
}) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-7 gap-px rounded-xl border border-neutral-200 overflow-hidden">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider bg-neutral-50 text-neutral-400">
            {d}
          </div>
        ))}
        {allDays.map((day) => {
          const dayAppts = appointments.filter((a: any) => isSameDay(new Date(a.startAt), day));
          const inMonth = day.getMonth() === date.getMonth();
          const today = isToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className="h-24 p-2 text-left border-t border-neutral-100 transition-colors hover:bg-neutral-50"
              style={{ opacity: inMonth ? 1 : 0.3 }}
            >
              <span className={`text-xs font-medium ${today ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white' : 'text-neutral-900'}`}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayAppts.slice(0, 3).map((a: any) => {
                  const st = getStatusConfig(a.status);
                  return (
                    <div key={a.id} className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: st.color }} />
                      <span className="text-[9px] truncate text-neutral-500">{a.patient?.name?.split(' ')[0]}</span>
                    </div>
                  );
                })}
                {dayAppts.length > 3 && <p className="text-[8px] text-neutral-400">+{dayAppts.length - 3}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniCalendar({ date, onSelect }: { date: Date; onSelect: (d: Date) => void }) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(calendarStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => onSelect(new Date(date.getFullYear(), date.getMonth() - 1, 1))} className="h-6 w-6 flex items-center justify-center rounded hover:bg-neutral-100">
          <ChevronLeft className="h-3.5 w-3.5 text-neutral-500" />
        </button>
        <p className="text-sm font-semibold text-neutral-900 capitalize">
          {format(date, "MMMM yyyy", { locale: ptBR })}
        </p>
        <button onClick={() => onSelect(new Date(date.getFullYear(), date.getMonth() + 1, 1))} className="h-6 w-6 flex items-center justify-center rounded hover:bg-neutral-100">
          <ChevronRight className="h-3.5 w-3.5 text-neutral-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d} className="text-center text-[9px] font-medium py-1 text-neutral-400">{d}</div>
        ))}
        {days.map((d) => {
          const inMonth = d.getMonth() === date.getMonth();
          const today = isToday(d);
          const selected = isSameDay(d, date);
          return (
            <button
              key={d.toISOString()}
              onClick={() => onSelect(d)}
              className="h-8 w-full text-[11px] font-medium rounded-lg transition-colors"
              style={{
                color: selected ? 'white' : inMonth ? '#111827' : '#d1d5db',
                background: selected ? '#7c3aed' : today ? '#f3f4f6' : 'transparent',
                fontWeight: selected || today ? 600 : 400,
              }}
            >
              {format(d, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
