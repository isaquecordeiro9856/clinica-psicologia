'use client';

import { apiFetch } from '@/lib/api';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useApi<T = unknown>(path: string, options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (method: string, body?: unknown) => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch<{ data?: T }>(path, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      });
      setData(json.data ?? json as T);
      if (options.successMessage) toast.success(options.successMessage);
      options.onSuccess?.(json.data ?? json);
      return json.data ?? json;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      if (options.errorMessage) toast.error(options.errorMessage);
      options.onError?.(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [path, options]);

  const get = useCallback(() => execute('GET'), [execute]);
  const post = useCallback((body?: unknown) => execute('POST', body), [execute]);
  const patch = useCallback((body?: unknown) => execute('PATCH', body), [execute]);
  const del = useCallback(() => execute('DELETE'), [execute]);

  return { data, loading, error, get, post, patch, del, execute };
}

export function useApiGet<T = unknown>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch<{ data?: T }>(path);
      setData(json.data ?? json as T);
      return json.data ?? json;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [path]);

  return { data, loading, error, fetch: fetchFn };
}
