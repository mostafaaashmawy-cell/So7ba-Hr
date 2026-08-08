'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { UserProfile } from '@/lib/types/database';
import { LogOut, User, ShieldCheck, Briefcase, UserCheck, Globe, Menu, X, Bell, CheckSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/context/LanguageContext';
import { generateDynamicNotifications } from '@/lib/utils/notificationHelper';

interface NavbarProps {
  user: UserProfile | null;
  activeRoleView?: 'employee' | 'manager' | 'super_admin';
}

interface DBNotification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: string;
  created_at: string;
}

export default function Navbar({ user, activeRoleView }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const { language, setLanguage, t, isRtl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch & Auto-generate notifications
  const loadNotifications = async () => {
    if (!user || !user.tenant_id) return;
    
    // Auto-generate notifications first
    await generateDynamicNotifications(supabase, user.id, user.role, user.tenant_id);

    // Fetch unread notifications
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (data) {
      setNotifications(data as DBNotification[]);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markAllAsRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id);

    if (!error) {
      setNotifications([]);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> {t('superAdmin')}
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-lime-500/20 text-lime-300 border border-lime-500/30">
            <Briefcase className="w-3.5 h-3.5" /> {t('teamView')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <UserCheck className="w-3.5 h-3.5" /> Employee
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-950/80 border-b border-gray-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-sky-500/20">
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

        {/* Navigation Tabs (Desktop) */}
        {user && user.tenant_id && (
          <nav className="hidden md:flex items-center gap-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800">
            <Link
              href="/dashboard/employee"
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeRoleView === 'employee'
                  ? 'bg-sky-500 text-white shadow-md'
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
                    ? 'bg-lime-600 text-white shadow-md'
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
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                {t('superAdmin')}
              </Link>
            )}
          </nav>
        )}

        {/* Actions & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-all relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className={`absolute top-12 ${isRtl ? 'left-0' : 'right-0'} w-80 bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50`}>
                  <div className="flex items-center justify-between border-b border-gray-950 pb-2">
                    <span className="text-xs font-bold text-gray-200">
                      {isRtl ? 'الإشعارات الجديدة' : 'Recent Notifications'}
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        <CheckSquare className="w-3 h-3" />
                        {isRtl ? 'تحديد كمقروء' : 'Mark all read'}
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2.5 scrollbar-thin">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-2.5 rounded-xl bg-gray-900 border border-gray-800/80 text-xs">
                        <div className="font-bold text-gray-200">{notif.title}</div>
                        <div className="text-gray-400 text-[11px] mt-0.5">{notif.message}</div>
                        <div className="text-[9px] text-gray-500 mt-1 font-sans">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="py-6 text-center text-xs text-gray-500">
                        {isRtl ? 'لا توجد إشعارات جديدة.' : 'No new notifications.'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            title={language === 'en' ? 'Switch to Arabic' : 'تغيير للإنجليزية'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-all text-xs font-semibold cursor-pointer"
          >
            <Globe className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-100 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" /> {user.full_name}
                </span>
                {getRoleBadge(user.role)}
              </div>

              <button
                onClick={handleSignOut}
                title={t('signOut')}
                className="p-2 rounded-xl bg-gray-900 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-800 hover:border-red-500/30 transition-all cursor-pointer"
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

          {/* Hamburger Menu Icon (Mobile Only) */}
          {user && user.tenant_id && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-all cursor-pointer"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {user && user.tenant_id && mobileMenuOpen && (
        <div className="md:hidden mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 flex flex-col gap-2 animate-in slide-in-from-top-3 duration-200">
          <Link
            href="/dashboard/employee"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold text-center transition-all ${
              activeRoleView === 'employee'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            {t('myWorkspace')}
          </Link>

          {(user.role === 'manager' || user.role === 'super_admin') && (
            <Link
              href="/dashboard/manager"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold text-center transition-all ${
                activeRoleView === 'manager'
                  ? 'bg-lime-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {t('teamView')}
            </Link>
          )}

          {user.role === 'super_admin' && (
            <Link
              href="/dashboard/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold text-center transition-all ${
                activeRoleView === 'super_admin'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {t('superAdmin')}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
