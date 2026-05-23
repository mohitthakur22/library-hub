import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminStudents() {
  const queryClient = useQueryClient();
  const { data: students, isLoading } = useQuery({
    queryKey: ['admin-students'],
    queryFn: () => api.get('/admin/students').then((r) => r.data),
  });

  const toggleBlock = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      api.patch(`/admin/students/${id}`, { isBlocked: !isBlocked }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-students'] }),
  });

  const addStudent = async () => {
    const name = prompt('Name:');
    const email = prompt('Email:');
    const phone = prompt('Phone:');
    const collegeId = prompt('College ID:');
    if (name && email && phone) {
      await api.post('/admin/students', { name, email, phone, collegeId });
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    }
  };

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-2xl font-bold">Student Management</h1>
        <Button onClick={addStudent}>Add Student</Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400">
              <th className="text-left py-3">Name</th>
              <th className="text-left py-3">Email</th>
              <th className="text-left py-3">Plan</th>
              <th className="text-left py-3">Seat</th>
              <th className="text-left py-3">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students?.map((s: {
              id: string;
              name: string;
              email: string;
              isBlocked: boolean;
              subscriptions: { plan: { name: string }; seat?: { number: string } }[];
            }) => (
              <tr key={s.id} className="border-b border-white/5">
                <td className="py-3 font-medium">{s.name}</td>
                <td className="py-3 text-slate-400">{s.email}</td>
                <td className="py-3">{s.subscriptions[0]?.plan.name || '—'}</td>
                <td className="py-3">{s.subscriptions[0]?.seat?.number || '—'}</td>
                <td className="py-3">
                  <Badge status={s.isBlocked ? 'OVERDUE' : 'ACTIVE'} />
                </td>
                <td className="py-3">
                  <Button
                    size="sm"
                    variant={s.isBlocked ? 'default' : 'danger'}
                    onClick={() => toggleBlock.mutate({ id: s.id, isBlocked: s.isBlocked })}
                  >
                    {s.isBlocked ? 'Unblock' : 'Block'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
