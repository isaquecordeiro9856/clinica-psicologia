const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as Record<string, string>) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/api/v1${path}`, { ...init, headers, credentials: 'include' });
  if (res.status === 401 && typeof window !== 'undefined') {
    // tenta refresh
    const r = await fetch(`${API_URL}/api/v1/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (r.ok) {
      const data = await r.json();
      localStorage.setItem('accessToken', data.data.accessToken);
      headers.Authorization = `Bearer ${data.data.accessToken}`;
      return fetch(`${API_URL}/api/v1${path}`, { ...init, headers, credentials: 'include' });
    }
  }
  return res;
}
