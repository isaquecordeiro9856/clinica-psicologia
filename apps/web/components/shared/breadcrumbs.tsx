'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--fg-faint)' }}>
      <Link href="/" className="flex items-center gap-1 hover:underline" style={{ color: 'var(--fg-muted)' }}>
        <Home className="h-3 w-3" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {item.href ? (
            <Link href={item.href} className="hover:underline" style={{ color: 'var(--fg-muted)' }}>{item.label}</Link>
          ) : (
            <span className="font-medium" style={{ color: 'var(--fg)' }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
