'use client';

import { cn } from '@/lib/utils';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selected?: string;
  onSelect: (time: string) => void;
}

export function TimeSlotPicker({ slots, selected, onSelect }: TimeSlotPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
      {slots.map((slot) => (
        <button
          key={slot.time}
          type="button"
          disabled={!slot.available}
          onClick={() => onSelect(slot.time)}
          className={cn(
            'rounded-md border px-2 py-1.5 text-[12px] font-medium transition-all',
            !slot.available && 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 line-through opacity-50',
            slot.available && selected !== slot.time && 'border-neutral-300 bg-white text-neutral-900 hover:border-sky-400 hover:bg-sky-50',
            slot.available && selected === slot.time && 'border-sky-500 bg-sky-500 text-white shadow-sm',
          )}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}
