'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { usePolling } from '@/hooks/use-polling';

export interface Billing {
  id: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  status: string;
  method?: string;
  paymentMethod?: string;
  dueDate?: string;
  paidAt?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  patient?: { name?: string };
  appointment?: { startAt?: string };
}

export interface BillingListResponse {
  data: Billing[];
  total?: number;
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

export function useBillings(params?: { status?: string; patientId?: string; page?: number; limit?: number; pollInterval?: number }) {
  const [data, setData] = useState<Billing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.patientId) query.set('patientId', params.patientId);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));

      const res = await apiFetch<BillingListResponse>(`/billings?${query.toString()}`);
      setData(res.data);
      setTotal(res.meta?.total ?? res.total ?? 0);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [params?.status, params?.patientId, params?.page, params?.limit]);

  useEffect(() => {
    fetchBillings();
  }, [fetchBillings]);

  usePolling(fetchBillings, params?.pollInterval ?? 0, !loading || data.length > 0);

  return { data, total, loading, error, refetch: fetchBillings };
}

export function useCreateBilling() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: {
    patientId: string;
    amount: number;
    method?: string;
    appointmentId?: string;
    dueDate?: string;
    description?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: Billing }>('/billings', {
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

export function useUpdateBilling() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: string, input: { amount?: number; method?: string; dueDate?: string; status?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: Billing }>(`/billings/${id}`, {
        method: 'PATCH',
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

export function useDeleteBilling() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/billings/${id}`, { method: 'DELETE' });
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useCreatePix() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (billingId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: Billing }>(`/billings/${billingId}/pix`, {
        method: 'POST',
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

export function useMarkPaid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: Billing }>(`/billings/${id}/mark-paid`, { method: 'PATCH' });
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

export function useFinancialSummary() {
  const [data, setData] = useState<{ totalRevenue: number; pendingAmount: number; overdueAmount: number; paidCount: number; pendingCount: number; overdueCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<BillingListResponse>('/billings?limit=1000');
      const billings = res.data;
      const totalRevenue = billings.filter((b) => b.status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0);
      const pendingAmount = billings.filter((b) => b.status === 'pending').reduce((sum, b) => sum + Number(b.amount), 0);
      const overdueAmount = billings.filter((b) => b.status === 'overdue').reduce((sum, b) => sum + Number(b.amount), 0);
      setData({
        totalRevenue,
        pendingAmount,
        overdueAmount,
        paidCount: billings.filter((b) => b.status === 'paid').length,
        pendingCount: billings.filter((b) => b.status === 'pending').length,
        overdueCount: billings.filter((b) => b.status === 'overdue').length,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, loading, error, refetch: fetchSummary };
}
