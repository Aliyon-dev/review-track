import { cn } from '@/lib/cn';

const variants = {
  primary:
    'bg-brand text-white hover:bg-brand-hover border border-brand shadow-sm',
  secondary:
    'bg-white text-brand hover:bg-brand-muted/50 border border-brand/15 shadow-sm',
  ghost:
    'bg-transparent text-brand/60 hover:text-brand hover:bg-brand-muted/50 border border-transparent',
  danger:
    'bg-white text-red-700 hover:bg-red-50 border border-brand/15 hover:border-red-200',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
