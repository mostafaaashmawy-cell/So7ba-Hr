'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Phone,
  Share2,
  Calendar,
  Building,
  Users,
  CheckCircle2,
  ArrowUpRight,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { TenantRecord } from '@/lib/types/database';

interface RenewalPipelineTabProps {
  tenants: TenantRecord[];
  onSelectClient: (tenant: TenantRecord) => void;
  onOpenOrderModalForClient: (tenant: TenantRecord) => void;
}

export default function RenewalPipelineTab({
  tenants,
  onSelectClient,
  onOpenOrderModalForClient,
}: RenewalPipelineTabProps) {
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical' | 'urgent' | 'upcoming' | 'expired'>('all');

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Expiring tenants list
  const expiringPipeline = tenants
    .filter((t) => {
      if (!t.subscription_expires_at) return false;
      const exp = new Date(t.subscription_expires_at);
      // All expiring in next 60 days or already expired
      return exp <= new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    })
    .map((t) => {
      const exp = new Date(t.subscription_expires_at!);
      const diffMs = exp.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const isExpired = daysLeft <= 0;
      const isCritical = daysLeft > 0 && daysLeft <= 7;
      const isUrgent = daysLeft > 7 && daysLeft <= 15;
      const isUpcoming = daysLeft > 15 && daysLeft <= 30;

      return {
        ...t,
        daysLeft,
        isExpired,
        isCritical,
        isUrgent,
        isUpcoming,
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const filteredPipeline = expiringPipeline.filter((t) => {
    if (urgencyFilter === 'critical') return t.isCritical;
    if (urgencyFilter === 'urgent') return t.isUrgent;
    if (urgencyFilter === 'upcoming') return t.isUpcoming;
    if (urgencyFilter === 'expired') return t.isExpired;
    return true;
  });

  // Seat Capacity Upsell Candidates (>= 80% used)
  const upsellCandidates = tenants
    .map((t) => {
      const used = t.user_count || 0;
      const max = t.max_employees || 50;
      const ratio = Math.round((used / max) * 100);
      return { ...t, used, max, ratio };
    })
    .filter((t) => t.ratio >= 80)
    .sort((a, b) => b.ratio - a.ratio);

  const getWhatsAppMessage = (tenant: typeof expiringPipeline[0]) => {
    const expDateStr = new Date(tenant.subscription_expires_at!).toLocaleDateString('ar-EG');
    return encodeURIComponent(
      `مرحباً أستاذ ${tenant.super_admin?.full_name || 'المدير المسؤول'}، تحياتنا من منصة HumAi الذكية لإدارة الموارد البشرية. نود تذكيركم بأن اشتراك مساحة العمل الخاصة بشركة (${tenant.name}) يوشك على الانتهاء بتاريخ ${expDateStr}. لتفادي أي انقطاع في خدمات المنظمة وتجديد الاشتراك، يسعدنا التنسيق معكم على هذا الرقم.`
    );
  };

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="cleariq-card p-6 cleariq-card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Client Retention & Renewal Pipeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Proactive churn prevention engine: Track expiring contracts, execute WhatsApp outreach reminders, and upsell growing clients nearing their seat ceiling.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setUrgencyFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              urgencyFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All ({expiringPipeline.length})
          </button>
          <button
            type="button"
            onClick={() => setUrgencyFilter('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              urgencyFilter === 'critical'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-rose-600 hover:text-rose-700'
            }`}
          >
            &lt; 7 Days ({expiringPipeline.filter((t) => t.isCritical).length})
          </button>
          <button
            type="button"
            onClick={() => setUrgencyFilter('urgent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              urgencyFilter === 'urgent'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-600 hover:text-amber-700'
            }`}
          >
            8 - 15 Days ({expiringPipeline.filter((t) => t.isUrgent).length})
          </button>
          <button
            type="button"
            onClick={() => setUrgencyFilter('expired')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              urgencyFilter === 'expired'
                ? 'bg-slate-900 text-white dark:bg-slate-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Expired ({expiringPipeline.filter((t) => t.isExpired).length})
          </button>
        </div>
      </div>

      {/* 1. Renewal Outreach Table */}
      <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
        <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          Expiring Clients Pipeline
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b dark:border-slate-800">
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Super Admin Contact</th>
                <th className="py-3 px-4">Plan & Active Seats</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Urgency Status</th>
                <th className="py-3 px-4 text-center">Quick Outreach & Renewal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPipeline.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    No clients currently falling into this renewal window. All subscriptions are secure!
                  </td>
                </tr>
              ) : (
                filteredPipeline.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-950 dark:text-white text-sm">
                      {tenant.name}
                    </td>

                    <td className="py-3.5 px-4">
                      {tenant.super_admin ? (
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {tenant.super_admin.full_name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {tenant.super_admin.mobile || 'No phone'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No admin assigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-extrabold uppercase text-[11px] text-slate-900 dark:text-slate-100 block">
                        {tenant.subscription_plan || 'Annual'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {tenant.user_count || 0} active employees
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {new Date(tenant.subscription_expires_at!).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tenant.isExpired
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                            : tenant.isCritical
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200'
                            : tenant.isUrgent
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200'
                        }`}
                      >
                        {tenant.isExpired
                          ? `Expired (${Math.abs(tenant.daysLeft)}d ago)`
                          : `Expires in ${tenant.daysLeft} days`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {tenant.super_admin?.mobile && (
                          <a
                            href={`https://api.whatsapp.com/send?phone=${tenant.super_admin.mobile.replace(
                              /[^0-9]/g,
                              ''
                            )}&text=${getWhatsAppMessage(tenant)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 transition-all"
                            title="Send pre-filled WhatsApp reminder"
                          >
                            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenOrderModalForClient(tenant)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          title="Record renewal payment"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Renew</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Seat Limit Upsell Opportunities */}
      <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Seat Limit Upsell Opportunities (&gt;= 80% Capacity)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Clients growing rapidly who are nearing their plan seat threshold. Proactive expansion opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {upsellCandidates.length === 0 ? (
            <p className="text-xs text-slate-400 col-span-3 py-6 text-center">
              No clients currently over 80% seat capacity.
            </p>
          ) : (
            upsellCandidates.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                      {t.name}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Admin: {t.super_admin?.full_name || 'N/A'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 font-black text-xs">
                    {t.ratio}% Full
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Used Seats</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {t.used} of {t.max} seats
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${Math.min(t.ratio, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                    Suggested: +50 Seats Tier
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectClient(t)}
                    className="px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 transition-all cursor-pointer"
                  >
                    Upgrade Seats
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
