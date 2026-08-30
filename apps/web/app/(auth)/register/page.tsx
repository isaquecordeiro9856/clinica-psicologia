'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (passwordStrength.score < 2) {
      setError('A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, lgpdConsent }),
      });
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      router.push('/login');
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div>
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre-se como paciente para agendar consultas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />
        </div>
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
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i < passwordStrength.score
                        ? passwordStrength.score <= 1
                          ? 'bg-red-500'
                          : passwordStrength.score === 2
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{passwordStrength.label}</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-destructive">As senhas não coincidem</p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="lgpd"
            className="mt-1 rounded border-input"
            checked={lgpdConsent}
            onChange={(e) => setLgpdConsent(e.target.checked)}
          />
          <label htmlFor="lgpd" className="text-xs text-muted-foreground">
            Li e aceito os{' '}
            <span className="font-medium text-foreground">Termos de Uso</span> e a{' '}
            <span className="font-medium text-foreground">Política de Privacidade</span> (LGPD).
            Autorizo o tratamento dos meus dados para fins de atendimento psicológico.
          </label>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={!lgpdConsent || loading}>
          {loading ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </div>
    </AuthLayout>
  );
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ['Muito fraca', 'Fraca', 'Razoável', 'Forte', 'Muito forte'];
  return { score: Math.min(score, 4), label: labels[Math.min(score, 4)] };
}
