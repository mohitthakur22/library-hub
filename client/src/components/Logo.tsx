import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LogoImage } from '@/components/LogoImage';

export function Logo({
  className,
  size = 'md',
  link = true,
  showText = true,
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  link?: boolean;
  showText?: boolean;
}) {
  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const content = (
    <motion.div
      className={cn('flex items-center gap-3', className)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <LogoImage size={size} />
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn('font-display font-bold tracking-tight gradient-text', textSizes[size])}>
            Aspirants
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-semibold">
            Library
          </span>
        </div>
      )}
    </motion.div>
  );

  if (link) {
    return <Link to="/">{content}</Link>;
  }
  return content;
}
