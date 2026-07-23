'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfile } from '@/lib/types/database';
import { LogOut, User, ShieldCheck, Briefcase, UserCheck, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/context/LanguageContext';

interface NavbarProps {
  user: UserProfile | null;
  activeRoleView?: 'employee' | 'manager' | 'super_admin';
}

export default function Navbar({ user, activeRoleView }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const { language, setLanguage, t } = useLanguage();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> {t('superAdmin')}
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Briefcase className="w-3.5 h-3.5" /> {t('teamView')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <UserCheck className="w-3.5 h-3.5" /> {t('brand')}
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-950/80 border-b border-gray-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-purple-500/20">
            S
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight gradient-text">
              {t('brand')}
            </div>
            <div className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
              {t('operations')}
            </div>
          </div>
        </Link>

        {/* Navigation Tabs based on Role */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800">
            <Link
              href="/dashboard/employee"
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeRoleView === 'employee'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              {t('myWorkspace')}
            </Link>

            {(user.role === 'manager' || user.role === 'super_admin') && (
              <Link
                href="/dashboard/manager"
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeRoleView === 'manager'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                {t('teamView')}
              </Link>
            )}

            {user.role === 'super_admin' && (
              <Link
                href="/dashboard/admin"
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeRoleView === 'super_admin'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                {t('superAdmin')}
              </Link>
            )}
          </nav>
        )}

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            title={language === 'en' ? 'Switch to Arabic' : 'تغيير للإنجليزية'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-all text-xs font-semibold"
          >
            <Globe className="w-4 h-4 text-purple-400" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-100 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" /> {user.full_name}
                </span>
                {getRoleBadge(user.role)}
              </div>

              <button
                onClick={handleSignOut}
                title={t('signOut')}
                className="p-2 rounded-xl bg-gray-900 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-800 hover:border-red-500/30 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="gradient-btn px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md"
            >
              {t('signIn')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
