'use client'

import Link from 'next/link'
import { ArrowUpRight, Check, ChevronRight, CircleDollarSign, Clock3, FileText, Plus, Sparkles, TrendingUp, UserRound, UsersRound } from 'lucide-react'
import { appointments, activities, patients, tasks, weeklyRevenue } from '@/lib/mock-clinic'

const tone: Record<string, string> = {
  teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-300',
  blue: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
}

export default function DashboardPage() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 p-5 md:p-8">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"><Sparkles className="size-3.5 text-primary" /> terça-feira, 27 de agosto de 2024</div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{greeting}, <span className="text-primary">Dra. Helena.</span></h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Aqui está o resumo da sua clínica. Você tem <strong className="font-medium text-foreground">5 consultas</strong> programadas para hoje.</p>
        </div>
        <div className="flex gap-2"><Link href="/psicologa/agenda" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"><Plus className="size-4" /> Nova consulta</Link><Link href="/psicologa/pacientes" className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-muted"><UserRound className="size-4" /> Paciente</Link></div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[['Receita do mês','R$ 12.480','+18,4%','text-emerald-600','bg-emerald-500/10',CircleDollarSign],['Pacientes ativos','42','+6 este mês','text-sky-600','bg-sky-500/10',UsersRound],['Consultas realizadas','86','94% de presença','text-violet-600','bg-violet-500/10',Check],['Pendências','R$ 640','3 pagamentos','text-amber-600','bg-amber-500/10',Clock3]].map(([label,value,meta,color,bg,Icon]) => <div key={label as string} className="rounded-2xl border bg-card p-4 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-xs text-muted-foreground">{label as string}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value as string}</p></div><div className={`rounded-xl p-2.5 ${bg as string} ${color as string}`}><Icon className="size-4" /></div></div><p className={`mt-3 flex items-center gap-1 text-xs ${color as string}`}><TrendingUp className="size-3" /> {meta as string}</p></div>)}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className="rounded-2xl border bg-card shadow-sm"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-semibold">Agenda de hoje</h2><p className="mt-1 text-xs text-muted-foreground">27 de agosto · 5 compromissos</p></div><Link href="/psicologa/agenda" className="flex items-center gap-1 text-xs font-medium text-primary">Ver agenda <ArrowUpRight className="size-3.5" /></Link></div><div className="divide-y">{appointments.map((apt) => <Link href="/psicologa/agenda" key={apt.id} className="group flex items-center gap-4 p-4 transition hover:bg-muted/40"><div className="w-12 text-center"><p className="text-sm font-semibold tabular-nums">{apt.time}</p><p className="text-[10px] text-muted-foreground">{apt.end}</p></div><div className={`size-10 rounded-xl ${tone[apt.color]} flex items-center justify-center text-xs font-semibold`}>{apt.initials}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{apt.patient}</p><p className="mt-1 text-xs text-muted-foreground">{apt.type}</p></div><span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-medium sm:inline-flex ${apt.status === 'realizada' ? 'bg-muted text-muted-foreground' : apt.status === 'pendente' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>{apt.status}</span><ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" /></Link>)}</div></section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Receita mensal</h2><p className="mt-1 text-xs text-muted-foreground">Agosto 2024</p></div><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">+18,4%</span></div><div className="mt-7 flex h-40 items-end gap-3">{weeklyRevenue.map((item, index) => <div key={item.day} className="flex flex-1 flex-col items-center gap-2"><div className="relative flex w-full items-end justify-center" style={{ height: '120px' }}><div className={`w-full max-w-9 rounded-t-lg transition hover:opacity-80 ${index === 3 ? 'bg-primary' : 'bg-primary/15'}`} style={{ height: `${(item.value / 1600) * 100}%` }} /></div><span className="text-[10px] text-muted-foreground">{item.day}</span></div>)}</div><div className="mt-5 flex items-center justify-between border-t pt-4"><span className="text-xs text-muted-foreground">Total recebido</span><span className="text-lg font-semibold">R$ 12.480,00</span></div></section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]"><section className="rounded-2xl border bg-card p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Tarefas pendentes</h2><Link href="/psicologa/tarefas" className="text-xs text-primary">Ver todas</Link></div><div className="flex flex-col gap-3">{tasks.map((task) => <div key={task.id} className="flex items-center gap-3"><div className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${task.done ? 'border-primary bg-primary text-primary-foreground' : ''}`}>{task.done && <Check className="size-3" />}</div><div className="min-w-0 flex-1"><p className={`truncate text-sm ${task.done ? 'text-muted-foreground line-through' : ''}`}>{task.title}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{task.due} · prioridade {task.priority.toLowerCase()}</p></div></div>)}</div></section><section className="rounded-2xl border bg-card p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Pacientes recentes</h2><Link href="/psicologa/pacientes" className="text-xs text-primary">Ver todos</Link></div><div className="flex flex-col gap-3">{patients.slice(0,3).map((patient) => <Link href="/psicologa/pacientes" key={patient.id} className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-muted"><div className={`flex size-9 items-center justify-center rounded-xl text-xs font-semibold ${tone[patient.color]}`}>{patient.initials}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{patient.name}</p><p className="text-[11px] text-muted-foreground">{patient.lastSession}</p></div><ChevronRight className="size-4 text-muted-foreground" /></Link>)}</div></section><section className="rounded-2xl border bg-card p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Atividade recente</h2><FileText className="size-4 text-muted-foreground" /></div><div className="flex flex-col gap-4">{activities.map((activity) => <div key={activity.text} className="flex gap-3"><div className="mt-1 size-2 rounded-full bg-primary" /><div><p className="text-sm">{activity.text}</p><p className="mt-1 text-[11px] text-muted-foreground">{activity.detail}</p></div></div>)}</div></section></div>
    </div>
  )
}
