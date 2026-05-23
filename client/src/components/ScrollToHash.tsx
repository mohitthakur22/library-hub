import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSection } from '@/lib/scroll';

/** Scrolls to #section when landing on home page with a hash (or after navigation). */
export function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname !== '/' || !hash) return;

    const id = hash.replace('#', '');
    const run = () => scrollToSection(id);

    // Wait for route transition / layout paint
    const t = window.setTimeout(run, 50);
    return () => window.clearTimeout(t);
  }, [pathname, hash]);

  return null;
}
