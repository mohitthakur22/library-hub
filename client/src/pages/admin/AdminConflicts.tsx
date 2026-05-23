import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminConflicts() {
  const queryClient = useQueryClient();
  const { data: conflicts, isLoading } = useQuery({
    queryKey: ['admin-conflicts'],
    queryFn: () => api.get('/admin/conflicts').then((r) => r.data),
  });

  const resolve = useMutation({
    mutationFn: ({ id, winnerId, resolution }: { id: string; winnerId: string; resolution: string }) =>
      api.post(`/admin/conflicts/${id}/resolve`, { winnerId, resolution }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-conflicts'] }),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Conflict Resolution</h1>
      <p className="text-slate-400">Overlapping seat bookings requiring manual override</p>

      <div className="space-y-4">
        {conflicts?.length ? (
          conflicts.map((c: {
            id: string;
            seatNumber: string;
            userName1: string;
            userName2: string;
            userId1: string;
            userId2: string;
            date: string;
          }) => (
            <Card key={c.id} className="border-red-500/20">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="font-bold text-red-400">Seat {c.seatNumber} Conflict</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {format(new Date(c.date), 'PPP')}
                  </p>
                  <p className="mt-2">
                    <span className="text-neon-blue">{c.userName1}</span>
                    {' vs '}
                    <span className="text-neon-violet">{c.userName2}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      resolve.mutate({
                        id: c.id,
                        winnerId: c.userId1,
                        resolution: `Assigned to ${c.userName1}`,
                      })
                    }
                  >
                    Award {c.userName1.split(' ')[0]}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      resolve.mutate({
                        id: c.id,
                        winnerId: c.userId2,
                        resolution: `Assigned to ${c.userName2}`,
                      })
                    }
                  >
                    Award {c.userName2.split(' ')[0]}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12 text-slate-500">
            No open conflicts — all clear!
          </Card>
        )}
      </div>
    </div>
  );
}
