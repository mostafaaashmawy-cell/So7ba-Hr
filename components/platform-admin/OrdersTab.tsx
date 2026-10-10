'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  CreditCard,
  Building,
  Check,
} from 'lucide-react';
import { SubscriptionOrderRecord, TenantRecord } from '@/lib/types/database';
import { exportToCSV } from '@/lib/utils/csvExport';

interface OrdersTabProps {
  orders: SubscriptionOrderRecord[];
  tenants: TenantRecord[];
  onOpenOrderModal: () => void;
  onSelectOrder: (order: SubscriptionOrderRecord) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
}

export default function OrdersTab({
  orders,
  tenants,
  onOpenOrderModal,
  onSelectOrder,
  onUpdateOrderStatus,
}: OrdersTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (o.payment_reference && o.payment_reference.toLowerCase().includes(search.toLowerCase())) ||
      (o.admin_email && o.admin_email.toLowerCase().includes(search.toLowerCase()));

    if (!matchSearch) return false;
    if (statusFilter !== 'all' && o.payment_status !== statusFilter) return false;
    if (methodFilter !== 'all' && o.payment_method !== methodFilter) return false;
    if (planFilter !== 'all' && o.plan_type !== planFilter) return false;

    return true;
  });

  // Calculate Order Aggregates
  const totalPaidAmount = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const totalPendingAmount = orders
    .filter((o) => o.payment_status === 'pending')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const aov = orders.length > 0 ? Math.round(totalPaidAmount / Math.max(orders.filter((o) => o.payment_status === 'paid').length, 1)) : 0;

  const handleExportCSV = () => {
    const exportData = filteredOrders.map((o) => ({
      'Order Number': o.order_number,
      'Company Name': o.company_name,
      'Plan Type': o.plan_type,
      'Amount (EGP)': o.amount,
      'Payment Channel': o.payment_method,
      'Payment Status': o.payment_status,
      'Reference / Notes': o.payment_reference || o.notes || '',
      'Invoice Date': o.invoice_date || '',
      'Created At': o.created_at ? new Date(o.created_at).toISOString().split('T')[0] : '',
    }));
    exportToCSV(exportData, `humai-orders-${new Date().toISOString().split('T')[0]}`);
  };

  const handleQuickMarkPaid = async (order: SubscriptionOrderRecord) => {
    try {
      setUpdatingId(order.id);
      await onUpdateOrderStatus(order.id, 'paid');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Top Aggregates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cleariq-card p-5 cleariq-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Paid Collections</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 dark:text-white font-sans">
            {totalPaidAmount.toLocaleString()} <span className="text-xs text-slate-500 font-normal">EGP</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
            {orders.filter((o) => o.payment_status === 'paid').length} Completed Invoices
          </span>
        </div>

        <div className="cleariq-card p-5 cleariq-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Pending Invoices</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 dark:text-white font-sans">
            {totalPendingAmount.toLocaleString()} <span className="text-xs text-slate-500 font-normal">EGP</span>
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block">
            {orders.filter((o) => o.payment_status === 'pending').length} Awaiting Verification
          </span>
        </div>

        <div className="cleariq-card p-5 cleariq-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Average Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 dark:text-white font-sans">
            {aov.toLocaleString()} <span className="text-xs text-slate-500 font-normal">EGP</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">
            Per paying client contract
          </span>
        </div>

        <div className="cleariq-card p-5 cleariq-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Logged Orders</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 dark:text-white font-sans">
            {orders.length}
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold block">
            All-time SaaS transactions
          </span>
        </div>
      </div>

      {/* Main Orders Directory & Filter Bar */}
      <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-500" />
              Subscription Orders & Billing Ledger ({orders.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official ledger of all corporate subscription invoices, bank wires, InstaPay transfers, and renewals.
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
              onClick={onOpenOrderModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Order</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, company, ref..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="paid">Paid & Verified</option>
            <option value="pending">Pending Payment</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Payment Channels</option>
            <option value="bank_transfer">Bank Wire / Transfer</option>
            <option value="instapay">InstaPay</option>
            <option value="cash">Cash / Office</option>
            <option value="vodafone_cash">Vodafone Cash / E-Wallet</option>
            <option value="cheque">Cheque</option>
            <option value="credit_card">Credit Card (Stripe/Paymob)</option>
            <option value="fawry">Fawry</option>
          </select>

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

        {/* Orders Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b dark:border-slate-800">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Client Organization</th>
                <th className="py-3 px-4">Plan / Cycle</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Channel & Reference</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Order # */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {order.order_number}
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-950 dark:text-white block">
                        {order.company_name}
                      </span>
                      {order.admin_email && (
                        <span className="text-[10px] text-slate-500 font-medium block">
                          {order.admin_email}
                        </span>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 uppercase text-[11px] block">
                        {order.plan_type}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                        {order.billing_cycle || order.plan_type}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-black text-slate-950 dark:text-white font-sans text-sm">
                      {Number(order.amount).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">EGP</span>
                    </td>

                    {/* Channel */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200 capitalize block">
                        {order.payment_method.replace('_', ' ')}
                      </span>
                      {order.payment_reference && (
                        <span className="text-[10px] text-slate-500 font-mono block">
                          Ref: {order.payment_reference}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                          order.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : order.payment_status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                        }`}
                      >
                        {order.payment_status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                        {order.payment_status === 'pending' && <Clock className="w-3 h-3" />}
                        {order.payment_status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {order.invoice_date || (order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A')}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {order.payment_status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleQuickMarkPaid(order)}
                            disabled={updatingId === order.id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                            title="Confirm payment received"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark Paid</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectOrder(order)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span>Invoice</span>
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
    </div>
  );
}
