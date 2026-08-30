'use client';

import { SecretaryLayout } from '@/components/layout/secretary-layout';
import { PageHeader } from '@/components/shared/page-header';
import { BillingTable } from '@/components/financial/billing-table';
import { StatsCard } from '@/components/shared/stats-card';
import { DollarSign, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFinancialSummary } from '@/hooks/use-billing';

export default function SecretaryFinanceiroPage() {
  const { data: summary, loading } = useFinancialSummary();

  return (
    <SecretaryLayout>
      <div className="space-y-6">
        <PageHeader
          title="Financeiro"
          description="Gerencie cobrancas, pagamentos e recibos."
          action={{ label: 'Nova cobranca' }}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Recebido no mes"
            value={loading ? '...' : `R$ ${(summary?.totalRevenue ?? 0).toLocaleString('pt-BR')}`}
            description={`${summary?.paidCount ?? 0} pagamentos`}
            icon={CheckCircle}
          />
          <StatsCard
            title="Pendente"
            value={loading ? '...' : `R$ ${(summary?.pendingAmount ?? 0).toLocaleString('pt-BR')}`}
            description={`${summary?.pendingCount ?? 0} cobrancas`}
            icon={Clock}
          />
          <StatsCard title="Atrasado" value="R$ 0" description="0 cobrancas" icon={AlertTriangle} />
          <StatsCard
            title="Total mes"
            value={loading ? '...' : `R$ ${(summary?.totalRevenue ?? 0).toLocaleString('pt-BR')}`}
            description={`${summary?.paidCount ?? 0} sessoes`}
            icon={DollarSign}
          />
        </div>

        <BillingTable />
      </div>
    </SecretaryLayout>
  );
}
