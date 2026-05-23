import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Menu, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { parseHashLink, scrollToSection } from '@/lib/scroll';

type NavItem = { to: string; label: string };

function NavItemLink({
  item,
  className,
  onNavigate,
}: {
  item: NavItem;
  className: string;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const sectionId = parseHashLink(item.to);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!sectionId) return;

      e.preventDefault();
      onNavigate?.();

      if (location.pathname === '/') {
        scrollToSection(sectionId);
        window.history.replaceState(null, '', `#${sectionId}`);
      } else {
        navigate({ pathname: '/', hash: `#${sectionId}` });
      }
    },
    [sectionId, location.pathname, navigate, onNavigate]
  );

  if (sectionId) {
    return (
      <a href={`/#${sectionId}`} onClick={handleClick} className={className}>
        {item.label}
      </a>
    );
  }

  return (
    <Link to={item.to} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

export function Navbar() {
  const { user, logout, token } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links: NavItem[] = token
    ? user?.role === 'ADMIN'
      ? [
          { to: '/admin', label: 'Admin' },
          { to: '/booking', label: 'Seats' },
        ]
      : [
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/booking', label: 'Book Seat' },
          { to: '/pricing', label: 'Plans' },
          { to: '/profile', label: 'Profile' },
        ]
    : [
        { to: '/#features', label: 'Features' },
        { to: '/#how-it-works', label: 'How it works' },
        { to: '/#facilities', label: 'Facilities' },
        { to: '/pricing', label: 'Pricing' },
        { to: '/#faq', label: 'FAQ' },
      ];

  const closeMobile = () => setOpen(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-brand-gold/10"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Logo size="md" />

        <div className="hidden items-center gap-6 lg:gap-8 md:flex">
          {links.map((l) => (
            <NavItemLink
              key={l.to}
              item={l}
              className="text-sm text-theme-muted transition-colors hover:text-brand-gold"
            />
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />

          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <>
                <span className="text-sm text-theme-muted">
                  Hi, <span className="text-brand-gold">{user?.name?.split(' ')[0]}</span>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/auth/register')}>
                  Join Now
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden text-brand-gold p-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-brand-gold/10 px-4 py-4 md:hidden"
        >
          {links.map((l) => (
            <NavItemLink
              key={l.to}
              item={l}
              className="block py-2 text-theme-muted hover:text-brand-gold"
              onNavigate={closeMobile}
            />
          ))}
          {!token && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--divider)]">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/auth/login')}>
                Login
              </Button>
              <Button className="flex-1" onClick={() => navigate('/auth/register')}>
                Join
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}
