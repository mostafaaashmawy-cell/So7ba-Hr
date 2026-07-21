'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types/database';
import { Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [basicSalary, setBasicSalary] = useState(5000);
  const [kpiUnit, setKpiUnit] = useState('tasks');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
              basic_salary: basicSalary,
              kpi_unit: kpiUnit,
            },
          },
        });

        if (error) throw error;
        
        if (data.user) {
          router.push('/dashboard/employee');
          router.refresh();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Fetch user profile to route properly
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profile?.role === 'super_admin') {
            router.push('/dashboard/admin');
          } else if (profile?.role === 'manager') {
            router.push('/dashboard/manager');
          } else {
            router.push('/dashboard/employee');
          }
          router.refresh();
        }
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setErrorMsg(errorObj.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0b0f19]">
      {/* Dynamic Background Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-gray-800 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-btn mx-auto flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-purple-500/20 mb-4">
            S
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {isSignUp ? 'Create So7ba HR Account' : 'Welcome to So7ba HR'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {isSignUp ? 'Register employee profile' : 'Sign in to access your operations dashboard'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ahmed Mostafa"
                    className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-gray-900/90 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Basic Salary (EGP)</label>
                  <input
                    type="number"
                    required
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(Number(e.target.value))}
                    className="w-full bg-gray-900/90 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Dynamic KPI Unit</label>
                <input
                  type="text"
                  required
                  value={kpiUnit}
                  onChange={(e) => setKpiUnit(e.target.value)}
                  placeholder="e.g. pieces, calls, reports"
                  className="w-full bg-gray-900/90 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-btn py-3 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isSignUp ? 'Register Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-all font-medium"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Register here'}
          </button>
        </div>
      </div>
    </div>
  );
}
