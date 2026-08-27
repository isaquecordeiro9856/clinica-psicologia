'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('psi@clinica.app');
  const [password, setPassword] = useState('Senha123!');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('Conectando...');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? 'Falha no login');
      localStorage.setItem('accessToken', data.data.accessToken);
      setMsg(`OK! Token salvo. Role: ${data.data.user.role}`);
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Login</h1>
      <p className="mt-2 text-sm text-muted-foreground">Use as credenciais do seed: psi@clinica.app / Senha123!</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input className="w-full rounded border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
        <input className="w-full rounded border px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
        <button className="w-full rounded bg-primary py-2 text-white" type="submit">Entrar</button>
      </form>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </main>
  );
}
