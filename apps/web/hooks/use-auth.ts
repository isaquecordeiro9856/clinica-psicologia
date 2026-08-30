'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  psychologistId?: string;
  patientId?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
}

const PUBLIC_ROUTES = ['/', '/login', '/register'];
const ROLE_ROUTES: Record<string, string[]> = {
  psychologist: ['/psicologa'],
  secretary: ['/secretaria'],
  patient: ['/paciente'],
};

export function useAuth(): AuthState & { logout: () => void } {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, authenticated: false });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setState({ user: null, loading: false, authenticated: false });
      return;
    }

    apiFetch<{ data: User }>('/auth/me')
      .then((data) => {
        setState({ user: data.data, loading: false, authenticated: true });
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        setState({ user: null, loading: false, authenticated: false });
      });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    setState({ user: null, loading: false, authenticated: false });
    router.push('/login');
  }, [router]);

  return { ...state, logout };
}

export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth.loading) return;

    // Allow public routes
    if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '?'))) return;

    // Redirect to login if not authenticated
    if (!auth.authenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check role access
    if (auth.user?.role) {
      const allowedPrefixes = ROLE_ROUTES[auth.user.role] ?? [];
      const hasAccess = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
      if (!hasAccess) {
        // Redirect to appropriate dashboard
        const defaultRoute = ROLE_ROUTES[auth.user.role]?.[0] ?? '/';
        router.push(defaultRoute);
      }
    }
  }, [auth.loading, auth.authenticated, auth.user, pathname, router]);

  return auth;
}
