'use client';

import { apiFetch } from '@/lib/api';
import { useCallback, useState } from 'react';

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useMutation<TInput = unknown, TOutput = unknown>(
  path: string | ((input: TInput) => string),
  method: string = 'POST',
  options: UseMutationOptions<TOutput> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (input: TInput) => {
    setLoading(true);
    setError(null);
    try {
      const url = typeof path === 'function' ? path(input) : path;
      const json = await apiFetch<{ data?: TOutput }>(url, {
        method,
        body: JSON.stringify(input),
      });
      options.onSuccess?.(json.data ?? json as TOutput);
      return json.data ?? json;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      options.onError?.(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [path, method, options]);

  return { mutate, loading, error };
}
