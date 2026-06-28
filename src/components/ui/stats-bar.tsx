import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export function StatsBar({ items, className }: { items: StatItem[]; className?: string }) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-wrap items-center rounded-xl border border-brand/10 bg-white shadow-sm',
        className,
      )}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            'flex flex-1 min-w-[140px] items-center gap-4 px-6 py-5',
            i > 0 && 'border-l border-brand/10',
          )}
        >
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              item.iconBg,
            )}
          >
            <item.icon className={cn('h-4 w-4', item.iconColor)} />
          </div>
          <div>
            <div className="font-serif text-2xl font-semibold text-brand">
              {item.value}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-brand/40 font-mono">
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
