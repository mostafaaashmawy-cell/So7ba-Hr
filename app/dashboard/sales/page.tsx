'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types/database';
import { TrendingUp, Plus, Check, X, CheckCircle2, RefreshCw, AlertCircle, Trash } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface SalesLog {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  user?: { full_name: string };
}

export default function SalesCommissionsPage() {
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [sales, setSales] = useState<SalesLog[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);

  // Log Form State
  const [salesAmount, setSalesAmount] = useState<number | ''>('');
  const [salesDate, setSalesDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>(''); // For admin logging on behalf of employee

  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Load User details and Sales logs
  const loadData = async () => {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    // Profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      setCurrentUser(profile as UserProfile);
      setSelectedEmployee(profile.id);

      // Fetch Sales logs
      // If manager/admin: fetch team sales, else fetch only own sales
      let query = supabase.from('sales_logs').select('*, user:users(full_name)');
      
      if (profile.role === 'manager') {
        // Load team members
        const { data: team } = await supabase
          .from('users')
          .select('*')
          .eq('manager_id', authUser.id);
        
        if (team) {
          setTeamMembers(team);
          const teamIds = [authUser.id, ...team.map((m) => m.id)];
          query = query.in('user_id', teamIds);
        }
      } else if (profile.role === 'super_admin') {
        // Load all users
        const { data: all } = await supabase
          .from('users')
          .select('*');
        if (all) {
          setTeamMembers(all);
        }
      } else {
        // Employee
        query = query.eq('user_id', authUser.id);
      }

      const { data: logs } = await query.order('date', { ascending: false });
      if (logs) {
        setSales(logs as SalesLog[]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !salesAmount) return;

    setSubmitting(true);
    setMsg(null);

    const logUserId = (currentUser.role === 'super_admin' || currentUser.role === 'manager') ? selectedEmployee : currentUser.id;

    try {
      const { error } = await supabase
        .from('sales_logs')
        .insert({
          tenant_id: currentUser.tenant_id,
          user_id: logUserId,
          amount: Number(salesAmount),
          date: salesDate,
          status: 'pending' // pending by default
        });

      if (error) throw error;

      setMsg({ text: isRtl ? 'تم تقديم تقرير المبيعات بنجاح وهو قيد الانتظار!' : 'Sales report submitted successfully and is pending approval!', error: false });
      setSalesAmount('');
      
      // Reload logs
      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Submission failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    if (!currentUser) return;
    setActionId(id);

    try {
      const { error } = await supabase
        .from('sales_logs')
        .update({
          status: newStatus,
          approved_by: currentUser.id
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setSales(sales.map((s) => s.id === id ? { ...s, status: newStatus } : s));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Status update failed';
      alert(errMsg);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? 'هل تريد حذف هذا التقرير؟' : 'Delete this sales log?')) return;
    setActionId(id);

    try {
      const { error } = await supabase
        .from('sales_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSales(sales.filter((s) => s.id !== id));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Delete failed';
      alert(errMsg);
    } finally {
      setActionId(null);
    }
  };

  const isManagement = currentUser?.role === 'manager' || currentUser?.role === 'super_admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-gray-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-sky-400 mr-2" />
        Loading sales & commissions panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar user={currentUser} activeRoleView={currentUser?.role === 'super_admin' ? 'super_admin' : currentUser?.role === 'manager' ? 'manager' : 'employee'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sales Logger Form */}
          <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-400" /> Log Daily/Weekly Sales
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Submit sales achievements for commission calculation.</p>
            </div>

            {msg && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                msg.error ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                {msg.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isManagement && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Select Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                  >
                    <option value={currentUser.id}>{isRtl ? 'أنا (نفسي)' : 'Myself'}</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Sales Volume (EGP)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 50000"
                  value={salesAmount}
                  onChange={(e) => setSalesAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Log Date</label>
                <input
                  type="date"
                  required
                  value={salesDate}
                  onChange={(e) => setSalesDate(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !salesAmount}
                className="gradient-btn py-2.5 rounded-xl text-xs font-bold text-white w-full flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Submit Sales Log
              </button>
            </form>
          </div>

          {/* Sales Logs & Action Center */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-gray-200">Sales Reports Tracking</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Managers and admins review and approve pending sales logs.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300 font-sans">
                <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Employee</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount (EGP)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-sans">
                  {sales.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-900/40">
                      <td className="px-4 py-3 font-semibold text-white">
                        {s.user?.full_name || 'Team Member'}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {s.date}
                      </td>
                      <td className="px-4 py-3 font-bold text-sky-400">
                        {Number(s.amount).toLocaleString()} EGP
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          s.status === 'approved' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                          s.status === 'rejected' ? 'bg-red-500/10 text-red-300 border-red-500/30' :
                          'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                        {isManagement && s.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(s.id, 'approved')}
                              disabled={actionId === s.id}
                              className="p-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/30 cursor-pointer"
                              title="Approve"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(s.id, 'rejected')}
                              disabled={actionId === s.id}
                              className="p-1 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg border border-red-500/30 cursor-pointer"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {/* Only allow deletion of pending logs or by super admin */}
                        {(s.status === 'pending' || currentUser?.role === 'super_admin') && (
                          <button
                            onClick={() => handleDelete(s.id)}
                            disabled={actionId === s.id}
                            className="p-1 bg-gray-900 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg border border-gray-800 hover:border-red-500/30 cursor-pointer"
                            title="Delete"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-500">
                        No sales reports logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
