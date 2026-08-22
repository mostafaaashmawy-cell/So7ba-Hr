'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, SystemAuditLogRecord } from '@/lib/types/database';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Clock,
  Calendar,
  User,
  Activity,
  DollarSign,
  Lock,
  Layers,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Globe,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { formatDate, formatTime, getCairoDate } from '@/lib/utils/dateUtils';
import { exportToCSV } from '@/lib/utils/csvExport';

type ActionCategory = 'all' | 'security' | 'financial' | 'operations' | 'settings';

export default function AuditLogsPage() {
  const router = useRouter();
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<SystemAuditLogRecord[]>([]);
  const [actorsList, setActorsList] = useState<{ id: string; name: string }[]>([]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory>('all');
  const [selectedActor, setSelectedActor] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | '7days' | 'month' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pagination State
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Detail Modal / Slide-over
  const [selectedLog, setSelectedLog] = useState<SystemAuditLogRecord | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      if (profile.role !== 'super_admin') {
        router.push('/dashboard/employee');
        return;
      }

      setCurrentUser(profile as UserProfile);

      // Fetch audit logs with actor profile
      const { data: logRecords } = await supabase
        .from('system_audit_logs')
        .select('*, actor:users(id, full_name, role)')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (logRecords) {
        setLogs(logRecords as SystemAuditLogRecord[]);

        // Extract unique actors
        const uniqueActorsMap = new Map<string, string>();
        logRecords.forEach((l) => {
          if (l.actor?.id && l.actor?.full_name) {
            uniqueActorsMap.set(l.actor.id, l.actor.full_name);
          }
        });
        const actors = Array.from(uniqueActorsMap.entries()).map(([id, name]) => ({ id, name }));
        setActorsList(actors);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Category classifier
  const getCategoryForAction = (action: string): ActionCategory => {
    const act = action.toUpperCase();
    if (
      act.includes('LOGIN') ||
      act.includes('ROLE') ||
      act.includes('PASSWORD') ||
      act.includes('AUTH') ||
      act.includes('GEOFENCE') ||
      act.includes('SECURITY') ||
      act.includes('DELETE')
    ) {
      return 'security';
    }
    if (
      act.includes('SALARY') ||
      act.includes('PAYROLL') ||
      act.includes('BONUS') ||
      act.includes('PENALTY') ||
      act.includes('ADVANCE') ||
      act.includes('ADJUSTMENT') ||
      act.includes('COMMISSION') ||
      act.includes('FINANCIAL')
    ) {
      return 'financial';
    }
    if (
      act.includes('SHIFT') ||
      act.includes('SWAP') ||
      act.includes('ATTENDANCE') ||
      act.includes('CHECK_IN') ||
      act.includes('LEAVE') ||
      act.includes('TARGET') ||
      act.includes('OVERTIME')
    ) {
      return 'operations';
    }
    if (
      act.includes('SETTING') ||
      act.includes('POLICY') ||
      act.includes('CONTRACT') ||
      act.includes('TENANT') ||
      act.includes('CONFIG')
    ) {
      return 'settings';
    }
    return 'operations';
  };

  // Badge Styling based on action type
  const getActionBadge = (action: string) => {
    const cat = getCategoryForAction(action);
    if (cat === 'security') {
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
        icon: ShieldAlert,
      };
    }
    if (cat === 'financial') {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        icon: DollarSign,
      };
    }
    if (cat === 'settings') {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
        icon: Lock,
      };
    }
    return {
      bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
      icon: Activity,
    };
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const actionMatch = log.action_type.toLowerCase().includes(q);
      const entityMatch = (log.target_entity || log.entity_name || '').toLowerCase().includes(q);
      const actorMatch = log.actor?.full_name?.toLowerCase().includes(q);
      const idMatch = (log.target_id || log.entity_id || '').toLowerCase().includes(q);
      const detailsMatch = JSON.stringify(log.details || {}).toLowerCase().includes(q);

      if (q && !actionMatch && !entityMatch && !actorMatch && !idMatch && !detailsMatch) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const cat = getCategoryForAction(log.action_type);
        if (cat !== selectedCategory) return false;
      }

      // Actor filter
      if (selectedActor !== 'all' && log.actor_id !== selectedActor) {
        return false;
      }

      // Target Entity filter
      if (selectedEntity !== 'all' && (log.target_entity || log.entity_name) !== selectedEntity) {
        return false;
      }

      // Date Range Filter (Cairo Timezone normalized)
      if (log.created_at) {
        const logDate = getCairoDate(log.created_at);
        const today = getCairoDate();

        if (datePreset === 'today') {
          if (logDate.toDateString() !== today.toDateString()) return false;
        } else if (datePreset === '7days') {
          const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (logDate < sevenDaysAgo) return false;
        } else if (datePreset === 'month') {
          if (
            logDate.getMonth() !== today.getMonth() ||
            logDate.getFullYear() !== today.getFullYear()
          ) {
            return false;
          }
        } else if (datePreset === 'custom') {
          if (customStartDate && logDate < new Date(customStartDate)) return false;
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (logDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [
    logs,
    searchQuery,
    selectedCategory,
    selectedActor,
    selectedEntity,
    datePreset,
    customStartDate,
    customEndDate,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Metric Ribbon Calculations
  const stats = useMemo(() => {
    const thisMonthLogs = logs.filter((l) => {
      if (!l.created_at) return false;
      const d = getCairoDate(l.created_at);
      const now = getCairoDate();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const securityCount = thisMonthLogs.filter((l) => getCategoryForAction(l.action_type) === 'security').length;
    const financialCount = thisMonthLogs.filter((l) => getCategoryForAction(l.action_type) === 'financial').length;
    const policyCount = thisMonthLogs.filter((l) => getCategoryForAction(l.action_type) === 'settings').length;

    return {
      totalMonth: thisMonthLogs.length,
      securityAlerts: securityCount,
      financialLogs: financialCount,
      policyMods: policyCount,
    };
  }, [logs]);

  // Export CSV
  const handleExportCSV = () => {
    const rows = filteredLogs.map((l) => ({
      'Log ID': l.id,
      'Timestamp (Cairo)': l.created_at ? `${formatDate(l.created_at)} ${formatTime(l.created_at)}` : '',
      'Actor Name': l.actor?.full_name || 'System / Service',
      'Actor Role': l.actor?.role || 'N/A',
      'Action Type': l.action_type,
      'Target Entity': l.target_entity || l.entity_name || 'general',
      'Target ID': l.target_id || l.entity_id || '',
      'IP Address': l.ip_address || '',
      'User Agent': l.user_agent || '',
      'Old Values': JSON.stringify(l.old_values || {}),
      'New Values': JSON.stringify(l.new_values || {}),
      'Details Payload': JSON.stringify(l.details || {}),
    }));

    exportToCSV(rows, `HumAi_Audit_Trail_${new Date().toISOString().split('T')[0]}`);
  };

  // Extract unique target entities for filter dropdown
  const uniqueEntities = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      const e = l.target_entity || l.entity_name;
      if (e) set.add(e);
    });
    return Array.from(set);
  }, [logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg) flex items-center justify-center text-slate-400 text-xs font-bold">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 mr-2" />
        Loading administrative audit logs & telemetry...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar user={currentUser} activeRoleView="super_admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              {isRtl ? 'سجل الرقابة وتتبع العمليات الإدارية' : 'System Logs & Administrative Audit Trail'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isRtl
                ? 'تتبع حركات النظام الحساسة، التعديلات المالية، الصلاحيات، وفروقات البيانات مع تسجيل البصمة الرقمية'
                : 'Monitor sensitive administrative events, financial mutations, role escalations, and visual diffs'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isRtl ? 'تصدير السجل CSV' : 'Export Audit Trail'}</span>
            </button>

            <button
              type="button"
              onClick={fetchLogs}
              className="gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isRtl ? 'تحديث السجلات' : 'Refresh Logs'}</span>
            </button>
          </div>
        </div>

        {/* High-level Analytics Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="cleariq-card p-4 cleariq-card-hover flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                {isRtl ? 'إجمالي الحركات (هذا الشهر)' : 'Total Events (Month)'}
              </span>
              <span className="text-lg font-black text-slate-950 dark:text-white font-sans">
                {stats.totalMonth}
              </span>
            </div>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                {isRtl ? 'تنبيهات أمنية وتعديل أدوار' : 'Security & Access Alerts'}
              </span>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-sans">
                {stats.securityAlerts}
              </span>
            </div>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                {isRtl ? 'تسويات وحركات الرواتب' : 'Financial Adjustments'}
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-sans">
                {stats.financialLogs}
              </span>
            </div>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                {isRtl ? 'تعديلات السياسات والإعدادات' : 'Policy & Config Edits'}
              </span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-sans">
                {stats.policyMods}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="cleariq-card p-4 cleariq-card-hover space-y-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-bold shrink-0">{isRtl ? 'التصنيف:' : 'Category:'}</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isRtl ? 'جميع التصنيفات' : 'All Events'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('security');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'security'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isRtl ? 'الأمان والصلاحيات' : 'Security & Access'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('financial');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'financial'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isRtl ? 'الماليات والرواتب' : 'Financial & Payroll'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('operations');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'operations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isRtl ? 'الورديات والعمليات' : 'Shifts & Operations'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('settings');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'settings'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isRtl ? 'السياسات والشركة' : 'Policy & Config'}
            </button>
          </div>

          {/* Grid Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={
                  isRtl
                    ? 'بحث بنوع الحركة، اسم المسؤول، الكيان، المعرّف...'
                    : 'Search action, actor, entity ID, details...'
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Actor Filter */}
            <div>
              <select
                value={selectedActor}
                onChange={(e) => {
                  setSelectedActor(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="all">{isRtl ? 'جميع المسؤولين' : 'All Actors'}</option>
                {actorsList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Entity Filter */}
            <div>
              <select
                value={selectedEntity}
                onChange={(e) => {
                  setSelectedEntity(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="all">{isRtl ? 'جميع الكيانات المستهدفة' : 'All Target Entities'}</option>
                {uniqueEntities.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Preset */}
            <div>
              <select
                value={datePreset}
                onChange={(e) => {
                  setDatePreset(e.target.value as 'all' | 'today' | '7days' | 'month' | 'custom');
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="month">{isRtl ? 'هذا الشهر' : 'This Month'}</option>
                <option value="today">{isRtl ? 'اليوم فقط' : 'Today Only'}</option>
                <option value="7days">{isRtl ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
                <option value="all">{isRtl ? 'كل الأوقات' : 'All Time'}</option>
                <option value="custom">{isRtl ? 'نطاق مخصص...' : 'Custom Range...'}</option>
              </select>
            </div>
          </div>

          {/* Custom Date Pickers */}
          {datePreset === 'custom' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  {isRtl ? 'من تاريخ:' : 'Start Date:'}
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  {isRtl ? 'إلى تاريخ:' : 'End Date:'}
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-950 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            AUDIT DATA GRID
            ═══════════════════════════════════════════════════════════════ */}
        <div className="cleariq-card overflow-hidden cleariq-card-hover">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">{isRtl ? 'التوقيت (القاهرة)' : 'Timestamp'}</th>
                  <th className="py-3.5 px-4">{isRtl ? 'المسؤول القائم بالحركة' : 'Actor'}</th>
                  <th className="py-3.5 px-4">{isRtl ? 'نوع الإجراء' : 'Action Type'}</th>
                  <th className="py-3.5 px-4">{isRtl ? 'الكيان المتأثر' : 'Target Entity'}</th>
                  <th className="py-3.5 px-4">{isRtl ? 'ملخص التغيير' : 'Details / Diff'}</th>
                  <th className="py-3.5 px-4 text-right">{isRtl ? 'التفاصيل' : 'Inspect'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {paginatedLogs.map((log) => {
                  const badge = getActionBadge(log.action_type);
                  const Icon = badge.icon;
                  const targetEntityName = log.target_entity || log.entity_name || 'general';
                  const targetEntityId = log.target_id || log.entity_id;
                  const hasDiff =
                    (log.old_values && Object.keys(log.old_values).length > 0) ||
                    (log.new_values && Object.keys(log.new_values).length > 0);

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          {log.created_at ? formatDate(log.created_at) : '--'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {log.created_at ? formatTime(log.created_at) : '--'}
                        </span>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold flex items-center justify-center shrink-0 text-xs">
                            {log.actor?.full_name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-950 dark:text-white block truncate max-w-[140px]">
                              {log.actor?.full_name || 'System Service'}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">
                              {log.actor?.role || 'Service'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3" />
                          {log.action_type}
                        </span>
                      </td>

                      {/* Target Entity */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                          {targetEntityName}
                        </span>
                        {targetEntityId && (
                          <span className="text-[10px] text-slate-500 font-mono truncate block max-w-[120px]">
                            ID: {targetEntityId.substring(0, 8)}...
                          </span>
                        )}
                      </td>

                      {/* Details / Diff Summary */}
                      <td className="py-3 px-4">
                        {hasDiff ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            Diff Snapshot Available
                          </span>
                        ) : log.details && Object.keys(log.details).length > 0 ? (
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate block max-w-[200px] font-mono">
                            {JSON.stringify(log.details)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">No extra parameters</span>
                        )}
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                          title="Inspect Event"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isRtl ? 'عرض' : 'Inspect'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {paginatedLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-bold">
                      {isRtl
                        ? 'لا توجد سجلات مطابقة لخيارات البحث المحددة.'
                        : 'No audit records found matching your filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">{isRtl ? 'عرض:' : 'Show:'}</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-slate-500">
                {isRtl ? `إجمالي ${filteredLogs.length} سجل` : `Total ${filteredLogs.length} events`}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-bold text-slate-900 dark:text-slate-100">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            LOG DETAIL MODAL & VISUAL JSON DIFF VIEWER
            ═══════════════════════════════════════════════════════════════ */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="cleariq-card w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div>
                  <h3 className="font-extrabold text-base text-slate-950 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    {isRtl ? 'تفاصيل الحركة وفروقات البيانات' : 'Event Telemetry & Visual Diff'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Log ID: {selectedLog.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                      {isRtl ? 'نوع الحركة:' : 'Action Type:'}
                    </span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                      {selectedLog.action_type}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                      {isRtl ? 'المسؤول القائم بالحركة:' : 'Actor:'}
                    </span>
                    <span className="font-bold text-slate-950 dark:text-white">
                      {selectedLog.actor?.full_name || 'System'} ({selectedLog.actor?.role || 'Service'})
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                      {isRtl ? 'التوقيت (القاهرة):' : 'Timestamp (Cairo):'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                      {selectedLog.created_at
                        ? `${formatDate(selectedLog.created_at)} ${formatTime(selectedLog.created_at)}`
                        : '--'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                      {isRtl ? 'الكيان المتأثر:' : 'Target Entity:'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                      {selectedLog.target_entity || selectedLog.entity_name}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                      {isRtl ? 'معرّف السجل المستهدف:' : 'Target Record ID:'}
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">
                      {selectedLog.target_id || selectedLog.entity_id || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                      {isRtl ? 'عنوان IP:' : 'IP Address:'}
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {selectedLog.ip_address || 'Protected / Local'}
                    </span>
                  </div>
                </div>

                {/* Device / User Agent */}
                {selectedLog.user_agent && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-600 dark:text-slate-400 text-[11px] font-mono">
                    <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedLog.user_agent}</span>
                  </div>
                )}

                {/* Visual JSON Diff Viewer (Old vs New) */}
                {(selectedLog.old_values || selectedLog.new_values) && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      {isRtl ? 'مقارنة التغييرات (Visual Diff Snapshot)' : 'Visual Mutation Snapshot (Old vs New)'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Old Values */}
                      <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-800 pb-1.5">
                          <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-400 uppercase">
                            - {isRtl ? 'القيم السابقة (قبل التعديل)' : 'Before Mutation (Old)'}
                          </span>
                        </div>
                        <pre className="text-[11px] font-mono text-rose-900 dark:text-rose-300 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(selectedLog.old_values || {}, null, 2)}
                        </pre>
                      </div>

                      {/* New Values */}
                      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-1.5">
                          <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase">
                            + {isRtl ? 'القيم الجديدة (بعد التعديل)' : 'After Mutation (New)'}
                          </span>
                        </div>
                        <pre className="text-[11px] font-mono text-emerald-900 dark:text-emerald-300 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(selectedLog.new_values || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Details Payload */}
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">
                      {isRtl ? 'حمولة البيانات الإضافية (Details JSON)' : 'Event Payload Details'}
                    </h4>
                    <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isRtl ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
