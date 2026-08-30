'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { apiFetch, ApiError } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function redirectByRole(role: string) {
    const map: Record<string, string> = {
      psychologist: '/psicologa/dashboard',
      secretary: '/secretaria/dashboard',
      patient: '/paciente/agenda',
      admin: '/psicologa/dashboard',
    };
    router.push(map[role] ?? '/');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch<{ data: { accessToken: string; user: { name?: string; email: string; role: string } } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      );
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('userRole', res.data.user.role);
      toast.success(`Bem-vindo(a), ${res.data.user.name ?? res.data.user.email}!`);
      redirectByRole(res.data.user.role);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao conectar com o servidor';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div>
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesse o sistema da clinica.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Nao tem conta?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Cadastre-se
        </Link>
      </div>
    </AuthLayout>
  );
}
