import { cn } from '@/lib/cn';

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'block text-[10.5px] font-medium uppercase tracking-wider text-brand/50 font-mono mb-2',
        className,
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-brand/15 bg-white px-3 py-2.5 text-sm text-brand outline-none transition-shadow placeholder:text-brand/40 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-canvas disabled:text-brand/50',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-brand/15 bg-white px-3 py-2.5 text-sm text-brand outline-none transition-shadow placeholder:text-brand/40 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-canvas resize-y min-h-[80px]',
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border border-brand/15 bg-white px-3 py-2.5 text-sm text-brand outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-canvas',
        className,
      )}
      {...props}
    />
  );
}
