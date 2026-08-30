'use client';

import { useEffect, useState } from 'react';

export function CurrentTimeIndicator() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const topPercent = ((hours - 7) * 60 + minutes) / (12 * 60) * 100;

  if (hours < 7 || hours > 19) return null;

  return (
    <div
      className="absolute left-0 right-0 z-10 pointer-events-none"
      style={{ top: `${topPercent}%` }}
    >
      <div className="flex items-center">
        <div className="h-2 w-2 rounded-full bg-destructive -ml-1" />
        <div className="flex-1 h-[1.5px] bg-destructive/80" />
      </div>
    </div>
  );
}
