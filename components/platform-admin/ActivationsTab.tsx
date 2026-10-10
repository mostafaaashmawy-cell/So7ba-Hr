'use client';

import React, { useState } from 'react';
import {
  Layers,
  Search,
  Download,
  Plus,
  Copy,
  Check,
  Share2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { TenantInvitationRecord } from '@/lib/types/database';
import { exportToCSV } from '@/lib/utils/csvExport';

interface ActivationsTabProps {
  invitations: TenantInvitationRecord[];
  appDomain: string;
  onOpenActivationModal: () => void;
}

export default function ActivationsTab({
  invitations,
  appDomain,
  onOpenActivationModal,
}: ActivationsTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'used' | 'expired'>('all');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const now = new Date();

  const filtered = invitations.filter((inv) => {
    const matchSearch =
      inv.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (inv.email && inv.email.toLowerCase().includes(search.toLowerCase())) ||
      inv.token.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    const isExpired = new Date(inv.expires_at) < now;
    if (statusFilter === 'used' && !inv.is_used) return false;
    if (statusFilter === 'pending' && (inv.is_used || isExpired)) return false;
    if (statusFilter === 'expired' && (inv.is_used || !isExpired)) return false;

    return true;
  });

  const copyToClipboard = (token: string, fullUrl: string) => {
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleExportCSV = () => {
    const exportData = filtered.map((inv) => ({
      'Company Name': inv.company_name,
      'Email': inv.email || '',
      'Token': inv.token,
      'Plan': inv.plan_type || 'annual',
      'Amount (EGP)': inv.amount_paid || 0,
      'Payment Channel': inv.payment_method || '',
      'Status': inv.is_used ? 'Activated' : new Date(inv.expires_at) < now ? 'Expired' : 'Pending',
      'Expires At': inv.expires_at ? new Date(inv.expires_at).toISOString().split('T')[0] : '',
      'Created At': inv.created_at ? new Date(inv.created_at).toISOString().split('T')[0] : '',
    }));
    exportToCSV(exportData, `humai-activation-tokens-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Top Header Card */}
      <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              Onboarding Links & Client Activation Tokens ({invitations.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Secure single-use tokens generated for corporate client onboarding using the active domain (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {appDomain.replace(/^https?:\/\//, '')}
              </span>
              ).
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenActivationModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Activation Link</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, email, or token..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Tokens ({invitations.length})</option>
            <option value="pending">Pending Setup (Unclaimed)</option>
            <option value="used">Activated (Workspace Created)</option>
            <option value="expired">Expired Tokens</option>
          </select>
        </div>
      </div>

      {/* Tokens Table */}
      <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b dark:border-slate-800">
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Recipient Email</th>
                <th className="py-3 px-4">Contract / Plan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Expires At</th>
                <th className="py-3 px-4 text-center">Share & Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No activation links match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const fullUrl = `${appDomain}/onboarding?token=${inv.token}`;
                  const isExpired = new Date(inv.expires_at) < now;
                  const isCopied = copiedToken === inv.token;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-950 dark:text-white">
                        {inv.company_name}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {inv.email || <span className="text-slate-400 italic">Open (Any Admin)</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-extrabold uppercase text-[11px] text-slate-900 dark:text-slate-100 block">
                          {inv.plan_type || 'Annual'}
                        </span>
                        {inv.amount_paid ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-sans">
                            {Number(inv.amount_paid).toLocaleString()} EGP ({inv.payment_method})
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Standard Onboarding</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {inv.is_used ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Activated
                          </span>
                        ) : isExpired ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400">
                            Expired
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending Setup
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(inv.expires_at).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(inv.token, fullUrl)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                            title="Copy link"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>

                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                              `أهلاً بكم في منصة HumAi! تفضلوا بإكمال إعداد مساحة العمل لشركتكم عبر الرابط الرسمي: ${fullUrl}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 transition-all"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </a>
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
  );
}
