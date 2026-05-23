import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';

export function AdminPayments() {
  const queryClient = useQueryClient();
  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => api.get('/payments').then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/payments/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-payments'] }),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Payment Tracking</h1>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400">
              <th className="text-left py-3">Student</th>
              <th className="text-left py-3">Invoice</th>
              <th className="text-left py-3">Amount</th>
              <th className="text-left py-3">Due</th>
              <th className="text-left py-3">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((p: {
              id: string;
              invoiceNumber: string;
              amount: number;
              dueDate: string;
              status: string;
              user: { name: string; email: string };
            }) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="py-3">
                  <p className="font-medium">{p.user.name}</p>
                  <p className="text-xs text-slate-500">{p.user.email}</p>
                </td>
                <td className="py-3">{p.invoiceNumber}</td>
                <td className="py-3 font-bold">{formatCurrency(p.amount)}</td>
                <td className="py-3 text-slate-400">{formatDate(p.dueDate)}</td>
                <td className="py-3">
                  <Badge status={p.status} />
                </td>
                <td className="py-3 flex gap-2">
                  {p.status !== 'PAID' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus.mutate({ id: p.id, status: 'PAID' })}
                    >
                      Mark Paid
                    </Button>
                  )}
                  {p.status === 'PENDING' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => updateStatus.mutate({ id: p.id, status: 'OVERDUE' })}
                    >
                      Overdue
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
