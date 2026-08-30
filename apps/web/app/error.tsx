'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="mt-6 text-xl font-bold">Algo deu errado</h1>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        Ocorreu um erro inesperado. Tente recarregar a página ou volte para o início.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => reset()}>
          Tentar novamente
        </Button>
        <Button onClick={() => (window.location.href = '/')}>Ir para o início</Button>
      </div>
    </div>
  );
}
