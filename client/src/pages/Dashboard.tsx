import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Armchair,
  Calendar,
  Flame,
  CreditCard,
  Bell,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import api from '@/lib/api';
import type { DashboardData } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils';

export function Dashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardData>('/users/dashboard').then((r) => r.data),
  });

  const checkIn = useMutation({
    mutationFn: () => api.post('/checkin', { seatId: data?.activeSubscription?.seat?.id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  const sub = data?.activeSubscription;
  const daysLeft = sub ? daysUntil(sub.endDate) : 0;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold mb-2">Your Dashboard</h1>
        <p className="text-slate-400">Track your seat, payments & study streak</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-brand-gold/10 to-transparent">
          <Armchair className="h-8 w-8 text-brand-gold mb-3" />
          <p className="text-sm text-slate-400">Current Seat</p>
          <p className="text-2xl font-bold">{sub?.seat?.number || '—'}</p>
          {sub && <Badge status={sub.plan.type} className="mt-2" />}
        </Card>

        <Card className="bg-gradient-to-br from-brand-navy-light/40 to-transparent">
          <Calendar className="h-8 w-8 text-brand-gold mb-3" />
          <p className="text-sm text-slate-400">Plan Expires</p>
          <p className="text-2xl font-bold">{daysLeft} days</p>
          <p className="text-xs text-slate-500 mt-1">{sub ? formatDate(sub.endDate) : 'No active plan'}</p>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent">
          <Flame className="h-8 w-8 text-amber-400 mb-3" />
          <p className="text-sm text-slate-400">Study Streak</p>
          <p className="text-2xl font-bold">{data?.streak || 0} days</p>
        </Card>

        <Card>
          <CreditCard className="h-8 w-8 text-neon-cyan mb-3" />
          <p className="text-sm text-slate-400">Next Payment</p>
          <p className="text-2xl font-bold">
            {data?.upcomingPayment ? formatCurrency(data.upcomingPayment.amount) : '—'}
          </p>
          {data?.upcomingPayment && (
            <Badge status={data.upcomingPayment.status} className="mt-2" />
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" glow>
          <h2 className="font-display font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/booking">
              <Button>
                <Armchair className="h-4 w-4" />
                Book Seat
              </Button>
            </Link>
            {sub && (
              <Button
                variant="outline"
                onClick={() =>
                  api.post(`/subscriptions/${sub.id}/extend`).then(() =>
                    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
                  )
                }
              >
                <RefreshCw className="h-4 w-4" />
                Extend Plan
              </Button>
            )}
            <Button
              variant="glass"
              onClick={() => checkIn.mutate()}
              disabled={checkIn.isPending}
            >
              Check In Today
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const subject = prompt('Issue subject:');
                const description = prompt('Describe the issue:');
                if (subject && description) {
                  api.post('/issues', { subject, description });
                  alert('Issue reported!');
                }
              }}
            >
              <AlertCircle className="h-4 w-4" />
              Report Issue
            </Button>
          </div>

          {sub && (
            <div className="mt-6 p-4 rounded-xl bg-white/5">
              <p className="text-sm text-slate-400">Active Plan</p>
              <p className="font-semibold">{sub.plan.name}</p>
              <p className="text-xs text-slate-500">
                {formatDate(sub.startDate)} — {formatDate(sub.endDate)}
              </p>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-brand-gold" />
            <h2 className="font-display font-semibold">Notifications</h2>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data?.notifications?.length ? (
              data.notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-lg bg-white/5 text-sm">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-slate-500 text-xs mt-1">{n.message}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No new notifications</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-display font-semibold mb-4">Recent Check-ins</h2>
        <div className="flex gap-2 flex-wrap">
          {data?.recentCheckIns?.map((c) => (
            <div
              key={c.id}
              className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs"
            >
              {formatDate(c.checkedAt)}
            </div>
          )) || <p className="text-slate-500 text-sm">No check-ins yet</p>}
        </div>
      </Card>
    </div>
  );
}
