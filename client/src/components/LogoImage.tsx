import { cn } from '@/lib/utils';

/** Logo with white/cream background removed via blend mode on dark UI */
export function LogoImage({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
}) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
    hero: 'h-28 w-28 md:h-36 md:w-36',
  };

  return (
    <div className={cn('relative inline-flex shrink-0', sizes[size], className)}>
      <img
        src="/logo.png"
        alt=""
        aria-hidden
        className="logo-knockout h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(245,197,24,0.25)]"
      />
    </div>
  );
}
