'use client';

import React from 'react';
import AppSidebar from '@/components/layout/AppSidebar';
import { UserProfile } from '@/lib/types/database';
import { useSidebar } from '@/lib/context/SidebarContext';
import { useLanguage } from '@/lib/context/LanguageContext';

interface AppLayoutProps {
  user: UserProfile | null;
  activeRoleView?: 'employee' | 'manager' | 'super_admin';
  children: React.ReactNode;
}

/**
 * AppLayout wraps dashboard pages.
 * On desktop (>= lg) the sidebar occupies a fixed column and pushes the main content
 * area so that page content is never occluded or covered.
 * On mobile (< lg) the sidebar is an overlay drawer with backdrop.
 */
export default function AppLayout({ user, children }: AppLayoutProps) {
  const { sidebarOpen, sidebarCollapsed, closeSidebar, toggleCollapse } = useSidebar();
  const { isRtl } = useLanguage();

  return (
    <div className="flex min-h-screen w-full bg-(--bg) overflow-hidden">
      {/* Sidebar Component */}
      <AppSidebar
        user={user}
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={closeSidebar}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Content Column — Pushed by sidebar on desktop */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
          isRtl
            ? sidebarCollapsed
              ? 'lg:mr-[72px]'
              : 'lg:mr-72'
            : sidebarCollapsed
            ? 'lg:ml-[72px]'
            : 'lg:ml-72'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
