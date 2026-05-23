import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import api from '@/lib/api';
import type { Seat, Plan } from '@/types';
import { SeatMap } from '@/components/SeatMap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';

export function Booking() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selected, setSelected] = useState<Seat | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingType, setBookingType] = useState<'FIXED' | 'ROTATIONAL' | 'DAY_PASS'>('ROTATIONAL');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  const { data: seats, isLoading } = useQuery({
    queryKey: ['seats', date],
    queryFn: () => api.get<Seat[]>(`/seats?date=${date}`).then((r) => r.data),
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => api.get<Plan[]>('/plans').then((r) => r.data),
    enabled: !!token,
  });

  const book = useMutation({
    mutationFn: () =>
      api.post('/seats/book', {
        seatId: selected!.id,
        date,
        type: bookingType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seats'] });
      setShowModal(false);
      setSelected(null);
      setError('');
      alert('Seat booked successfully!');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: string; conflict?: boolean } } };
      setError(e.response?.data?.error || 'Booking failed');
    },
  });

  const handleSelect = (seat: Seat) => {
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }
    const status = seat.displayStatus || seat.status;
    if (status === 'AVAILABLE' || status === 'OCCUPIED_TODAY') {
      setSelected(seat);
      setShowModal(true);
      setError('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Seat Booking</h1>
          <p className="text-slate-400">Interactive hall layout — click to select</p>
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-1">View availability for</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : seats ? (
        <SeatMap
          seats={seats}
          selectedId={selected?.id}
          onSelect={handleSelect}
          readonly={!token}
        />
      ) : null}

      <AnimatePresence>
        {showModal && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card glow>
                <h2 className="font-display text-xl font-bold mb-2">Confirm Booking</h2>
                <p className="text-slate-400 mb-4">
                  Seat <span className="text-white font-bold">{selected.number}</span> on{' '}
                  {format(new Date(date), 'PPP')}
                </p>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-400">Booking type</p>
                  {(['ROTATIONAL', 'FIXED', 'DAY_PASS'] as const).map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={bookingType === t}
                        onChange={() => setBookingType(t)}
                        className="accent-neon-blue"
                      />
                      <span className="text-sm">{t.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>

                {bookingType === 'FIXED' && plans && (
                  <p className="text-xs text-amber-400 mb-4">
                    Fixed seats require an active Fixed Seat subscription. Subscribe from Plans page first.
                  </p>
                )}

                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => book.mutate()}
                    disabled={book.isPending}
                  >
                    {book.isPending ? 'Booking...' : 'Confirm'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
