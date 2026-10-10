'use client';

import React from 'react';
import {
  X,
  TrendingUp,
  DollarSign,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { TenantRecord, SubscriptionOrderRecord } from '@/lib/types/database';

interface MrrExplainerModalProps {
  tenants: TenantRecord[];
  orders: SubscriptionOrderRecord[];
  onClose: () => void;
}

export default function MrrExplainerModal({
  tenants,
  orders,
  onClose,
}: MrrExplainerModalProps) {
  const activeTenants = tenants.filter((t) => t.subscription_status === 'active');
  const paidOrders = orders.filter((o) => o.payment_status === 'paid');

  const tenantBreakdowns = activeTenants.map((t) => {
    const tOrders = paidOrders.filter(
      (o) => o.tenant_id === t.id || o.company_name?.toLowerCase().trim() === t.name?.toLowerCase().trim()
    );
    const latestOrder = tOrders[0];
    const contractAmount = latestOrder ? Number(latestOrder.amount) : 0;
    const plan = t.subscription_plan || 'annual';

    let monthlyContribution = 0;
    let formulaDesc = '';

    if (contractAmount > 0) {
      if (plan === 'monthly') {
        monthlyContribution = contractAmount;
        formulaDesc = `${contractAmount.toLocaleString()} EGP / 1 mo`;
      } else if (plan === 'semi_annual') {
        monthlyContribution = contractAmount / 6;
        formulaDesc = `${contractAmount.toLocaleString()} EGP / 6 mos`;
      } else {
        // annual or enterprise
        monthlyContribution = contractAmount / 12;
        formulaDesc = `${contractAmount.toLocaleString()} EGP / 12 mos`;
      }
    } else {
      formulaDesc = 'No paid invoice (Free / Test)';
    }

    return {
      name: t.name,
      plan,
      contractAmount,
      formulaDesc,
      monthlyContribution: Math.round(monthlyContribution),
    };
  });

  const totalMrr = tenantBreakdowns.reduce((sum, item) => sum + item.monthlyContribution, 0);
  const totalArr = totalMrr * 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in">
      <div className="w-full max-w-2xl cleariq-card p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">
                How MRR (Monthly Recurring Revenue) is Calculated
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Understanding SaaS Unit Economics, Contract Normalization & ARR Run-Rate
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Principles */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 text-xs leading-relaxed">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold mb-1">
                Why use Normalized MRR instead of Total Cash Collected?
              </strong>
              <p className="text-slate-600 dark:text-slate-400">
                In B2B SaaS, corporate clients frequently pay upfront for 6 or 12-month contracts (e.g. 15,000 EGP upfront).
                Counting that entire 15,000 EGP as revenue for just this current month would distort your financial health—it would show 15,000 EGP in month 1 and 0 EGP for the remaining 11 months, despite you delivering software services all year long.
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                <strong>Normalized MRR</strong> standardizes every subscription into a predictable monthly figure:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Annual Plans</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                Contract Amount ÷ 12
              </span>
              <span className="text-[11px] text-slate-500">e.g. 15,000 ÷ 12 = 1,250 EGP/mo</span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Semi-Annual Plans</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                Contract Amount ÷ 6
              </span>
              <span className="text-[11px] text-slate-500">e.g. 8,000 ÷ 6 = 1,333 EGP/mo</span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Plans</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                Monthly Fee × 1
              </span>
              <span className="text-[11px] text-slate-500">e.g. 1,500 EGP/mo</span>
            </div>
          </div>
        </div>

        {/* Current Live Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Live MRR Composition by Active Client ({activeTenants.length} Workspaces)
            </h4>
            <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              Total MRR: {totalMrr.toLocaleString()} EGP/mo
            </span>
          </div>

          {tenantBreakdowns.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 text-center">
              No active subscription workspaces currently recorded.
            </p>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="grid grid-cols-12 p-3 bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                <div className="col-span-4">Client Workspace</div>
                <div className="col-span-3">Plan Tier</div>
                <div className="col-span-3">Contract Normalization</div>
                <div className="col-span-2 text-right">MRR Yield</div>
              </div>

              {tenantBreakdowns.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <div className="col-span-4 font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </div>
                  <div className="col-span-3 text-slate-500 capitalize">
                    {item.plan.replace('_', ' ')}
                  </div>
                  <div className="col-span-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {item.formulaDesc}
                  </div>
                  <div className="col-span-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{item.monthlyContribution.toLocaleString()} EGP
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ARR & Summary */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
              Annualized Run-Rate (ARR)
            </span>
            <span className="text-xl font-black text-slate-950 dark:text-white font-mono">
              {totalArr.toLocaleString()} EGP / Year
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Calculated as: <code className="font-mono text-emerald-600 dark:text-emerald-400">{totalMrr.toLocaleString()} × 12</code>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl gradient-btn text-xs font-bold text-white shadow-md cursor-pointer self-start sm:self-auto"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
