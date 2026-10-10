'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Download,
  Calendar,
  CreditCard,
  Building,
  Percent,
  PieChart,
  ArrowUpRight,
  Wallet,
  Clock,
  CheckCircle2,
  Megaphone,
  Trash2,
  HelpCircle,
  TrendingDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  SubscriptionOrderRecord,
  TenantRecord,
  PlatformMarketingExpenseRecord,
} from '@/lib/types/database';
import { exportToCSV } from '@/lib/utils/csvExport';
import MrrExplainerModal from './MrrExplainerModal';

interface FinancialsTabProps {
  orders: SubscriptionOrderRecord[];
  tenants: TenantRecord[];
  marketingExpenses: PlatformMarketingExpenseRecord[];
  onOpenOrderModal: () => void;
  onOpenAdSpendModal: () => void;
  onDeleteExpense: (expenseId: string) => Promise<void>;
}

export default function FinancialsTab({
  orders,
  tenants,
  marketingExpenses,
  onOpenOrderModal,
  onOpenAdSpendModal,
  onDeleteExpense,
}: FinancialsTabProps) {
  const [showMrrModal, setShowMrrModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 1. Core Revenue Calculations
  const paidOrders = orders.filter((o) => o.payment_status === 'paid');
  const pendingOrders = orders.filter((o) => o.payment_status === 'pending');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const pendingReceivables = pendingOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  // 2. Marketing & Ads Spend Calculations
  const totalAdSpend = marketingExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const metaAdSpend = marketingExpenses
    .filter((e) => e.channel === 'meta')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const googleAdSpend = marketingExpenses
    .filter((e) => e.channel === 'google')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const otherAdSpend = totalAdSpend - (metaAdSpend + googleAdSpend);

  const totalLeads = marketingExpenses.reduce((sum, e) => sum + (e.leads_count || 0), 0);
  const costPerLead = totalLeads > 0 ? Math.round(totalAdSpend / totalLeads) : 0;

  // 3. Net Profit & Marketing Contribution Economics
  const netProfit = totalRevenue - totalAdSpend;
  const netProfitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const roas = totalAdSpend > 0 ? (totalRevenue / totalAdSpend).toFixed(2) : totalRevenue > 0 ? '∞' : '0.00';

  // Blended Customer Acquisition Cost (CAC)
  const paidClientsCount = new Set(paidOrders.map((o) => o.company_name || o.tenant_id)).size;
  const blendedCac = paidClientsCount > 0 ? Math.round(totalAdSpend / paidClientsCount) : 0;

  // Lifetime Value (LTV) and LTV:CAC Ratio
  const ltv = paidClientsCount > 0 ? Math.round(totalRevenue / paidClientsCount) : 0;
  const ltvToCac = blendedCac > 0 ? (ltv / blendedCac).toFixed(1) : 'N/A';

  // 4. Normalized MRR Calculation
  let mrr = 0;
  tenants.forEach((t) => {
    if (t.subscription_status === 'active') {
      const tenantOrders = paidOrders.filter((o) => o.tenant_id === t.id);
      const latestOrder = tenantOrders[0];
      const amount = latestOrder ? Number(latestOrder.amount) : 0;
      if (t.subscription_plan === 'monthly') {
        mrr += amount || 1500;
      } else if (t.subscription_plan === 'semi_annual') {
        mrr += (amount || 8000) / 6;
      } else {
        mrr += (amount || 15000) / 12;
      }
    }
  });

  const arr = mrr * 12;
  const activeTenantsCount = tenants.filter((t) => t.subscription_status === 'active').length;
  const arpa = activeTenantsCount > 0 ? Math.round(totalRevenue / activeTenantsCount) : 0;
  const totalEmployees = tenants.reduce((sum, t) => sum + (t.user_count || 0), 0);
  const arpu = totalEmployees > 0 ? Math.round(totalRevenue / totalEmployees) : 0;

  // Payback period (Months)
  const averageMonthlyYieldPerClient = activeTenantsCount > 0 ? mrr / activeTenantsCount : 0;
  const paybackMonths =
    averageMonthlyYieldPerClient > 0 && blendedCac > 0
      ? (blendedCac / averageMonthlyYieldPerClient).toFixed(1)
      : '0';

  // 5. Plan Breakdown
  const planAggregates: Record<string, { count: number; totalRevenue: number }> = {
    annual: { count: 0, totalRevenue: 0 },
    semi_annual: { count: 0, totalRevenue: 0 },
    monthly: { count: 0, totalRevenue: 0 },
    custom: { count: 0, totalRevenue: 0 },
  };

  paidOrders.forEach((o) => {
    const plan = o.plan_type === 'enterprise' ? 'annual' : o.plan_type in planAggregates ? o.plan_type : 'custom';
    planAggregates[plan].count += 1;
    planAggregates[plan].totalRevenue += Number(o.amount) || 0;
  });

  // 6. Payment Channel Breakdown
  const channelAggregates: Record<string, { count: number; totalRevenue: number }> = {};
  paidOrders.forEach((o) => {
    const ch = o.payment_method || 'other';
    if (!channelAggregates[ch]) {
      channelAggregates[ch] = { count: 0, totalRevenue: 0 };
    }
    channelAggregates[ch].count += 1;
    channelAggregates[ch].totalRevenue += Number(o.amount) || 0;
  });

  // 7. Monthly Combined P&L Breakdown (Revenue vs Spend by Month)
  const monthlyPnL: Record<
    string,
    { revenue: number; metaSpend: number; googleSpend: number; otherSpend: number; totalSpend: number; leads: number }
  > = {};

  // Aggregate monthly revenues
  paidOrders.forEach((o) => {
    const dateStr = o.invoice_date || (o.created_at ? o.created_at.substring(0, 7) : '2026-10');
    const monthKey = dateStr.substring(0, 7);
    if (!monthlyPnL[monthKey]) {
      monthlyPnL[monthKey] = { revenue: 0, metaSpend: 0, googleSpend: 0, otherSpend: 0, totalSpend: 0, leads: 0 };
    }
    monthlyPnL[monthKey].revenue += Number(o.amount) || 0;
  });

  // Aggregate monthly expenses
  marketingExpenses.forEach((e) => {
    const monthKey = e.period_month || (e.date_spent ? e.date_spent.substring(0, 7) : '2026-10');
    if (!monthlyPnL[monthKey]) {
      monthlyPnL[monthKey] = { revenue: 0, metaSpend: 0, googleSpend: 0, otherSpend: 0, totalSpend: 0, leads: 0 };
    }
    const amt = Number(e.amount) || 0;
    monthlyPnL[monthKey].totalSpend += amt;
    monthlyPnL[monthKey].leads += e.leads_count || 0;

    if (e.channel === 'meta') monthlyPnL[monthKey].metaSpend += amt;
    else if (e.channel === 'google') monthlyPnL[monthKey].googleSpend += amt;
    else monthlyPnL[monthKey].otherSpend += amt;
  });

  const sortedPnLMonths = Object.keys(monthlyPnL).sort().reverse();

  // Export handlers
  const handleExportFinancialReport = () => {
    const exportData = paidOrders.map((o) => ({
      'Invoice / Order #': o.order_number,
      'Client Organization': o.company_name,
      'Plan': o.plan_type,
      'Billing Cycle': o.billing_cycle || o.plan_type,
      'Amount Collected (EGP)': o.amount,
      'Payment Gateway': o.payment_method,
      'Payment Status': o.payment_status,
      'Reference / Bank TX': o.payment_reference || '',
      'Date': o.invoice_date || (o.created_at ? o.created_at.split('T')[0] : ''),
    }));
    exportToCSV(exportData, `humai-financial-ledger-${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPnLReport = () => {
    const exportData = sortedPnLMonths.map((m) => {
      const p = monthlyPnL[m];
      const pnlProfit = p.revenue - p.totalSpend;
      const pnlRoas = p.totalSpend > 0 ? (p.revenue / p.totalSpend).toFixed(2) : 'N/A';
      const pnlMargin = p.revenue > 0 ? Math.round((pnlProfit / p.revenue) * 100) : 0;
      return {
        Month: m,
        'Subscription Revenue (EGP)': p.revenue,
        'Meta Ads Spend (EGP)': p.metaSpend,
        'Google Ads Spend (EGP)': p.googleSpend,
        'Other Ads Spend (EGP)': p.otherSpend,
        'Total Ads Spend (EGP)': p.totalSpend,
        'Net Profit (EGP)': pnlProfit,
        'ROAS (x)': pnlRoas,
        'Net Margin %': `${pnlMargin}%`,
        'Leads Acquired': p.leads,
      };
    });
    exportToCSV(exportData, `humai-pnl-marketing-statement-${new Date().toISOString().split('T')[0]}`);
  };

  const handleDeleteExpenseClick = async (id: string) => {
    if (confirm('Are you sure you want to delete this marketing expense entry?')) {
      try {
        setDeletingId(id);
        await onDeleteExpense(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in">
      {/* Top Header */}
      <div className="cleariq-card p-6 cleariq-card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-500" />
              Financial Reports, Ad Spend & P&L Statement
            </h2>
            <button
              type="button"
              onClick={() => setShowMrrModal(true)}
              className="text-slate-400 hover:text-emerald-500 cursor-pointer p-1 transition-colors"
              title="How is MRR calculated?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Profit & Loss statement tracking gross subscription collections against Meta & Google ad spend, customer acquisition cost (CAC), and net profit margin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportPnLReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Export P&L CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenAdSpendModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-400 transition-all cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-500" />
            <span>Log Ad Spend</span>
          </button>

          <button
            type="button"
            onClick={onOpenOrderModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Record Revenue</span>
          </button>
        </div>
      </div>

      {/* 1. Executive P&L Snapshot: Revenues vs Spending vs Net Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collections */}
        <div className="cleariq-card p-5 cleariq-card-hover space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Realized Collections (Inflows)
          </span>
          <div className="text-3xl font-black text-slate-950 dark:text-white font-sans">
            {totalRevenue.toLocaleString()} <span className="text-xs text-slate-400 font-normal">EGP</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {paidOrders.length} Completed Invoices
          </span>
        </div>

        {/* Total Ad Spend */}
        <div className="cleariq-card p-5 cleariq-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Ads & Marketing Spend
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950 dark:text-white font-sans">
            {totalAdSpend.toLocaleString()} <span className="text-xs text-slate-400 font-normal">EGP</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
            <span>Meta: <strong className="text-slate-800 dark:text-slate-200">{metaAdSpend.toLocaleString()}</strong></span>
            <span>•</span>
            <span>Google: <strong className="text-slate-800 dark:text-slate-200">{googleAdSpend.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="cleariq-card p-5 cleariq-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Net Profit (Contribution)
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                netProfit >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {netProfitMargin}% Margin
            </span>
          </div>
          <div
            className={`text-3xl font-black font-sans ${
              netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {netProfit.toLocaleString()} <span className="text-xs font-normal">EGP</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">
            Gross Collections minus Total Marketing
          </span>
        </div>

        {/* ROAS & CAC */}
        <div className="cleariq-card p-5 cleariq-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Blended ROAS & CAC
            </span>
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
              {roas}x ROAS
            </span>
          </div>
          <div className="text-3xl font-black text-slate-950 dark:text-white font-sans">
            {blendedCac.toLocaleString()} <span className="text-xs text-slate-400 font-normal">EGP CAC</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">
            LTV:CAC <strong className="text-slate-800 dark:text-slate-200">{ltvToCac}x</strong> • Payback: <strong className="text-slate-800 dark:text-slate-200">{paybackMonths} mo</strong>
          </span>
        </div>
      </div>

      {/* 2. Monthly P&L Ledger (جدول الأرباح والخسائر الشهري) */}
      <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Monthly SaaS P&L Ledger (الأرباح والمصاريف الشهرية)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparative monthly breakdown of collections vs marketing allocations, net profit, and return on ad spend.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAdSpendModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-500" />
            <span>+ Add Ad Expense</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b dark:border-slate-800">
                <th className="py-2.5 px-3.5">Month</th>
                <th className="py-2.5 px-3">Revenue (Inflow)</th>
                <th className="py-2.5 px-3">Meta Ads</th>
                <th className="py-2.5 px-3">Google Ads</th>
                <th className="py-2.5 px-3">Other Ads</th>
                <th className="py-2.5 px-3">Total Spend</th>
                <th className="py-2.5 px-3">Net Profit</th>
                <th className="py-2.5 px-3 text-center">ROAS</th>
                <th className="py-2.5 px-3 text-right">Net Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedPnLMonths.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400 italic">
                    No monthly revenue or marketing expenses recorded yet.
                  </td>
                </tr>
              ) : (
                sortedPnLMonths.map((m) => {
                  const p = monthlyPnL[m];
                  const mProfit = p.revenue - p.totalSpend;
                  const mRoas = p.totalSpend > 0 ? (p.revenue / p.totalSpend).toFixed(2) : p.revenue > 0 ? '∞' : '0.00';
                  const mMargin = p.revenue > 0 ? Math.round((mProfit / p.revenue) * 100) : 0;

                  return (
                    <tr key={m} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3.5 font-bold font-mono text-slate-900 dark:text-white">
                        {m}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        +{p.revenue.toLocaleString()} EGP
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {p.metaSpend > 0 ? `${p.metaSpend.toLocaleString()} EGP` : '—'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {p.googleSpend > 0 ? `${p.googleSpend.toLocaleString()} EGP` : '—'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {p.otherSpend > 0 ? `${p.otherSpend.toLocaleString()} EGP` : '—'}
                      </td>
                      <td className="py-3 px-3 font-bold text-amber-600 dark:text-amber-400 font-mono">
                        {p.totalSpend > 0 ? `-${p.totalSpend.toLocaleString()} EGP` : '0 EGP'}
                      </td>
                      <td
                        className={`py-3 px-3 font-black font-mono ${
                          mProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {mProfit >= 0 ? `+${mProfit.toLocaleString()}` : mProfit.toLocaleString()} EGP
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400">
                          {mRoas}x
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-bold ${
                            mMargin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {mMargin}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Ads Spend Record History & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Breakdown Card */}
        <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              Marketing Channels Breakdown
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {marketingExpenses.length} Entries
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Meta (FB / Instagram)', amount: metaAdSpend, color: 'bg-blue-600' },
              { label: 'Google Ads (Search/YT)', amount: googleAdSpend, color: 'bg-emerald-500' },
              { label: 'Other Marketing Channels', amount: otherAdSpend, color: 'bg-purple-500' },
            ].map((ch) => {
              const share = totalAdSpend > 0 ? Math.round((ch.amount / totalAdSpend) * 100) : 0;
              return (
                <div key={ch.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{ch.label}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{ch.amount.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{share}% of ad budget</span>
                    <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className={`${ch.color} h-full rounded-full`} style={{ width: `${share}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Performance Cards: Leads & CPL */}
          <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 block">
              Inbound Lead Economics
            </span>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Total Leads Logged:</span>
              <strong className="text-slate-950 dark:text-white font-mono">{totalLeads}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Blended Cost Per Lead (CPL):</span>
              <strong className="text-teal-600 dark:text-teal-400 font-mono font-bold">{costPerLead.toLocaleString()} EGP</strong>
            </div>
          </div>
        </div>

        {/* Ad Spend Ledger Table */}
        <div className="cleariq-card p-6 cleariq-card-hover space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-500" />
                Ad Budget Expense Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log of individual ad spends recorded by platform administrator.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenAdSpendModal}
              className="px-3 py-1.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-xs cursor-pointer"
            >
              + Record Spend
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b dark:border-slate-800 sticky top-0 z-10">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Campaign / Notes</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-center">Leads</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {marketingExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      No ad expenses recorded yet. Click &quot;Record Spend&quot; to log your first Meta or Google ad invoice.
                    </td>
                  </tr>
                ) : (
                  marketingExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {exp.date_spent}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            exp.channel === 'meta'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : exp.channel === 'google'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                          }`}
                        >
                          {exp.channel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                        <div className="font-bold truncate max-w-[180px]">
                          {exp.campaign_name || 'Direct Budget'}
                        </div>
                        {exp.notes && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                            {exp.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-black text-slate-950 dark:text-white font-mono">
                        {Number(exp.amount).toLocaleString()} EGP
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-700 dark:text-slate-300">
                        {exp.leads_count || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteExpenseClick(exp.id)}
                          disabled={deletingId === exp.id}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. MRR & SaaS Recurring Revenue Economics */}
      <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              SaaS Recurring Revenue & Account Run-Rate (MRR / ARR)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Normalized subscription yield per account and per active seat across all subscribed organizations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowMrrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-all cursor-pointer self-start sm:self-auto"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How is MRR Calculated?</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">MRR Run Rate</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white font-mono">
              {Math.round(mrr).toLocaleString()} <span className="text-xs text-slate-400 font-normal">EGP/mo</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
              Predictable Monthly Base
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Annualized Run-Rate (ARR)</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white font-mono">
              {Math.round(arr).toLocaleString()} <span className="text-xs text-slate-400 font-normal">EGP/yr</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              MRR × 12 Months
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">ARPA (Per Account)</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white font-mono">
              {arpa.toLocaleString()} <span className="text-xs text-slate-400 font-normal">EGP</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Average Revenue Per Organization
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">ARPU (Per Active Seat)</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white font-mono">
              {arpu.toLocaleString()} <span className="text-xs text-slate-400 font-normal">EGP</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Per Registered Employee Account
            </span>
          </div>
        </div>
      </div>

      {/* 5. Revenue by Plan & Revenue by Payment Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Tiers Revenue */}
        <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              Revenue by Subscription Plan Tier
            </h3>
            <span className="text-xs text-slate-500 font-medium font-sans">
              {paidOrders.length} Paid Contracts
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b dark:border-slate-800">
                  <th className="py-2.5 px-3">Plan Tier</th>
                  <th className="py-2.5 px-3 text-center">Orders</th>
                  <th className="py-2.5 px-3">Revenue (EGP)</th>
                  <th className="py-2.5 px-3 text-right">Share %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(planAggregates).map(([plan, data]) => {
                  const share = totalRevenue > 0 ? Math.round((data.totalRevenue / totalRevenue) * 100) : 0;
                  return (
                    <tr key={plan} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-bold uppercase text-slate-900 dark:text-white">
                        {plan.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300">
                        {data.count}
                      </td>
                      <td className="py-3 px-3 font-black text-slate-950 dark:text-white font-sans">
                        {data.totalRevenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{share}%</span>
                          <div className="w-12 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${share}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Channels Mix */}
        <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-500" />
              Revenue by Payment Channel
            </h3>
            <span className="text-xs text-slate-500 font-medium">Gateway Inflows</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b dark:border-slate-800">
                  <th className="py-2.5 px-3">Gateway</th>
                  <th className="py-2.5 px-3 text-center">Invoices</th>
                  <th className="py-2.5 px-3">Volume (EGP)</th>
                  <th className="py-2.5 px-3 text-right">Share %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.keys(channelAggregates).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No payment channels recorded yet.
                    </td>
                  </tr>
                ) : (
                  Object.entries(channelAggregates).map(([channel, data]) => {
                    const share = totalRevenue > 0 ? Math.round((data.totalRevenue / totalRevenue) * 100) : 0;
                    return (
                      <tr key={channel} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-bold capitalize text-slate-900 dark:text-white">
                          {channel.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300">
                          {data.count}
                        </td>
                        <td className="py-3 px-3 font-black text-slate-950 dark:text-white font-sans">
                          {data.totalRevenue.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{share}%</span>
                            <div className="w-12 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${share}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MRR Explainer Modal */}
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
