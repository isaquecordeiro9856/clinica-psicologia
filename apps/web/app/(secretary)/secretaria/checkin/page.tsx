'use client';

import { SecretaryLayout } from '@/components/layout/secretary-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, User, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const waitingPatients = [
  { id: '1', name: 'Ana Beatriz Silva', appointmentTime: '09:00', arrivedAt: '08:55', status: 'waiting' },
  { id: '2', name: 'Carlos Eduardo Souza', appointmentTime: '10:00', arrivedAt: '09:50', status: 'waiting' },
  { id: '3', name: 'Pedro Henrique Costa', appointmentTime: '14:00', arrivedAt: null, status: 'not_arrived' },
];

export default function SecretaryCheckinPage() {
  const [search, setSearch] = useState('');

  return (
    <SecretaryLayout>
      <div className="space-y-6">
        <PageHeader
          title="Check-in"
          description="Registre a presença dos pacientes."
        />

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {waitingPatients.map((p) => (
            <Card key={p.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Consulta: {p.appointmentTime}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {p.status === 'waiting' ? (
                    <>
                      <div className="flex items-center gap-2 text-xs text-success">
                        <CheckCircle className="h-3 w-3" />
                        Chegou às {p.arrivedAt}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">Confirmar</Button>
                        <Button size="sm" variant="outline" className="flex-1">Falta</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Aguardando chegada
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        <User className="mr-1 h-3 w-3" />
                        Registrar chegada manual
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SecretaryLayout>
  );
}
