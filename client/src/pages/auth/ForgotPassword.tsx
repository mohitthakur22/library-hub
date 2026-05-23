import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendOtp = async () => {
    const res = await api.post('/auth/forgot-password', { email });
    if (res.data.otp) setDevOtp(res.data.otp);
    setStep('reset');
    setMessage('OTP sent (check dev console in demo)');
  };

  const reset = async () => {
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setMessage('Password reset! You can login now.');
      setError('');
    } catch {
      setError('Invalid OTP or password');
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
        <Card glow>
          <h1 className="font-display text-xl font-bold mb-6">Reset password</h1>
          {step === 'email' ? (
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              </div>
              <Button className="w-full" onClick={sendOtp}>
                Send OTP
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {devOtp && <p className="text-xs text-neon-cyan">Dev OTP: {devOtp}</p>}
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP" />
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                placeholder="New password"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {message && <p className="text-emerald-400 text-sm">{message}</p>}
              <Button className="w-full" onClick={reset}>
                Reset Password
              </Button>
            </div>
          )}
          <Link to="/auth/login" className="block text-center text-sm text-brand-gold mt-6 hover:underline">
            Back to login
          </Link>
        </Card>
      </motion.div>
    </div>
  );
}
