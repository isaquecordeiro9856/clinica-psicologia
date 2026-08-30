'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace('/login');
    }
  }, [loading, authenticated, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--fg)' }} />
      </div>
    );
  }

  if (!authenticated) return null;

  return <>{children}</>;
}
