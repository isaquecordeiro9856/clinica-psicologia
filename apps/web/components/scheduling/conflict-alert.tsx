'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConflictAlertProps {
  message: string;
  className?: string;
}

export function ConflictAlert({ message, className }: ConflictAlertProps) {
  return (
    <div className={cn(
      'flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700',
      className,
    )}>
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
