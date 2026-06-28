import { fmtDateTime } from '@/api/mappers';
import type { UiActivityEvent } from '@/types/ui';

export function ActivityTimeline({ events }: { events: UiActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand/15 bg-brand-muted/30 px-4 py-8 text-center text-sm text-brand/60">
        No activity yet for this application.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((ev, i) => (
        <div key={ev.id} className="relative pl-7 pb-5 last:pb-0">
          {i < events.length - 1 && (
            <div className="absolute left-[7px] top-4 bottom-0 w-px bg-brand/20" />
          )}
          <div
            className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: ev.dot }}
          />
          <div className="text-sm leading-snug">
            <span className="font-medium text-brand">{ev.actor}</span>
            <span className="text-brand/60"> {ev.label}</span>
          </div>
          <div className="mt-1 text-[11px] text-brand/40 font-mono">
            {fmtDateTime(ev.ts)}
          </div>
          {ev.comment && (
            <div className="mt-2 rounded-lg border border-brand/10 bg-brand-muted/30 px-3 py-2 text-sm text-brand/70 leading-relaxed">
              {ev.comment}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
