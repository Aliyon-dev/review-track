import { cn } from '@/lib/cn';

export function Avatar({
  children,
  size = 'md',
  className,
}: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'h-6 w-6 text-[9px]',
    md: 'h-8 w-8 text-[11px]',
    lg: 'h-14 w-14 text-lg',
  };

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border border-brand/10 bg-brand text-white font-mono font-medium',
        sizes[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
