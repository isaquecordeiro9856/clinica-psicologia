'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PatientFormProps {
  initialData?: { id?: string; name?: string; email?: string; phone?: string; cpf?: string; dateOfBirth?: string };
  onSuccess: () => void;
  onCancel?: () => void;
}

export function PatientForm({ initialData, onSuccess, onCancel }: PatientFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');
  const [phone, setPhone] = useState(initialData?.phone ?? '');
  const [cpf, setCpf] = useState(initialData?.cpf ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Nome é obrigatório'); return; }
    setSaving(true);
    setError('');
    try {
      if (initialData?.id) {
        await apiFetch(`/patients/${initialData.id}`, { method: 'PATCH', body: JSON.stringify({ name: name.trim(), email, phone, cpf, dateOfBirth }) });
      } else {
        await apiFetch('/patients', { method: 'POST', body: JSON.stringify({ name: name.trim(), email, phone, cpf, dateOfBirth }) });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? 'Erro ao salvar paciente');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      <div>
        <Label className="text-xs">Nome *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-9 text-sm" placeholder="Nome completo" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">E-mail</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-9 text-sm" type="email" />
        </div>
        <div>
          <Label className="text-xs">Telefone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 h-9 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">CPF</Label>
          <Input value={cpf} onChange={(e) => setCpf(e.target.value)} className="mt-1 h-9 text-sm" />
        </div>
        <div>
          <Label className="text-xs">Data de nascimento</Label>
          <Input value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-1 h-9 text-sm" type="date" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" size="sm" disabled={saving} style={{ background: 'var(--primary)', color: 'var(--primary-fg)' }}>
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
