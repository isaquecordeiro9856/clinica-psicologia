'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export interface AvailableSlot {
  psychologistId: string;
  psychologistName: string;
  startAt: string;
  endAt: string;
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  price: number;
}

export interface PatientAppointment {
  id: string;
  patientId: string;
  psychologistId: string;
  startAt: string;
  endAt: string;
  status: string;
  service?: { name: string; durationMinutes: number; price: number };
  psychologist?: { name: string };
}

export interface AvailabilityResponse {
  data: AvailableSlot[];
}

export interface CreatePatientAppointmentInput {
  psychologistId: string;
  serviceId: string;
  startAt: string;
  endAt: string;
}

export function usePatientAvailability(psychologistId?: string, from?: string, to?: string) {
  const [data, setData] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!psychologistId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      query.set('psychologistId', psychologistId);
      if (from) query.set('from', from);
      if (to) query.set('to', to);
      const res = await apiFetch<AvailabilityResponse>(`/availability?${query.toString()}`);
      setData(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [psychologistId, from, to]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return { data, loading, error, refetch: fetchAvailability };
}

export function usePatientAppointments() {
  const [data, setData] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: PatientAppointment[] }>('/appointments');
      setData(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { data, loading, error, refetch: fetchAppointments };
}

export function useCreatePatientAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: CreatePatientAppointmentInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: PatientAppointment }>('/appointments', {
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

export function useCancelPatientAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/appointments/${id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}