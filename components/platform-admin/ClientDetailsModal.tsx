'use client';

import React, { useState } from 'react';
import {
  X,
  Building,
  Users,
  Calendar,
  Save,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  DollarSign,
  Phone,
  Mail,
} from 'lucide-react';
import { TenantRecord } from '@/lib/types/database';

interface ClientDetailsModalProps {
  tenant: TenantRecord;
  onClose: () => void;
  onSaveTenant: (updatedData: Partial<TenantRecord>) => Promise<void>;
  onOpenOrderModal: (tenant: TenantRecord) => void;
}

export default function ClientDetailsModal({
  tenant,
  onClose,
  onSaveTenant,
  onOpenOrderModal,
}: ClientDetailsModalProps) {
  const [name, setName] = useState(tenant.name || '');
  const [status, setStatus] = useState(tenant.subscription_status || 'active');
  const [plan, setPlan] = useState(tenant.subscription_plan || 'annual');
  const [maxEmployees, setMaxEmployees] = useState(tenant.max_employees || 50);
  const [expiresAt, setExpiresAt] = useState(
    tenant.subscription_expires_at
      ? new Date(tenant.subscription_expires_at).toISOString().split('T')[0]
      : ''
  );
  const [contactEmail, setContactEmail] = useState(tenant.contact_email || '');
  const [contactPhone, setContactPhone] = useState(tenant.contact_phone || '');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleQuickExtend = (months: number) => {
    const baseDate = expiresAt ? new Date(expiresAt) : new Date();
    baseDate.setMonth(baseDate.getMonth() + months);
    setExpiresAt(baseDate.toISOString().split('T')[0]);
    if (status === 'expired' || status === 'suspended') {
      setStatus('active');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await onSaveTenant({
        id: tenant.id,
        name: name.trim(),
        subscription_status: status as any,
        subscription_plan: plan as any,
        max_employees: Number(maxEmployees) || 50,
        subscription_expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
      });

      setSuccessMsg('Workspace settings updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update workspace settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in">
      <div className="w-full max-w-xl cleariq-card p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center justify-center text-lg">
              {tenant.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                Manage Client Workspace
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Workspace ID: {tenant.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Current Workspace Quick Stats */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Seats</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {tenant.user_count || 0} / {tenant.max_employees || 50}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Super Admin</span>
            <span className="font-bold text-slate-900 dark:text-white truncate block">
              {tenant.super_admin?.full_name || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Onboarded</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subscription Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="active">Active (Access Enabled)</option>
                <option value="suspended">Suspended (Access Blocked)</option>
                <option value="expired">Expired (Due for Renewal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subscription Plan Tier
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="annual">Annual Plan</option>
                <option value="semi_annual">Semi-Annual Plan</option>
                <option value="monthly">Monthly Plan</option>
                <option value="enterprise">Enterprise</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Max Allowed Seats (Quota)
              </label>
              <input
                type="number"
                min="1"
                required
                value={maxEmployees}
                onChange={(e) => setMaxEmployees(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-sans focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Limits how many employee accounts can be added.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subscription Expiry Date
              </label>
              <input
                type="date"
                required
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-sans focus:outline-none focus:border-emerald-500"
              />
              {/* Quick Extend Buttons */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickExtend(1)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                >
                  +1 Mo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickExtend(6)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                >
                  +6 Mo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickExtend(12)}
                  className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold"
                >
                  +1 Year
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="billing@company.com"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone / WhatsApp
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenOrderModal(tenant);
              }}
              className="px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer"
            >
              Log Order / Payment for this Client
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
