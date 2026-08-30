'use client';

import { useState } from 'react';
import { usePatients, Patient } from '@/hooks/use-patients';
import { useAppointments } from '@/hooks/use-appointments';
import { useClinicalRecords } from '@/hooks/use-clinical-records';
import { useDocuments } from '@/hooks/use-documents';
import { useBillings } from '@/hooks/use-billing';
import { StatusDot, StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { PatientForm } from '@/components/patients/patient-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Plus, X, Phone, Mail, Calendar, FileText,
  DollarSign, Clock, ChevronRight, User, Eye, Pencil,
  MoreHorizontal, Loader2,
} from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PacientesPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Patient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [detailTab, setDetailTab] = useState('info');
  const { data: patients, loading, refetch } = usePatients({ limit: 100, search });

  function handleEdit(p: Patient) {
    setEditingPatient(p);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingPatient(null);
    refetch();
  }

  return (
    <div className="flex h-full animate-fade-in">
      {/* Left: Patient list */}
      <div className="split-panel-left" style={{ width: selected ? 420 : '100%', maxWidth: selected ? 420 : undefined }}>
        {/* Header */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold">Pacientes</h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
                {patients.length} cadastrado{patients.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button size="sm" className="h-8 rounded-lg gap-1.5" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }} onClick={() => { setEditingPatient(null); setShowForm(true); }}>
              <Plus className="h-3.5 w-3.5" /> Novo
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--fg-faint)' }} />
            <Input
              placeholder="Buscar paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Patient cards list */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[72px] rounded-xl animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
              ))}
            </div>
          ) : patients.length === 0 ? (
            <EmptyState
              icon={<User className="h-8 w-8" />}
              title="Nenhum paciente"
              description="Cadastre o primeiro paciente."
              action={{ label: 'Cadastrar', onClick: () => { setEditingPatient(null); setShowForm(true); } }}
            />
          ) : (
            <div className="p-2 space-y-1">
              {patients.map((p) => {
                const isSelected = selected?.id === p.id;
                const initials = p.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '??';
                return (
                  <div
                    key={p.id}
                    className="group flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all"
                    style={isSelected ? {
                      background: '#f0f9ff',
                      borderLeft: '3px solid var(--accent)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    } : {
                      background: 'transparent',
                      borderLeft: '3px solid transparent',
                    }}
                    onClick={() => { setSelected(p); setDetailTab('info'); }}
                  >
                    {/* Avatar */}
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center text-xs font-bold shrink-0" style={{ background: isSelected ? 'var(--accent)' : 'var(--bg-subtle)', color: isSelected ? 'white' : 'var(--fg)' }}>
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--fg)' }}>{p.name ?? 'Sem nome'}</p>
                        <StatusDot status={p.status ?? 'active'} />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.phone && (
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--fg-muted)' }}>
                            <Phone className="h-3 w-3" /> {p.phone}
                          </span>
                        )}
                        {p.email && (
                          <span className="flex items-center gap-1 text-[11px] truncate" style={{ color: 'var(--fg-muted)' }}>
                            <Mail className="h-3 w-3" /> <span className="truncate">{p.email}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions — always visible */}
                    <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={(e) => { e.stopPropagation(); setSelected(p); setDetailTab('info'); }}
                        title="Visualizar"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right: Detail */}
      <div className="split-panel-right">
        {!selected ? (
          <div className="empty-state h-full">
            <User className="h-12 w-12 mb-3" style={{ color: 'var(--fg-faint)' }} />
            <p className="text-sm font-medium">Selecione um paciente</p>
            <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>Escolha um paciente na lista para ver seus dados.</p>
          </div>
        ) : (
          <PatientProfile
            patient={selected}
            onClose={() => setSelected(null)}
            detailTab={detailTab}
            onTabChange={setDetailTab}
            onEdit={() => handleEdit(selected)}
          />
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) handleFormClose(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPatient ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
          </DialogHeader>
          <PatientForm
            initialData={editingPatient ? { id: editingPatient.id, name: editingPatient.name, cpf: editingPatient.cpf, email: editingPatient.email, phone: editingPatient.phone, dateOfBirth: editingPatient.dateOfBirth } : undefined}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PatientProfile({ patient, onClose, detailTab, onTabChange, onEdit }: {
  patient: Patient;
  onClose: () => void;
  detailTab: string;
  onTabChange: (tab: string) => void;
  onEdit: () => void;
}) {
  const { data: appointments, loading: appointmentsLoading } = useAppointments({ patientId: patient.id, limit: 20 });
  const { data: records, loading: recordsLoading } = useClinicalRecords(patient.id);
  const { data: documents, loading: documentsLoading } = useDocuments(patient.id);
  const { data: billings, loading: billingsLoading } = useBillings({ patientId: patient.id, limit: 20 });

  const initials = patient.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '??';
  const age = patient.dateOfBirth
    ? differenceInYears(new Date(), new Date(patient.dateOfBirth))
    : null;

  const lastApt = appointments.length > 0 ? appointments[0] : null;

  return (
    <div className="animate-fade-in flex flex-col h-full">
      {/* Header with actions */}
      <div className="flex items-center gap-4 p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'var(--violet)', color: 'white' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{patient.name ?? 'Sem nome'}</h2>
            <StatusBadge status={patient.status ?? 'active'} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            {patient.phone && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--fg-muted)' }}>
                <Phone className="h-3 w-3" /> {patient.phone}
              </span>
            )}
            {patient.email && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--fg-muted)' }}>
                <Mail className="h-3 w-3" /> {patient.email}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1.5" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" /> Editar
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex items-center gap-4 px-6 py-3 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
        {[
          { label: 'Consultas', value: appointments.length, color: 'var(--indigo)' },
          { label: 'Registros', value: records.length, color: 'var(--teal)' },
          { label: 'Documentos', value: documents.length, color: 'var(--violet)' },
          { label: 'Idade', value: age ? `${age} anos` : '---', color: 'var(--fg)' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="text-[11px] font-medium" style={{ color: 'var(--fg-faint)' }}>{s.label}</span>
            <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={detailTab} onValueChange={onTabChange} className="p-6">
          <TabsList className="rounded-xl">
            <TabsTrigger value="info" className="rounded-lg text-xs">Dados</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-lg text-xs">Linha do tempo</TabsTrigger>
            <TabsTrigger value="records" className="rounded-lg text-xs">Registros</TabsTrigger>
            <TabsTrigger value="billing" className="rounded-lg text-xs">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6">
            <div className="record-card">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--fg-faint)' }}>Informações</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'CPF', value: patient.cpf ?? '---' },
                  { label: 'Data de nascimento', value: patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd/MM/yyyy') : '---' },
                  { label: 'Telefone', value: patient.phone ?? '---' },
                  { label: 'E-mail', value: patient.email ?? '---' },
                  { label: 'Status', value: patient.status ?? 'active' },
                  { label: 'Cadastro', value: format(new Date(patient.createdAt), 'dd/MM/yyyy') },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--fg-faint)' }}>{item.label}</p>
                    <p className="text-sm font-medium mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <TimelineList appointments={appointments} records={records} billings={billings} loading={appointmentsLoading || recordsLoading || billingsLoading} />
          </TabsContent>

          <TabsContent value="records" className="mt-6">
            <RecordsList records={records} loading={recordsLoading} />
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <BillingList billings={billings} loading={billingsLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TimelineList({ appointments, records, billings, loading }: { appointments: any[]; records: any[]; billings: any[]; loading: boolean }) {
  const events = [
    ...appointments.map((a) => ({
      id: `apt-${a.id}`,
      date: new Date(a.startAt),
      title: `Consulta — ${a.service?.name ?? 'Sessão'}`,
      type: 'appointment' as const,
      status: a.status,
    })),
    ...records.map((r) => ({
      id: `rec-${r.id}`,
      date: new Date(r.createdAt),
      title: `Registro — ${r.type === 'evolution' ? 'Evolução' : r.type === 'anamnesis' ? 'Anamnese' : 'Avaliação'}`,
      type: 'record' as const,
      status: 'completed',
    })),
    ...billings.map((b) => ({
      id: `bill-${b.id}`,
      date: new Date(b.createdAt),
      title: `Cobrança — R$ ${Number(b.amount).toLocaleString('pt-BR')}`,
      type: 'billing' as const,
      status: b.status,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <EmptyState icon={<Clock className="h-8 w-8" />} title="Nenhum evento" description="Ainda não há atividades registradas." />;
  }

  const typeColors: Record<string, string> = {
    appointment: 'var(--indigo)',
    record: 'var(--teal)',
    billing: 'var(--amber)',
  };

  return (
    <div className="relative">
      <div className="absolute left-[5px] top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />
      <div className="space-y-4">
        {events.map((e) => (
          <div key={e.id} className="flex gap-4">
            <div className="relative z-10 mt-1">
              <div className="h-[11px] w-[11px] rounded-full border-2" style={{ borderColor: 'var(--surface)', background: typeColors[e.type] }} />
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{e.title}</p>
                <StatusDot status={e.status} />
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-faint)' }}>
                {format(e.date, "dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecordsList({ records, loading }: { records: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return <EmptyState icon={<FileText className="h-8 w-8" />} title="Nenhum registro" description="Nenhum prontuário encontrado." />;
  }

  const typeLabels: Record<string, string> = { evolution: 'Evolução', anamnesis: 'Anamnese', assessment: 'Avaliação' };

  return (
    <div className="space-y-3">
      {records.map((r) => {
        let soap: any = {};
        try { soap = JSON.parse(r.content); } catch { soap = { subjective: r.content }; }
        return (
          <div key={r.id} className="record-card">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" style={{ color: 'var(--teal)' }} />
              <p className="text-sm font-semibold">{typeLabels[r.type as string] ?? r.type ?? 'Registro'}</p>
              <span className="text-[10px] ml-auto" style={{ color: 'var(--fg-faint)' }}>
                {format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
            <div className="space-y-1">
              {soap.subjective && <p className="text-xs" style={{ color: 'var(--fg-muted)' }}><strong>S:</strong> {soap.subjective.slice(0, 200)}{soap.subjective.length > 200 ? '...' : ''}</p>}
              {soap.objective && <p className="text-xs" style={{ color: 'var(--fg-muted)' }}><strong>O:</strong> {soap.objective.slice(0, 200)}{soap.objective.length > 200 ? '...' : ''}</p>}
              {soap.assessment && <p className="text-xs" style={{ color: 'var(--fg-muted)' }}><strong>A:</strong> {soap.assessment.slice(0, 200)}{soap.assessment.length > 200 ? '...' : ''}</p>}
              {soap.plan && <p className="text-xs" style={{ color: 'var(--fg-muted)' }}><strong>P:</strong> {soap.plan.slice(0, 200)}{soap.plan.length > 200 ? '...' : ''}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BillingList({ billings, loading }: { billings: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
        ))}
      </div>
    );
  }

  if (billings.length === 0) {
    return <EmptyState icon={<DollarSign className="h-8 w-8" />} title="Nenhuma cobrança" description="Nenhum registro financeiro encontrado." />;
  }

  return (
    <div className="space-y-2">
      {billings.map((b) => (
        <div key={b.id} className="record-card flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">R$ {Number(b.amount).toLocaleString('pt-BR')}</p>
            <p className="text-[11px]" style={{ color: 'var(--fg-faint)' }}>
              {b.dueDate ? `Vencimento: ${format(new Date(b.dueDate), 'dd/MM/yyyy')}` : 'Sem data'}
            </p>
          </div>
          <StatusBadge status={b.status} />
        </div>
      ))}
    </div>
  );
}
