import { cn } from '@/lib/utils';

const colors: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  BOOKED: 'bg-red-500/20 text-red-400 border-red-500/30',
  OCCUPIED_TODAY: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  MAINTENANCE: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  OVERDUE: 'bg-red-500/20 text-red-400 border-red-500/30',
  ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export function Badge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colors[status] || 'bg-white/10 text-slate-300 border-white/20',
        className
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
