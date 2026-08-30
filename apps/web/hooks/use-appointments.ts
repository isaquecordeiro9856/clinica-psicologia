'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { usePolling } from '@/hooks/use-polling';

export interface Appointment {
  id: string;
  patientId: string;
  psychologistId: string;
  serviceId?: string;
  startAt: string;
  endAt: string;
  status: string;
  modality?: string;
  cancelReason?: string;
  patient?: { id?: string; name?: string; email?: string; phone?: string };
  psychologist?: { name?: string };
  service?: { id?: string; name?: string; durationMinutes?: number; price?: number };
}

export interface AppointmentListResponse {
  data: Appointment[];
  total?: number;
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

export function useAppointments(params?: {
  from?: string;
  to?: string;
  status?: string;
  patientId?: string;
  psychologistId?: string;
  page?: number;
  limit?: number;
  pollInterval?: number;
}) {
  const [data, setData] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params?.from) query.set('from', params.from);
      if (params?.to) query.set('to', params.to);
      if (params?.status) query.set('status', params.status);
      if (params?.patientId) query.set('patientId', params.patientId);
      if (params?.psychologistId) query.set('psychologistId', params.psychologistId);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));

      const res = await apiFetch<AppointmentListResponse>(`/appointments?${query.toString()}`);
      setData(res.data);
      setTotal(res.meta?.total ?? res.total ?? 0);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [params?.from, params?.to, params?.status, params?.patientId, params?.psychologistId, params?.page, params?.limit]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  usePolling(fetchAppointments, params?.pollInterval ?? 0, !loading);

  return { data, total, loading, error, refetch: fetchAppointments };
}

function useAppointmentMutation<TInput, TOutput = unknown>(
  fn: (input: TInput) => Promise<TOutput>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (input: TInput) => {
    setLoading(true);
    setError(null);
    try {
      return await fn(input);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { mutate, loading, error };
}

export function useCreateAppointment() {
  return useAppointmentMutation(async (input: {
    patientId: string;
    serviceId: string;
    startAt: string;
    endAt: string;
    modality?: string;
  }) => {
    const res = await apiFetch<{ data: Appointment }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data;
  });
}

export function useUpdateAppointment() {
  return useAppointmentMutation(async (input: {
    id: string;
    data: { patientId?: string; serviceId?: string; startAt?: string; endAt?: string; modality?: string };
  }) => {
    const res = await apiFetch<{ data: Appointment }>(`/appointments/${input.id}`, {
      method: 'PATCH',
      body: JSON.stringify(input.data),
    });
    return res.data;
  });
}

export function useConfirmAppointment() {
  return useAppointmentMutation(async (id: string) => {
    await apiFetch(`/appointments/${id}/confirm`, { method: 'PATCH' });
  });
}

export function useCompleteAppointment() {
  return useAppointmentMutation(async (id: string) => {
    await apiFetch(`/appointments/${id}/complete`, { method: 'PATCH' });
  });
}

export function useNoShowAppointment() {
  return useAppointmentMutation(async (id: string) => {
    await apiFetch(`/appointments/${id}/no-show`, { method: 'PATCH' });
  });
}

export function useCancelAppointment() {
  return useAppointmentMutation(async (input: { id: string; reason?: string }) => {
    await apiFetch(`/appointments/${input.id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason: input.reason }),
    });
  });
}

export function useRescheduleAppointment() {
  return useAppointmentMutation(async (input: {
    id: string;
    startAt: string;
    endAt: string;
  }) => {
    const res = await apiFetch<{ data: Appointment }>(`/appointments/${input.id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ startAt: input.startAt, endAt: input.endAt }),
    });
    return res.data;
  });
}

export function useDeleteAppointment() {
  return useAppointmentMutation(async (id: string) => {
    await apiFetch(`/appointments/${id}`, { method: 'DELETE' });
  });
}

export function useTodayAppointments() {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const from = new Date(now);
      from.setHours(0, 0, 0, 0);
      const to = new Date(now);
      to.setHours(23, 59, 59, 999);
      const res = await apiFetch<AppointmentListResponse>(
        `/appointments?from=${from.toISOString()}&to=${to.toISOString()}`,
      );
      setData(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  usePolling(fetchToday, 60000, true);

  return { data, loading, error, refetch: fetchToday };
}
