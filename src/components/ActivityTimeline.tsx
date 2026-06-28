import { fmtDateTime } from '@/api/mappers';
import type { UiActivityEvent } from '@/types/ui';
import styles from './ActivityTimeline.module.css';

export function ActivityTimeline({ events }: { events: UiActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <div className={styles.empty}>No activity yet for this application.</div>
    );
  }

  return (
    <div className={styles.timeline}>
      {events.map((ev) => (
        <div key={ev.id} className={styles.item}>
          <div
            className={styles.dot}
            style={{
              background: ev.dot,
              boxShadow: `0 0 0 1px ${ev.dot}`,
            }}
          />
          <div className={styles.content}>
            <div className={styles.line}>
              <span className={styles.actor}>{ev.actor}</span>
              <span className={styles.label}> {ev.label}</span>
            </div>
            <div className={styles.meta}>{fmtDateTime(ev.ts)}</div>
            {ev.comment && (
              <div className={styles.comment}>{ev.comment}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
