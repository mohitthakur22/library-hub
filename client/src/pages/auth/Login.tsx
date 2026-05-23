import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import api, { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { GoogleSignIn } from '@/components/GoogleSignIn';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.token, res.data.user);
      const from = (location.state as { from?: string })?.from;
      navigate(from || (res.data.user.role === 'ADMIN' ? '/admin' : '/dashboard'));
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { error?: string; needsOtp?: boolean; email?: string; phone?: string } };
      };
      if (axiosErr.response?.data?.needsOtp) {
        navigate('/auth/verify-otp', {
          state: {
            email: axiosErr.response.data.email,
            phone: axiosErr.response.data.phone,
            channel: 'email',
          },
        });
        return;
      }
      setError('root', { message: getApiErrorMessage(err, 'Login failed') });
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
          <h1 className="font-display text-xl font-bold text-center mb-6 text-white">Welcome back</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="you@college.edu" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            {errors.root && (
              <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{errors.root.message}</p>
            )}
            <div className="flex justify-end">
              <Link to="/auth/forgot-password" className="text-sm text-brand-gold hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-brand-navy px-2 text-slate-500">or</span>
            </div>
          </div>
          <GoogleSignIn />
          <p className="text-center text-sm text-slate-500 mt-6">
            New here?{' '}
            <Link to="/auth/register" className="text-brand-gold hover:underline font-medium">
              Create account
            </Link>
          </p>
          <p className="text-center text-xs text-slate-600 mt-4">
            Demo: student@demo.com / student123
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
