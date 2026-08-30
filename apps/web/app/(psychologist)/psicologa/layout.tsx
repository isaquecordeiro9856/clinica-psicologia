'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { AuthGuard } from '@/components/layout/auth-guard';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { TopBar } from '@/components/layout/topbar';

export default function PsicologaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ErrorBoundary>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </ErrorBoundary>
    </AuthGuard>
  );
}
