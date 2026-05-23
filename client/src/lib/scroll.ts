const NAV_OFFSET = 88;

export function scrollToSection(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (!el) return false;

  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  return true;
}

export function parseHashLink(to: string): string | null {
  const match = to.match(/^\/#([\w-]+)$/);
  return match ? match[1] : null;
}
