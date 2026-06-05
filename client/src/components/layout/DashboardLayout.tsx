import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Armchair,
  CreditCard,
  User,
  Bell,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { LogoImage } from '@/components/LogoImage';
import { ThemeToggle } from '@/components/ThemeToggle';

export function DashboardLayout({ admin }: { admin?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const studentNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/booking', icon: Armchair, label: 'Book Seat' },
    { to: '/pricing', icon: CreditCard, label: 'Plans' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const adminNav = [
    { to: '/admin', icon: Shield, label: 'Overview' },
    { to: '/admin/students', icon: User, label: 'Students' },
    { to: '/admin/seats', icon: Armchair, label: 'Seats' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { to: '/admin/conflicts', icon: Bell, label: 'Conflicts' },
  ];

  const nav = admin ? adminNav : studentNav;

  return (
    <div className="min-h-screen bg-mesh">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col glass border-r border-brand-gold/10 p-6 lg:flex">
        <Logo size="sm" className="mb-8" />
        <nav className="flex-1 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300',
                location.pathname === item.to
                  ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <motion.aside
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          className="fixed inset-0 z-40 lg:hidden"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative h-full w-64 flex flex-col glass border-r border-brand-gold/10 p-6 overflow-y-auto">
            <div className="mb-8">
              <Logo size="sm" />
            </div>
            <nav className="space-y-1 mb-auto">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300',
                    location.pathname === item.to
                      ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <button
              onClick={() => {
                logout();
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors mt-4"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </motion.aside>
      )}

      <main className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-gold/10 glass px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-brand-gold p-2 hover:bg-brand-gold/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <p className="text-xs text-brand-gold/80 uppercase tracking-wider">
                {admin ? 'Admin Panel' : 'Student Portal'}
              </p>
              <h1 className="font-display text-lg font-semibold text-theme">{user?.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="lg:hidden">
              <LogoImage size="md" />
            </div>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
