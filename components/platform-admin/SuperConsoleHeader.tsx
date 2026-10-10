'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Building,
  DollarSign,
  Plus,
  RefreshCw,
  Download,
  Receipt,
  Layers,
  BarChart3,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import HumAiLogo from '@/components/common/HumAiLogo';

export type SuperConsoleTab =
  | 'overview'
  | 'clients'
  | 'orders'
  | 'financials'
  | 'pipeline'
  | 'activations';

interface SuperConsoleHeaderProps {
  activeTab: SuperConsoleTab;
  setActiveTab: (tab: SuperConsoleTab) => void;
  onRefresh: () => void;
  loading: boolean;
  onOpenActivationModal: () => void;
  onOpenOrderModal: () => void;
  onExportAll: () => void;
  totalTenants: number;
  totalOrders: number;
  expiringSoonCount: number;
}

export default function SuperConsoleHeader({
  activeTab,
  setActiveTab,
  onRefresh,
  loading,
  onOpenActivationModal,
  onOpenOrderModal,
  onExportAll,
  totalTenants,
  totalOrders,
  expiringSoonCount,
}: SuperConsoleHeaderProps) {
  const tabs: { id: SuperConsoleTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Command Center', icon: BarChart3 },
    { id: 'clients', label: 'Clients & Workspaces', icon: Building, badge: totalTenants },
    { id: 'orders', label: 'Orders & Subscriptions', icon: Receipt, badge: totalOrders },
    { id: 'financials', label: 'Financials & Ads P&L', icon: DollarSign },
    {
      id: 'pipeline',
      label: 'Renewal Pipeline',
      icon: AlertTriangle,
      badge: expiringSoonCount > 0 ? expiringSoonCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'activations', label: 'Activation Links', icon: Layers },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="flex items-center gap-2.5 group">
              <HumAiLogo size="md" />
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-950 dark:text-white flex items-center gap-1.5">
                  HumAi Super Console
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    SaaS Master
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  ashmawy.ai25@gmail.com
                </span>
              </div>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh all metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={onExportAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Export complete data report to CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenOrderModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Record Order</span>
            </button>

            <button
              type="button"
              onClick={onOpenActivationModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>New Client Link</span>
            </button>

            <Link
              href="/dashboard/admin"
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2 border-t border-slate-100 dark:border-slate-800/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        tab.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300')
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>
    </div>
  );
}
