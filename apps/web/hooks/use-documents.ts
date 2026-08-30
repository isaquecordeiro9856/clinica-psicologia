'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export interface Document {
  id: string;
  patientId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  isClinical: boolean;
  createdAt: string;
}

export interface DocumentListResponse {
  data: Document[];
}

export function useDocuments(patientId?: string) {
  const [data, setData] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!patientId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<DocumentListResponse>(`/patients/${patientId}/documents`);
      setData(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { data, loading, error, refetch: fetchDocuments };
}

export function useUploadDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (patientId: string, file: File, category: string, isClinical?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      if (isClinical) formData.append('isClinical', 'true');

      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/patients/${patientId}/documents/upload`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.message ?? 'Erro no upload');
      }

      return res.json();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useDeleteDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (patientId: string, documentId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/patients/${patientId}/documents/${documentId}`, { method: 'DELETE' });
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useDownloadDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (patientId: string, documentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ url: string }>(`/patients/${patientId}/documents/${documentId}/download`);
      window.open(res.url, '_blank');
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}