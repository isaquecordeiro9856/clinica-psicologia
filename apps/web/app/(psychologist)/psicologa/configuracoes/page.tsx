'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  User, Bell, Shield, Palette,
  ChevronRight,
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const sections = [
    {
      title: 'Perfil',
      icon: User,
      items: [
        { label: 'Nome', value: user?.name ?? 'Não informado' },
        { label: 'E-mail', value: user?.email ?? 'Não informado' },
        { label: 'Função', value: user?.role === 'psychologist' ? 'Psicóloga' : user?.role ?? '---' },
      ],
    },
    {
      title: 'Aparência',
      icon: Palette,
      items: [
        { label: 'Modo escuro', value: theme === 'dark', type: 'toggle' as const },
        { label: 'Idioma', value: 'Português (Brasil)' },
      ],
    },
    {
      title: 'Notificações',
      icon: Bell,
      items: [
        { label: 'E-mail', value: true, type: 'toggle' as const },
        { label: 'Lembretes', value: true, type: 'toggle' as const },
        { label: 'Atualizações', value: false, type: 'toggle' as const },
      ],
    },
    {
      title: 'Segurança',
      icon: Shield,
      items: [
        { label: 'Alterar senha', value: '', type: 'link' as const },
        { label: 'Verificação em duas etapas', value: false, type: 'toggle' as const },
      ],
    },
  ];

  return (
    <div className="animate-fade-in p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Gerencie suas preferências.</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="record-card">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-subtle)' }}>
                <section.icon className="h-4 w-4" style={{ color: 'var(--fg-muted)' }} />
              </div>
              <h3 className="text-sm font-semibold">{section.title}</h3>
            </div>
            <div className="space-y-3">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>{item.label}</span>
                  {item.type === 'toggle' ? (
                    <Switch
                      checked={!!item.value}
                      onCheckedChange={(checked: boolean) => {
                        if (item.label === 'Modo escuro') {
                          setTheme(checked ? 'dark' : 'light');
                        }
                      }}
                    />
                  ) : item.type === 'link' ? (
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" style={{ color: 'var(--accent)' }}>
                      Alterar <ChevronRight className="h-3 w-3" />
                    </Button>
                  ) : (
                    <span className="text-sm font-medium">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="record-card">
          <Button variant="destructive" className="w-full" onClick={logout}>
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
