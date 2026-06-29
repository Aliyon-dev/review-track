import { Button } from './button';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  confirmLoading?: boolean;
  showComment?: boolean;
  commentLabel?: string;
  comment?: string;
  onCommentChange?: (value: string) => void;
}

export function Dialog({
  open,
  onClose,
  title,
  message,
  confirmLabel,
  onConfirm,
  confirmLoading,
  showComment,
  commentLabel,
  comment,
  onCommentChange,
}: DialogProps) {
  if (!open) return null;

  const handleOverlayClick = () => {
    if (!confirmLoading) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand/40 p-4 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-brand/10 bg-white p-6 shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-brand font-serif tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm text-brand/60 leading-relaxed">{message}</p>
        {showComment && (
          <div className="mt-4">
            <label className="block text-[10.5px] font-medium uppercase tracking-wider text-brand/50 font-mono mb-2">
              {commentLabel}
            </label>
            <textarea
              className="w-full rounded-lg border border-brand/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-y min-h-[80px] disabled:opacity-50"
              rows={3}
              placeholder="Type your note…"
              value={comment ?? ''}
              onChange={(e) => onCommentChange?.(e.target.value)}
              disabled={confirmLoading}
            />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={confirmLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} loading={confirmLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
