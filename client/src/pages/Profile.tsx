import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { User, CreditCard } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Payment } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';

export function Profile() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    collegeId: user?.collegeId || '',
    photo: user?.photo || '',
  });

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get<Payment[]>('/payments/my').then((r) => r.data),
  });

  const updateProfile = useMutation({
    mutationFn: () => api.patch('/users/profile', form),
    onSuccess: (res) => {
      setUser(res.data);
      alert('Profile updated!');
    },
  });

  const payNow = useMutation({
    mutationFn: (id: string) => api.post(`/payments/${id}/pay`, { method: 'demo' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Profile</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card glow>
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-neon-blue" />
            <h2 className="font-display font-semibold">Personal Details</h2>
          </div>
          <div className="space-y-4">
            {(['name', 'phone', 'collegeId', 'photo'] as const).map((field) => (
              <div key={field}>
                <Label>{field === 'photo' ? 'Photo URL' : field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                <Input
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
              </div>
            ))}
            <p className="text-xs text-slate-500">Email: {user?.email} (cannot change)</p>
            <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
              Save Changes
            </Button>
          </div>
        </Card>

        <Card glow className="flex flex-col items-center justify-center text-center">
          <h2 className="font-display font-semibold mb-4">Check-in QR Code</h2>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-white rounded-2xl"
          >
            <QRCodeSVG value={user?.id || ''} size={180} />
          </motion.div>
          <p className="text-sm text-slate-400 mt-4">Show this at the library entrance</p>
          <p className="text-xs text-slate-500 mt-1">{user?.name}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="h-5 w-5 text-neon-violet" />
          <h2 className="font-display font-semibold">Payment History</h2>
        </div>
        {isLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <div className="space-y-3">
            {payments?.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/5"
              >
                <div>
                  <p className="font-medium">{p.invoiceNumber}</p>
                  <p className="text-sm text-slate-500">
                    Due {formatDate(p.dueDate)}
                    {p.paidAt && ` · Paid ${formatDate(p.paidAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{formatCurrency(p.amount)}</span>
                  <Badge status={p.status} />
                  {p.status === 'PENDING' && (
                    <Button size="sm" onClick={() => payNow.mutate(p.id)}>
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!payments?.length && (
              <p className="text-slate-500 text-sm">No payment history yet</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
