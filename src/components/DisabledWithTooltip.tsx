import type { ReactNode } from 'react';
import { API_GAP_TOOLTIP } from '@/types/ui';
import styles from './DisabledWithTooltip.module.css';

interface DisabledWithTooltipProps {
  tooltip?: string;
  children: ReactNode;
  className?: string;
  block?: boolean;
}

export function DisabledWithTooltip({
  tooltip = API_GAP_TOOLTIP,
  children,
  className,
  block = false,
}: DisabledWithTooltipProps) {
  return (
    <span
      className={`${styles.wrap} ${block ? styles.block : ''} ${className ?? ''}`}
      title={tooltip}
      data-tooltip={tooltip}
    >
      <span className={styles.inner}>{children}</span>
    </span>
  );
}
