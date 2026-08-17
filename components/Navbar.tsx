'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { UserProfile } from '@/lib/types/database';
import {
  LogOut,
  ShieldCheck,
  Briefcase,
  UserCheck,
  Globe,
  Menu,
  Bell,
  Search,
  LayoutDashboard,
  Users,
  Target,
  Star,
  Sun,
  Moon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSidebar } from '@/lib/context/SidebarContext';
import { generateDynamicNotifications } from '@/lib/utils/notificationHelper';
import PageGuideModal from '@/components/common/PageGuideModal';

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
  const pathname = usePathname();
  const supabase = createClient();
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar } = useSidebar();

  // Notifications State
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const toggleLanguage = () => setLanguage(language === 'en' ? 'ar' : 'en');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!user || !user.tenant_id) return;
    await generateDynamicNotifications(supabase, user.id, user.role, user.tenant_id);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data as DBNotification[]);
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
    if (!error) setNotifications([]);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/50">
            <ShieldCheck className="w-3 h-3" /> {t('superAdmin')}
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700/50">
            <Briefcase className="w-3 h-3" /> {t('teamView')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
            <UserCheck className="w-3 h-3" /> Employee
          </span>
        );
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isManager = user?.role === 'manager' || isSuperAdmin;

  const headerStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    borderBottomColor: 'var(--border)',
  };

  const iconBtnStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-input)',
    borderColor: 'var(--border)',
    color: 'var(--text-secondary)',
  };

  return (
    <>
      <header
        className="sticky top-0 z-30 border-b px-4 lg:px-6 py-2.5 transition-colors shadow-xs"
        style={headerStyle}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left: Sidebar toggle + Brand */}
          <div className="flex items-center gap-3">
            {/* Hamburger — opens sidebar on mobile, or can toggle collapse on desktop */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex items-center justify-center w-8 h-8 rounded-xl border transition-colors cursor-pointer hover:border-blue-400"
              style={iconBtnStyle}
              title="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Brand (visible when sidebar is collapsed on desktop) */}
            <Link href="/" className="hidden lg:flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform">
                H
              </div>
              <span className="font-extrabold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                HumAi
              </span>
            </Link>

            {/* Search (desktop) */}
            <div className="hidden xl:flex items-center relative w-52">
              <Search className="w-3.5 h-3.5 absolute left-3" style={{ color: 'var(--text-muted)' }} />
              <input
                type="search"
                placeholder={isRtl ? 'بحث سريع...' : 'Search HumAi...'}
                className="w-full rounded-xl border pl-8 pr-3 py-1.5 text-xs transition-all"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Center: Role nav tabs (desktop) */}
          {user && user.tenant_id && (
            <nav className="hidden md:flex items-center gap-1 rounded-2xl border px-1 py-1"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}>
              <Link
                href="/dashboard/employee"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeRoleView === 'employee'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'hover:bg-white dark:hover:bg-slate-700'
                }`}
                style={activeRoleView === 'employee' ? {} : { color: 'var(--text-secondary)' }}
              >
                {t('myWorkspace')}
              </Link>

              {isManager && (
                <Link
                  href="/dashboard/manager"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeRoleView === 'manager'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'hover:bg-white dark:hover:bg-slate-700'
                  }`}
                  style={activeRoleView === 'manager' ? {} : { color: 'var(--text-secondary)' }}
                >
                  {t('teamView')}
                </Link>
              )}

              {isSuperAdmin && (
                <Link
                  href="/dashboard/admin"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeRoleView === 'super_admin'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'hover:bg-white dark:hover:bg-slate-700'
                  }`}
                  style={activeRoleView === 'super_admin' ? {} : { color: 'var(--text-secondary)' }}
                >
                  {t('superAdmin')}
                </Link>
              )}
            </nav>
          )}

          {/* Right: Action icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Page Guide */}
            <PageGuideModal />

            {/* Dark / Light mode toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-xl border transition-all cursor-pointer"
              style={iconBtnStyle}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark'
                ? <Sun className="w-3.5 h-3.5 text-amber-400" />
                : <Moon className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all"
              style={iconBtnStyle}
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase text-[10px] font-sans">{language}</span>
            </button>

            {/* Notifications Bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative flex items-center justify-center w-8 h-8 rounded-xl border transition-all cursor-pointer"
                  style={iconBtnStyle}
                >
                  <Bell className="w-3.5 h-3.5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center font-sans">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div
                    className="absolute mt-2 w-80 sm:w-96 rounded-2xl border shadow-xl z-50 p-4 space-y-3 animate-in"
                    style={{
                      right: isRtl ? 'auto' : 0,
                      left: isRtl ? 0 : 'auto',
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border)',
                      boxShadow: 'var(--shadow-modal)',
                    }}
                  >
                    <div className="flex items-center justify-between border-b pb-2.5"
                      style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                          {isRtl ? 'الإشعارات والتنبيهات' : 'Smart Notifications'}
                        </span>
                      </div>
                      {notifications.length > 0 && (
                        <button type="button" onClick={markAllAsRead}
                          className="text-[10px] text-blue-600 hover:underline font-bold">
                          {isRtl ? 'تعيين الكل كمقروء' : 'Mark all read'}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id}
                          className="p-2.5 rounded-xl border space-y-1"
                          style={{ backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--border)' }}>
                          <div className="text-xs font-bold flex items-center justify-between"
                            style={{ color: 'var(--text-primary)' }}>
                            <span>{n.title}</span>
                            <span className="text-[9px] font-sans" style={{ color: 'var(--text-muted)' }}>
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {n.message}
                          </p>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="text-center py-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {isRtl ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Avatar / Logout */}
            {user ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {user.full_name ?? 'User'}
                  </span>
                  {getRoleBadge(user.role)}
                </div>

                <div className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center bg-blue-600 shadow-xs">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center w-8 h-8 rounded-xl border transition-all cursor-pointer hover:border-rose-300 hover:text-rose-500"
                  style={iconBtnStyle}
                  title={t('signOut')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold shadow-xs">
                {t('signIn')}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      {user && user.tenant_id && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t px-4 py-2 flex items-center justify-around"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <Link href="/dashboard/employee"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              pathname.includes('/employee') ? 'text-blue-600' : ''
            }`}
            style={pathname.includes('/employee') ? {} : { color: 'var(--text-muted)' }}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Workspace</span>
          </Link>

          {isManager && (
            <Link href="/dashboard/manager"
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                pathname.includes('/manager') ? 'text-blue-600' : ''
              }`}
              style={pathname.includes('/manager') ? {} : { color: 'var(--text-muted)' }}>
              <Users className="w-5 h-5" />
              <span>Team</span>
            </Link>
          )}

          {isSuperAdmin && (
            <Link href="/dashboard/admin"
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                pathname.includes('/admin') ? 'text-blue-600' : ''
              }`}
              style={pathname.includes('/admin') ? {} : { color: 'var(--text-muted)' }}>
              <ShieldCheck className="w-5 h-5" />
              <span>Admin</span>
            </Link>
          )}

          <Link href="/dashboard/targets"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              pathname.includes('/targets') ? 'text-blue-600' : ''
            }`}
            style={pathname.includes('/targets') ? {} : { color: 'var(--text-muted)' }}>
            <Target className="w-5 h-5" />
            <span>Targets</span>
          </Link>

          <Link href="/dashboard/evaluations"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              pathname.includes('/evaluations') ? 'text-blue-600' : ''
            }`}
            style={pathname.includes('/evaluations') ? {} : { color: 'var(--text-muted)' }}>
            <Star className="w-5 h-5" />
            <span>Reviews</span>
          </Link>
        </div>
      )}
    </>
  );
}
