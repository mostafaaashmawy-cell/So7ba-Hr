'use client';

import React, { useState } from 'react';
import {
  Building,
  Users,
  Search,
  Filter,
  Download,
  Plus,
  ExternalLink,
  Edit2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  Receipt,
  Share2,
} from 'lucide-react';
import { TenantRecord } from '@/lib/types/database';
import { exportToCSV } from '@/lib/utils/csvExport';

interface ClientsTabProps {
  tenants: TenantRecord[];
  onSelectClient: (tenant: TenantRecord) => void;
  onOpenOrderModalForClient: (tenant: TenantRecord) => void;
  onOpenActivationModal: () => void;
}

export default function ClientsTab({
  tenants,
  onSelectClient,
  onOpenOrderModalForClient,
  onOpenActivationModal,
}: ClientsTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'suspended'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Filtered List
  const filteredTenants = tenants.filter((t) => {
    // Search
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.super_admin?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.super_admin?.mobile?.includes(search) ||
      t.contact_email?.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    // Status Filter
    if (statusFilter !== 'all') {
      const expDate = t.subscription_expires_at ? new Date(t.subscription_expires_at) : null;
      if (statusFilter === 'active' && t.subscription_status !== 'active') return false;
      if (statusFilter === 'suspended' && t.subscription_status !== 'suspended') return false;
      if (statusFilter === 'expiring') {
        if (!expDate || expDate <= now || expDate > in30Days) return false;
      }
      if (statusFilter === 'expired') {
        if (!expDate || expDate > now) return false;
      }
    }

    // Plan Filter
    if (planFilter !== 'all' && t.subscription_plan !== planFilter) {
      return false;
    }

    return true;
  });

  const handleExportCSV = () => {
    const exportData = filteredTenants.map((t) => {
      const expDate = t.subscription_expires_at ? new Date(t.subscription_expires_at).toISOString().split('T')[0] : 'N/A';
      return {
        'Company Name': t.name,
        'Workspace ID': t.id,
        'Super Admin': t.super_admin?.full_name || 'N/A',
        'Mobile': t.super_admin?.mobile || 'N/A',
        'Email': t.contact_email || 'N/A',
        'Plan': t.subscription_plan || 'annual',
        'Status': t.subscription_status || 'active',
        'Active Seats': t.user_count || 0,
        'Seat Limit': t.max_employees || 50,
        'Expires At': expDate,
        'Created At': t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : '',
      };
    });
    exportToCSV(exportData, `humai-clients-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Top Bar with Search & Filters */}
      <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-500" />
              Client Workspaces CRM ({tenants.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive registry of all paying SaaS clients, seat allocations, contract lifecycles, and direct admin actions.
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
              <span>Onboard New Client</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, admin name, or phone..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Statuses ({tenants.length})</option>
            <option value="active">Active Only</option>
            <option value="expiring">Expiring Soon (Next 30 Days)</option>
            <option value="expired">Expired / Due for Renewal</option>
            <option value="suspended">Suspended Accounts</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Plans</option>
            <option value="annual">Annual Plan</option>
            <option value="semi_annual">Semi-Annual Plan</option>
            <option value="monthly">Monthly Plan</option>
            <option value="enterprise">Enterprise</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b dark:border-slate-800">
                <th className="py-3 px-4">Company & ID</th>
                <th className="py-3 px-4">Super Admin Contact</th>
                <th className="py-3 px-4">Seat Allocation</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4">Expiration / Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No client workspaces match the search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => {
                  const usedSeats = t.user_count || 0;
                  const maxSeats = t.max_employees || 50;
                  const ratio = Math.round((usedSeats / maxSeats) * 100);

                  const expDate = t.subscription_expires_at ? new Date(t.subscription_expires_at) : null;
                  const isExpired = expDate ? expDate <= now : false;
                  const isExpiringSoon = expDate ? expDate > now && expDate <= in30Days : false;
                  const daysLeft = expDate
                    ? Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Company Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center justify-center shrink-0">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-950 dark:text-white block text-sm">
                              {t.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {t.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Admin Contact */}
                      <td className="py-3.5 px-4">
                        {t.super_admin ? (
                          <div className="space-y-1">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {t.super_admin.full_name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              {t.super_admin.mobile && (
                                <a
                                  href={`tel:${t.super_admin.mobile}`}
                                  className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{t.super_admin.mobile}</span>
                                </a>
                              )}
                              {t.super_admin.mobile && (
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${t.super_admin.mobile.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 hover:underline font-bold"
                                  title="WhatsApp"
                                >
                                  [WA]
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No admin assigned</span>
                        )}
                      </td>

                      {/* Seat Allocation Meter */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5 w-36">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {usedSeats} / {maxSeats}
                            </span>
                            <span
                              className={`font-black ${
                                ratio >= 90 ? 'text-rose-600' : ratio >= 75 ? 'text-amber-600' : 'text-emerald-600'
                              }`}
                            >
                              {ratio}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                ratio >= 90 ? 'bg-rose-500' : ratio >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(ratio, 100)}%` }}
                            />
                          </div>
                          {ratio >= 85 && (
                            <span className="text-[10px] text-amber-600 font-bold block">
                              Upsell Capacity!
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Subscription Plan */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 uppercase text-[11px] block">
                          {t.subscription_plan || 'Annual'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Since {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>

                      {/* Expiration & Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                              t.subscription_status === 'suspended'
                                ? 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                : isExpired
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400'
                                : isExpiringSoon
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
                            }`}
                          >
                            {t.subscription_status === 'suspended'
                              ? 'Suspended'
                              : isExpired
                              ? 'Expired'
                              : isExpiringSoon
                              ? `Expires in ${daysLeft}d`
                              : 'Active'}
                          </span>

                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                            {expDate ? expDate.toLocaleDateString() : 'No expiry set'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectClient(t)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                            title="Edit workspace settings & limits"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                            <span>Manage</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenOrderModalForClient(t)}
                            className="px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                            title="Record renewal or payment"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Renew</span>
                          </button>
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
