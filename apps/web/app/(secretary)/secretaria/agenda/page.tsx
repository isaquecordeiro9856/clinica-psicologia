'use client';

import { SecretaryLayout } from '@/components/layout/secretary-layout';
import { PageHeader } from '@/components/shared/page-header';
import { AgendaProvider, useAgenda } from '@/components/scheduling/agenda-context';
import { CalendarHeader } from '@/components/scheduling/calendar-header';
import { DayView } from '@/components/scheduling/day-view';
import { WeekView } from '@/components/scheduling/week-view';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppointmentForm } from '@/components/scheduling/appointment-form';
import { useState } from 'react';

function SecretaryAgendaContent() {
  const { viewMode, refresh } = useAgenda();
  const [showForm, setShowForm] = useState(false);

  return (
    <SecretaryLayout>
      <div className="space-y-4">
        <PageHeader
          title="Agenda"
          description="Gerencie agendamentos e disponibilidade da psicologa."
        />

        <CalendarHeader onNewAppointment={() => setShowForm(true)} />

        {viewMode === 'week' && <WeekView />}
        {viewMode === 'day' && <DayView />}
        {viewMode === 'month' && <WeekView />}
        {viewMode === 'list' && <DayView />}

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo agendamento</DialogTitle>
            </DialogHeader>
            <AppointmentForm
              mode="create"
              onSuccess={() => { setShowForm(false); refresh(); }}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </SecretaryLayout>
  );
}

export default function SecretaryAgendaPage() {
  return (
    <AgendaProvider>
      <SecretaryAgendaContent />
    </AgendaProvider>
  );
}
