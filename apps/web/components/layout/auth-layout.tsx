'use client';

import { Brain } from 'lucide-react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: 'var(--primary)', color: 'var(--primary-fg)' }}>
        <div>
          <div className="flex items-center gap-2.5 mb-12">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Brain className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">Clínica</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight">Sistema de Gestão<br />Clínica Psicológica</h1>
          <p className="mt-4 text-sm opacity-70 max-w-sm">Gerencie agenda, prontuários, financeiro e muito mais em um só lugar.</p>
        </div>
        <p className="text-xs opacity-40">© 2026 Clínica. Todos os direitos reservados.</p>
      </div>
      {/* Right: Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
