import { Check, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/cn';

export function ToastStack() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 items-end max-sm:left-4 max-sm:right-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-center gap-3 rounded-lg px-4 py-3 text-sm shadow-lg animate-slide-up max-w-sm w-full sm:w-auto border',
            t.type === 'error'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-brand text-white border-brand-muted',
          )}
        >
          <span className="shrink-0">
            {t.type === 'error' ? (
              <X className="h-4 w-4" strokeWidth={2.5} />
            ) : (
              <Check className="h-4 w-4" strokeWidth={2.5} />
            )}
          </span>
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            className="shrink-0 text-white/60 hover:text-white"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
