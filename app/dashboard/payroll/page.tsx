'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types/database';
import { FileText, CheckCircle2, RefreshCw, AlertCircle, Check, X, Download, DollarSign, Percent } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface FinancialAdjustment {
  id: string;
  user_id: string;
  type: 'bonus' | 'penalty';
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
  user?: { full_name: string };
}

interface AdvanceRequest {
  id: string;
  user_id: string;
  amount: number;
  month: string;
  status: 'pending' | 'approved' | 'rejected';
  user?: { full_name: string };
}

interface PayslipData {
  employeeName: string;
  departmentName: string;
  jobTitle: string;
  basicSalary: number;
  commission: number;
  totalSales: number;
  bonuses: number;
  penalties: number;
  advances: number;
  latenessDeductions: number;
  socialInsurance: number;
  healthInsurance: number;
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  month: string;
}

export default function PayrollPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  // Payroll Calculation States
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // 'YYYY-MM'
  );
  const [commissionRate, setCommissionRate] = useState<number>(5); // default 5%
  
  // Lists
  const [adjustments, setAdjustments] = useState<FinancialAdjustment[]>([]);
  const [advances, setAdvances] = useState<AdvanceRequest[]>([]);
  
  // Form input states
  const [adjType, setAdjType] = useState<'bonus' | 'penalty'>('bonus');
  const [adjAmount, setAdjAmount] = useState<number | ''>('');
  const [adjNotes, setAdjNotes] = useState<string>('');
  
  const [advAmount, setAdvAmount] = useState<number | ''>('');

  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Payslip compiled states
  const [payslipData, setPayslipData] = useState<PayslipData | null>(null);
  const [showPayslip, setShowPayslip] = useState(false);

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

      // Load all employees
      const { data: users } = await supabase
        .from('users')
        .select('*, department:departments(name)')
        .eq('tenant_id', profile.tenant_id);
      
      if (users) {
        setEmployees(users as UserProfile[]);
        if (users.length > 0) {
          setSelectedEmployee(users[0].id);
        }
      }

      // Load Adjustments in Tenant
      const { data: adj } = await supabase
        .from('financial_adjustments')
        .select('*, user:users(full_name)')
        .eq('tenant_id', profile.tenant_id)
        .order('date', { ascending: false });
      
      if (adj) {
        setAdjustments(adj as FinancialAdjustment[]);
      }

      // Load Advances in Tenant
      const { data: adv } = await supabase
        .from('advances')
        .select('*, user:users(full_name)')
        .eq('tenant_id', profile.tenant_id)
        .order('month', { ascending: false });
      
      if (adv) {
        setAdvances(adv as AdvanceRequest[]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !adjAmount || !selectedEmployee) return;

    setSubmitting(true);
    setMsg(null);

    // If super admin, auto approve. If manager, set pending.
    const finalStatus = currentUser.role === 'super_admin' ? 'approved' : 'pending';

    try {
      const { error } = await supabase
        .from('financial_adjustments')
        .insert({
          tenant_id: currentUser.tenant_id,
          user_id: selectedEmployee,
          type: adjType,
          amount: Number(adjAmount),
          notes: adjNotes.trim() || null,
          status: finalStatus,
          created_by: currentUser.id
        });

      if (error) throw error;

      setMsg({
        text: finalStatus === 'approved' ? 'Adjustment successfully executed!' : 'Adjustment submitted and is pending admin approval!',
        error: false
      });
      setAdjAmount('');
      setAdjNotes('');

      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Action failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !advAmount || !selectedEmployee) return;

    setSubmitting(true);
    setMsg(null);

    // If super admin, auto approve. If manager, set pending.
    const finalStatus = currentUser.role === 'super_admin' ? 'approved' : 'pending';
    const payrollMonth = `${selectedMonth}-01`;

    try {
      const { error } = await supabase
        .from('advances')
        .insert({
          tenant_id: currentUser.tenant_id,
          user_id: selectedEmployee,
          amount: Number(advAmount),
          month: payrollMonth,
          status: finalStatus
        });

      if (error) throw error;

      setMsg({
        text: finalStatus === 'approved' ? 'Salary Advance request approved!' : 'Salary Advance submitted and is pending admin approval!',
        error: false
      });
      setAdvAmount('');

      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Action failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusAdjustment = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActionId(id);
    try {
      const { error } = await supabase
        .from('financial_adjustments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setAdjustments(adjustments.map((a) => a.id === id ? { ...a, status: newStatus } : a));
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Status change failed';
      alert(errMsg);
    } finally {
      setActionId(null);
    }
  };

  const handleStatusAdvance = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActionId(id);
    try {
      const { error } = await supabase
        .from('advances')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setAdvances(advances.map((a) => a.id === id ? { ...a, status: newStatus } : a));
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Status change failed';
      alert(errMsg);
    } finally {
      setActionId(null);
    }
  };

  // Compile Payslip
  const compilePayslip = async () => {
    const emp = employees.find((e) => e.id === selectedEmployee);
    if (!emp || !currentUser) return;

    setLoading(true);
    const startStr = `${selectedMonth}-01`;
    const endStr = `${selectedMonth}-31`; // fallback or end day of month

    try {
      // 1. Get Approved Sales & calculate Commission
      const { data: salesLogs } = await supabase
        .from('sales_logs')
        .select('amount')
        .eq('user_id', emp.id)
        .eq('status', 'approved')
        .gte('date', startStr)
        .lte('date', endStr);

      const totalSales = salesLogs ? salesLogs.reduce((sum, curr) => sum + Number(curr.amount), 0) : 0;
      const commission = (totalSales * Number(commissionRate)) / 100;

      // 2. Get Approved Bonuses & Penalties
      const { data: adjLogs } = await supabase
        .from('financial_adjustments')
        .select('*')
        .eq('user_id', emp.id)
        .eq('status', 'approved')
        .gte('date', startStr)
        .lte('date', endStr);

      const bonuses = adjLogs ? adjLogs.filter((a) => a.type === 'bonus').reduce((sum, curr) => sum + Number(curr.amount), 0) : 0;
      const penalties = adjLogs ? adjLogs.filter((a) => a.type === 'penalty').reduce((sum, curr) => sum + Number(curr.amount), 0) : 0;

      // 3. Get Approved Advances
      const { data: advLogs } = await supabase
        .from('advances')
        .select('amount')
        .eq('user_id', emp.id)
        .eq('status', 'approved')
        .eq('month', startStr);

      const totalAdvances = advLogs ? advLogs.reduce((sum, curr) => sum + Number(curr.amount), 0) : 0;

      // 4. Calculate Lateness Deductions automatically using tenant settings policy
      const { data: settings } = await supabase
        .from('tenant_settings')
        .select('*')
        .eq('tenant_id', currentUser.tenant_id)
        .single();

      const { data: checkins } = await supabase
        .from('attendance')
        .select('check_in_time')
        .eq('user_id', emp.id)
        .gte('date', startStr)
        .lte('date', endStr);

      let latenessDeductions = 0;
      if (checkins && settings && settings.lateness_policy?.thresholds) {
        const dailyRate = Number(emp.basic_salary) / 30; // standard daily rate

        checkins.forEach((c) => {
          const checkinTime = new Date(c.check_in_time);
          const shiftStart = new Date(checkinTime);
          shiftStart.setHours(9, 0, 0, 0); // standard 9:00 AM shift start

          const delayMins = Math.max(0, Math.floor((checkinTime.getTime() - shiftStart.getTime()) / 60000));
          
          // Match policy
          let maxDeductionPct = 0;
          settings.lateness_policy.thresholds.forEach((rule: { mins: number; deduction: number }) => {
            if (delayMins >= rule.mins) {
              maxDeductionPct = Math.max(maxDeductionPct, rule.deduction);
            }
          });

          latenessDeductions += maxDeductionPct * dailyRate;
        });
      }

      // 5. Insurance deductions (default to 0 if toggle disabled)
      const socialIns = Number(emp.social_insurance || 0);
      const healthIns = Number(emp.health_insurance || 0);

      // Calculations
      const grossEarnings = Number(emp.basic_salary) + commission + bonuses;
      const totalDeductions = penalties + totalAdvances + latenessDeductions + socialIns + healthIns;
      const netPay = grossEarnings - totalDeductions;

      setPayslipData({
        employeeName: emp.full_name,
        departmentName: ((emp as unknown) as { department?: { name?: string } }).department?.name || 'N/A',
        jobTitle: emp.job_title || 'N/A',
        basicSalary: Number(emp.basic_salary),
        commission,
        totalSales,
        bonuses,
        penalties,
        advances: totalAdvances,
        latenessDeductions,
        socialInsurance: socialIns,
        healthInsurance: healthIns,
        grossEarnings,
        totalDeductions,
        netPay,
        month: selectedMonth
      });

      setShowPayslip(true);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Payslip compilation failed';
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-gray-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-sky-400 mr-2" />
        Loading payroll engine...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar user={currentUser} activeRoleView={isSuperAdmin ? 'super_admin' : 'manager'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6 print:bg-white print:text-black print:p-0">
        
        {/* Printable payslip modal view */}
        {showPayslip && payslipData && (
          <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6 print:border-none print:shadow-none print:bg-white print:text-black print:p-0">
            <div className="flex justify-between items-center pb-3 border-b border-gray-800 print:hidden">
              <h3 className="font-bold text-sm text-gray-200">Generated Monthly Payslip</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="gradient-btn px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download / Print Payslip
                </button>
                <button
                  onClick={() => setShowPayslip(false)}
                  className="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                >
                  Close Payslip
                </button>
              </div>
            </div>

            {/* Printing Payslip layout */}
            <div className="space-y-6 p-4 print:p-0 font-sans">
              <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-4">
                <div>
                  <h2 className="text-lg font-black text-black">Simply HR System</h2>
                  <p className="text-[10px] text-gray-600">Employment Payslip Statement</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-500 block">Payroll Month</span>
                  <span className="text-sm font-extrabold text-sky-600 print:text-black">{payslipData.month}</span>
                </div>
              </div>

              {/* Bio Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-b border-gray-100 print:border-black font-sans text-xs text-gray-400 print:text-black">
                <div>
                  <span className="font-bold text-gray-500 block">Employee:</span>
                  <span className="text-sm font-bold text-white print:text-black">{payslipData.employeeName}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 block">Job Title:</span>
                  <span className="text-sm font-bold text-white print:text-black">{payslipData.jobTitle}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 block">Department:</span>
                  <span className="text-sm font-bold text-white print:text-black">{payslipData.departmentName}</span>
                </div>
              </div>

              {/* Financial Breakdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                {/* Earnings */}
                <div className="space-y-2 border border-gray-800/80 rounded-xl p-4 bg-gray-950/20 print:border-black print:bg-transparent">
                  <h4 className="text-xs font-bold text-sky-400 print:text-black border-b border-gray-800 pb-1 uppercase">Earnings (+)</h4>
                  <div className="flex justify-between text-xs">
                    <span>Basic Salary:</span>
                    <span>{payslipData.basicSalary.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Commissions ({commissionRate}%):</span>
                    <span>{payslipData.commission.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Approved Bonuses:</span>
                    <span>{payslipData.bonuses.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold pt-2 border-t border-gray-800/80 text-gray-200 print:text-black">
                    <span>Gross Earnings:</span>
                    <span>{payslipData.grossEarnings.toLocaleString()} EGP</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2 border border-gray-800/80 rounded-xl p-4 bg-gray-950/20 print:border-black print:bg-transparent">
                  <h4 className="text-xs font-bold text-red-400 print:text-black border-b border-gray-800 pb-1 uppercase">Deductions (-)</h4>
                  <div className="flex justify-between text-xs">
                    <span>Advances Taken:</span>
                    <span>{payslipData.advances.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Approved Penalties:</span>
                    <span>{payslipData.penalties.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Lateness Deductions:</span>
                    <span>{payslipData.latenessDeductions.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Social Insurance:</span>
                    <span>{payslipData.socialInsurance.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Health Insurance:</span>
                    <span>{payslipData.healthInsurance.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold pt-2 border-t border-gray-800/80 text-gray-200 print:text-black">
                    <span>Total Deductions:</span>
                    <span>{payslipData.totalDeductions.toLocaleString()} EGP</span>
                  </div>
                </div>
              </div>

              {/* Net pay summary panel */}
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-center font-sans print:border-black print:bg-transparent">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Net Take-Home Pay</span>
                <span className="text-2xl font-black text-sky-400 print:text-black">
                  {payslipData.netPay.toLocaleString()} EGP
                </span>
              </div>
            </div>
          </div>
        )}

        {!showPayslip && (
          <div className="space-y-6 print:hidden">
            
            {/* Top Config Engine Card */}
            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-sky-400" /> Payroll Payslip Generator
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Calculate monthly payouts, deductions, and print payslips.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Select Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Payroll Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Commission Rate (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none font-sans"
                    />
                    <Percent className="w-4 h-4 text-sky-400" />
                  </div>
                </div>
              </div>

              <button
                onClick={compilePayslip}
                className="w-full gradient-btn py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-lg"
              >
                <FileText className="w-4 h-4" /> Calculate & View Net Payslip
              </button>
            </div>

            {/* Adjustments Logging grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Request Adjustments & Advances Form */}
              <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-gray-200">Submit Adjustments & Advances</h3>
                  <p className="text-[10px] text-gray-500">Log financial modifications. Manager submissions require Admin validation.</p>
                </div>

                {msg && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    msg.error ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}>
                    {msg.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{msg.text}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Adjustment Sub-form */}
                  <form onSubmit={handleCreateAdjustment} className="space-y-3.5 p-3 rounded-xl bg-gray-900/30 border border-gray-800">
                    <h4 className="text-xs font-bold text-sky-400 border-b border-gray-800 pb-1">Bonus / Penalty Adjustments</h4>
                    
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-0.5">Adjustment Type</label>
                      <select
                        value={adjType}
                        onChange={(e) => setAdjType(e.target.value as 'bonus' | 'penalty')}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 focus:outline-none"
                      >
                        <option value="bonus">Bonus (+)</option>
                        <option value="penalty">Penalty (-)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-500 mb-0.5">Amount (EGP)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 500"
                        value={adjAmount}
                        onChange={(e) => setAdjAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 focus:outline-none font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-500 mb-0.5">Adjustment Notes</label>
                      <input
                        type="text"
                        placeholder="Reason..."
                        value={adjNotes}
                        onChange={(e) => setAdjNotes(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !adjAmount}
                      className="w-full bg-sky-500/10 border border-sky-500/20 text-sky-400 py-1.5 rounded-lg text-xs font-bold hover:bg-sky-500/20 transition-all cursor-pointer"
                    >
                      Submit Adjustment
                    </button>
                  </form>

                  {/* Advance Sub-form */}
                  <form onSubmit={handleCreateAdvance} className="space-y-3.5 p-3 rounded-xl bg-gray-900/30 border border-gray-800 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-sky-400 border-b border-gray-800 pb-1">Salary Advances</h4>
                      
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-0.5">Loan Amount (EGP)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="e.g. 2000"
                          value={advAmount}
                          onChange={(e) => setAdvAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 focus:outline-none font-sans"
                        />
                      </div>
                      
                      <p className="text-[10px] text-gray-500 leading-relaxed">Advances are allocated for the configured month above and auto-deducted during payslip generation.</p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !advAmount}
                      className="w-full bg-sky-500/10 border border-sky-500/20 text-sky-400 py-1.5 rounded-lg text-xs font-bold hover:bg-sky-500/20 transition-all mt-4 cursor-pointer"
                    >
                      Request Advance
                    </button>
                  </form>
                </div>
              </div>

              {/* Adjustments & Advances Verification Table */}
              <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4 max-h-[480px] overflow-y-auto pr-1">
                <div>
                  <h3 className="font-bold text-sm text-gray-200">Pending Approvals Queue</h3>
                  <p className="text-[10px] text-gray-500">Super admins approve or reject requests here.</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400">Adjustment Requests</h4>
                  {adjustments.map((a) => (
                    <div key={a.id} className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-between text-xs font-sans">
                      <div>
                        <div className="font-bold text-gray-200">
                          {a.user?.full_name || 'Employee'} - <span className={a.type === 'bonus' ? 'text-emerald-400' : 'text-rose-400'}>{a.type}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{a.notes || 'No justification'} ({a.date})</div>
                        <span className="text-[10px] font-bold text-sky-400">{Number(a.amount).toLocaleString()} EGP</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isSuperAdmin && a.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleStatusAdjustment(a.id, 'approved')}
                              disabled={actionId === a.id}
                              className="p-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/20 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusAdjustment(a.id, 'rejected')}
                              disabled={actionId === a.id}
                              className="p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg border border-red-500/20 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            a.status === 'approved' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-red-500/10 text-red-300'
                          }`}>{a.status}</span>
                        )}
                      </div>
                    </div>
                  ))}

                  <h4 className="text-xs font-bold text-gray-400 pt-3 border-t border-gray-900">Advance Loans Requests</h4>
                  {advances.map((a) => (
                    <div key={a.id} className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-between text-xs font-sans">
                      <div>
                        <div className="font-bold text-gray-200">
                          {a.user?.full_name || 'Employee'}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Month: {a.month.substring(0,7)}</div>
                        <span className="text-[10px] font-bold text-sky-400">{Number(a.amount).toLocaleString()} EGP</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isSuperAdmin && a.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleStatusAdvance(a.id, 'approved')}
                              disabled={actionId === a.id}
                              className="p-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/20 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusAdvance(a.id, 'rejected')}
                              disabled={actionId === a.id}
                              className="p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg border border-red-500/20 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            a.status === 'approved' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-red-500/10 text-red-300'
                          }`}>{a.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
