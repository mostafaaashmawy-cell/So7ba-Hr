'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import { UserProfile, DepartmentRecord } from '@/lib/types/database';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  Building2,
  Users,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Search,
  Briefcase,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface DepartmentWithStats extends DepartmentRecord {
  memberCount: number;
  members: UserProfile[];
  manager?: UserProfile;
}

export default function DepartmentsPage() {
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [departments, setDepartments] = useState<DepartmentWithStats[]>([]);
  const [allEmployees, setAllEmployees] = useState<UserProfile[]>([]);

  // Create Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDepartmentsData = async () => {
    setLoading(true);
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!profile) return;
    setCurrentUser(profile as UserProfile);

    // Fetch Departments
    const { data: depts } = await supabase
      .from('departments')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('name');

    // Fetch Employees
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('tenant_id', profile.tenant_id);

    const empList = (users as UserProfile[]) || [];
    setAllEmployees(empList);

    if (depts) {
      const deptsWithStats: DepartmentWithStats[] = (depts as DepartmentRecord[]).map((d) => {
        const deptMembers = empList.filter((u) => u.department_id === d.id);
        const manager = deptMembers.find((u) => u.role === 'manager' || u.role === 'super_admin');

        return {
          ...d,
          memberCount: deptMembers.length,
          members: deptMembers,
          manager,
        };
      });

      setDepartments(deptsWithStats);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDepartmentsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !currentUser?.tenant_id) return;

    setSaving(true);
    setMsg(null);

    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          tenant_id: currentUser.tenant_id,
          name: newDeptName.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setMsg({
        text: isRtl ? 'تم إنشاء القسم الإداري بنجاح!' : 'Department created successfully!',
        error: false,
      });
      setNewDeptName('');
      setShowAddModal(false);
      fetchDepartmentsData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to create department';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!confirm(isRtl ? `هل أنت متأكد من حذف قسم "${name}"؟` : `Delete department "${name}"?`)) return;

    try {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;

      setDepartments((prev) => prev.filter((d) => d.id !== id));
      setMsg({
        text: isRtl ? 'تم حذف القسم بنجاح.' : 'Department deleted.',
        error: false,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Delete failed';
      setMsg({ text: errMsg, error: true });
    }
  };

  const unassignedEmployees = allEmployees.filter((u) => !u.department_id);

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar user={currentUser} activeRoleView={currentUser?.role === 'super_admin' ? 'super_admin' : 'manager'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              <h1 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                {isRtl ? 'الهيكل الإداري وإدارة الأقسام' : 'Departments & Organization Chart'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isRtl
                ? 'توزيع الموظفين على الأقسام الإدارية، وتعيين مدراء الإدارات'
                : 'Structure departments, assign managers, and manage organizational distribution.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDepartmentsData}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'إضافة قسم جديد' : 'New Department'}</span>
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {msg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              msg.error
                ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            {msg.error ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
          <div className="cleariq-card p-4 cleariq-card-hover space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isRtl ? 'إجمالي الأقسام' : 'Total Departments'}
            </span>
            <span className="text-2xl font-extrabold text-slate-950 dark:text-white font-sans">
              {departments.length}
            </span>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              {isRtl ? 'إجمالي الموظفين المسكنين' : 'Assigned Employees'}
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-sans">
              {allEmployees.length - unassignedEmployees.length}
            </span>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover space-y-1">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              {isRtl ? 'موظفين غير مسكنين بأقسام' : 'Unassigned Employees'}
            </span>
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-sans">
              {unassignedEmployees.length}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={isRtl ? 'بحث في الأقسام...' : 'Search departments...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-950 dark:text-white"
          />
        </div>

        {/* Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="cleariq-card p-5 cleariq-card-hover flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                        {dept.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-sans">
                        {dept.memberCount} {isRtl ? 'موظف' : 'members'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Manager / Lead Badge */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {isRtl ? 'مدير القسم المسؤول' : 'Department Lead / Manager'}
                  </span>
                  {dept.manager ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold">
                        {dept.manager.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {dept.manager.full_name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px]">
                      {isRtl ? 'لم يتم تعيين مدير بعد' : 'No manager assigned'}
                    </span>
                  )}
                </div>

                {/* Members preview */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {isRtl ? 'أعضاء القسم' : 'Team Members'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.members.slice(0, 5).map((m) => (
                      <span
                        key={m.id}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {m.full_name}
                      </span>
                    ))}
                    {dept.memberCount > 5 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        +{dept.memberCount - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/dashboard/employees"
                  className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all text-center block"
                >
                  {isRtl ? 'عرض الموظفين في السجل ←' : 'Manage in Directory →'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="cleariq-card p-6 w-full max-w-md space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  {isRtl ? 'إنشاء قسم إداري جديد' : 'Create New Department'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                    {isRtl ? 'اسم القسم الإداري' : 'Department Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales, Technology, Finance"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !newDeptName.trim()}
                    className="gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isRtl ? 'حفظ القسم' : 'Create Department'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
