'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  Download,
  Target,
  Globe,
  Clock,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import {
  UserProfile,
  UserRole,
  DepartmentRecord,
  ShiftRecord,
  SystemAuditLogRecord,
  TenantSettings,
} from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/context/LanguageContext';
import { exportToCSV } from '@/lib/utils/csvExport';
import { logAuditAction } from '@/lib/utils/auditLogger';

interface EmployeeManagementProps {
  initialUsers: UserProfile[];
  initialShifts?: ShiftRecord[];
  initialAuditLogs?: SystemAuditLogRecord[];
  tenantSettings?: TenantSettings | null;
}

export default function EmployeeManagement({
  initialUsers,
  initialShifts = [],
  initialAuditLogs = [],
}: EmployeeManagementProps) {
  const { isRtl } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [shifts, setShifts] = useState<ShiftRecord[]>(initialShifts);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLogRecord[]>(initialAuditLogs);
  const [kpiUnits, setKpiUnits] = useState<{ id: string; name: string }[]>([]);

  // TABS: registry (Employee Database), departments, kpis, audit
  const [activeTab, setActiveTab] = useState<'registry' | 'departments' | 'kpis' | 'audit'>('registry');

  // MESSAGES & LOADINGS
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  // SEARCH & FILTERS
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterJob, setFilterJob] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterShift, setFilterShift] = useState('all');
  const [filterRemote, setFilterRemote] = useState('all');
  const [auditSearch, setAuditSearch] = useState('');

  // CONFIGURATORS STATE
  const [newDeptName, setNewDeptName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');

  // EDIT PROFILE FORM
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    role: 'employee' as UserRole,
    basic_salary: 5000,
    commission_rate: 5,
    kpi_unit: 'tasks',
    manager_id: '',
    mobile: '',
    id_number: '',
    id_photo_url: '',
    age: 20,
    birth_date: '',
    birth_cert_url: '',
    qualification: '',
    qualification_url: '',
    address: '',
    job_title: '',
    criminal_record_url: '',
    department_id: '',
    payment_method: 'Cash',
    income_tax_rate: 0,
    social_insurance: 0,
    health_insurance: 0,
    contract_type: 'Full-Time',
    probation_period: 3,
    contract_end_date: '',
    annual_leave_allowance: 21,
    // Remote, Flexible & Shift
    is_remote: false,
    is_flexible: false,
    required_daily_hours: 8,
    shift_id: '',
    custom_schedule_enabled: false,
    custom_start_time: '09:00',
    custom_end_time: '17:00',
    custom_work_days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] as string[],
  });

  const supabase = createClient();

  const fetchKpiUnits = async () => {
    const { data } = await supabase.from('kpi_units').select('*').order('name');
    if (data) setKpiUnits(data);
  };

  const fetchDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').order('name');
    if (data) setDepartments(data);
  };

  const fetchShifts = async () => {
    if (shifts.length > 0) return;
    const { data } = await supabase.from('shifts').select('*').order('start_time');
    if (data) setShifts(data);
  };

  const fetchAuditLogs = async () => {
    const { data } = await supabase
      .from('system_audit_logs')
      .select('*, actor:users(full_name)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setAuditLogs(data);
  };

  useEffect(() => {
    fetchKpiUnits();
    fetchDepartments();
    fetchShifts();
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Filtered employees list
  const filteredUsers = users.filter((u) => {
    const nameMatch = u.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const mobileMatch = u.mobile?.toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery && !nameMatch && !mobileMatch) return false;

    if (filterDept !== 'all' && u.department_id !== filterDept) return false;
    if (filterJob !== 'all' && u.job_title !== filterJob) return false;
    if (filterPayment !== 'all' && u.payment_method !== filterPayment) return false;
    if (filterShift !== 'all' && u.shift_id !== filterShift) return false;
    if (filterRemote === 'remote' && !u.is_remote) return false;
    if (filterRemote === 'onsite' && u.is_remote) return false;

    return true;
  });

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const actionMatch = log.action_type.toLowerCase().includes(auditSearch.toLowerCase());
    const entityMatch = log.entity_name.toLowerCase().includes(auditSearch.toLowerCase());
    const actorMatch = log.actor?.full_name?.toLowerCase().includes(auditSearch.toLowerCase());
    return !auditSearch || actionMatch || entityMatch || actorMatch;
  });

  // Extract filter dropdown contents
  const uniqueJobTitles = Array.from(new Set(users.map((u) => u.job_title).filter((t): t is string => !!t)));
  const uniquePaymentMethods = Array.from(new Set(users.map((u) => u.payment_method).filter((t): t is string => !!t)));
  const managersList = users.filter((u) => u.role === 'manager' || u.role === 'super_admin');

  // Handle Edit Profile Click
  const handleEditClick = (u: UserProfile) => {
    setSelectedUser(u);
    setEditForm({
      full_name: u.full_name || '',
      role: (u.role as UserRole) || 'employee',
      basic_salary: Number(u.basic_salary) || 5000,
      commission_rate: Number(u.commission_rate) || 5,
      kpi_unit: u.kpi_unit || 'tasks',
      manager_id: u.manager_id || '',
      mobile: u.mobile || '',
      id_number: u.id_number || '',
      id_photo_url: u.id_photo_url || '',
      age: Number(u.age) || 20,
      birth_date: u.birth_date || '',
      birth_cert_url: u.birth_cert_url || '',
      qualification: u.qualification || '',
      qualification_url: u.qualification_url || '',
      address: u.address || '',
      job_title: u.job_title || '',
      criminal_record_url: u.criminal_record_url || '',
      department_id: u.department_id || '',
      payment_method: u.payment_method || 'Cash',
      income_tax_rate: Number(u.income_tax_rate) || 0,
      social_insurance: Number(u.social_insurance) || 0,
      health_insurance: Number(u.health_insurance) || 0,
      contract_type: u.contract_type || 'Full-Time',
      probation_period: Number(u.probation_period) || 3,
      contract_end_date: u.contract_end_date || '',
      annual_leave_allowance: Number(u.annual_leave_allowance) || 21,
      is_remote: !!u.is_remote,
      is_flexible: !!u.is_flexible,
      required_daily_hours: Number(u.required_daily_hours) || 8,
      shift_id: u.shift_id || '',
      custom_schedule_enabled: !!u.custom_schedule_enabled,
      custom_start_time: u.custom_start_time || '09:00',
      custom_end_time: u.custom_end_time || '17:00',
      custom_work_days: u.custom_work_days || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    });
  };

  // Save Employee Changes
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);
    setMsg(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editForm.full_name,
          role: editForm.role,
          basic_salary: editForm.basic_salary,
          commission_rate: editForm.commission_rate,
          kpi_unit: editForm.kpi_unit,
          manager_id: editForm.manager_id || null,
          mobile: editForm.mobile || null,
          id_number: editForm.id_number || null,
          id_photo_url: editForm.id_photo_url || null,
          age: editForm.age || null,
          birth_date: editForm.birth_date || null,
          birth_cert_url: editForm.birth_cert_url || null,
          qualification: editForm.qualification || null,
          qualification_url: editForm.qualification_url || null,
          address: editForm.address || null,
          job_title: editForm.job_title || null,
          criminal_record_url: editForm.criminal_record_url || null,
          department_id: editForm.department_id || null,
          payment_method: editForm.payment_method || null,
          income_tax_rate: editForm.income_tax_rate || 0,
          social_insurance: editForm.social_insurance || 0,
          health_insurance: editForm.health_insurance || 0,
          contract_type: editForm.contract_type || 'Full-Time',
          probation_period: editForm.probation_period || 3,
          contract_end_date: editForm.contract_end_date || null,
          annual_leave_allowance: editForm.annual_leave_allowance || 21,
          is_remote: editForm.is_remote,
          is_flexible: editForm.is_flexible,
          required_daily_hours: editForm.required_daily_hours,
          shift_id: editForm.shift_id || null,
          custom_schedule_enabled: editForm.custom_schedule_enabled,
          custom_start_time: editForm.custom_schedule_enabled ? editForm.custom_start_time : null,
          custom_end_time: editForm.custom_schedule_enabled ? editForm.custom_end_time : null,
          custom_work_days: editForm.custom_schedule_enabled ? editForm.custom_work_days : null,
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      // Log action to system audit trail
      const { data: { user: currentAuth } } = await supabase.auth.getUser();
      if (currentAuth && selectedUser.tenant_id) {
        await logAuditAction(supabase, {
          tenant_id: selectedUser.tenant_id,
          actor_id: currentAuth.id,
          action_type: 'UPDATE_EMPLOYEE_PROFILE',
          entity_name: 'users',
          entity_id: selectedUser.id,
          details: {
            employee_name: editForm.full_name,
            role: editForm.role,
            is_remote: editForm.is_remote,
            is_flexible: editForm.is_flexible,
            shift_id: editForm.shift_id,
          },
        });
      }

      // Update state locally
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? ({
                ...u,
                ...editForm,
                role: editForm.role as UserRole,
                manager_id: editForm.manager_id || null,
                department_id: editForm.department_id || null,
                shift_id: editForm.shift_id || null,
                department: departments.find((d) => d.id === editForm.department_id) || u.department,
                shift: shifts.find((s) => s.id === editForm.shift_id) || null,
              } as UserProfile)
            : u
        )
      );

      setMsg({ text: isRtl ? 'تم تحديث بيانات الموظف بنجاح!' : 'Employee profile updated successfully!', error: false });
      setSelectedUser(null);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Update failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setLoading(false);
    }
  };

  // Add Department
  const handleAddDept = async () => {
    if (!newDeptName.trim()) return;
    setLoading(true);
    const { data: { user: currentAuth } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('departments').insert({ name: newDeptName.trim() }).select().single();
    if (error) {
      setMsg({ text: error.message, error: true });
    } else if (data) {
      setDepartments([...departments, data]);
      setNewDeptName('');
      setMsg({ text: isRtl ? 'تمت إضافة القسم بنجاح!' : 'Department created successfully!', error: false });

      if (currentAuth && users[0]?.tenant_id) {
        logAuditAction(supabase, {
          tenant_id: users[0].tenant_id,
          actor_id: currentAuth.id,
          action_type: 'CREATE_DEPARTMENT',
          entity_name: 'departments',
          entity_id: data.id,
          details: { name: data.name },
        });
      }
    }
    setLoading(false);
  };

  // Delete Department
  const handleDeleteDept = async (id: string) => {
    if (!confirm(isRtl ? 'هل أنت متأكد من حذف هذا القسم؟' : 'Are you sure you want to delete this department?')) return;
    setLoading(true);
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) {
      setMsg({ text: error.message, error: true });
    } else {
      setDepartments(departments.filter((d) => d.id !== id));
      setMsg({ text: isRtl ? 'تم حذف القسم بنجاح.' : 'Department deleted successfully.', error: false });
    }
    setLoading(false);
  };

  // Add KPI Unit
  const handleAddKpiUnit = async () => {
    if (!newUnitName.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from('kpi_units').insert({ name: newUnitName.trim() }).select().single();
    if (error) {
      setMsg({ text: error.message, error: true });
    } else if (data) {
      setKpiUnits([...kpiUnits, data]);
      setNewUnitName('');
      setMsg({ text: isRtl ? 'تمت إضافة وحدة القياس بنجاح!' : 'KPI Unit added successfully!', error: false });
    }
    setLoading(false);
  };

  // Delete KPI Unit
  const handleDeleteKpiUnit = async (id: string) => {
    if (!confirm(isRtl ? 'هل أنت متأكد من حذف وحدة القياس؟' : 'Are you sure you want to delete this KPI Unit?')) return;
    setLoading(true);
    const { error } = await supabase.from('kpi_units').delete().eq('id', id);
    if (error) {
      setMsg({ text: error.message, error: true });
    } else {
      setKpiUnits(kpiUnits.filter((u) => u.id !== id));
      setMsg({ text: isRtl ? 'تم حذف وحدة القياس بنجاح.' : 'KPI Unit deleted successfully.', error: false });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* 4-Tab Horizontal Switchers matching reference */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => { setActiveTab('registry'); setSelectedUser(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'registry'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" /> {isRtl ? 'سجل وقاعدة بيانات الموظفين' : 'Employee Database Registry'}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('departments'); setSelectedUser(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'departments'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <FolderOpen className="w-4 h-4" /> {isRtl ? 'إعدادات الأقسام' : 'Departments Config'}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('kpis'); setSelectedUser(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'kpis'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Target className="w-4 h-4" /> {isRtl ? 'إعدادات مؤشرات الأداء' : 'KPI Metrics Config'}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('audit'); setSelectedUser(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> {isRtl ? 'سجل تدقيق النظام والمشرفين' : 'System Audit Trail'}
        </button>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
            msg.error
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          {msg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          <span className="font-medium">{msg.text}</span>
        </div>
      )}

      {/* TAB 1: EMPLOYEE REGISTRY DATABASE */}
      {activeTab === 'registry' && !selectedUser && (
        <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'ابحث بالاسم أو الهاتف...' : 'Search by Name or Mobile...'}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Shift Filter */}
              {shifts.length > 0 && (
                <select
                  value={filterShift}
                  onChange={(e) => setFilterShift(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="all">{isRtl ? 'كل الورديات' : 'All Shifts'}</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}

              {/* Remote / Onsite Filter */}
              <select
                value={filterRemote}
                onChange={(e) => setFilterRemote(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">{isRtl ? 'العمل المكتبي وعن بعد' : 'All Work Modes'}</option>
                <option value="remote">{isRtl ? '🌐 عن بعد (Check-in Anywhere)' : '🌐 Remote'}</option>
                <option value="onsite">{isRtl ? '🏢 مكتبي (Geofenced)' : '🏢 On-Site'}</option>
              </select>

              {/* Department filter */}
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">{isRtl ? 'كل الأقسام' : 'All Departments'}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              {/* Job Title Filter */}
              <select
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">{isRtl ? 'كل المسميات' : 'All Job Titles'}</option>
                {uniqueJobTitles.map((job) => (
                  <option key={job} value={job}>{job}</option>
                ))}
              </select>

              {/* Payment Method Filter */}
              {uniquePaymentMethods.length > 0 && (
                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="all">{isRtl ? 'طريقة الدفع' : 'Payment Method'}</option>
                  {uniquePaymentMethods.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              )}

              {/* Export to CSV */}
              <button
                type="button"
                onClick={() =>
                  exportToCSV(
                    filteredUsers.map((u) => ({
                      Name: u.full_name,
                      Role: u.role,
                      Department: u.department?.name || 'N/A',
                      JobTitle: u.job_title || 'N/A',
                      Mobile: u.mobile || 'N/A',
                      BasicSalary: u.basic_salary,
                      CommissionRate: `${u.commission_rate || 0}%`,
                      WorkMode: u.is_remote ? 'Remote' : 'Onsite',
                      Shift: u.shift?.name || 'General',
                      PaymentMethod: u.payment_method || 'Cash',
                    })),
                    'HumAi_Employee_Registry.csv'
                  )
                }
                className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تصدير السجل' : 'Export Registry'}</span>
              </button>

              {/* View Full Directory CTA */}
              <Link
                href="/dashboard/employees"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 transition-all shadow-xs"
              >
                <span>{isRtl ? 'دليل الموظفين الكامل (100+) ←' : 'View Full Employee Directory (100+) →'}</span>
              </Link>
            </div>
          </div>

          {/* Employees Table (Limited to latest 10) */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">{isRtl ? 'الموظف' : 'Employee'}</th>
                  <th className="py-3 px-4">{isRtl ? 'القسم والمسمى' : 'Dept & Title'}</th>
                  <th className="py-3 px-4">{isRtl ? 'نظام العمل والوردية' : 'Work Mode & Shift'}</th>
                  <th className="py-3 px-4">{isRtl ? 'الهاتف والراتب' : 'Contact & Salary'}</th>
                  <th className="py-3 px-4 text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      {isRtl ? 'لا يوجد موظفون مطابقون لخيارات البحث' : 'No employees matching search criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.slice(0, 10).map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center font-sans">
                            {u.full_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-950 dark:text-white block">{u.full_name}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-sans">{u.role}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{u.job_title || 'N/A'}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{u.department?.name || 'Operations'}</span>
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {u.is_remote ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 flex items-center gap-1">
                              <Globe className="w-3 h-3" /> Remote / Anywhere
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                              🏢 On-Site
                            </span>
                          )}

                          {u.is_flexible && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Flex ({u.required_daily_hours || 8}h)
                            </span>
                          )}
                        </div>

                        {u.shift ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                            ⏰ {u.shift.name} ({u.shift.start_time} - {u.shift.end_time})
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block">Standard Hours</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-950 dark:text-white font-sans block">
                          {Number(u.basic_salary).toLocaleString()} EGP
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{u.mobile || 'No Phone'}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleEditClick(u)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'تعديل الملف' : 'Edit Profile'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Bottom 10-Row Indicator & CTA */}
            {filteredUsers.length > 10 && (
              <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30">
                <span className="text-xs text-slate-500 font-medium">
                  {isRtl
                    ? `يتم عرض أحدث 10 موظفين من إجمالي ${filteredUsers.length} موظف`
                    : `Showing latest 10 of ${filteredUsers.length} employees`}
                </span>
                <Link
                  href="/dashboard/employees"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 transition-all shadow-xs"
                >
                  <span>{isRtl ? 'فتح سجل ودليل الموظفين الشامل (100+) ←' : 'View Full Employee Directory (100+) →'}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {isRtl ? 'سجل تدقيق الإجراءات وعمليات المشرفين' : 'System & Administrative Audit Trail'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isRtl
                  ? 'سجل غير قابل للتعديل يوثق جميع التغييرات الإدارية، تعديلات السياسات، والموافقات المالية'
                  : 'Immutable security log tracking all admin overrides, policy changes, and workflow approvals'}
              </p>
            </div>

            <div className="flex items-center gap-2 relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder={isRtl ? 'بحث في سجل التدقيق...' : 'Search logs by action or actor...'}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">{isRtl ? 'التاريخ والوقت' : 'Timestamp'}</th>
                  <th className="py-3 px-4">{isRtl ? 'المشرف (الفاعل)' : 'Actor (Admin)'}</th>
                  <th className="py-3 px-4">{isRtl ? 'نوع الإجراء' : 'Action Type'}</th>
                  <th className="py-3 px-4">{isRtl ? 'العنصر المستهدف' : 'Entity'}</th>
                  <th className="py-3 px-4">{isRtl ? 'التفاصيل والبيانات' : 'Details / Payload'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      {isRtl ? 'لا توجد سجلات تدقيق مسجلة بعد' : 'No audit records logged yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-950 dark:text-white">
                        {log.actor?.full_name || 'System Admin'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 uppercase tracking-wider font-mono">
                          {log.action_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {log.entity_name} {log.entity_id ? `(#${String(log.entity_id).slice(0, 6)})` : ''}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px] max-w-xs truncate">
                        {JSON.stringify(log.details || {})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS CONFIG */}
      {activeTab === 'departments' && (
        <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">{isRtl ? 'إدارة الأقسام والوحدات' : 'Manage Corporate Departments'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{isRtl ? 'إضافة أو حذف الأقسام التنظيمية في الشركة' : 'Create or remove departments for user assignment.'}</p>
          </div>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder={isRtl ? 'اسم القسم الجديد...' : 'e.g. Sales, Marketing, IT...'}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddDept}
              disabled={loading}
              className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> {isRtl ? 'إضافة' : 'Add'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{dept.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteDept(dept.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: KPI METRICS CONFIG */}
      {activeTab === 'kpis' && (
        <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">{isRtl ? 'وحدات قياس ومؤشرات الأداء' : 'KPI Metrics & Units'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{isRtl ? 'إضافة وحدات قياس مخصصة لمتابعة الإنتاجية' : 'Define custom productivity measurement units.'}</p>
          </div>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder={isRtl ? 'اسم الوحدة (قطع، مكالمات، ملفات...)' : 'e.g. calls, pieces, designs...'}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddKpiUnit}
              disabled={loading}
              className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> {isRtl ? 'إضافة' : 'Add'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {kpiUnits.map((unit) => (
              <div
                key={unit.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-xs">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{unit.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteKpiUnit(unit.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL / VIEW */}
      {selectedUser && (
        <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {isRtl ? 'تعديل السجل الشامل للموظف' : 'Comprehensive Employee Record & Policies'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedUser.full_name} ({selectedUser.id})
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

          <form onSubmit={handleSaveUser} className="space-y-6">
            {/* 1. Core Profile Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                1. {isRtl ? 'البيانات الأساسية والوظيفية' : 'Core Identification & Employment'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'الاسم بالكامل' : 'Full Name'}</label>
                  <input
                    type="text"
                    required
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'الدور والصلاحيات' : 'Role Scopes'}</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'القسم التنظيمي' : 'Department'}</label>
                  <select
                    value={editForm.department_id}
                    onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">{isRtl ? 'اختر القسم...' : 'Select Department...'}</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'المسمى الوظيفي' : 'Job Title'}</label>
                  <input
                    type="text"
                    value={editForm.job_title}
                    onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                    placeholder="e.g. Senior Operations Specialist"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'المدير المباشر' : 'Direct Supervisor / Manager'}</label>
                  <select
                    value={editForm.manager_id}
                    onChange={(e) => setEditForm({ ...editForm, manager_id: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">{isRtl ? 'بدون مدير مباشر' : 'No Direct Manager'}</option>
                    {managersList.map((m) => (
                      <option key={m.id} value={m.id}>{m.full_name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'رقم الهاتف' : 'Mobile Phone'}</label>
                  <input
                    type="text"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    placeholder="01012345678"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'رصيد الإجازات السنوي (أيام)' : 'Annual Leave Allowance (Days)'}</label>
                  <input
                    type="number"
                    value={editForm.annual_leave_allowance}
                    onChange={(e) => setEditForm({ ...editForm, annual_leave_allowance: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* 2. Remote Work, Flexible Schedule & Shifts Assignment */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" /> 2. {isRtl ? 'نظام العمل، الورديات، والعمل عن بعد' : 'Work Mode, Shifts & Remote Overrides'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Remote Work Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      {isRtl ? 'العمل عن بعد (Check-in Anywhere)' : 'Remote Work Override'}
                    </span>
                    <input
                      type="checkbox"
                      checked={editForm.is_remote}
                      onChange={(e) => setEditForm({ ...editForm, is_remote: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isRtl
                      ? 'عند التفعيل، يتم تجاوز فحص النطاق الجغرافي (Geofencing) كلياً لهذا الموظف.'
                      : 'Bypasses GPS geofence restrictions completely for this employee.'}
                  </p>
                </div>

                {/* Flexible Schedule Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-teal-600" />
                      {isRtl ? 'ساعات عمل مرنة (Flexible)' : 'Flexible Schedule'}
                    </span>
                    <input
                      type="checkbox"
                      checked={editForm.is_flexible}
                      onChange={(e) => setEditForm({ ...editForm, is_flexible: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                  {editForm.is_flexible && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        {isRtl ? 'إجمالي الساعات المطلوبة يومياً' : 'Required Daily Hours'}
                      </label>
                      <input
                        type="number"
                        value={editForm.required_daily_hours}
                        onChange={(e) => setEditForm({ ...editForm, required_daily_hours: Number(e.target.value) })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-950 dark:text-white font-sans"
                      />
                    </div>
                  )}
                </div>

                {/* Shift Assignment */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    {isRtl ? 'الوردية المسندة (Shift Assignment)' : 'Assigned Shift Schedule'}
                  </span>
                  <select
                    value={editForm.shift_id}
                    onChange={(e) => setEditForm({ ...editForm, shift_id: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white cursor-pointer"
                  >
                    <option value="">{isRtl ? 'بدون وردية (ساعات الشركة الافتراضية)' : 'Default Company Schedule'}</option>
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.start_time} - {s.end_time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Financial & Compensation Package */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                3. {isRtl ? 'الراتب، العمولات، والتأمينات' : 'Compensation & Insurance Parameters'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'الراتب الأساسي (EGP)' : 'Basic Salary (EGP)'}</label>
                  <input
                    type="number"
                    required
                    value={editForm.basic_salary}
                    onChange={(e) => setEditForm({ ...editForm, basic_salary: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'نسبة العمولة (%)' : 'Commission Rate (%)'}</label>
                  <input
                    type="number"
                    value={editForm.commission_rate}
                    onChange={(e) => setEditForm({ ...editForm, commission_rate: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'نسبة ضريبة كسب العمل (%)' : 'Income Tax Rate (%)'}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editForm.income_tax_rate}
                    onChange={(e) => setEditForm({ ...editForm, income_tax_rate: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'التأمين الاجتماعي (EGP)' : 'Social Insurance'}</label>
                  <input
                    type="number"
                    value={editForm.social_insurance}
                    onChange={(e) => setEditForm({ ...editForm, social_insurance: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'التأمين الصحي (EGP)' : 'Health Insurance'}</label>
                  <input
                    type="number"
                    value={editForm.health_insurance}
                    onChange={(e) => setEditForm({ ...editForm, health_insurance: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? (isRtl ? 'جاري الحفظ...' : 'Saving Changes...') : (isRtl ? 'حفظ التعديلات' : 'Save Employee Profile')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
