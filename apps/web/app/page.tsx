import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Clínica de Psicologia</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Sistema de gestão — agenda, prontuário, financeiro e teleconsulta. LGPD nativo.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card title="Paciente" desc="Agende, pague com PIX, acesse recibos e formulários." href="/login?role=patient" cta="Entrar como paciente" />
        <Card title="Psicóloga" desc="Agenda, prontuário criptografado, financeiro e relatórios." href="/login?role=psychologist" cta="Painel da psicóloga" />
        <Card title="Secretaria" desc="Gestão de agenda e financeiro sem acesso a prontuário." href="/login?role=secretary" cta="Acesso secretaria" />
      </div>

      <section className="mt-12 rounded-lg border p-6">
        <h2 className="font-semibold">Status do projeto</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
          <li>Monorepo inicializado — <code>apps/api</code> (NestJS) + <code>apps/web</code> (Next.js)</li>
          <li>Prisma schema com 16 entidades + seed demo</li>
          <li>Próximo: implementar telas reais por perfil (ver <code>docs/runbooks</code>)</li>
        </ul>
        <div className="mt-4 flex gap-3">
          <a href="http://localhost:3001/docs" className="text-sm text-primary underline" target="_blank">API Docs (após rodar API)</a>
          <a href="http://localhost:8025" className="text-sm text-primary underline" target="_blank">Mailhog (e-mails locais)</a>
        </div>
      </section>
    </main>
  );
}

function Card({ title, desc, href, cta }: { title: string; desc: string; href: string; cta: string }) {
  return (
    <div className="rounded-lg border p-6">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <Link href={href as never} className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        {cta}
      </Link>
    </div>
  );
}
