'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  Menu, 
  X, 
  ArrowLeft, 
  ShieldCheck, 
  Layers, 
  MessageSquare, 
  CreditCard, 
  PhoneCall, 
  LogIn
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'النظام الأساسي', icon: Layers },
  { href: '/blueprints', label: 'قوالب التشغيل', icon: Layers },
  { href: '/whatsapp-assistant', label: 'مساعد واتساب الذكي', icon: MessageSquare },
  { href: '/security', label: 'الأمان والخصوصية', icon: ShieldCheck },
  { href: '/pricing', label: 'الأسعار', icon: CreditCard },
  { href: '/contact', label: 'تواصل معنا', icon: PhoneCall },
];

export function MarketingNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-slate-950/20'
          : 'bg-slate-950 border-b border-slate-800/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-white font-sans">
                  Hum<span className="text-teal-400">Ai</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                منظومة إدارة الموارد البشرية الذكية
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/contact"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span>تسجيل الدخول</span>
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 text-sm font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 rounded-xl shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 flex items-center gap-2"
            >
              <span>ابدأ تجربتك المجانية</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/contact"
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 rounded-lg"
            >
              تجربة مجانية
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-teal-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-900 rounded-xl"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span>تسجيل الدخول</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl shadow-md"
            >
              <span>ابدأ تجربتك المجانية</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
