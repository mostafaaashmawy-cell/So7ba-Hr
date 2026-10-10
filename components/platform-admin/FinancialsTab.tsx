'use client';

import React from 'react';
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
} from 'lucide-react';
import { SubscriptionOrderRecord, TenantRecord } from '@/lib/types/database';
import { exportToCSV } from '@/lib/utils/csvExport';

interface FinancialsTabProps {
  orders: SubscriptionOrderRecord[];
  tenants: TenantRecord[];
  onOpenOrderModal: () => void;
}

export default function FinancialsTab({ orders, tenants, onOpenOrderModal }: FinancialsTabProps) {
  // 1. Calculations
  const paidOrders = orders.filter((o) => o.payment_status === 'paid');
  const pendingOrders = orders.filter((o) => o.payment_status === 'pending');

  const totalCollected = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const pendingReceivables = pendingOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  // MRR calculation
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
  const arpa = activeTenantsCount > 0 ? Math.round(totalCollected / activeTenantsCount) : 0;
  const totalEmployees = tenants.reduce((sum, t) => sum + (t.user_count || 0), 0);
  const arpu = totalEmployees > 0 ? Math.round(totalCollected / totalEmployees) : 0;

  // Plan Breakdown
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

  // Payment Channel Breakdown
  const channelAggregates: Record<string, { count: number; totalRevenue: number }> = {};
  paidOrders.forEach((o) => {
    const ch = o.payment_method || 'other';
    if (!channelAggregates[ch]) {
      channelAggregates[ch] = { count: 0, totalRevenue: 0 };
    }
    channelAggregates[ch].count += 1;
    channelAggregates[ch].totalRevenue += Number(o.amount) || 0;
  });

  // Monthly Cashflow breakdown
  const monthlyCashflow: Record<string, { count: number; amount: number }> = {};
  paidOrders.forEach((o) => {
    const dateStr = o.invoice_date || (o.created_at ? o.created_at.substring(0, 7) : '2026-10');
    const monthKey = dateStr.substring(0, 7);
    if (!monthlyCashflow[monthKey]) {
      monthlyCashflow[monthKey] = { count: 0, amount: 0 };
    }
    monthlyCashflow[monthKey].count += 1;
    monthlyCashflow[monthKey].amount += Number(o.amount) || 0;
  });

  const sortedMonths = Object.keys(monthlyCashflow).sort().reverse();

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

  return (
    <div className="space-y-8 animate-in">
      {/* Top Header */}
      <div className="cleariq-card p-6 cleariq-card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            Financial Reports & SaaS Unit Economics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete analysis of cash collections, monthly recurring revenue run rates, and payment gateway distribution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportFinancialReport}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>Export Financial Ledger</span>
          </button>

          <button
            type="button"
            onClick={onOpenOrderModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Record Revenue</span>
          </button>
        </div>
      </div>

      {/* 1. Core Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cleariq-card p-5 cleariq-card-hover space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Realized Collections
          </span>
          <div className="text-3xl font-black text-slate-950 dark:text-white font-sans">
            {totalCollected.toLocaleString()} <span className="text-xs text-slate-400 font-normal">EGP</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Total Inflows Across All Tenants
          </span>
        </div>

        <div className="cleariq-card p-5 cleariq-card-hover space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            MRR Run Rate
          </span>
          <div className="text-3xl font-black text-slate-950 dark:text-white font-sans">
            {Math.round(mrr).toLocaleString()} <span className="text-xs text-slate-400 font-normal">EGP/mo</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">
            Annualized (ARR): <strong className="text-slate-900 dark:text-white">{Math.round(arr).toLocaleString()} EGP</strong>
          </span>
        </div>

        <div className="cleariq-card p-5 cleariq-card-hover space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            ARPA (Per Account)
          </span>
          <div className="text-3xl font-black text-slate-950 dark:text-white font-sans">
            {arpa.toLocaleString()} <span className="text-xs text-slate-400 font-normal">EGP</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">
            Avg revenue per client workspace
          </span>
        </div>

        <div className="cleariq-card p-5 cleariq-card-hover space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Pending Receivables
          </span>
          <div className="text-3xl font-black text-slate-950 dark:text-white font-sans">
            {pendingReceivables.toLocaleString()} <span className="text-xs text-slate-400 font-normal">EGP</span>
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block">
            {pendingOrders.length} Pending Invoices
          </span>
        </div>
      </div>

      {/* 2. Side-by-Side: Revenue by Plan & Revenue by Payment Channel */}
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
                  const share = totalCollected > 0 ? Math.round((data.totalRevenue / totalCollected) * 100) : 0;
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
                    const share = totalCollected > 0 ? Math.round((data.totalRevenue / totalCollected) * 100) : 0;
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

      {/* 3. Monthly Cashflow Inflows */}
      <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Monthly Cash Inflow Statement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical cashflow realizations by calendar month.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {sortedMonths.length === 0 ? (
            <p className="text-xs text-slate-400 col-span-4 text-center py-6">
              No historical monthly cash inflows recorded yet.
            </p>
          ) : (
            sortedMonths.map((m) => (
              <div
                key={m}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono">{m}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    {monthlyCashflow[m].count} Orders
                  </span>
                </div>
                <div className="text-xl font-black text-slate-950 dark:text-white font-sans">
                  {monthlyCashflow[m].amount.toLocaleString()}{' '}
                  <span className="text-xs text-slate-400 font-normal">EGP</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
