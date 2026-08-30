'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ClinicalRecordFormProps {
  patientId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ClinicalRecordForm({ patientId, onSuccess, onCancel }: ClinicalRecordFormProps) {
  const [type, setType] = useState<string>('evolution');
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subjective.trim()) { setError('Campo subjetivo é obrigatório'); return; }
    setSaving(true);
    setError('');
    try {
      await apiFetch('/clinical-records', {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          type,
          content: JSON.stringify({ subjective, objective, assessment, plan }),
        }),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? 'Erro ao salvar registro');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      <div>
        <Label className="text-xs">Tipo</Label>
        <div className="flex gap-2 mt-1.5">
          {['evolution', 'anamnesis', 'assessment'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
              style={{
                background: type === t ? 'var(--accent)' : 'white',
                color: type === t ? 'white' : 'var(--fg-muted)',
                borderColor: type === t ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {t === 'evolution' ? 'Evolução' : t === 'anamnesis' ? 'Anamnese' : 'Avaliação'}
            </button>
          ))}
        </div>
      </div>
      {[
        { label: 'Subjetivo (S)', value: subjective, setter: setSubjective, placeholder: 'Queixa principal, histórico...' },
        { label: 'Objetivo (O)', value: objective, setter: setObjective, placeholder: 'Exame físico, observações...' },
        { label: 'Avaliação (A)', value: assessment, setter: setAssessment, placeholder: 'Hipótese diagnóstica...' },
        { label: 'Plano (P)', value: plan, setter: setPlan, placeholder: 'Conduta, encaminhamentos...' },
      ].map((f) => (
        <div key={f.label}>
          <Label className="text-xs">{f.label}</Label>
          <Textarea
            value={f.value}
            onChange={(e) => f.setter(e.target.value)}
            placeholder={f.placeholder}
            className="mt-1 text-sm min-h-[80px]"
          />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" size="sm" disabled={saving} style={{ background: 'var(--primary)', color: 'var(--primary-fg)' }}>
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
