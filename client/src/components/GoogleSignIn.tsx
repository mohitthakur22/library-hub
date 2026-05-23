import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import api, { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

interface GoogleJwtPayload {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export function GoogleSignIn() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSuccess = async (response: CredentialResponse) => {
    setError('');
    if (!response.credential) {
      setError('Google did not return a credential');
      return;
    }

    try {
      const payload = jwtDecode<GoogleJwtPayload>(response.credential);
      const res = await api.post('/auth/google', {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        photo: payload.picture,
      });
      setAuth(res.data.token, res.data.user);
      navigate(res.data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Google sign-in failed'));
    }
  };

  if (!clientId) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-center text-amber-400/90 bg-amber-500/10 rounded-lg px-3 py-2">
          Google Sign-In needs <code className="text-brand-gold">VITE_GOOGLE_CLIENT_ID</code> in{' '}
          <code className="text-brand-gold">client/.env</code>. Use email/password or demo account below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => setError('Google sign-in was cancelled or failed')}
        theme="filled_black"
        size="large"
        width="100%"
        text="continue_with"
        shape="pill"
      />
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
    </div>
  );
}
