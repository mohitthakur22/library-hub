import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Seat } from '@/types';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/80 hover:bg-emerald-400 border-emerald-400/50',
  BOOKED: 'bg-red-500/80 border-red-400/50 cursor-not-allowed',
  OCCUPIED_TODAY: 'bg-amber-500/80 border-amber-400/50',
  MAINTENANCE: 'bg-slate-600/80 border-slate-500/50 cursor-not-allowed',
};

interface SeatMapProps {
  seats: Seat[];
  selectedId?: string;
  onSelect?: (seat: Seat) => void;
  readonly?: boolean;
}

export function SeatMap({ seats, selectedId, onSelect, readonly }: SeatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<Seat | null>(null);

  const maxRow = Math.max(...seats.map((s) => s.row), 1);
  const maxCol = Math.max(...seats.map((s) => s.col), 1);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-seat]')) return;
    setDragging(true);
    setStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - start.x, y: e.clientY - start.y });
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        {[
          { c: 'bg-emerald-500', l: 'Available' },
          { c: 'bg-red-500', l: 'Booked (Fixed)' },
          { c: 'bg-amber-500', l: 'Rotational (Today)' },
          { c: 'bg-slate-500', l: 'Maintenance' },
        ].map((x) => (
          <span key={x.l} className="flex items-center gap-2">
            <span className={cn('h-3 w-3 rounded', x.c)} />
            {x.l}
          </span>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl glass p-8 cursor-grab active:cursor-grabbing"
        style={{ minHeight: 400 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <motion.div
          className="relative mx-auto"
          style={{
            width: maxCol * 72 + 40,
            height: maxRow * 72 + 80,
            transform: `translate(${offset.x}px, ${offset.y}px)`,
          }}
        >
          <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-lg bg-white/5 px-8 py-2 text-xs text-slate-500">
            ENTRANCE
          </div>

          {seats.map((seat) => {
            const status = seat.displayStatus || seat.status;
            const isSelected = selectedId === seat.id;
            return (
              <motion.button
                key={seat.id}
                data-seat
                type="button"
                disabled={readonly || status === 'MAINTENANCE' || status === 'BOOKED'}
                onClick={() => onSelect?.(seat)}
                onMouseEnter={() => setHovered(seat)}
                onMouseLeave={() => setHovered(null)}
                whileHover={{ scale: status === 'AVAILABLE' ? 1.1 : 1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'absolute flex h-14 w-14 flex-col items-center justify-center rounded-xl border-2 text-xs font-bold text-white shadow-lg transition-all',
                  statusColors[status] || statusColors.AVAILABLE,
                  isSelected && 'ring-2 ring-brand-gold ring-offset-2 ring-offset-surface'
                )}
                style={{
                  left: (seat.col - 1) * 72 + 20,
                  top: seat.row * 72 + 40,
                }}
              >
                {seat.number}
              </motion.button>
            );
          })}
        </motion.div>

        <p className="mt-4 text-center text-xs text-slate-500">Drag to explore the hall layout</p>
      </div>

      {hovered && (hovered.fixedHolder || hovered.todayBooking) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 glass rounded-xl p-4 flex items-center gap-3"
        >
          {(hovered.fixedHolder?.photo || hovered.todayBooking?.user.photo) && (
            <img
              src={hovered.fixedHolder?.photo || hovered.todayBooking?.user.photo}
              alt=""
              className="h-10 w-10 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">
              {hovered.fixedHolder?.name || hovered.todayBooking?.user.name}
            </p>
            <p className="text-xs text-slate-500">Seat {hovered.number}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
