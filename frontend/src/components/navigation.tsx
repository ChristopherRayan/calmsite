// Simplified navigation for restaurant information website
'use client';

import {
  Menu,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { resolvedTheme, toggleTheme } = useTheme();
  const isHome = pathname === '/';
  const isTransparentNav = isHome && !isScrolled;

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 60);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('mobile-nav-open', mobileOpen);
    return () => {
      document.body.classList.remove('mobile-nav-open');
    };
  }, [mobileOpen]);

  function isActive(path: string) {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  }

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
        isTransparentNav
          ? 'border-b border-transparent bg-transparent'
          : 'border-b border-woodAccent/20 dark:border-woodAccent/20 bg-gradient-to-b from-cream/95 to-cream/85 dark:from-[#0a0604] dark:to-[#0a0604] backdrop-blur-md'
      )}
    >
      <nav className="page-shell flex h-14 items-center justify-between" aria-label="Main">
        <Link
          href="/"
          className={cn(
            'font-heading text-xl font-bold uppercase tracking-[0.14em]',
            isTransparentNav ? 'text-white' : 'text-woodAccent dark:text-woodAccent'
          )}
        >
          <span className={cn(isTransparentNav ? 'text-white/90' : 'text-ink dark:text-ink/80')}>The</span> CalmTable
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'relative text-[11px] font-medium uppercase tracking-[0.18em] hover:text-woodAccent dark:hover:text-woodAccent/80',
                  isTransparentNav ? 'text-white/80' : 'text-ink dark:text-ink/80',
                  isActive(link.href) && 'text-woodAccent'
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-woodAccent" aria-hidden />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-1 md:flex">
          <button
            type="button"
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full border border-woodAccent/35 dark:border-woodAccent/35 hover:bg-woodAccent/10 dark:hover:bg-[#2a1810]/60',
              isTransparentNav ? 'text-white' : 'text-woodAccent dark:text-woodAccent'
            )}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <button
          type="button"
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-full border border-woodAccent/35 dark:border-woodAccent/35 md:hidden',
            isTransparentNav ? 'text-white' : 'text-woodAccent dark:text-woodAccent'
          )}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((current) => !current)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-woodAccent/20 dark:border-woodAccent/20 bg-cream dark:bg-[#0a0604] md:hidden"
          >
            <ul className="page-shell flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block rounded-lg px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]',
                      isActive(link.href)
                        ? 'bg-woodAccent/18 dark:bg-[#2a1810]/70 text-woodAccent dark:text-woodAccent'
                        : 'text-ink/80 dark:text-ink/70 hover:bg-woodAccent/10 dark:hover:bg-[#2a1810]/60'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-woodAccent/25 dark:border-woodAccent/35 px-3 py-2 text-woodAccent dark:text-woodAccent"
                  onClick={() => {
                    toggleTheme();
                    setMobileOpen(false);
                  }}
                >
                  {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  <span className="ml-2 text-xs uppercase tracking-[0.1em]">Theme</span>
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
