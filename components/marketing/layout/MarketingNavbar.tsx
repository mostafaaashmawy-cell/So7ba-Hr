'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X } from 'lucide-react';
import type { SiteDictionary } from '@/lib/i18n/types';

export function MarketingNavbar({ dict }: { dict: SiteDictionary }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const switchLocale = dict.locale === 'ar' ? 'en' : 'ar';
  // Replace /ar or /en prefix in current path
  const switchHref = pathname.replace(/^\/(ar|en)/, `/${switchLocale}`);

  const homeHref = dict.locale === 'ar' ? '/ar' : '/en';
  const ctaHref = dict.locale === 'ar' ? '/ar/contact' : '/en/contact';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#05070D]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/40 py-3'
          : 'bg-transparent py-5'
      }`}
      dir={dict.dir}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href={homeHref} className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-white">Hum</span>
                <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">Ai</span>
              </span>
              <span className="text-[10px] text-[#4B5567] font-medium tracking-wide hidden sm:block">
                {dict.nav.logoTagline}
              </span>
            </div>
          </Link>

          {/* Desktop Nav — pill shaped */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#0D1117]/80 backdrop-blur-md border border-white/[0.06] rounded-full p-1.5">
            {dict.nav.links.map((link) => {
              const isActive = pathname === link.href || (link.href !== homeHref && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400/10 to-violet-500/10 text-cyan-400 border border-cyan-400/20'
                      : 'text-[#94A3B8] hover:text-white border border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Language Switcher */}
            <Link
              href={switchHref}
              className="border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold px-3 py-1.5 rounded-lg text-white transition-colors"
              aria-label={dict.locale === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              {dict.locale === 'ar' ? 'EN' : 'AR'}
            </Link>

            <Link
              href={ctaHref}
              className="btn-gradient px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md shadow-cyan-500/20 glow-pulse"
            >
              {dict.nav.cta}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Language Switcher */}
            <Link
              href={switchHref}
              className="border border-white/10 bg-white/5 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white"
            >
              {dict.locale === 'ar' ? 'EN' : 'AR'}
            </Link>
            <button
              className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/5"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 bg-[#05070D]/95 backdrop-blur-xl border-b border-white/[0.06] overflow-hidden md:hidden shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col gap-1" dir={dict.dir}>
              {dict.nav.links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-400/10 to-violet-500/10 text-cyan-400 border border-cyan-400/20'
                        : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="h-px bg-white/[0.06] my-3" />
              <Link
                href={ctaHref}
                onClick={() => setMobileMenuOpen(false)}
                className="btn-gradient w-full text-center py-3 rounded-xl text-sm font-bold text-white shadow-lg"
              >
                {dict.nav.cta}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
