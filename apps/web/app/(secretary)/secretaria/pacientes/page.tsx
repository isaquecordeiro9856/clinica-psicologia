'use client';

import { useState } from 'react';
import { SecretaryLayout } from '@/components/layout/secretary-layout';
import { PageHeader } from '@/components/shared/page-header';
import { PatientTable } from '@/components/patients/patient-table';
import { PatientForm } from '@/components/patients/patient-form';
import { Patient } from '@/hooks/use-patients';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function SecretaryPacientesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | undefined>();
  const [version, setVersion] = useState(0);

  function startCreate() { setEditing(undefined); setOpen(true); }
  function startEdit(patient: Patient) { setEditing(patient); setOpen(true); }
  function closeAndRefresh() { setOpen(false); setVersion((value) => value + 1); }

  return (
    <SecretaryLayout>
      <div className="space-y-6">
        <PageHeader
          title="Pacientes"
          description="Consulta e dados não-clínicos dos pacientes."
          action={{ label: 'Novo paciente', onClick: startCreate }}
        />
        <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground mb-4">
          Acesso somente a dados não-clínicos. Prontuários são visíveis apenas para a psicóloga.
        </div>
        <PatientTable key={version} onChanged={() => setVersion((value) => value + 1)} />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar paciente' : 'Novo paciente'}</DialogTitle>
            </DialogHeader>
            <PatientForm
              initialData={editing ? { id: editing.id, name: editing.name, cpf: editing.cpf, email: editing.email, phone: editing.phone } : undefined}
              onSuccess={closeAndRefresh}
            />
          </DialogContent>
        </Dialog>
      </div>
    </SecretaryLayout>
  );
}
