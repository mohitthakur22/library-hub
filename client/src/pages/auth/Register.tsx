import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Enter at least 10 digits').max(15),
  collegeId: z.string().min(3, 'College ID is required'),
});

type FormData = z.infer<typeof schema>;

export function Register() {
  const navigate = useNavigate();
  const [otpChannel, setOtpChannel] = useState<'email' | 'phone'>('email');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const phone = data.phone.replace(/\D/g, '').slice(-10);
    try {
      const res = await api.post('/auth/register', {
        ...data,
        phone,
        otpChannel,
      });

      navigate('/auth/verify-otp', {
        state: {
          email: data.email,
          phone,
          channel: otpChannel,
          devOtp: res.data.otp,
          emailPreviewUrl: res.data.emailPreviewUrl,
          message: res.data.message,
          showOtpInApp: res.data.showOtpInApp ?? !!res.data.otp,
        },
      });
    } catch (err: unknown) {
      setError('root', { message: getApiErrorMessage(err, 'Registration failed') });
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <Logo size="lg" link={false} />
        </div>

        <Card glow>
          <h1 className="font-display text-xl font-bold text-center mb-1 text-white">Create your account</h1>
          <p className="text-center text-sm text-slate-400 mb-6">Join Aspirants Library</p>

          <div className="mb-6">
            <Label className="mb-2 block">Receive OTP via</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'email' as const, icon: Mail, label: 'Email' },
                  { id: 'phone' as const, icon: Phone, label: 'Phone' },
                ] as const
              ).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOtpChannel(id)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-all',
                    otpChannel === id
                      ? 'border-brand-gold bg-brand-gold/15 text-brand-gold'
                      : 'border-white/10 text-slate-400 hover:border-brand-gold/30'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register('name')} placeholder="Your name" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="you@college.edu" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" {...register('phone')} placeholder="9876543210" />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <Label htmlFor="collegeId">College ID</Label>
              <Input id="collegeId" {...register('collegeId')} placeholder="COL2024001" />
              {errors.collegeId && (
                <p className="text-red-400 text-xs mt-1">{errors.collegeId.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} placeholder="••••••••" />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
            {errors.root && (
              <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{errors.root.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-brand-gold hover:underline font-medium">
              Login
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
