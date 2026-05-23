import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function ProtectedRoute({
  children,
  adminOnly,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { token, user } = useAuthStore();

  if (!token) return <Navigate to="/auth/login" replace />;
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  if (!adminOnly && user?.role === 'ADMIN') return <Navigate to="/admin" replace />;

  return <>{children}</>;
}
