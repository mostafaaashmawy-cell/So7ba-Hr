'use client';

import React from 'react';
import {
  Building,
  Users,
  DollarSign,
  TrendingUp,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  Layers,
  ChevronRight,
  Percent,
  HelpCircle,
  Megaphone,
} from 'lucide-react';
import {
  TenantRecord,
  SubscriptionOrderRecord,
  TenantInvitationRecord,
  PlatformMarketingExpenseRecord,
} from '@/lib/types/database';
import { SuperConsoleTab } from './SuperConsoleHeader';
import MrrExplainerModal from './MrrExplainerModal';

interface OverviewTabProps {
  tenants: TenantRecord[];
  orders: SubscriptionOrderRecord[];
  invitations: TenantInvitationRecord[];
  marketingExpenses?: PlatformMarketingExpenseRecord[];
  onNavigateTab: (tab: SuperConsoleTab) => void;
  onOpenOrderModal: () => void;
  onOpenActivationModal: () => void;
  onOpenAdSpendModal?: () => void;
  onSelectClient: (tenant: TenantRecord) => void;
  onSelectOrder: (order: SubscriptionOrderRecord) => void;
}

export default function OverviewTab({
  tenants,
  orders,
  invitations,
  marketingExpenses = [],
  onNavigateTab,
  onOpenOrderModal,
  onOpenActivationModal,
  onOpenAdSpendModal,
  onSelectClient,
  onSelectOrder,
}: OverviewTabProps) {
  const [showMrrModal, setShowMrrModal] = React.useState(false);
  // 1. Calculate Core Financials
  const paidOrders = orders.filter((o) => o.payment_status === 'paid');
  const pendingOrders = orders.filter((o) => o.payment_status === 'pending');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  // Marketing & Ad Spend Economics
  const totalAdSpend = marketingExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const metaAdSpend = marketingExpenses
    .filter((e) => e.channel === 'meta')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const googleAdSpend = marketingExpenses
    .filter((e) => e.channel === 'google')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netProfit = totalRevenue - totalAdSpend;
  const netProfitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const roas = totalAdSpend > 0 ? (totalRevenue / totalAdSpend).toFixed(2) : totalRevenue > 0 ? '∞' : '0.00';
  const payingClientsCount = new Set(paidOrders.map((o) => o.company_name || o.tenant_id)).size;
  const blendedCac = payingClientsCount > 0 ? Math.round(totalAdSpend / payingClientsCount) : 0;

  // Normalized MRR calculation strictly based on actual verified paid orders:
  // Annual order => actual amount / 12
  // Semi-annual => actual amount / 6
  // Monthly => actual amount / 1
  let mrr = 0;
  tenants.forEach((t) => {
    if (t.subscription_status === 'active') {
      const tenantOrders = paidOrders.filter(
        (o) => o.tenant_id === t.id || o.company_name?.toLowerCase().trim() === t.name?.toLowerCase().trim()
      );
      const latestOrder = tenantOrders[0];
      const orderAmount = latestOrder ? Number(latestOrder.amount) : 0;
      if (orderAmount > 0) {
        if (t.subscription_plan === 'monthly') {
          mrr += orderAmount;
        } else if (t.subscription_plan === 'semi_annual') {
          mrr += orderAmount / 6;
        } else {
          // default annual / enterprise / custom
          mrr += orderAmount / 12;
        }
      }
    }
  });

  const arr = mrr * 12;

  // 2. User & Seat Capacity
  const totalUsers = tenants.reduce((sum, t) => sum + (t.user_count || 0), 0);
  const totalSeatCapacity = tenants.reduce((sum, t) => sum + (t.max_employees || 50), 0);
  const seatUtilizationRate = totalSeatCapacity > 0 ? Math.round((totalUsers / totalSeatCapacity) * 100) : 0;

  // 3. Expirations & Churn Pipeline
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringTenants = tenants.filter((t) => {
    if (!t.subscription_expires_at) return false;
    const exp = new Date(t.subscription_expires_at);
    return exp > now && exp <= in30Days;
  });
  const expiredTenants = tenants.filter((t) => {
    if (!t.subscription_expires_at) return false;
    return new Date(t.subscription_expires_at) <= now;
  });

  // 4. Plan Breakdown
  const planBreakdown = {
    annual: tenants.filter((t) => t.subscription_plan === 'annual' || t.subscription_plan === 'enterprise').length,
    semi_annual: tenants.filter((t) => t.subscription_plan === 'semi_annual').length,
    monthly: tenants.filter((t) => t.subscription_plan === 'monthly').length,
    custom: tenants.filter((t) => t.subscription_plan === 'custom').length,
  };

  // 5. Payment Channel Breakdown
  const paymentBreakdown: Record<string, { count: number; total: number }> = {};
  paidOrders.forEach((o) => {
    const method = o.payment_method || 'other';
    if (!paymentBreakdown[method]) {
      paymentBreakdown[method] = { count: 0, total: 0 };
    }
    paymentBreakdown[method].count += 1;
    paymentBreakdown[method].total += Number(o.amount) || 0;
  });

  return (
    <div className="space-y-8 animate-in">
      {/* Welcome & Command Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 rounded-3xl border border-emerald-500/20">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            SaaS Unit Economics & Operations
          </span>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-1">
            Executive Command Center
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Live overview of monthly recurring revenue (MRR), client health, subscription renewals, and cash collections across all client organizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenOrderModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs cursor-pointer transition-all"
          >
            <Receipt className="w-4 h-4" />
            <span>Record Order</span>
          </button>
          <button
            type="button"
            onClick={onOpenActivationModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Token</span>
          </button>
        </div>
      </div>

      {/* 1. Executive Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="cleariq-card p-5 cleariq-card-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>MRR (Monthly Run Rate)</span>
              <button
                type="button"
                onClick={() => setShowMrrModal(true)}
                className="text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                title="How is MRR calculated?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950 dark:text-white font-sans">
              {Math.round(mrr).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">EGP/mo</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">ARR Projection:</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-sans">
              {Math.round(arr).toLocaleString()} EGP
            </span>
          </div>
        </div>

        {/* Total Realized Revenue Card */}
        <div className="cleariq-card p-5 cleariq-card-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Realized Collections
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950 dark:text-white font-sans">
              {Math.round(totalRevenue).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">EGP</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Pending Receivables:</span>
            <span className="font-extrabold text-amber-600 dark:text-amber-400 font-sans">
              {Math.round(pendingRevenue).toLocaleString()} EGP
            </span>
          </div>
        </div>

        {/* Workspaces & Paying Clients */}
        <div className="cleariq-card p-5 cleariq-card-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Client Workspaces
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950 dark:text-white">
              {tenants.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">companies</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Annual Subscriptions:</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
              {planBreakdown.annual} ({tenants.length > 0 ? Math.round((planBreakdown.annual / tenants.length) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Platform Seats & Utilization */}
        <div className="cleariq-card p-5 cleariq-card-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Seat Utilization
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950 dark:text-white">
              {seatUtilizationRate}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {totalUsers} / {totalSeatCapacity} seats
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(seatUtilizationRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* SaaS Marketing & Net Profit Summary Strip */}
      <div className="cleariq-card p-5 cleariq-card-hover flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 text-xs w-full md:w-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Ads Budget</span>
            <span className="text-base font-black text-slate-950 dark:text-white font-mono">
              {totalAdSpend.toLocaleString()} <span className="text-xs text-slate-400 font-normal">EGP</span>
            </span>
            <span className="text-[10px] text-slate-500 block">
              Meta: {metaAdSpend.toLocaleString()} • Google: {googleAdSpend.toLocaleString()}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:border-slate-800 hidden sm:block" />

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Profit (After Ads)</span>
            <span
              className={`text-base font-black font-mono ${
                netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {netProfit >= 0 ? `+${netProfit.toLocaleString()}` : netProfit.toLocaleString()} EGP
            </span>
            <span className="text-[10px] text-slate-500 block">
              Margin: <strong className="text-emerald-600 dark:text-emerald-400">{netProfitMargin}%</strong>
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:border-slate-800 hidden sm:block" />

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Blended ROAS & CAC</span>
            <span className="text-base font-black text-teal-600 dark:text-teal-400 font-mono">
              {roas}x ROAS
            </span>
            <span className="text-[10px] text-slate-500 block">
              CAC: <strong className="text-slate-800 dark:text-slate-200 font-mono">{blendedCac.toLocaleString()} EGP</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          {onOpenAdSpendModal && (
            <button
              type="button"
              onClick={onOpenAdSpendModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-400 transition-all cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-500" />
              <span>Log Ad Spend</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigateTab('financials')}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
          >
            <span>View Full P&L</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Middle Row: Churn Pipeline Alert & Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Renewal Alerts / Retention Pipeline Widget */}
        <div className="cleariq-card p-6 cleariq-card-hover space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Renewal Urgency Pipeline
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('pipeline')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-0.5"
            >
              View Pipeline <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {expiringTenants.length === 0 && expiredTenants.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  All Client Subscriptions Healthy
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  No corporate workspaces expiring within the next 30 days.
                </p>
              </div>
            ) : (
              <>
                {expiredTenants.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-rose-700 dark:text-rose-300 block">
                        {expiredTenants.length} Lapsed / Expired
                      </span>
                      <span className="text-[11px] text-rose-600/80">
                        Immediate outreach required
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('pipeline')}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px]"
                    >
                      Act Now
                    </button>
                  </div>
                )}

                {expiringTenants.map((t) => {
                  const daysLeft = Math.ceil(
                    (new Date(t.subscription_expires_at!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectClient(t)}
                      className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block text-xs">
                          {t.name}
                        </span>
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          Expires in {daysLeft} days ({t.subscription_plan})
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-amber-600 dark:text-amber-300">
                        Renew →
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Plan Breakdown & Unit Economics */}
        <div className="cleariq-card p-6 cleariq-card-hover space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              Subscription Tiers
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('clients')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
            >
              Manage Clients
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Annual Enterprise (12 Mo)</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{planBreakdown.annual}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${tenants.length > 0 ? (planBreakdown.annual / tenants.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Semi-Annual (6 Mo)</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{planBreakdown.semi_annual}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${tenants.length > 0 ? (planBreakdown.semi_annual / tenants.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Monthly Flexible</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{planBreakdown.monthly}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${tenants.length > 0 ? (planBreakdown.monthly / tenants.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">Average Contract Value (ARPA):</span>
              <span className="font-extrabold text-slate-900 dark:text-white font-sans">
                {tenants.length > 0 ? Math.round(totalRevenue / tenants.length).toLocaleString() : 0} EGP
              </span>
            </div>
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="cleariq-card p-6 cleariq-card-hover space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-500" />
              Collections by Gateway
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('financials')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
            >
              Financial Report
            </button>
          </div>

          <div className="space-y-2.5">
            {Object.keys(paymentBreakdown).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No payment transactions recorded yet.</p>
            ) : (
              Object.entries(paymentBreakdown).map(([channel, data]) => (
                <div
                  key={channel}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                      {channel.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">({data.count})</span>
                  </div>
                  <span className="font-black text-slate-950 dark:text-white font-sans">
                    {data.total.toLocaleString()} EGP
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Recent Orders Stream & Quick Actions */}
      <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-500" />
              Recent Subscription Orders & Contracts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest payment orders logged across all corporate accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            View All ({orders.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b dark:border-slate-800">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    No orders logged yet. Click &quot;Record Order&quot; above to log the first payment.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {order.order_number}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-950 dark:text-white">
                      {order.company_name}
                    </td>
                    <td className="py-3 px-4 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {order.plan_type}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-950 dark:text-white font-sans">
                      {Number(order.amount).toLocaleString()} EGP
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-600 dark:text-slate-400">
                      {order.payment_method.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : order.payment_status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectOrder(order)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] cursor-pointer"
                      >
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showMrrModal && (
        <MrrExplainerModal
          tenants={tenants}
          orders={orders}
          onClose={() => setShowMrrModal(false)}
        />
      )}
    </div>
  );
}
