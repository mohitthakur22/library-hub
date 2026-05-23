import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Armchair, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

export function AdminOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
  });

  const { data: revenue } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => api.get('/admin/revenue?period=monthly').then((r) => r.data),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  const cards = [
    { icon: Users, label: 'Total Students', value: stats?.totalStudents, color: 'text-neon-blue' },
    { icon: Armchair, label: 'Active Seats', value: `${stats?.activeSeats}/${stats?.totalSeats}`, color: 'text-neon-violet' },
    { icon: DollarSign, label: 'Revenue (Month)', value: formatCurrency(stats?.revenueThisMonth || 0), color: 'text-emerald-400' },
    { icon: Clock, label: 'Pending Payments', value: stats?.pendingPayments, color: 'text-amber-400' },
    { icon: AlertTriangle, label: 'Open Conflicts', value: stats?.openConflicts, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Admin Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <c.icon className={`h-8 w-8 ${c.color} mb-2`} />
              <p className="text-sm text-slate-400">{c.label}</p>
              <p className="text-2xl font-bold">{c.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card glow className="h-80">
        <h2 className="font-display font-semibold mb-4">Revenue Analytics</h2>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={revenue || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: '#12121f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
              }}
            />
            <Bar dataKey="amount" fill="url(#gradient)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h2 className="font-display font-semibold mb-4">Broadcast Notification</h2>
        <BroadcastForm />
      </Card>
    </div>
  );
}

function BroadcastForm() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const send = async () => {
    await api.post('/notifications/broadcast', { title, message });
    alert('Broadcast sent!');
    setTitle('');
    setMessage('');
  };

  return (
    <div className="flex flex-wrap gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="flex-1 min-w-[200px] h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm"
      />
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
        className="flex-[2] min-w-[200px] h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm"
      />
      <button
        onClick={send}
        className="h-11 px-6 rounded-xl bg-gradient-to-r from-neon-blue to-neon-violet font-semibold text-sm"
      >
        Send to All
      </button>
    </div>
  );
}
