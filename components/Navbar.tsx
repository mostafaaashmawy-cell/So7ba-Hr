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
  X,
  Bell,
  Search,
  LayoutDashboard,
  Users,
  Target,
  FileSpreadsheet,
  Star,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
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

    await generateDynamicNotifications(supabase, user.id, user.role, user.tenant_id);

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3 h-3" /> {t('superAdmin')}
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Briefcase className="w-3 h-3" /> {t('teamView')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <UserCheck className="w-3 h-3" /> Employee
          </span>
        );
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isManager = user?.role === 'manager' || isSuperAdmin;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-8 py-3 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform">
                H
              </div>
              <div>
                <div className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                  HumAi
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-wider font-sans">
                    SaaS
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase hidden sm:block">
                  Smart HR & Operations
                </div>
              </div>
            </Link>

            {/* Global Search Bar (Desktop) */}
            <div className="hidden lg:flex items-center relative w-64">
              <Search className="w-4 h-4 absolute left-3 text-slate-400" />
              <input
                type="text"
                placeholder={isRtl ? 'بحث سريع...' : 'Search in HumAi...'}
                className="w-full bg-slate-100/80 hover:bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          {user && user.tenant_id && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200">
              <Link
                href="/dashboard/employee"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeRoleView === 'employee'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {t('myWorkspace')}
              </Link>

              {isManager && (
                <Link
                  href="/dashboard/manager"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeRoleView === 'manager'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {t('teamView')}
                </Link>
              )}

              {isSuperAdmin && (
                <Link
                  href="/dashboard/admin"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeRoleView === 'super_admin'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {t('superAdmin')}
                </Link>
              )}
            </nav>
          )}

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Toggle Language"
            >
              <Globe className="w-4 h-4 text-slate-600" />
              <span className="uppercase text-[11px] font-sans">{language}</span>
            </button>

            {/* Notifications Bell Dropdown */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center font-sans">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Popup */}
                {showNotifDropdown && (
                  <div
                    className={`absolute ${
                      isRtl ? 'left-0' : 'right-0'
                    } mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900">
                          {isRtl ? 'الإشعارات والتنبيهات' : 'Smart Notifications'}
                        </span>
                      </div>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-[10px] text-blue-600 hover:underline font-bold"
                        >
                          {isRtl ? 'تعيين الكل كمقروء' : 'Mark all as read'}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 hover:border-slate-200 transition-all"
                        >
                          <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[9px] text-slate-400 font-sans">
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                        </div>
                      ))}

                      {notifications.length === 0 && (
                        <div className="text-center py-6 text-xs text-slate-400">
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
              <div className="flex items-center gap-2.5 pl-1">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user.full_name || 'User'}
                  </span>
                  {getRoleBadge(user.role)}
                </div>

                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shadow-xs">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>

                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 transition-all"
                  title={t('signOut')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
              >
                {t('signIn')}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200 space-y-2">
            {user && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{user.full_name}</div>
                    <div className="text-[10px] text-slate-500">{user.job_title || user.role}</div>
                  </div>
                </div>
                {getRoleBadge(user.role)}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/employee"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  activeRoleView === 'employee'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('myWorkspace')}
              </Link>

              {isManager && (
                <Link
                  href="/dashboard/manager"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    activeRoleView === 'manager'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {t('teamView')}
                </Link>
              )}

              {isSuperAdmin && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    activeRoleView === 'super_admin'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t('superAdmin')}
                </Link>
              )}

              <Link
                href="/dashboard/targets"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-2"
              >
                <Target className="w-4 h-4" /> Targets Board
              </Link>

              <Link
                href="/dashboard/evaluations"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-2"
              >
                <Star className="w-4 h-4" /> Evaluations
              </Link>

              <Link
                href="/dashboard/payroll"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" /> Payroll
              </Link>

              <Link
                href="/dashboard/sales"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" /> Sales
              </Link>

              <Link
                href="/dashboard/contracts"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Contracts
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Matching Cleariq Phone Mockup) */}
      {user && user.tenant_id && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 shadow-lg flex items-center justify-around">
          <Link
            href="/dashboard/employee"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              pathname.includes('/employee') ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Workspace</span>
          </Link>

          {isManager && (
            <Link
              href="/dashboard/manager"
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                pathname.includes('/manager') ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Team</span>
            </Link>
          )}

          {isSuperAdmin && (
            <Link
              href="/dashboard/admin"
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                pathname.includes('/admin') ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Admin</span>
            </Link>
          )}

          <Link
            href="/dashboard/targets"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              pathname.includes('/targets') ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <Target className="w-5 h-5" />
            <span>Targets</span>
          </Link>

          <Link
            href="/dashboard/evaluations"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              pathname.includes('/evaluations') ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <Star className="w-5 h-5" />
            <span>Reviews</span>
          </Link>
        </div>
      )}
    </>
  );
}
