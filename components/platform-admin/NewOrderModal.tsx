'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Receipt,
  DollarSign,
  Building,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  CreditCard,
} from 'lucide-react';
import { TenantRecord, SubscriptionOrderRecord } from '@/lib/types/database';

interface NewOrderModalProps {
  tenants: TenantRecord[];
  preselectedTenant?: TenantRecord | null;
  onClose: () => void;
  onCreateOrder: (orderData: Partial<SubscriptionOrderRecord>, autoExtendTenant: boolean) => Promise<void>;
}

export default function NewOrderModal({
  tenants,
  preselectedTenant,
  onClose,
  onCreateOrder,
}: NewOrderModalProps) {
  const [selectedTenantId, setSelectedTenantId] = useState<string>(preselectedTenant?.id || '');
  const [customCompanyName, setCustomCompanyName] = useState<string>(preselectedTenant?.name || '');
  const [adminEmail, setAdminEmail] = useState<string>(preselectedTenant?.contact_email || '');
  const [adminPhone, setAdminPhone] = useState<string>(preselectedTenant?.contact_phone || preselectedTenant?.super_admin?.mobile || '');

  const [planType, setPlanType] = useState<'monthly' | 'semi_annual' | 'annual' | 'custom'>('annual');
  const [amount, setAmount] = useState<number>(15000);
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [paymentStatus, setPaymentStatus] = useState<string>('paid');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [autoExtend, setAutoExtend] = useState<boolean>(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update company info when tenant is chosen
  useEffect(() => {
    if (selectedTenantId && selectedTenantId !== 'new') {
      const found = tenants.find((t) => t.id === selectedTenantId);
      if (found) {
        setCustomCompanyName(found.name);
        if (found.contact_email) setAdminEmail(found.contact_email);
        if (found.contact_phone || found.super_admin?.mobile) {
          setAdminPhone(found.contact_phone || found.super_admin?.mobile || '');
        }
      }
    }
  }, [selectedTenantId, tenants]);

  // Adjust default recommended price when plan changes
  const handlePlanChange = (newPlan: 'monthly' | 'semi_annual' | 'annual' | 'custom') => {
    setPlanType(newPlan);
    if (newPlan === 'monthly') setAmount(1500);
    else if (newPlan === 'semi_annual') setAmount(8000);
    else if (newPlan === 'annual') setAmount(15000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCompanyName.trim()) {
      setErrorMessage('Please enter a company name.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const generatedOrderNum = `ORD-${Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()}`;

      await onCreateOrder(
        {
          order_number: generatedOrderNum,
          tenant_id: selectedTenantId && selectedTenantId !== 'new' ? selectedTenantId : null,
          company_name: customCompanyName.trim(),
          admin_email: adminEmail.trim() || null,
          admin_phone: adminPhone.trim() || null,
          plan_type: planType,
          billing_cycle: planType,
          amount: Number(amount) || 0,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          payment_reference: paymentReference.trim() || null,
          invoice_date: invoiceDate,
          notes: notes.trim() || null,
        },
        autoExtend && selectedTenantId !== 'new' && !!selectedTenantId
      );

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record subscription order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in">
      <div className="w-full max-w-lg cleariq-card p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-500" />
              Record Subscription Order / Renewal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Log a verified corporate subscription invoice, offline payment, or contract renewal.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Client Workspace *
            </label>
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">-- Choose Existing Workspace or Type New --</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Admin: {t.super_admin?.full_name || 'N/A'})
                </option>
              ))}
              <option value="new">+ New / Unregistered Client Company</option>
            </select>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Company / Organization Name *
            </label>
            <input
              type="text"
              required
              value={customCompanyName}
              onChange={(e) => setCustomCompanyName(e.target.value)}
              placeholder="e.g. Al-Amal Trading Co."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admin Contact Phone
              </label>
              <input
                type="tel"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admin Email (Optional)
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@company.com"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Plan & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subscription Plan
              </label>
              <select
                value={planType}
                onChange={(e) => handlePlanChange(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="annual">Annual Plan (12 Mo)</option>
                <option value="semi_annual">Semi-Annual (6 Mo)</option>
                <option value="monthly">Monthly Plan (1 Mo)</option>
                <option value="custom">Custom Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contract Amount (EGP) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="15000"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-sans focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="bank_transfer">Bank Wire / Transfer</option>
                <option value="instapay">InstaPay</option>
                <option value="cash">Cash / Office Direct</option>
                <option value="vodafone_cash">Vodafone Cash / E-Wallet</option>
                <option value="cheque">Cheque</option>
                <option value="credit_card">Credit Card (Stripe/Paymob)</option>
                <option value="fawry">Fawry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="paid">Paid & Verified (Complete)</option>
                <option value="pending">Pending Payment Verification</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Reference / Receipt #
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. Wire #TX-9824 or InstaPay"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-sans focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Auto-extend checkbox */}
          {selectedTenantId && selectedTenantId !== 'new' && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
              <input
                type="checkbox"
                id="autoExtend"
                checked={autoExtend}
                onChange={(e) => setAutoExtend(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="autoExtend" className="text-xs font-bold text-emerald-800 dark:text-emerald-300 cursor-pointer">
                Automatically extend workspace expiration date by this plan duration (+{planType === 'monthly' ? '1 Mo' : planType === 'semi_annual' ? '6 Mo' : '1 Year'}).
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Save & Log Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
