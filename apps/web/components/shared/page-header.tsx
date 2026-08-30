'use client';

import { ReactNode } from 'react';
import { Breadcrumbs } from './breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  action?: { label: string; onClick?: () => void };
}

export function PageHeader({ title, description, breadcrumbs, actions, action }: PageHeaderProps) {
  const headerActions = actions ?? (action ? (
    <button onClick={action.onClick} className="rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: 'var(--primary)', color: 'var(--primary-fg)' }}>
      {action.label}
    </button>
  ) : undefined);

  return (
    <div className="mb-6">
      {breadcrumbs && <div className="mb-3"><Breadcrumbs items={breadcrumbs} /></div>}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {description && <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>{description}</p>}
        </div>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </div>
    </div>
  );
}
