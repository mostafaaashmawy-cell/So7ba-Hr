'use client';

import React from 'react';
import {
  X,
  Printer,
  Receipt,
  CheckCircle2,
  Clock,
  Building,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Download,
} from 'lucide-react';
import HumAiLogo from '@/components/common/HumAiLogo';
import { SubscriptionOrderRecord } from '@/lib/types/database';

interface InvoiceModalProps {
  order: SubscriptionOrderRecord;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const isPaid = order.payment_status === 'paid';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in print:p-0 print:bg-white">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 space-y-8 max-h-[95vh] overflow-y-auto shadow-2xl print:border-none print:shadow-none print:p-6 print:rounded-none">
        {/* Header & Close (hidden in print) */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Official SaaS Billing Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4 text-emerald-500" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body (Printed) */}
        <div className="space-y-8">
          {/* Top Brand Banner */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <HumAiLogo size="lg" />
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                <p className="font-bold text-slate-900 dark:text-white">HumAi Smart Operations Platform</p>
                <p>Enterprise Multi-Tenant SaaS Cloud</p>
                <p>Egypt & Regional Operations</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-2xl font-black text-slate-950 dark:text-white font-mono block">
                {order.order_number}
              </span>
              <p className="text-xs text-slate-500">
                Invoice Date:{' '}
                <strong className="text-slate-800 dark:text-slate-200 font-mono">
                  {order.invoice_date || (order.created_at ? new Date(order.created_at).toLocaleDateString() : '')}
                </strong>
              </p>
              <div className="pt-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                  }`}
                >
                  {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  {isPaid ? 'PAID & VERIFIED' : 'PAYMENT PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Bill To & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Billed Client Organization
              </span>
              <h4 className="text-base font-black text-slate-950 dark:text-white">
                {order.company_name}
              </h4>
              {order.admin_email && (
                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {order.admin_email}
                </p>
              )}
              {order.admin_phone && (
                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {order.admin_phone}
                </p>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Payment Channel & Transaction
              </span>
              <p className="font-bold text-slate-900 dark:text-white capitalize text-sm">
                {order.payment_method.replace('_', ' ')}
              </p>
              {order.payment_reference && (
                <p className="font-mono text-slate-600 dark:text-slate-400">
                  Ref: {order.payment_reference}
                </p>
              )}
              <p className="text-[11px] text-slate-500">
                Billing Cycle: <strong className="capitalize">{order.billing_cycle || order.plan_type}</strong>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4 text-center">Plan Tier</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Amount (EGP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-4 px-4">
                    <span className="font-extrabold text-slate-950 dark:text-white block text-sm">
                      HumAi SaaS Cloud Workspace Subscription
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Full access to multi-tenant operations, automated payroll, Cairo geofence attendance, and smart analytics.
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center uppercase font-bold text-slate-800 dark:text-slate-200">
                    {order.plan_type}
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                    1 Workspace
                  </td>
                  <td className="py-4 px-4 text-right font-black text-slate-950 dark:text-white font-sans text-sm">
                    {Number(order.amount).toLocaleString()} EGP
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-right font-extrabold text-slate-700 dark:text-slate-300">
                    Total Contract Value:
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-950 dark:text-white text-base font-sans">
                    {Number(order.amount).toLocaleString()} EGP
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes / Terms */}
          {order.notes && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                Notes & Terms:
              </span>
              <p className="text-slate-700 dark:text-slate-300">{order.notes}</p>
            </div>
          )}

          {/* Stamp & Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">HumAi Smart Operations Platform</p>
              <p className="text-[11px]">System generated commercial billing invoice. Authorized platform seal.</p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-400">
                Generated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
