import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, ExternalLink, Copy, Check } from 'lucide-react';
import api, { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

type LocationState = {
  email?: string;
  phone?: string;
  channel?: 'email' | 'phone';
  devOtp?: string;
  emailPreviewUrl?: string;
  message?: string;
  showOtpInApp?: boolean;
};

export function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const state = (location.state as LocationState) || {};

  const [channel, setChannel] = useState<'email' | 'phone'>(state.channel || 'email');
  const [otp, setOtp] = useState(state.devOtp || '');
  const [displayOtp, setDisplayOtp] = useState(state.devOtp || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(state.message || '');
  const [previewUrl, setPreviewUrl] = useState(state.emailPreviewUrl || '');
  const [copied, setCopied] = useState(false);

  const email = state.email || '';
  const phone = state.phone || '';
  const showCodeBox = state.showOtpInApp || !!displayOtp;

  const verify = async () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', {
        email: channel === 'email' ? email : undefined,
        phone: channel === 'phone' ? phone : undefined,
        otp,
      });
      setAuth(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid or expired code'));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError('');
    try {
      const res = await api.post('/auth/resend-otp', {
        email: channel === 'email' ? email : undefined,
        phone: channel === 'phone' ? phone : undefined,
        channel,
      });
      if (res.data.otp) {
        setOtp(res.data.otp);
        setDisplayOtp(res.data.otp);
      }
      setInfo(res.data.message || 'Code resent!');
      if (res.data.emailPreviewUrl) setPreviewUrl(res.data.emailPreviewUrl);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not resend code'));
    }
  };

  const copyOtp = () => {
    if (displayOtp) {
      navigator.clipboard.writeText(displayOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!email && !phone) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
        <Card className="text-center max-w-md">
          <p className="text-slate-400 mb-4">No verification session. Please sign up first.</p>
          <Link to="/auth/register">
            <Button>Go to Sign Up</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <Logo size="md" link={false} />
        </div>

        <Card glow className="text-center">
          <h1 className="font-display text-xl font-bold mb-2 text-white">Verify your account</h1>
          <p className="text-sm text-slate-400 mb-2">Enter the 6-digit code</p>
          {channel === 'email' && (
            <p className="text-xs text-slate-500 mb-4 px-2">
              Real emails need SMTP in server/.env. Until then, use the code shown below or the test email link.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 mb-6">
            {(
              [
                { id: 'email' as const, icon: Mail, label: 'Email', value: email },
                { id: 'phone' as const, icon: Phone, label: 'Phone', value: phone },
              ] as const
            ).map(({ id, icon: Icon, label, value }) => (
              <button
                key={id}
                type="button"
                onClick={() => setChannel(id)}
                className={cn(
                  'rounded-xl border-2 p-3 text-left transition-all',
                  channel === id
                    ? 'border-brand-gold bg-brand-gold/10'
                    : 'border-white/10 hover:border-brand-gold/30'
                )}
              >
                <Icon className={cn('h-4 w-4 mb-1', channel === id ? 'text-brand-gold' : 'text-slate-500')} />
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-medium truncate text-white">{value || '—'}</p>
              </button>
            ))}
          </div>

          {info && (
            <p className="text-sm text-emerald-400 mb-4 bg-emerald-500/10 rounded-lg py-2 px-3">{info}</p>
          )}

          {showCodeBox && displayOtp && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/30"
            >
              <p className="text-xs text-brand-gold mb-2 font-medium">
                Your verification code (email delivery may be unavailable)
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-mono font-bold tracking-widest text-white">{displayOtp}</span>
                <button
                  type="button"
                  onClick={copyOtp}
                  className="p-2 rounded-lg hover:bg-white/10 text-brand-gold"
                  title="Copy code"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>
          )}

          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-gold hover:underline mb-4"
            >
              Open test email in browser <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="text-center text-3xl tracking-[0.5em] font-mono mb-4"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
          />

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <Button className="w-full mb-3" onClick={verify} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </Button>

          <button type="button" onClick={resend} className="text-sm text-brand-gold hover:underline">
            Resend code
          </button>

          <p className="mt-6 text-xs text-slate-500">
            <Link to="/auth/login" className="text-brand-gold hover:underline">
              Back to login
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
