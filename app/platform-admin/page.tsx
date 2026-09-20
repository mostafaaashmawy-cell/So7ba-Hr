'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Building,
  Users,
  ShieldCheck,
  Plus,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Search,
  DollarSign,
  Calendar,
  AlertCircle,
  Share2,
  CheckCircle2,
  ArrowLeft,
  Briefcase,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';
import HumAiLogo from '@/components/common/HumAiLogo';
import { TenantRecord, TenantInvitationRecord, PlatformMetrics, UserProfile } from '@/lib/types/database';

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'https://app.humai-hr.com';

export default function PlatformAdminPage() {
  const router = useRouter();
  const supabase = createClient();

  // Authentication & Authorization
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<UserProfile | null>(null);

  // Data State
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    total_tenants: 0,
    total_users: 0,
    pending_invitations: 0,
    total_annual: 0,
    total_monthly: 0,
    total_revenue: 0,
  });
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [invitations, setInvitations] = useState<TenantInvitationRecord[]>([]);

  // Search & Filter
  const [tenantSearch, setTenantSearch] = useState('');
  const [invitationSearch, setInvitationSearch] = useState('');

  // New Client Activation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCompany, setFormCompany] = useState('');
  const [formAdminName, setFormAdminName] = useState('');
  const [formAdminEmail, setFormAdminEmail] = useState('');
  const [formPlan, setFormPlan] = useState<'annual' | 'semi_annual' | 'monthly' | 'custom'>('annual');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formPaymentMethod, setFormPaymentMethod] = useState('bank_transfer');
  const [formNotes, setFormNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check Platform Admin Authorization
  useEffect(() => {
    const verifyAuth = async () => {
      setCheckingAuth(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Use SECURITY DEFINER RPC to bypass RLS (platform admin has no tenant_id
      // which can cause the normal RLS self-select to fail in some policy combinations)
      const { data: profiles } = await supabase.rpc('get_my_profile');
      const profile = profiles && profiles.length > 0 ? profiles[0] : null;

      // Authorized ONLY if user has is_platform_admin = true
      if (profile && profile.is_platform_admin === true) {
        setIsAuthorized(true);
        setCurrentAdmin(profile as UserProfile);
        loadPlatformData();
      } else {
        setIsAuthorized(false);
        setCheckingAuth(false);
      }
    };

    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlatformData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Tenants with Super Admin info and User count
      const { data: tenantsData } = await supabase
        .from('tenants')
        .select('*, users:users(id, role, full_name, mobile)')
        .order('created_at', { ascending: false });

      if (tenantsData) {
        const enrichedTenants: TenantRecord[] = tenantsData.map((t) => {
          const userList = (t.users as Array<{ id: string; role: string; full_name: string; mobile?: string }>) || [];
          const superAdminUser = userList.find((u) => u.role === 'super_admin');
          return {
            id: t.id,
            name: t.name,
            plan: t.plan || 'enterprise',
            subscription_status: t.subscription_status || 'active',
            subscription_plan: t.subscription_plan || 'annual',
            subscription_expires_at: t.subscription_expires_at || null,
            max_employees: t.max_employees || 50,
            contact_email: t.contact_email || null,
            contact_phone: t.contact_phone || null,
            created_at: t.created_at,
            user_count: userList.length,
            super_admin: superAdminUser
              ? ({
                  id: superAdminUser.id,
                  full_name: superAdminUser.full_name,
                  mobile: superAdminUser.mobile,
                  role: 'super_admin',
                } as UserProfile)
              : null,
          };
        });
        setTenants(enrichedTenants);
      }

      // 2. Fetch Invitations / Activation Links
      const { data: invitationsData } = await supabase
        .from('tenant_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (invitationsData) {
        setInvitations(invitationsData as TenantInvitationRecord[]);
      }

      // 3. Aggregate Platform Metrics
      const totalTenants = tenantsData ? tenantsData.length : 0;
      let totalUsers = 0;
      let totalAnnual = 0;
      let totalMonthly = 0;

      tenantsData?.forEach((t) => {
        const uList = (t.users as unknown[]) || [];
        totalUsers += uList.length;
        if (t.subscription_plan === 'annual') totalAnnual += 1;
        if (t.subscription_plan === 'monthly') totalMonthly += 1;
      });

      const pendingInvites =
        invitationsData?.filter(
          (inv) => !inv.is_used && new Date(inv.expires_at) > new Date()
        ).length || 0;

      const totalRevenue =
        invitationsData?.reduce((acc, inv) => acc + (Number(inv.amount_paid) || 0), 0) || 0;

      setMetrics({
        total_tenants: totalTenants,
        total_users: totalUsers,
        pending_invitations: pendingInvites,
        total_annual: totalAnnual,
        total_monthly: totalMonthly,
        total_revenue: totalRevenue,
      });
    } catch (err) {
      console.error('Failed to load platform data', err);
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  };

  const handleGenerateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim()) return;

    setGenerating(true);
    setErrorMessage(null);

    try {
      // 1. Try RPC function if present
      const { data: rpcData, error: rpcErr } = await supabase.rpc('generate_client_invitation', {
        p_company_name: formCompany.trim(),
        p_email: formAdminEmail.trim() || null,
        p_plan_type: formPlan,
        p_amount_paid: Number(formAmount) || 0,
        p_payment_method: formPaymentMethod,
        p_notes: formNotes.trim() || null,
      });

      let tokenValue = '';

      if (!rpcErr && rpcData && rpcData.success) {
        tokenValue = rpcData.token;
      } else {
        // Fallback: direct insert with random token
        const generatedToken = Array.from(crypto.getRandomValues(new Uint8Array(24)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        const { data: insertData, error: insertErr } = await supabase
          .from('tenant_invitations')
          .insert({
            token: generatedToken,
            company_name: formCompany.trim(),
            email: formAdminEmail.trim() || null,
            role: 'super_admin',
            plan_type: formPlan,
            amount_paid: Number(formAmount) || 0,
            payment_method: formPaymentMethod,
            notes: formNotes.trim() || null,
            expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            is_used: false,
          })
          .select()
          .single();

        if (insertErr) throw insertErr;
        tokenValue = insertData.token;
      }

      // Professional Domain URL
      const finalLink = `${APP_DOMAIN}/onboarding?token=${tokenValue}`;
      setGeneratedLink(finalLink);
      loadPlatformData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate invitation link';
      setErrorMessage(msg);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setFormCompany('');
    setFormAdminName('');
    setFormAdminEmail('');
    setFormPlan('annual');
    setFormAmount(0);
    setFormPaymentMethod('bank_transfer');
    setFormNotes('');
    setGeneratedLink(null);
    setCopiedLink(false);
    setErrorMessage(null);
  };

  // Filtered tenants
  const filteredTenants = tenants.filter((t) => {
    const matchName = t.name.toLowerCase().includes(tenantSearch.toLowerCase());
    const matchAdmin = t.super_admin?.full_name?.toLowerCase().includes(tenantSearch.toLowerCase());
    return matchName || matchAdmin;
  });

  // Filtered invitations
  const filteredInvitations = invitations.filter((inv) => {
    const matchCompany = inv.company_name.toLowerCase().includes(invitationSearch.toLowerCase());
    const matchEmail = inv.email?.toLowerCase().includes(invitationSearch.toLowerCase());
    return matchCompany || matchEmail;
  });

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[--bg] flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-500 mr-2" />
        Authenticating Platform Owner Access...
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[--bg] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md cleariq-card p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Access Restricted</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This console is strictly reserved for the HumAi Platform Owner. Your account does not have platform administrative privileges.
          </p>
          <div className="pt-2 flex gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--bg] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Platform Owner Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <HumAiLogo variant="horizontal" size="sm" showTagline />
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Platform Super Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all"
            >
              <Building className="w-3.5 h-3.5" /> Workspace View
            </Link>

            <button
              type="button"
              onClick={() => {
                resetModal();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Client Activation
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              HumAi Multi-Tenant SaaS Control Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Global overview across all corporate workspaces, active client subscriptions, and offline onboarding.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPlatformData}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* 1. Global Platform KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Tenants */}
          <div className="cleariq-card p-5 cleariq-card-hover space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Companies
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950 dark:text-white">
                {metrics.total_tenants}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                organizations
              </span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span>{metrics.total_annual} on Annual Plans</span>
            </div>
          </div>

          {/* Total Employees Across All Companies */}
          <div className="cleariq-card p-5 cleariq-card-hover space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Platform-Wide Users
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950 dark:text-white">
                {metrics.total_users}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                employees
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Avg.{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {metrics.total_tenants > 0
                  ? (metrics.total_users / metrics.total_tenants).toFixed(1)
                  : 0}
              </span>{' '}
              users per company
            </div>
          </div>

          {/* Pending Onboarding Links */}
          <div className="cleariq-card p-5 cleariq-card-hover space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pending Activations
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950 dark:text-white">
                {metrics.pending_invitations}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                awaiting setup
              </span>
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
              Tokens active & unclaimed
            </div>
          </div>

          {/* Total Logged Revenue */}
          <div className="cleariq-card p-5 cleariq-card-hover space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Recorded Contracts
              </span>
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950 dark:text-white">
                {metrics.total_revenue.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                EGP
              </span>
            </div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
              Offline + direct activations
            </div>
          </div>
        </div>

        {/* 2. Companies & Workspaces Directory */}
        <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-500" />
                All Client Workspaces ({tenants.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every tenant registered on the HumAi multi-tenant platform with active seat counts.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tenantSearch}
                onChange={(e) => setTenantSearch(e.target.value)}
                placeholder="Search company or admin name..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b dark:border-slate-800">
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Super Admin Contact</th>
                  <th className="py-3 px-4 text-center">Active Seats</th>
                  <th className="py-3 px-4">Subscription Plan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Onboarded Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No companies match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-950 dark:text-white block">
                              {t.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {t.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {t.super_admin ? (
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              {t.super_admin.full_name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {t.super_admin.mobile || 'Super Admin'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No admin assigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-extrabold text-xs">
                          {t.user_count || 0} users
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] block">
                          {t.subscription_plan || 'Annual'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Expires: {t.subscription_expires_at ? new Date(t.subscription_expires_at).toLocaleDateString() : '1 Year'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            t.subscription_status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                          }`}
                        >
                          {t.subscription_status || 'Active'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Activation Links & Token Tracker */}
        <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                Activation Links & Invitations ({invitations.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All issued onboarding links using the official <span className="font-bold text-emerald-600 dark:text-emerald-400">app.humai-hr.com</span> domain.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={invitationSearch}
                onChange={(e) => setInvitationSearch(e.target.value)}
                placeholder="Search by company or email..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b dark:border-slate-800">
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Recipient Email</th>
                  <th className="py-3 px-4">Contract / Plan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Expires At</th>
                  <th className="py-3 px-4 text-center">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No activation links generated yet. Click &quot;New Client Activation&quot; above to issue one.
                    </td>
                  </tr>
                ) : (
                  filteredInvitations.map((inv) => {
                    const fullLink = `${APP_DOMAIN}/onboarding?token=${inv.token}`;
                    const isExpired = new Date(inv.expires_at) < new Date();
                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-950 dark:text-white">
                          {inv.company_name}
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {inv.email || <span className="text-slate-400 italic">Unassigned (Open Link)</span>}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] block">
                            {inv.plan_type || 'Annual'}
                          </span>
                          {inv.amount_paid ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-sans">
                              {Number(inv.amount_paid).toLocaleString()} EGP ({inv.payment_method})
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Direct Setup</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {inv.is_used ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" /> Activated
                            </span>
                          ) : isExpired ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 w-max">
                              Expired
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 w-max">
                              Pending Setup
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {new Date(inv.expires_at).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(fullLink)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                              title="Copy activation link"
                            >
                              <Copy className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Copy</span>
                            </button>

                            <a
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                                `Welcome to HumAi! Complete your corporate workspace setup here: ${fullLink}`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 transition-all"
                              title="Share via WhatsApp"
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
      </main>

      {/* 4. Manual Client Activation Modal (Offline Payments) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg cleariq-card p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-500" />
                  New Client Activation (Offline Payment)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Generate a verified onboarding token for bank transfer, cash, or direct sales.
                </p>
              </div>

              <button
                type="button"
                onClick={resetModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold p-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {generatedLink ? (
              /* Success State: Show Generated Link with Copy and WhatsApp */
              <div className="space-y-4 animate-in">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
                    Activation Link Generated Successfully!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Workspace: <span className="font-bold text-slate-900 dark:text-white">{formCompany}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Client Onboarding URL (Professional Domain):
                  </label>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-slate-100 break-all">
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
                      `Welcome to HumAi! Complete your corporate workspace setup here: ${generatedLink}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all"
                  >
                    <Share2 className="w-4 h-4" /> Share via WhatsApp
                  </a>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold"
                  >
                    Done / Close Modal
                  </button>
                </div>
              </div>
            ) : (
              /* Form State: Enter Client & Contract Details */
              <form onSubmit={handleGenerateInvitation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al-Amal Trading Co."
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Client Admin Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ahmed Fouad"
                      value={formAdminName}
                      onChange={(e) => setFormAdminName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Admin Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="admin@alamal.com"
                      value={formAdminEmail}
                      onChange={(e) => setFormAdminEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Subscription Plan
                    </label>
                    <select
                      value={formPlan}
                      onChange={(e) => setFormPlan(e.target.value as 'annual' | 'semi_annual' | 'monthly' | 'custom')}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="annual">Annual Plan (12 Months)</option>
                      <option value="semi_annual">Semi-Annual (6 Months)</option>
                      <option value="monthly">Monthly Plan</option>
                      <option value="custom">Custom Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Amount Paid (EGP)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 24000"
                      value={formAmount || ''}
                      onChange={(e) => setFormAmount(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-sans focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Payment Channel
                    </label>
                    <select
                      value={formPaymentMethod}
                      onChange={(e) => setFormPaymentMethod(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="bank_transfer">Bank Wire / Transfer</option>
                      <option value="cash">Cash / Direct Office</option>
                      <option value="cheque">Cheque</option>
                      <option value="vodafone_cash">Vodafone Cash / E-Wallet</option>
                      <option value="instapay">InstaPay</option>
                      <option value="stripe">Online (Stripe/Card)</option>
                      <option value="paymob">Paymob</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Payment Reference / Receipt #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wire #TX-9842"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                  Link will be generated with professional domain: <span className="font-bold text-slate-900 dark:text-slate-100">{APP_DOMAIN}/onboarding?token=...</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetModal}
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
      )}
    </div>
  );
}
