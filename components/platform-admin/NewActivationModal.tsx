'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Plus,
  Briefcase,
} from 'lucide-react';

interface NewActivationModalProps {
  appDomain: string;
  onClose: () => void;
  onGenerate: (data: {
    companyName: string;
    adminName: string;
    adminEmail: string;
    plan: 'annual' | 'semi_annual' | 'monthly' | 'custom';
    amount: number;
    paymentMethod: string;
    notes: string;
  }) => Promise<string>;
}

export default function NewActivationModal({
  appDomain,
  onClose,
  onGenerate,
}: NewActivationModalProps) {
  const [formCompany, setFormCompany] = useState('');
  const [formAdminName, setFormAdminName] = useState('');
  const [formAdminEmail, setFormAdminEmail] = useState('');
  const [formPlan, setFormPlan] = useState<'annual' | 'semi_annual' | 'monthly' | 'custom'>('annual');
  const [formAmount, setFormAmount] = useState<number>(15000);
  const [formPaymentMethod, setFormPaymentMethod] = useState('bank_transfer');
  const [formNotes, setFormNotes] = useState('');

  const [generating, setGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePlanChange = (newPlan: 'annual' | 'semi_annual' | 'monthly' | 'custom') => {
    setFormPlan(newPlan);
    if (newPlan === 'monthly') setFormAmount(1500);
    else if (newPlan === 'semi_annual') setFormAmount(8000);
    else if (newPlan === 'annual') setFormAmount(15000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim()) return;

    setGenerating(true);
    setErrorMessage(null);

    try {
      const link = await onGenerate({
        companyName: formCompany.trim(),
        adminName: formAdminName.trim(),
        adminEmail: formAdminEmail.trim(),
        plan: formPlan,
        amount: Number(formAmount) || 0,
        paymentMethod: formPaymentMethod,
        notes: formNotes.trim(),
      });
      setGeneratedLink(link);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate invitation token');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in">
      <div className="w-full max-w-lg cleariq-card p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-500" />
              New Client Onboarding Link
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Issue a secure single-use token for offline, bank transfer, or direct client onboarding.
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

        {generatedLink ? (
          /* Success Screen */
          <div className="space-y-4 animate-in">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-black text-slate-950 dark:text-white">
                Activation Link Ready!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Workspace reserved for:{' '}
                <strong className="text-slate-900 dark:text-white">{formCompany}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Client Onboarding URL (Professional Domain):
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all">
                <span>{generatedLink}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => copyToClipboard(generatedLink)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copied to Clipboard!' : 'Copy Activation Link'}
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `أهلاً بكم في منصة HumAi! تفضلوا بإكمال إعداد مساحة العمل لشركتكم (${formCompany}) عبر الرابط المعتمد: ${generatedLink}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all"
              >
                <Share2 className="w-4 h-4" /> Share on WhatsApp
              </a>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold"
              >
                Done / Return to Super Console
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company / Organization Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Al-Nour Group"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Client Admin Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mahmoud Ali"
                  value={formAdminName}
                  onChange={(e) => setFormAdminName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="admin@alnour.com"
                  value={formAdminEmail}
                  onChange={(e) => setFormAdminEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subscription Plan
                </label>
                <select
                  value={formPlan}
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
                  Amount Paid (EGP)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formAmount || ''}
                  onChange={(e) => setFormAmount(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-sans focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Channel
                </label>
                <select
                  value={formPaymentMethod}
                  onChange={(e) => setFormPaymentMethod(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="bank_transfer">Bank Wire / Transfer</option>
                  <option value="instapay">InstaPay</option>
                  <option value="cash">Cash / Direct Office</option>
                  <option value="vodafone_cash">Vodafone Cash / E-Wallet</option>
                  <option value="cheque">Cheque</option>
                  <option value="credit_card">Credit Card (Stripe/Paymob)</option>
                  <option value="fawry">Fawry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Reference / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wire #TX-9842"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

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
                disabled={generating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Generate Activation Link
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
