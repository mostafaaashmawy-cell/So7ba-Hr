'use client';

import React, { useState } from 'react';
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
import {
  NAV_SECTIONS,
  GLOBAL_NAV_ANCHORS,
  NavSection,
  getActiveDomain,
} from '@/lib/config/navConfig';

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

  const userRole = user?.role ?? 'employee';
  const activeDomain = getActiveDomain(pathname);

  // Track which sections are expanded in the accordion
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV_SECTIONS.forEach((s) => {
      init[s.id] = s.id === activeDomain || s.id === 'dashboard';
    });
    return init;
  });

  const toggleSection = (id: string) =>
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));

  // Filter sections and sub-items by user role
  const visibleSections = NAV_SECTIONS.filter(
    (s) => !s.roles || s.roles.includes(userRole)
  ).map((s) => ({
    ...s,
    subItems: s.subItems.filter(
      (sub) => !sub.roles || sub.roles.includes(userRole)
    ),
  }));

  const visibleAnchors = GLOBAL_NAV_ANCHORS.filter((a) => {
    if (a.id === 'company') return userRole === 'super_admin';
    if (a.id === 'operations' && userRole === 'employee') return false;
    if (a.id === 'payroll' && userRole === 'employee') return false;
    return true;
  });

  // The contextual sub-items for the currently active domain
  const contextualSection = visibleSections.find((s) => s.id === activeDomain);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

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
          className="flex items-center justify-between px-4 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2.5 group min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-extrabold text-lg shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                H
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-base tracking-tight flex items-center gap-1.5 truncate"
                  style={{ color: 'var(--text-primary)' }}>
                  HumAi
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 uppercase tracking-wider font-sans">
                    SaaS
                  </span>
                </div>
                <div className="text-[10px] tracking-wider uppercase truncate"
                  style={{ color: 'var(--text-muted)' }}>
                  Smart Operations
                </div>
              </div>
            </Link>
          )}

          {isCollapsed && (
            <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-extrabold text-lg">
              H
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0 ml-auto"
            style={{ color: 'var(--text-muted)' }}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* ── Scrollable Navigation ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-1 px-2">

          {/* ── GLOBAL FAST-SWITCH ANCHORS ──────────────────────── */}
          {!isCollapsed && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest px-2 mb-2"
                style={{ color: 'var(--text-muted)' }}>
                {isRtl ? 'انتقال سريع' : 'Quick Nav'}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {visibleAnchors.map((anchor) => {
                  const Icon = anchor.icon;
                  const isThisActive = activeDomain === anchor.id;
                  return (
                    <button
                      key={anchor.id}
                      type="button"
                      onClick={() => setExpandedSections((prev) => ({ ...prev, [anchor.id]: true }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                        isThisActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                      style={isThisActive ? {} : { color: 'var(--text-secondary)' }}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate w-full text-center">
                        {isRtl ? anchor.titleAr : anchor.titleEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="h-px mx-2 mb-3" style={{ backgroundColor: 'var(--border)' }} />

          {/* ── CONTEXTUAL SUB-NAV for the active domain ────────── */}
          {!isCollapsed && contextualSection && contextualSection.subItems.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest px-2 mb-1.5"
                style={{ color: 'var(--text-muted)' }}>
                {isRtl ? contextualSection.titleAr : contextualSection.titleEn}
              </p>
              {contextualSection.subItems.map((sub) => {
                const SubIcon = sub.icon;
                const active = isActive(sub.href);
                return (
                  <Link
                    key={sub.titleEn + sub.href}
                    href={sub.href}
                    onClick={() => { if (onClose && window.innerWidth < 1024) onClose(); }}
                    className={`nav-active-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all mb-0.5 ${
                      active ? 'nav-active' : 'hover:bg-blue-50 dark:hover:bg-blue-900/15'
                    }`}
                    style={active ? {} : { color: 'var(--text-secondary)' }}
                  >
                    <SubIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{isRtl ? sub.titleAr : sub.titleEn}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ── FULL ACCORDION MENU ─────────────────────────────── */}
          <div className="space-y-0.5">
            {visibleSections.map((section) => {
              const SectionIcon = section.icon;
              const isExpanded = expandedSections[section.id];
              const isSectionActive = section.subItems.some((s) => isActive(s.href));

              if (isCollapsed) {
                // Icon-only mode for collapsed sidebar
                return (
                  <div key={section.id} className="relative group/section">
                    <Link
                      href={section.subItems[0]?.href ?? '#'}
                      className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all ${
                        isSectionActive ? 'nav-active' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                      style={isSectionActive ? {} : { color: 'var(--text-secondary)' }}
                      title={isRtl ? section.titleAr : section.titleEn}
                    >
                      <SectionIcon className="w-4 h-4" />
                    </Link>
                  </div>
                );
              }

              return (
                <div key={section.id}>
                  {/* Section accordion header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSectionActive ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}
                    style={isSectionActive ? {} : { color: 'var(--text-primary)' }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <SectionIcon className={`w-4 h-4 shrink-0 ${isSectionActive ? 'text-blue-600 dark:text-blue-400' : ''}`}
                        style={isSectionActive ? {} : { color: 'var(--text-muted)' }} />
                      <span className="truncate">{isRtl ? section.titleAr : section.titleEn}</span>
                    </div>
                    {isExpanded
                      ? <ChevronDown className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
                      : <ChevronRight className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} />}
                  </button>

                  {/* Sub-items */}
                  {isExpanded && (
                    <div
                      className="ml-5 pl-2 py-0.5 space-y-0.5 border-l"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {section.subItems.map((sub) => {
                        const SubIcon = sub.icon;
                        const active = isActive(sub.href);
                        return (
                          <Link
                            key={sub.titleEn + sub.href}
                            href={sub.href}
                            onClick={() => { if (onClose && window.innerWidth < 1024) onClose(); }}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                              active ? 'nav-active' : 'hover:bg-blue-50 dark:hover:bg-blue-900/15'
                            }`}
                            style={active ? {} : { color: 'var(--text-secondary)' }}
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
        </div>

        {/* ── User Profile Footer ────────────────────────────────── */}
        {user && (
          <div className="px-3 py-3 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
            {isCollapsed ? (
              <div
                className="w-9 h-9 mx-auto rounded-xl flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
              >
                {user.full_name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border"
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {user.full_name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {user.full_name ?? 'User'}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider truncate" style={{ color: 'var(--text-muted)' }}>
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
