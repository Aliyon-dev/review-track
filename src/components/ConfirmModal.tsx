import styles from './ConfirmModal.module.css';

export interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmLabel: string;
  showComment?: boolean;
  commentLabel?: string;
  comment?: string;
  requireComment?: boolean;
  onCommentChange?: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  showComment,
  commentLabel,
  comment,
  onCommentChange,
  onConfirm,
  onCancel,
}: ConfirmModalConfig) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        {showComment && (
          <label className="mono-label" style={{ display: 'block', marginBottom: 8 }}>
            {commentLabel}
            <textarea
              className="field-input"
              rows={3}
              placeholder="Type your note…"
              value={comment ?? ''}
              onChange={(e) => onCommentChange?.(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </label>
        )}
        <div className={styles.actions}>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
