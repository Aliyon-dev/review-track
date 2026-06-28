import type { UiStatus } from '@/types/ui';
import styles from './StatusBadge.module.css';

const LABELS: Record<UiStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Changes Requested',
};

export function StatusBadge({ status }: { status: UiStatus }) {
  return (
    <span className={`${styles.chip} ${styles[status]}`}>
      <span className={`${styles.dot} ${styles[`dot_${status}`]}`} />
      {LABELS[status]}
    </span>
  );
}
