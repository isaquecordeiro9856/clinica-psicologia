'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="mb-3 text-[var(--fg-faint)]">{icon}</div>}
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="mt-1 text-xs max-w-xs" style={{ color: 'var(--fg-muted)' }}>{description}</p>}
      {action && (
        <button onClick={action.onClick} className="mt-4 rounded-lg px-4 py-2 text-xs font-medium text-white" style={{ background: 'var(--primary)' }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
