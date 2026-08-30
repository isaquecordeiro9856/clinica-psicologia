'use client';

import { useState } from 'react';
import { useFinancialSummary, useBillings, useCreateBilling } from '@/hooks/use-billing';
import { usePatients } from '@/hooks/use-patients';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  DollarSign, Clock, AlertTriangle, CheckCircle2, Calendar, CreditCard, Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

export default function FinanceiroPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const { data: summary, loading: summaryLoading } = useFinancialSummary();
  const { data: billings, loading: billingsLoading, refetch } = useBillings({ limit: 100 });

  const filtered = filter === 'all' ? billings : billings.filter((b) => b.status === filter);

  const metrics = [
    { label: 'Receita total', value: `R$ ${(summary?.totalRevenue ?? 0).toLocaleString('pt-BR')}`, icon: DollarSign, color: 'var(--teal)' },
    { label: 'Pendente', value: `R$ ${(summary?.pendingAmount ?? 0).toLocaleString('pt-BR')}`, icon: Clock, color: 'var(--amber)' },
    { label: 'Recebidos', value: `${summary?.paidCount ?? 0}`, icon: CheckCircle2, color: 'var(--emerald)' },
    { label: 'Atrasado', value: `R$ ${(summary?.overdueAmount ?? 0).toLocaleString('pt-BR')}`, icon: AlertTriangle, color: 'var(--rose)' },
  ];

  return (
    <div className="animate-fade-in p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Acompanhe receitas e cobranças.</p>
        </div>
        <Button size="sm" className="h-9 rounded-lg gap-1.5" onClick={() => setShowCreate(true)}>
          <CreditCard className="h-4 w-4" /> Nova cobrança
        </Button>
      </div>

      {/* Metrics */}
      {summaryLoading ? (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {metrics.map((m) => (
            <div key={m.label} className="record-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${m.color}15` }}>
                  <m.icon className="h-5 w-5" style={{ color: m.color }} />
                </div>
                <div>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--fg-muted)' }}>{m.label}</p>
                  <p className="text-xl font-bold">{m.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        {([
          { key: 'all', label: 'Todos' },
          { key: 'pending', label: 'Pendentes' },
          { key: 'paid', label: 'Pagos' },
          { key: 'overdue', label: 'Atrasados' },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
            style={{
              background: filter === f.key ? 'var(--accent)' : 'white',
              color: filter === f.key ? 'white' : 'var(--fg-muted)',
              borderColor: filter === f.key ? 'var(--accent)' : 'var(--border)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Billing list */}
      {billingsLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<DollarSign className="h-8 w-8" />} title="Nenhuma cobrança" description="Nenhum registro financeiro encontrado." />
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => (
            <div key={b.id} className="record-card flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--bg-subtle)' }}>
                <DollarSign className="h-5 w-5" style={{ color: 'var(--fg-muted)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">R$ {Number(b.amount).toLocaleString('pt-BR')}</p>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {b.patient?.name && (
                    <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--fg-muted)' }}>
                      {b.patient.name}
                    </span>
                  )}
                  {b.dueDate && (
                    <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--fg-faint)' }}>
                      <Calendar className="h-3 w-3" /> {format(new Date(b.dueDate), 'dd/MM/yyyy')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create billing dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Cobrança</DialogTitle>
          </DialogHeader>
          <CreateBillingForm
            onSuccess={() => { setShowCreate(false); refetch(); }}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateBillingForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [patientId, setPatientId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const { mutate: createBilling } = useCreateBilling();
  const { data: patients } = usePatients({ limit: 200 });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) { toast.error('Selecione um paciente'); return; }
    if (!amount || Number(amount) <= 0) { toast.error('Informe um valor'); return; }
    setSaving(true);
    try {
      await createBilling({
        patientId,
        amount: Number(amount),
        dueDate: dueDate || undefined,
        description: description || undefined,
      });
      toast.success('Cobrança criada!');
      onSuccess();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-xs">Paciente *</Label>
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="mt-1 flex h-9 w-full rounded-md border border-neutral-300 bg-white px-3 py-1 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
        >
          <option value="">Selecione...</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.name ?? 'Sem nome'}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Valor (R$) *</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="mt-1"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <Label className="text-xs">Vencimento</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Descrição</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Sessão de terapia"
          className="mt-1"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
          Criar cobrança
        </Button>
      </div>
    </form>
  );
}
