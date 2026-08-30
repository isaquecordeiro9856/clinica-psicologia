'use client';

import { Search, Bell, ChevronDown, User, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import Link from 'next/link';

export function TopBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  function getInitials() {
    if (user?.name) return user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return '??';
  }

  const roleLabels: Record<string, string> = {
    psychologist: 'Psicóloga',
    secretary: 'Secretária',
    patient: 'Paciente',
  };

  return (
    <header className="flex h-14 items-center justify-between border-b px-6" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface)' }}>
      {/* Search */}
      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--fg-muted)', background: 'var(--bg-subtle)' }}
      >
        <Search className="h-3.5 w-3.5" />
        <span>Buscar...</span>
        <kbd className="ml-4 flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-medium" style={{ borderColor: 'var(--border)', color: 'var(--fg-faint)' }}>
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 h-9 rounded-lg">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] font-bold" style={{ background: 'var(--bg-subtle)', color: 'var(--fg)' }}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3 w-3" style={{ color: 'var(--fg-faint)' }} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name ?? 'Usuário'}</p>
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{roleLabels[user?.role ?? ''] ?? user?.role}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/psicologa/configuracoes"><User className="mr-2 h-4 w-4" /> Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/psicologa/configuracoes"><Settings className="mr-2 h-4 w-4" /> Configurações</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-[var(--danger)]">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
