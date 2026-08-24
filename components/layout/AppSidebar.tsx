'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { UserProfile } from '@/lib/types/database';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTenantSettings } from '@/lib/context/SettingsContext';
import {
  NAV_SECTIONS,
  MOBILE_CORE_ANCHORS,
} from '@/lib/config/navConfig';
import HumAiLogo from '@/components/common/HumAiLogo';

interface AppSidebarProps {
  user: UserProfile | null;
  isOpen: boolean; // mobile overlay open
  isCollapsed?: boolean; // desktop collapsed icon-only mode
  onClose?: () => void;
  onToggleCollapse?: () => void;
}

export default function AppSidebar({
  user,
  isOpen,
  isCollapsed = false,
  onClose,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { isRtl } = useLanguage();
  const { isFeatureEnabled } = useTenantSettings();
  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash);
      const handleHashChange = () => setCurrentHash(window.location.hash);
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, [pathname]);

  const userRole = user?.role ?? 'employee';

  // Track expanded accordion sections — fixed, predictable defaults
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboard: true,
    company: true,
    operations: true,
    performance: true,
    payroll: true,
    workspace: true,
  });

  const toggleSection = (id: string) =>
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));

  // Filter sections and sub-items strictly by user role and active feature toggles
  const visibleSections = NAV_SECTIONS.filter(
    (s) =>
      (!s.roles || s.roles.includes(userRole)) &&
      (!s.featureToggle || isFeatureEnabled(s.featureToggle))
  )
    .map((s) => ({
      ...s,
      subItems: (s.subItems || []).filter(
        (sub) =>
          (!sub.roles || sub.roles.includes(userRole)) &&
          (!sub.featureToggle || isFeatureEnabled(sub.featureToggle))
      ),
    }))
    .filter((s) => (s.subItems && s.subItems.length > 0) || Boolean(s.href));

  const visibleMobileAnchors = MOBILE_CORE_ANCHORS.filter(
    (a) => !a.roles || a.roles.includes(userRole)
  );

  // Exact matching for active route highlight
  const isItemActive = (href: string) => {
    if (href.includes('#')) {
      const [path, hash] = href.split('#');
      return pathname === path && currentHash === `#${hash}`;
    }
    // For non-hash routes: exact pathname match
    return pathname === href;
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* ─── Sidebar Panel ──────────────────────────────────────────── */}
      <aside
        className={`
          app-sidebar fixed top-0 bottom-0 z-40
          flex flex-col border-r
          transition-all duration-300 ease-in-out
          ${isRtl ? 'right-0 border-l border-r-0' : 'left-0'}
          ${isCollapsed ? 'w-[72px]' : 'w-72'}
          ${isOpen ? 'translate-x-0' : isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
      >
        {/* ── Brand Header ─────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-3.5 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2 group min-w-0">
              <HumAiLogo variant="horizontal" size="sm" showTagline />
            </Link>
          )}

          {isCollapsed && (
            <Link href="/" className="mx-auto group">
              <HumAiLogo variant="icon" size="sm" />
            </Link>
          )}

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0 ml-auto text-slate-500 dark:text-slate-400 cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* ── Mobile Pinned Core Anchors (At Top of Drawer) ────────── */}
        <div className="lg:hidden p-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-3 gap-1.5">
            {visibleMobileAnchors.map((anchor) => {
              const Icon = anchor.icon;
              const active = pathname === anchor.href;
              return (
                <Link
                  key={anchor.id}
                  href={anchor.href}
                  onClick={() => { if (onClose) onClose(); }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all text-center ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate w-full">{isRtl ? anchor.titleAr : anchor.titleEn}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Scrollable Navigation Menu (Fixed Predictable Order) ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-1 px-2">
          {visibleSections.map((section) => {
            const SectionIcon = section.icon;
            const hasSubItems = Boolean(section.subItems && section.subItems.length > 0);
            const isExpanded = expandedSections[section.id];
            const targetDirectHref = section.href || (hasSubItems ? section.subItems![0].href : '#');
            const isSectionActive = isItemActive(targetDirectHref) || (hasSubItems && section.subItems!.some((s) => isItemActive(s.href)));

            if (isCollapsed) {
              return (
                <div key={section.id} className="relative group/section my-1">
                  <Link
                    href={targetDirectHref}
                    className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all ${
                      isSectionActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                    }`}
                    title={isRtl ? section.titleAr : section.titleEn}
                  >
                    <SectionIcon className="w-4 h-4" />
                  </Link>
                </div>
              );
            }

            // Direct Single Link (no sub-items)
            if (!hasSubItems && section.href) {
              const active = isItemActive(section.href);
              return (
                <div key={section.id} className="mb-1">
                  <Link
                    href={section.href}
                    onClick={() => {
                      if (section.href?.includes('#')) {
                        setCurrentHash('#' + section.href.split('#')[1]);
                      }
                      if (onClose && window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-900 dark:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <SectionIcon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    <span className="truncate">{isRtl ? section.titleAr : section.titleEn}</span>
                  </Link>
                </div>
              );
            }

            return (
              <div key={section.id} className="mb-1">
                {/* Section Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSectionActive
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30'
                      : 'text-slate-900 dark:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SectionIcon
                      className={`w-4 h-4 shrink-0 ${
                        isSectionActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    <span className="truncate">{isRtl ? section.titleAr : section.titleEn}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  )}
                </button>

                {/* Sub-Items List */}
                {isExpanded && (
                  <div
                    className="ml-4 pl-2 py-0.5 space-y-0.5 border-l"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {section.subItems?.map((sub) => {
                      const SubIcon = sub.icon;
                      const active = isItemActive(sub.href);
                      return (
                        <Link
                          key={sub.titleEn + sub.href}
                          href={sub.href}
                          onClick={() => {
                            if (sub.href.includes('#')) {
                              setCurrentHash('#' + sub.href.split('#')[1]);
                            }
                            if (onClose && window.innerWidth < 1024) onClose();
                          }}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] transition-all ${
                            active
                              ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-r-2 dark:border-emerald-400'
                              : 'text-slate-800 dark:text-slate-300 font-medium hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                          }`}
                        >
                          <SubIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{isRtl ? sub.titleAr : sub.titleEn}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── User Profile Footer ────────────────────────────────── */}
        {user && (
          <div className="px-3 py-3 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
            {isCollapsed ? (
              <div
                className="w-9 h-9 mx-auto rounded-xl flex items-center justify-center text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              >
                {user.full_name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                >
                  {user.full_name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold truncate text-slate-950 dark:text-white">
                    {user.full_name ?? 'User'}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider truncate text-slate-500 dark:text-slate-400">
                    {user.job_title ?? user.role}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
