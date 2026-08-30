'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CreditCard, Check, Clock, Receipt } from 'lucide-react';
import { PatientLayout } from '@/components/layout/patient-layout';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { useBillings } from '@/hooks/use-billing';
import { toast } from 'sonner';

export default function PagamentosPage() {
  const { data: billings, loading } = useBillings();
  const totalPaid = billings.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = billings.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div>
          <Breadcrumbs items={[{ label: 'Pagamentos' }]} />
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-sm text-muted-foreground">Acompanhe seus pagamentos e recibos.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="card-healthcare">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10">
                  <Check className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total pago</p>
                  <p className="text-xl font-bold text-success">R$ {totalPaid.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-healthcare">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendente</p>
                  <p className="text-xl font-bold text-warning">R$ {totalPending.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : billings.length === 0 ? (
          <EmptyState
            title="Nenhum pagamento registrado"
            description="Seus pagamentos aparecerão aqui."
            icon={<Receipt className="h-6 w-6 text-muted-foreground" />}
          />
        ) : (
          <div className="space-y-2">
            {billings.map((billing) => (
              <div key={billing.id} className="flex flex-col gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sessão individual</p>
                    <p className="text-xs text-muted-foreground">
                      {billing.dueDate ? new Date(billing.dueDate).toLocaleDateString('pt-BR') : '—'} · {billing.paymentMethod ?? 'PIX'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">R$ {Number(billing.amount).toLocaleString('pt-BR')}</span>
                  <StatusBadge status={billing.status} />
                  {billing.status === 'paid' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => toast.info('Download do recibo em desenvolvimento')}
                      aria-label="Baixar recibo"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Recibo</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
