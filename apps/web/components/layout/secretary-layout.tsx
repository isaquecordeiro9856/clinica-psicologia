'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, Home, Calendar, Users, CreditCard, ClipboardCheck, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const nav = [
  { icon: Home, href: '/secretaria/dashboard', label: 'Dashboard' },
  { icon: Calendar, href: '/secretaria/agenda', label: 'Agenda' },
  { icon: Users, href: '/secretaria/pacientes', label: 'Pacientes' },
  { icon: CreditCard, href: '/secretaria/financeiro', label: 'Financeiro' },
  { icon: ClipboardCheck, href: '/secretaria/checkin', label: 'Check-in' },
];

export function SecretaryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <aside className="flex w-60 flex-col border-r" style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex h-14 items-center gap-2.5 border-b px-5" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)', color: 'white' }}>
            <Brain className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold">Clínica — Secretária</span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors" style={active ? { background: 'var(--surface-overlay)', color: 'var(--accent)' } : { color: 'var(--fg-muted)' }}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={logout} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm w-full" style={{ color: 'var(--danger)' }}>
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
