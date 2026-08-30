const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as Record<string, string>) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, { ...init, headers, credentials: 'include' });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se a API está rodando.', 0);
  }

  if (res.status === 401 && typeof window !== 'undefined') {
    try {
      const r = await fetch(`${API_URL}/api/v1/auth/refresh`, { method: 'POST', credentials: 'include' });
      if (r.ok) {
        const data = await r.json();
        if (data.data?.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
          headers.Authorization = `Bearer ${data.data.accessToken}`;
          res = await fetch(`${API_URL}/api/v1${path}`, { ...init, headers, credentials: 'include' });
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          throw new ApiError('Sessão expirada. Faça login novamente.', 401);
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        throw new ApiError('Sessão expirada. Faça login novamente.', 401);
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      throw new ApiError('Sessão expirada. Faça login novamente.', 401);
    }
  }

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = await res.json();
      message = body?.error?.message ?? body?.message ?? message;
    } catch {}
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}
