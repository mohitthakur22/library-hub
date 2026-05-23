import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Seat } from '@/types';
import { SeatMap } from '@/components/SeatMap';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminSeats() {
  const queryClient = useQueryClient();
  const { data: seats, isLoading } = useQuery({
    queryKey: ['seats', 'today'],
    queryFn: () => api.get<Seat[]>('/seats').then((r) => r.data),
  });

  const setMaintenance = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/seats/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seats'] }),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Seat Management</h1>
      <p className="text-slate-400">Click a seat below to toggle maintenance mode</p>

      {seats && (
        <SeatMap
          seats={seats}
          onSelect={(seat) => {
            const newStatus = seat.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
            setMaintenance.mutate({ id: seat.id, status: newStatus });
          }}
        />
      )}

      <Card>
        <h2 className="font-semibold mb-4">Occupancy Summary</h2>
        <div className="grid grid-cols-4 gap-4 text-center">
          {['AVAILABLE', 'BOOKED', 'OCCUPIED_TODAY', 'MAINTENANCE'].map((status) => (
            <div key={status} className="p-4 rounded-xl bg-white/5">
              <p className="text-2xl font-bold">
                {seats?.filter((s) => (s.displayStatus || s.status) === status).length || 0}
              </p>
              <p className="text-xs text-slate-500">{status.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
