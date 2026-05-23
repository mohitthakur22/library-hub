import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { VerifyOtp } from '@/pages/auth/VerifyOtp';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { Dashboard } from '@/pages/Dashboard';
import { Booking } from '@/pages/Booking';
import { Pricing } from '@/pages/Pricing';
import { Profile } from '@/pages/Profile';
import { AdminOverview } from '@/pages/admin/AdminOverview';
import { AdminStudents } from '@/pages/admin/AdminStudents';
import { AdminSeats } from '@/pages/admin/AdminSeats';
import { AdminPayments } from '@/pages/admin/AdminPayments';
import { AdminConflicts } from '@/pages/admin/AdminConflicts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ScrollToHash } from '@/components/ScrollToHash';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
});

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />

          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/verify-otp" element={<VerifyOtp />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route
            element={
              <ProtectedRoute adminOnly>
                <DashboardLayout admin />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/seats" element={<AdminSeats />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/conflicts" element={<AdminConflicts />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToHash />
        <AnimatedRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
