'use client';

import React, { useState } from 'react';
import {
  X,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Megaphone,
  Layers,
  FileText,
} from 'lucide-react';
import { PlatformMarketingExpenseRecord } from '@/lib/types/database';

interface NewAdSpendModalProps {
  onClose: () => void;
  onCreateExpense: (data: Partial<PlatformMarketingExpenseRecord>) => Promise<void>;
}

export default function NewAdSpendModal({
  onClose,
  onCreateExpense,
}: NewAdSpendModalProps) {
  const [channel, setChannel] = useState<string>('meta');
  const [campaignName, setCampaignName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [dateSpent, setDateSpent] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [leadsCount, setLeadsCount] = useState<string>('');
  const [impressions, setImpressions] = useState<string>('');
  const [clicks, setClicks] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid positive spend amount in EGP.');
      return;
    }

    if (!dateSpent) {
      setErrorMessage('Please specify the date of the marketing expense.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const periodMonth = dateSpent.substring(0, 7); // e.g. "2026-10"

      await onCreateExpense({
        channel: channel as any,
        campaign_name: campaignName.trim() || null,
        amount: numAmount,
        currency: 'EGP',
        date_spent: dateSpent,
        period_month: periodMonth,
        leads_count: parseInt(leadsCount) || 0,
        impressions: parseInt(impressions) || 0,
        clicks: parseInt(clicks) || 0,
        notes: notes.trim() || null,
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record marketing expense');
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
              <Megaphone className="w-5 h-5 text-emerald-500" />
              Log Marketing & Ad Spend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record advertising budget spent across Meta, Google, or other channels to calculate CAC, ROAS & Net P&L.
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
          {/* Ad Channel / Source */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Advertising Channel / Source *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'meta', name: 'Meta (FB/Insta)' },
                { id: 'google', name: 'Google Ads' },
                { id: 'tiktok', name: 'TikTok Ads' },
                { id: 'linkedin', name: 'LinkedIn Ads' },
                { id: 'offline', name: 'Offline / Events' },
                { id: 'other', name: 'Other Channel' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChannel(c.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                    channel === c.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span>{c.name}</span>
                  {channel === c.id && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount Spent (EGP) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date Spent *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={dateSpent}
                  onChange={(e) => setDateSpent(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Campaign / Adset Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Q4 Cairo HR Lead Generation Campaign"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Performance Data: Leads, Impressions, Clicks */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 block">
              Optional Performance Metrics (For CPL & Conversion Analysis)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Leads Generated
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 35"
                  value={leadsCount}
                  onChange={(e) => setLeadsCount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Impressions
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50000"
                  value={impressions}
                  onChange={(e) => setImpressions(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Clicks
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1200"
                  value={clicks}
                  onChange={(e) => setClicks(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Internal Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Targeting HR managers in Cairo & Giza, test creative #2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Record Ad Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
