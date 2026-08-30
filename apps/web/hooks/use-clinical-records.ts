'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { usePolling } from '@/hooks/use-polling';

export interface ClinicalRecord {
  id: string;
  patientId: string;
  psychologistId: string;
  appointmentId?: string;
  content: string;
  type?: string;
  createdAt: string;
  updatedAt?: string;
  patient?: { name?: string };
  psychologist?: { name?: string };
}

export function useClinicalRecords(patientId?: string, type?: string, pollInterval?: number) {
  const [data, setData] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!patientId) {
        setData([]);
        setLoading(false);
        return;
      }
      const query = type ? `?type=${type}` : '';
      const res = await apiFetch<{ data: ClinicalRecord[] }>(`/patients/${patientId}/clinical-records${query}`);
      setData(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [patientId, type]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  usePolling(fetchRecords, pollInterval ?? 0, !!patientId && (!loading || data.length > 0));

  return { data, loading, error, refetch: fetchRecords };
}

export function useClinicalRecord(id?: string) {
  const [data, setData] = useState<ClinicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecord = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: ClinicalRecord }>(`/clinical-records/${id}`);
      setData(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);
  return { data, loading, error, refetch: fetchRecord };
}

export function useCreateClinicalRecord() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: {
    patientId: string;
    appointmentId?: string;
    content: string;
    type?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: ClinicalRecord }>(`/patients/${input.patientId}/clinical-records`, {
        method: 'POST',
        body: JSON.stringify({
          content: input.content,
          appointmentId: input.appointmentId,
          type: input.type ?? 'evolution',
        }),
      });
      return res.data;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useUpdateClinicalRecord() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: string, input: { content?: string; type?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: ClinicalRecord }>(`/clinical-records/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
      return res.data;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useDeleteClinicalRecord() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/clinical-records/${id}`, { method: 'DELETE' });
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
