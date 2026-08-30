'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { usePolling } from '@/hooks/use-polling';

export interface Patient {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  dateOfBirth?: string;
  status?: string;
  createdAt: string;
}

export interface PatientListResponse {
  data: Patient[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

export function usePatients(params?: { page?: number; limit?: number; search?: string; pollInterval?: number }) {
  const [data, setData] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.search) query.set('search', params.search);

      const res = await apiFetch<PatientListResponse>(`/patients?${query.toString()}`);
      setData(res.data);
      setTotal(res.meta?.total ?? res.total ?? 0);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.limit, params?.search]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  usePolling(fetchPatients, params?.pollInterval ?? 0, !loading || data.length > 0);

  return { data, total, loading, error, refetch: fetchPatients };
}

export function useCreatePatient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: { name: string; email: string; cpf?: string; phone?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: Patient }>('/patients', {
        method: 'POST',
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

export function useUpdatePatient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = async (id: string, input: Partial<Pick<Patient, 'name' | 'email' | 'cpf' | 'phone'>>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: Patient }>(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
      return res.data;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally { setLoading(false); }
  };
  return { mutate, loading, error };
}

export function useDeletePatient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/patients/${id}`, { method: 'DELETE' });
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { mutate, loading, error };
}
