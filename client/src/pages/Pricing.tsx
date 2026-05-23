import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import type { Plan } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export function Pricing() {
  const { token } = useAuthStore();
  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => api.get<Plan[]>('/plans').then((r) => r.data),
  });

  const subscribe = useMutation({
    mutationFn: (planId: string) => api.post('/subscriptions/subscribe', { planId }),
    onSuccess: () => alert('Subscription created! Complete payment from dashboard.'),
  });

  const popular = 'ROTATIONAL';

  return (
    <div className="min-h-screen bg-surface bg-mesh">
      {!token && <Navbar />}
      <div className={`mx-auto max-w-7xl px-4 ${token ? '' : 'pt-24'} pb-24`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl font-bold gradient-text mb-4">Plans & Pricing</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Choose fixed for your own cubicle, or rotational for flexibility. Student combos save big.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans?.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  glow={plan.type === popular}
                  className={`h-full flex flex-col relative ${
                    plan.type === popular ? 'border-brand-gold/30' : ''
                  }`}
                >
                  {plan.type === popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-dark px-3 py-1 text-xs font-semibold">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                  <p className="text-3xl font-bold mt-2 gradient-text">
                    {formatCurrency(plan.price)}
                    <span className="text-sm text-slate-500 font-normal">
                      /{plan.durationDays}d
                    </span>
                  </p>
                  <p className="text-sm text-slate-400 mt-2 mb-6">{plan.description}</p>
                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features?.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {token ? (
                    <Button
                      className="w-full"
                      variant={plan.type === 'FIXED' ? 'default' : 'outline'}
                      onClick={() => {
                        if (plan.type === 'FIXED') {
                          window.location.href = '/booking';
                        } else {
                          subscribe.mutate(plan.id);
                        }
                      }}
                    >
                      {plan.type === 'FIXED' ? 'Select Seat & Subscribe' : 'Subscribe'}
                    </Button>
                  ) : (
                    <Link to="/auth/register">
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Card className="mt-16 overflow-x-auto">
          <h2 className="font-display text-xl font-bold mb-6">Feature Comparison</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 text-slate-400">Feature</th>
                <th className="py-3">Fixed</th>
                <th className="py-3">Rotational</th>
                <th className="py-3">Day Pass</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {[
                ['Dedicated cubicle', true, false, false],
                ['Any available seat', false, true, true],
                ['Locker access', true, false, false],
                ['Priority Wi-Fi', true, false, false],
                ['Flexible timing', false, true, true],
              ].map(([feature, fixed, rot, day]) => (
                <tr key={feature as string} className="border-b border-white/5">
                  <td className="py-3">{feature}</td>
                  <td className="text-center">{fixed ? '✓' : '—'}</td>
                  <td className="text-center">{rot ? '✓' : '—'}</td>
                  <td className="text-center">{day ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
