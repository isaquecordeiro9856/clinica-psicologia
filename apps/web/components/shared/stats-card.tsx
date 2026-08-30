'use client';

import { cn } from '@/lib/utils';

interface StatsCardProps {
  label?: string;
  title?: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<any>;
  color?: string;
  accent?: string;
  change?: string;
  className?: string;
}

export function StatsCard({ label, title, value, description, icon: Icon, color, accent, change, className }: StatsCardProps) {
  const displayLabel = label ?? title;
  const iconColor = color ?? (accent === 'blue' ? 'var(--accent)' : accent === 'green' ? 'var(--success)' : accent === 'amber' ? 'var(--warning)' : 'var(--accent)');

  return (
    <div className={cn('record-card', className)}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${iconColor}12` }}>
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium" style={{ color: 'var(--fg-muted)' }}>{displayLabel}</p>
          <p className="text-xl font-bold">{value}</p>
          {description && <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--fg-faint)' }}>{description}</p>}
          {change && <span className="text-[10px] font-semibold" style={{ color: 'var(--success)' }}>{change}</span>}
        </div>
      </div>
    </div>
  );
}
