'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import HumAiLogo from '@/components/common/HumAiLogo';

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const redirectParam = searchParams.get('redirect');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Use SECURITY DEFINER RPC to safely get profile regardless of tenant_id
        const { data: profiles } = await supabase.rpc('get_my_profile');
        const profile = profiles && profiles.length > 0 ? profiles[0] : null;

        // 1. If explicit redirect query param was passed (e.g. /platform-admin)
        if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
          router.push(redirectParam);
        } else if (profile?.is_platform_admin) {
          // 2. Platform Admin defaults to Platform Console
          router.push('/platform-admin');
        } else if (!profile?.tenant_id) {
          // 3. User with no tenant -> onboarding
          router.push('/onboarding');
        } else if (profile?.role === 'super_admin') {
          // 4. Client Super Admin -> Organization Admin Dashboard
          router.push('/dashboard/admin');
        } else if (profile?.role === 'manager') {
          router.push('/dashboard/manager');
        } else {
          router.push('/dashboard/employee');
        }
        router.refresh();
      }
    } catch (err: unknown) {
      console.error('Auth error details:', err);
      let message = 'Invalid email or password';
      if (err && typeof err === 'object') {
        if ('message' in err && typeof err.message === 'string') {
          message = err.message;
        } else {
          message = JSON.stringify(err);
        }
      } else if (typeof err === 'string') {
        message = err;
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Subtle background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-800/10 dark:bg-slate-700/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md cleariq-card p-8 relative z-10 space-y-6">
        <div className="text-center flex flex-col items-center">
          <HumAiLogo variant="full" size="lg" className="mb-3" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Sign in to HumAi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Enter your company credentials to access your operations dashboard
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2.5 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Work Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-btn py-3 rounded-xl font-bold text-sm text-white shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* B2B Onboarding & Security Banner */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Enterprise Multi-Tenant Isolated Workspace</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            New organization? Company registration is strictly by invitation link.
            Contact your HR department or HumAi Sales for your activation link.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500 mr-2" />
          Loading authentication...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

