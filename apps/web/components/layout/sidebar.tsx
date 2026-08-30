'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Calendar, Users, FileText, DollarSign,
  BarChart3, Settings, LogOut, Brain, X, Menu,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

const nav = [
  { icon: Home, href: '/psicologa/dashboard', label: 'Dashboard' },
  { icon: Calendar, href: '/psicologa/agenda', label: 'Agenda' },
  { icon: Users, href: '/psicologa/pacientes', label: 'Pacientes' },
  { icon: FileText, href: '/psicologa/prontuario', label: 'Prontuário' },
  { icon: DollarSign, href: '/psicologa/financeiro', label: 'Financeiro' },
  { icon: BarChart3, href: '/psicologa/relatorios', label: 'Relatórios' },
];

const bottomNav = [
  { icon: Settings, href: '/psicologa/configuracoes', label: 'Configurações' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 mb-8">
        <div className="h-9 w-9 flex items-center justify-center rounded-xl" style={{ background: 'var(--sidebar-accent)' }}>
          <Brain className="h-5 w-5 text-white" />
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--sidebar-active)' }}>Clínica</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 space-y-1">
        {nav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
              style={{
                background: active ? 'var(--sidebar-hover)' : 'transparent',
                color: active ? 'var(--sidebar-active)' : 'var(--sidebar-fg)',
                borderLeft: active ? '3px solid var(--sidebar-accent)' : '3px solid transparent',
              }}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 space-y-1 pb-4">
        {bottomNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
              style={{
                background: active ? 'var(--sidebar-hover)' : 'transparent',
                color: active ? 'var(--sidebar-active)' : 'var(--sidebar-fg)',
                borderLeft: active ? '3px solid var(--sidebar-accent)' : '3px solid transparent',
              }}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}

        <div className="my-2 h-px" style={{ background: 'var(--sidebar-hover)' }} />

        <button
          onClick={() => { logout(); setMobileOpen(false); }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium w-full transition-all"
          style={{ color: 'var(--sidebar-fg)' }}
        >
          <LogOut className="h-4.5 w-4.5" />
          Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 lg:hidden flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex h-screen w-60 flex-col border-r"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--sidebar-bg)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 flex flex-col border-r"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--sidebar-bg)' }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-lg"
              style={{ color: 'var(--sidebar-fg)' }}
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
