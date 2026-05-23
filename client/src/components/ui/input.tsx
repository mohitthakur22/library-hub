import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-xl border border-brand-gold/20 bg-brand-navy/40 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/25 transition-all duration-300',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';
