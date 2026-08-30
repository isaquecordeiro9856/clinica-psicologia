'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, Home, Calendar, FileText, CreditCard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const nav = [
  { icon: Home, href: '/paciente/dashboard', label: 'Início' },
  { icon: Calendar, href: '/paciente/agenda', label: 'Agenda' },
  { icon: FileText, href: '/paciente/historico', label: 'Histórico' },
  { icon: CreditCard, href: '/paciente/pagamentos', label: 'Pagamentos' },
];

export function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex h-14 items-center gap-2.5 border-b px-5" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)', color: 'white' }}>
            <Brain className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold">Clínica</span>
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="flex h-14 items-center gap-4 border-b px-6 lg:hidden" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface)' }}>
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="text-sm font-bold">Clínica</span>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
