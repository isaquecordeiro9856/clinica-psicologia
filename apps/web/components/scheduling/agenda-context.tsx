'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  startOfWeek as dfStartOfWeek,
  endOfWeek as dfEndOfWeek,
  startOfMonth as dfStartOfMonth,
  endOfMonth as dfEndOfMonth,
  addDays,
  addWeeks,
  addMonths,
  format,
  isToday as dfIsToday,
  isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewMode = 'month' | 'week' | 'day' | 'list';

interface AgendaContextValue {
  currentDate: Date;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  navigate: (direction: number) => void;
  goToToday: () => void;
  goTo: (date: Date) => void;
  formatDisplayDate: () => string;
  getVisibleRange: () => { from: Date; to: Date };
  refreshKey: number;
  refresh: () => void;
}

const AgendaContext = createContext<AgendaContextValue | null>(null);

export function useAgenda() {
  const ctx = useContext(AgendaContext);
  if (!ctx) throw new Error('useAgenda must be used within AgendaProvider');
  return ctx;
}

export { dfIsToday as isToday, isSameDay, format, addDays };

export function getStartOfWeek(date: Date): Date {
  return dfStartOfWeek(date, { weekStartsOn: 1 });
}

export function getEndOfWeek(date: Date): Date {
  return dfEndOfWeek(date, { weekStartsOn: 1 });
}

export function AgendaProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const navigate = useCallback((direction: number) => {
    setCurrentDate((prev) => {
      if (viewMode === 'month') return addMonths(prev, direction);
      if (viewMode === 'week') return addWeeks(prev, direction);
      return addDays(prev, direction);
    });
  }, [viewMode]);

  const goToToday = useCallback(() => setCurrentDate(new Date()), []);

  const goTo = useCallback((date: Date) => setCurrentDate(date), []);

  const formatDisplayDate = useCallback(() => {
    if (viewMode === 'month') {
      return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    }
    if (viewMode === 'week') {
      const start = getStartOfWeek(currentDate);
      const end = getEndOfWeek(currentDate);
      const startStr = format(start, "dd 'de' MMM", { locale: ptBR });
      const endStr = format(end, "dd 'de' MMM 'de' yyyy", { locale: ptBR });
      return `${startStr} — ${endStr}`;
    }
    return format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }, [currentDate, viewMode]);

  const getVisibleRange = useCallback(() => {
    if (viewMode === 'month') {
      return { from: dfStartOfMonth(currentDate), to: dfEndOfMonth(currentDate) };
    }
    if (viewMode === 'week') {
      return { from: getStartOfWeek(currentDate), to: getEndOfWeek(currentDate) };
    }
    const from = new Date(currentDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(currentDate);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }, [currentDate, viewMode]);

  return (
    <AgendaContext.Provider value={{
      currentDate,
      viewMode,
      setViewMode,
      navigate,
      goToToday,
      goTo,
      formatDisplayDate,
      getVisibleRange,
      refreshKey,
      refresh,
    }}>
      {children}
    </AgendaContext.Provider>
  );
}
