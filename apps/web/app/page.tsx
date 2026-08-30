import Link from 'next/link';
import { Brain, Shield, CreditCard, Calendar, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">ClínicaPsi</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Começar agora</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Gestão inteligente para sua clínica de psicologia
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Agenda, prontuário eletrônico criptografado, financeiro e teleconsulta em um só lugar. 
            LGPD nativo para proteção dos dados dos seus pacientes.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Agendar demonstração</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">Já tenho conta</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold">Tudo que você precisa</h2>
          <p className="mt-2 text-center text-muted-foreground">Funcionalidades pensadas para psicólogas e clínicas</p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Calendar} title="Agenda inteligente" description="Gerencie horários, bloqueios e disponibilidade. Pacientes agendam online 24h." />
            <FeatureCard icon={FileText} title="Prontuário seguro" description="Evolução por sessão com modelo SOAP. Criptografia AES-256-GCM em todos os dados clínicos." />
            <FeatureCard icon={CreditCard} title="PIX e cartão" description="Cobrança automática, comprovantes, segunda via e relatórios financeiros." />
            <FeatureCard icon={Lock} title="LGPD nativo" description="Consentimento granular, trilha de auditoria imutável e exportação de dados." />
            <FeatureCard icon={Shield} title="Acesso por perfil" description="Psicóloga, secretária e paciente com permissões distintas. Prontuário só para profissional." />
            <FeatureCard icon={Brain} title="Teleconsulta" description="Videochamada integrada, sala de espera virtual e registro de presença." />
          </div>
        </div>
      </section>

      {/* Login cards */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">Acesse o sistema</h2>
        <p className="mt-2 text-center text-muted-foreground">Escolha seu perfil para entrar</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <LoginCard
            title="Paciente"
            description="Agende, pague com PIX, acesse recibos e formulários."
            href="/login?role=patient"
            cta="Entrar como paciente"
          />
          <LoginCard
            title="Psicóloga"
            description="Agenda, prontuário criptografado, financeiro e relatórios."
            href="/login?role=psychologist"
            cta="Painel da psicóloga"
            featured
          />
          <LoginCard
            title="Secretária"
            description="Gestão de agenda e financeiro sem acesso a prontuário."
            href="/login?role=secretary"
            cta="Acesso secretaria"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-muted-foreground">
          <p>ClínicaPsi © 2026. Privado — uso interno de clínica.</p>
          <div className="flex gap-4">
            <span>Termos de uso</span>
            <span>Política de privacidade</span>
            <span>Contato</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function LoginCard({ title, description, href, cta, featured }: { title: string; description: string; href: string; cta: string; featured?: boolean }) {
  return (
    <div className={`rounded-xl border p-6 transition-shadow hover:shadow-md ${featured ? 'border-primary bg-primary/5' : 'bg-card'}`}>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Link href={href} className="mt-4 block">
        <Button variant={featured ? 'default' : 'outline'} className="w-full" size="sm">
          {cta}
        </Button>
      </Link>
    </div>
  );
}
