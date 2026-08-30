'use client';

import { useState } from 'react';
import { usePatients } from '@/hooks/use-patients';
import { useClinicalRecords, ClinicalRecord } from '@/hooks/use-clinical-records';
import { useDocuments, useDownloadDocument } from '@/hooks/use-documents';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { ClinicalRecordForm } from '@/components/clinical/clinical-record-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search, Plus, FileText, User, Calendar,
  ChevronRight, Upload, Download, Clock, Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProntuarioPage() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'documents'>('records');
  const { data: patients } = usePatients({ limit: 100, search });
  const { data: records, loading: recordsLoading } = useClinicalRecords(patientId ?? '');
  const { data: documents, loading: documentsLoading } = useDocuments(patientId ?? undefined);

  const patient = patients.find((p) => p.id === patientId);

  return (
    <div className="flex h-full animate-fade-in">
      {/* Left: Patient selector */}
      <div className="split-panel-left" style={{ width: 300 }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-sm font-bold mb-3">Paciente</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--fg-faint)' }} />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {patients.map((p) => (
              <button
                key={p.id}
                onClick={() => setPatientId(p.id)}
                className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors"
                style={{
                  background: patientId === p.id ? '#f0f9ff' : 'transparent',
                  fontWeight: patientId === p.id ? 500 : 400,
                }}
              >
                <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: 'var(--bg-subtle)' }}>
                  {p.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '??'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{p.name ?? 'Sem nome'}</p>
                </div>
                <ChevronRight className="h-3 w-3" style={{ color: 'var(--fg-faint)' }} />
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Records / Documents */}
      <div className="split-panel-right flex flex-col">
        {!patientId ? (
          <div className="empty-state h-full">
            <User className="h-12 w-12 mb-3" style={{ color: 'var(--fg-faint)' }} />
            <p className="text-sm font-medium">Selecione um paciente</p>
            <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>Escolha um paciente para ver seu prontuário.</p>
          </div>
        ) : (
          <>
            {/* Patient header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--bg-subtle)' }}>
                {patient?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '??'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold truncate">{patient?.name ?? 'Paciente'}</h2>
                <p className="text-[11px]" style={{ color: 'var(--fg-muted)' }}>{records.length} registro{records.length !== 1 ? 's' : ''} · {documents.length} documento{documents.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs gap-1" onClick={() => setActiveTab('records')} style={activeTab === 'records' ? { background: 'var(--surface-overlay)' } : {}}>
                  <FileText className="h-3.5 w-3.5" /> Registros
                </Button>
                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs gap-1" onClick={() => setActiveTab('documents')} style={activeTab === 'documents' ? { background: 'var(--surface-overlay)' } : {}}>
                  <Upload className="h-3.5 w-3.5" /> Documentos
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'records' ? (
                <RecordsTab records={records} loading={recordsLoading} onAdd={() => setShowForm(true)} />
              ) : (
                <DocumentsTab documents={documents} patientId={patientId} loading={documentsLoading} />
              )}
            </div>
          </>
        )}
      </div>

      {/* Create record dialog */}
      <Dialog open={showForm && !!patientId} onOpenChange={(open) => { if (!open) setShowForm(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Registro</DialogTitle>
          </DialogHeader>
          {patientId && (
            <ClinicalRecordForm patientId={patientId} onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecordsTab({ records, loading, onAdd }: { records: ClinicalRecord[]; loading: boolean; onAdd: () => void }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title="Nenhum registro"
        description="Adicione o primeiro registro clínico."
        action={{ label: 'Novo registro', onClick: onAdd }}
      />
    );
  }

  const typeLabels: Record<string, string> = { evolution: 'Evolução', anamnesis: 'Anamnese', assessment: 'Avaliação' };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-faint)' }}>Registros clínicos</h3>
        <Button size="sm" className="h-7 rounded-lg text-xs gap-1" style={{ background: 'var(--primary)', color: 'var(--primary-fg)' }} onClick={onAdd}>
          <Plus className="h-3 w-3" /> Novo
        </Button>
      </div>
      {records.map((r) => {
        let soap: any = {};
        try { soap = JSON.parse(r.content); } catch { soap = { subjective: r.content }; }
        return (
          <div key={r.id} className="record-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)', color: 'white' }}>
                <FileText className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{typeLabels[r.type as string] ?? r.type ?? 'Registro'}</p>
                <p className="text-[10px]" style={{ color: 'var(--fg-faint)' }}>
                  {format(new Date(r.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { key: 'subjective', label: 'Subjetivo', value: soap.subjective },
                { key: 'objective', label: 'Objetivo', value: soap.objective },
                { key: 'assessment', label: 'Avaliação', value: soap.assessment },
                { key: 'plan', label: 'Plano', value: soap.plan },
              ].filter((f) => f.value).map((f) => (
                <div key={f.key}>
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-faint)' }}>{f.label}</span>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DocumentsTab({ documents, patientId, loading }: { documents: any[]; patientId: string | null; loading: boolean }) {
  const { mutate: downloadDoc, loading: downloading } = useDownloadDocument();
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<Upload className="h-8 w-8" />}
        title="Nenhum documento"
        description="Faça upload do primeiro documento."
      />
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--fg-faint)' }}>Documentos</h3>
      {documents.map((doc) => (
        <div key={doc.id} className="record-card flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-subtle)' }}>
            <FileText className="h-4 w-4" style={{ color: 'var(--fg-muted)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{doc.name ?? doc.filename ?? 'Documento'}</p>
            <p className="text-[10px]" style={{ color: 'var(--fg-faint)' }}>
              {format(new Date(doc.createdAt), 'dd/MM/yyyy')}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => patientId && downloadDoc(patientId, doc.id)} disabled={downloading}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
