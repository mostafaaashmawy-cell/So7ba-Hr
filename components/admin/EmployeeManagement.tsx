'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  Download,
  Upload,
  ExternalLink,
  Target,
  Percent,
} from 'lucide-react';
import { UserProfile, DepartmentRecord } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/context/LanguageContext';
import { exportToCSV } from '@/lib/utils/csvExport';

interface EmployeeManagementProps {
  initialUsers: UserProfile[];
}

export default function EmployeeManagement({ initialUsers }: EmployeeManagementProps) {
  const { t, isRtl } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [kpiUnits, setKpiUnits] = useState<{ id: string; name: string }[]>([]);

  // TABS: registry (Employee Database), departments, kpis
  const [activeTab, setActiveTab] = useState<'registry' | 'departments' | 'kpis'>('registry');

  // MESSAGES & LOADINGS
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  // SEARCH & FILTERS
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterJob, setFilterJob] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

  // CONFIGURATORS STATE
  const [newDeptName, setNewDeptName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');

  // EDIT PROFILE FORM
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    role: 'employee',
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
    social_insurance: 0,
    health_insurance: 0,
    contract_type: 'Full-Time',
    probation_period: 3,
    contract_end_date: '',
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

  useEffect(() => {
    fetchKpiUnits();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered employees list
  const filteredUsers = users.filter((u) => {
    const nameMatch = u.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const mobileMatch = u.mobile?.toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery && !nameMatch && !mobileMatch) return false;

    if (filterDept !== 'all' && u.department_id !== filterDept) return false;
    if (filterJob !== 'all' && u.job_title !== filterJob) return false;
    if (filterPayment !== 'all' && u.payment_method !== filterPayment) return false;

    return true;
  });

  // Extract filter dropdown contents
  const uniqueJobTitles = Array.from(new Set(users.map((u) => u.job_title).filter((t): t is string => !!t)));
  const managersList = users.filter((u) => u.role === 'manager' || u.role === 'super_admin');

  // File Upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldName);
    setMsg(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `employee_docs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setEditForm((prev) => ({
        ...prev,
        [fieldName]: publicUrlData.publicUrl,
      }));

      setMsg({ text: isRtl ? 'تم رفع المستند بنجاح!' : 'Document uploaded successfully!', error: false });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'File upload failed';
      setMsg({ text: errorMsg, error: true });
    } finally {
      setUploadingField(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const exportData = filteredUsers.map((u) => {
      const dept = departments.find((d) => d.id === u.department_id);
      return {
        'Full Name': u.full_name,
        Role: u.role,
        'Job Title': u.job_title || 'N/A',
        Department: dept?.name || 'N/A',
        'Mobile Number': u.mobile || 'N/A',
        'National ID': u.id_number || 'N/A',
        Age: u.age || 'N/A',
        'Basic Salary': u.basic_salary,
        'Commission Rate (%)': u.commission_rate ?? 5,
        'Social Insurance': u.social_insurance || 0,
        'Health Insurance': u.health_insurance || 0,
        'Contract Type': u.contract_type || 'N/A',
        'Contract End Date': u.contract_end_date || 'N/A',
        'Payment Method': u.payment_method || 'N/A',
      };
    });
    exportToCSV(exportData, `HumAi_Employee_Registry_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Open Edit Form
  const handleEditClick = (user: UserProfile) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      role: user.role || 'employee',
      basic_salary: Number(user.basic_salary || 5000),
      commission_rate: Number(user.commission_rate ?? 5),
      kpi_unit: user.kpi_unit || 'tasks',
      manager_id: user.manager_id || '',
      mobile: user.mobile || '',
      id_number: user.id_number || '',
      id_photo_url: user.id_photo_url || '',
      age: Number(user.age || 20),
      birth_date: user.birth_date || '',
      birth_cert_url: user.birth_cert_url || '',
      qualification: user.qualification || '',
      qualification_url: user.qualification_url || '',
      address: user.address || '',
      job_title: user.job_title || '',
      criminal_record_url: user.criminal_record_url || '',
      department_id: user.department_id || '',
      payment_method: user.payment_method || 'Cash',
      social_insurance: Number(user.social_insurance || 0),
      health_insurance: Number(user.health_insurance || 0),
      contract_type: user.contract_type || 'Full-Time',
      probation_period: Number(user.probation_period || 3),
      contract_end_date: user.contract_end_date || '',
      custom_schedule_enabled: user.custom_schedule_enabled || false,
      custom_start_time: user.custom_start_time || '09:00',
      custom_end_time: user.custom_end_time || '17:00',
      custom_work_days: user.custom_work_days || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    });
    setMsg(null);
  };

  // Save Edit Form Changes
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: editForm.full_name,
        role: editForm.role,
        basic_salary: Number(editForm.basic_salary),
        commission_rate: Number(editForm.commission_rate),
        kpi_unit: editForm.kpi_unit,
        manager_id: editForm.manager_id || null,
        mobile: editForm.mobile,
        id_number: editForm.id_number,
        id_photo_url: editForm.id_photo_url,
        age: Number(editForm.age),
        birth_date: editForm.birth_date || null,
        birth_cert_url: editForm.birth_cert_url,
        qualification: editForm.qualification,
        qualification_url: editForm.qualification_url,
        address: editForm.address,
        job_title: editForm.job_title,
        criminal_record_url: editForm.criminal_record_url,
        department_id: editForm.department_id || null,
        payment_method: editForm.payment_method,
        social_insurance: Number(editForm.social_insurance),
        health_insurance: Number(editForm.health_insurance),
        contract_type: editForm.contract_type,
        probation_period: Number(editForm.probation_period),
        contract_end_date: editForm.contract_end_date || null,
        custom_schedule_enabled: editForm.custom_schedule_enabled,
        custom_start_time: editForm.custom_start_time,
        custom_end_time: editForm.custom_end_time,
        custom_work_days: editForm.custom_work_days,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedUser.id)
      .select()
      .single();

    if (error) {
      setMsg({ text: error.message, error: true });
    } else if (data) {
      const { data: refreshedUsers } = await supabase
        .from('users')
        .select('*, department:departments(*)');

      if (refreshedUsers) {
        setUsers(refreshedUsers as UserProfile[]);
      } else {
        setUsers(users.map((u) => (u.id === selectedUser.id ? (data as UserProfile) : u)));
      }

      setSelectedUser(null);
      setMsg({ text: isRtl ? 'تم تحديث بيانات الموظف بنجاح!' : 'Employee profile updated successfully!', error: false });
    }
    setLoading(false);
  };

  // Add Department
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from('departments')
      .insert({ name: newDeptName.trim() })
      .select()
      .single();

    if (error) {
      setMsg({ text: error.message, error: true });
    } else if (data) {
      setDepartments([...departments, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewDeptName('');
      setMsg({ text: isRtl ? 'تمت إضافة القسم بنجاح!' : 'Department added successfully!', error: false });
    }
    setLoading(false);
  };

  // Delete Department
  const handleDeleteDept = async (id: string, name: string) => {
    if (!confirm(isRtl ? `هل أنت متأكد من حذف قسم "${name}"؟` : `Are you sure you want to delete "${name}"?`)) return;

    setLoading(true);
    setMsg(null);

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
  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;

    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from('kpi_units')
      .insert({ name: newUnitName.trim().toLowerCase() })
      .select()
      .single();

    if (error) {
      setMsg({ text: error.message, error: true });
    } else if (data) {
      setKpiUnits([...kpiUnits, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewUnitName('');
      setMsg({ text: isRtl ? 'تمت إضافة وحدة القياس بنجاح!' : 'KPI Unit added successfully!', error: false });
    }
    setLoading(false);
  };

  // Delete KPI Unit
  const handleDeleteUnit = async (id: string, name: string) => {
    if (!confirm(isRtl ? `هل أنت متأكد من حذف وحدة "${name}"؟` : `Are you sure you want to delete "${name}"?`)) return;

    setLoading(true);
    setMsg(null);

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
      {/* Tab Selectors */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => { setActiveTab('registry'); setSelectedUser(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'registry'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" /> {isRtl ? 'قاعدة بيانات وسجل الموظفين' : 'Employee Database Registry'}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('departments'); setSelectedUser(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'departments'
              ? 'bg-blue-600 text-white shadow-xs'
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
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Target className="w-4 h-4" /> {isRtl ? 'إعدادات مؤشرات الأداء' : 'KPI Metrics Config'}
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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Department filter */}
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="all">{isRtl ? 'جميع الأقسام' : 'All Departments'}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* Job Title filter */}
              <select
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="all">{isRtl ? 'جميع المسميات' : 'All Job Titles'}</option>
                {uniqueJobTitles.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>

              {/* Export CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تصدير CSV' : 'Export CSV'}</span>
              </button>
            </div>
          </div>

          {/* Registry Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-200 uppercase text-[10px] tracking-wider font-extrabold">
                <tr>
                  <th className="px-4 py-3.5">{t('fullName')}</th>
                  <th className="px-4 py-3.5">{isRtl ? 'الهاتف' : 'Contact'}</th>
                  <th className="px-4 py-3.5">{isRtl ? 'القسم' : 'Department'}</th>
                  <th className="px-4 py-3.5">{isRtl ? 'المسمى الوظيفي' : 'Job Title'}</th>
                  <th className="px-4 py-3.5">{isRtl ? 'الراتب الأساسي' : 'Basic Salary'}</th>
                  <th className="px-4 py-3.5">{isRtl ? 'العمولة %' : 'Commission %'}</th>
                  <th className="px-4 py-3.5">{isRtl ? 'العقد' : 'Contract'}</th>
                  <th className="px-4 py-3.5">{isRtl ? 'التأمينات' : 'Insurances'}</th>
                  <th className="px-4 py-3.5">{isRtl ? 'المستندات' : 'Docs'}</th>
                  <th className="px-4 py-3.5 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredUsers.map((u) => {
                  const dept = departments.find((d) => d.id === u.department_id);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-950 dark:text-white">{u.full_name}</td>
                      <td className="px-4 py-3.5 text-slate-800 dark:text-slate-300 font-sans font-semibold">{u.mobile || '--'}</td>
                      <td className="px-4 py-3.5 text-blue-700 dark:text-blue-400 font-bold">{dept?.name || '--'}</td>
                      <td className="px-4 py-3.5 text-slate-800 dark:text-slate-300 font-medium">{u.job_title || '--'}</td>
                      <td className="px-4 py-3.5 font-extrabold text-emerald-700 dark:text-emerald-400 font-sans">
                        {Number(u.basic_salary || 0).toLocaleString()} EGP
                      </td>
                      <td className="px-4 py-3.5 font-extrabold text-blue-700 dark:text-blue-400 font-sans">
                        {u.commission_rate ?? 5}%
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 dark:text-slate-300 font-medium">
                        <span className="font-semibold">{u.contract_type || 'Full-Time'}</span>
                        {u.contract_end_date && (
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                            Exp: {u.contract_end_date}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-slate-800 dark:text-slate-300 font-sans">
                        <div>Soc: {u.social_insurance || 0} EGP</div>
                        <div>Med: {u.health_insurance || 0} EGP</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        <div className="flex gap-2">
                          {u.id_photo_url && (
                            <a
                              href={u.id_photo_url}
                              target="_blank"
                              rel="noreferrer"
                              title="ID Photo"
                              className="text-blue-600 hover:text-blue-700 p-1 bg-blue-50 dark:bg-blue-950/40 rounded-md"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {u.qualification_url && (
                            <a
                              href={u.qualification_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Qualification"
                              className="text-purple-600 hover:text-purple-700 p-1 bg-purple-50 dark:bg-purple-950/40 rounded-md"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {u.criminal_record_url && (
                            <a
                              href={u.criminal_record_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Criminal Record"
                              className="text-rose-600 hover:text-rose-700 p-1 bg-rose-50 dark:bg-rose-950/40 rounded-md"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleEditClick(u)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg transition-all cursor-pointer"
                          title={isRtl ? 'تعديل البيانات' : 'Edit Profile'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT PROFILE PANEL */}
      {activeTab === 'registry' && selectedUser && (
        <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white">
                {isRtl ? `تعديل ملف الموظف: ${selectedUser.full_name}` : `Edit Profile: ${selectedUser.full_name}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRtl ? 'تحديث السجل الإداري والعمولات والمستندات الثبوتية' : 'Update registry fields, commissions, and official documents'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

          <form onSubmit={handleSaveDetails} className="space-y-6 font-sans">
            {/* 1. Core Bio Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{t('fullName')}</label>
                <input
                  type="text"
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'رقم الهاتف' : 'Mobile Number'}</label>
                <input
                  type="text"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'الرقم القومي' : 'ID National Number'}</label>
                <input
                  type="text"
                  value={editForm.id_number}
                  onChange={(e) => setEditForm({ ...editForm, id_number: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'السن' : 'Age'}</label>
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'تاريخ الميلاد' : 'Birth Date'}</label>
                <input
                  type="date"
                  value={editForm.birth_date}
                  onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'المؤهل الدراسي' : 'Academic Qualification'}</label>
                <input
                  type="text"
                  value={editForm.qualification}
                  onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Job & Financial Settings (Including Commission Rate) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'المسمى الوظيفي' : 'Job Title'}</label>
                <input
                  type="text"
                  value={editForm.job_title}
                  onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'القسم' : 'Department'}</label>
                <select
                  value={editForm.department_id}
                  onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="">{isRtl ? 'لا يوجد قسم' : 'No department'}</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'الراتب الأساسي (ج.م)' : 'Basic Salary (EGP)'}</label>
                <input
                  type="number"
                  value={editForm.basic_salary}
                  onChange={(e) => setEditForm({ ...editForm, basic_salary: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none font-sans"
                />
              </div>

              {/* Commission Rate field inside Employee Profile */}
              <div>
                <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" />
                  {isRtl ? 'نسبة العمولة من المبيعات (%)' : 'Sales Commission Rate (%)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={editForm.commission_rate}
                  onChange={(e) => setEditForm({ ...editForm, commission_rate: Number(e.target.value) })}
                  className="w-full bg-blue-50/50 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-800 rounded-xl px-3.5 py-2 text-xs font-extrabold text-blue-700 dark:text-blue-300 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'طريقة دفع الراتب' : 'Salary Payment Method'}</label>
                <select
                  value={editForm.payment_method}
                  onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="Cash">{isRtl ? 'نقداً' : 'Cash'}</option>
                  <option value="Bank Transfer">{isRtl ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                  <option value="InstaPay">{isRtl ? 'إنستاباي' : 'InstaPay'}</option>
                  <option value="Vodafone Cash">{isRtl ? 'فودافون كاش' : 'Vodafone Cash'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'نوع العقد' : 'Contract Type'}</label>
                <select
                  value={editForm.contract_type}
                  onChange={(e) => setEditForm({ ...editForm, contract_type: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'التأمين الاجتماعي (ج.م)' : 'Social Insurance (EGP)'}</label>
                <input
                  type="number"
                  value={editForm.social_insurance}
                  onChange={(e) => setEditForm({ ...editForm, social_insurance: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'التأمين الصحي (ج.م)' : 'Health Insurance (EGP)'}</label>
                <input
                  type="number"
                  value={editForm.health_insurance}
                  onChange={(e) => setEditForm({ ...editForm, health_insurance: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'تاريخ انتهاء العقد' : 'Contract End Date'}</label>
                <input
                  type="date"
                  value={editForm.contract_end_date}
                  onChange={(e) => setEditForm({ ...editForm, contract_end_date: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{t('role')}</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="employee">{isRtl ? 'موظف' : 'Employee'}</option>
                  <option value="manager">{isRtl ? 'مدير' : 'Manager'}</option>
                  <option value="super_admin">{t('superAdmin')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'المدير المباشر' : 'Direct Manager'}</label>
                <select
                  value={editForm.manager_id}
                  onChange={(e) => setEditForm({ ...editForm, manager_id: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="">{isRtl ? 'بلا مدير' : 'None'}</option>
                  {managersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">{isRtl ? 'العنوان بالكامل' : 'Full Home Address'}</label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            {/* 3. Official Documents Upload Section */}
            <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
              <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {isRtl ? 'المستندات الرسمية والشهادات' : 'Official Documents & Certifications'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ID Photo */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="block text-xs font-bold text-slate-900 dark:text-slate-200">{isRtl ? 'صورة بطاقة الرقم القومي:' : 'National ID Photo:'}</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'id_photo_url')}
                      className="hidden"
                      id="upload-id-photo"
                    />
                    <label
                      htmlFor="upload-id-photo"
                      className="cursor-pointer flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-xl text-xs hover:bg-slate-100 font-bold transition-all text-slate-800 dark:text-slate-200"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>{uploadingField === 'id_photo_url' ? 'Uploading...' : 'Choose File'}</span>
                    </label>
                    {editForm.id_photo_url && (
                      <a
                        href={editForm.id_photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Uploaded
                      </a>
                    )}
                  </div>
                </div>

                {/* Birth Cert */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="block text-xs font-bold text-slate-900 dark:text-slate-200">{isRtl ? 'شهادة الميلاد:' : 'Birth Certificate Photo:'}</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'birth_cert_url')}
                      className="hidden"
                      id="upload-birth-cert"
                    />
                    <label
                      htmlFor="upload-birth-cert"
                      className="cursor-pointer flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-xl text-xs hover:bg-slate-100 font-bold transition-all text-slate-800 dark:text-slate-200"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>{uploadingField === 'birth_cert_url' ? 'Uploading...' : 'Choose File'}</span>
                    </label>
                    {editForm.birth_cert_url && (
                      <a
                        href={editForm.birth_cert_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Uploaded
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-5 py-2 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="gradient-btn px-6 py-2 rounded-xl text-xs text-white font-bold shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Saving...' : t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS CONFIGURATOR */}
      {activeTab === 'departments' && (
        <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white">{isRtl ? 'إعدادات الأقسام الإدارية' : 'Departments Registry Config'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{isRtl ? 'إضافة وتعديل الأقسام التي تظهر في قاعدة بيانات الموظفين' : 'Manage core administrative departments for registry dropdowns'}</p>
          </div>

          <form onSubmit={handleAddDept} className="flex gap-3 max-w-md">
            <input
              type="text"
              required
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder={isRtl ? 'اسم القسم الجديد...' : 'New Department name...'}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {isRtl ? 'إضافة قسم' : 'Add Department'}
            </button>
          </form>

          <div className="space-y-2 max-w-md border-t border-slate-200 dark:border-slate-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{isRtl ? 'الأقسام المسجلة' : 'Registered Departments'}</h4>
            {departments.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-4">{isRtl ? 'لا توجد أقسام مسجلة.' : 'No departments found.'}</div>
            ) : (
              departments.map((d) => (
                <div key={d.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-950 dark:text-white">{d.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteDept(d.id, d.name)}
                    className="p-1 text-rose-600 hover:text-rose-800 dark:text-rose-400 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: KPI CONFIGURATOR */}
      {activeTab === 'kpis' && (
        <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white">{isRtl ? 'إعدادات مؤشرات الأداء' : 'KPI Metrics Settings'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{isRtl ? 'إدارة وحدات قياس مؤشرات الإنتاجية للموظفين' : 'Manage metric units allowed for logging productivity entries'}</p>
          </div>

          <form onSubmit={handleAddUnit} className="flex gap-3 max-w-md">
            <input
              type="text"
              required
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="e.g. calls, pieces, pages..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {isRtl ? 'إضافة معيار' : 'Add Metric'}
            </button>
          </form>

          <div className="space-y-2 max-w-md border-t border-slate-200 dark:border-slate-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{isRtl ? 'المعايير المعتمدة' : 'Approved KPI Metric Units'}</h4>
            {kpiUnits.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-4">{isRtl ? 'لا توجد وحدات قياس.' : 'No units configured.'}</div>
            ) : (
              kpiUnits.map((u) => (
                <div key={u.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-950 dark:text-white capitalize">{u.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteUnit(u.id, u.name)}
                    className="p-1 text-rose-600 hover:text-rose-800 dark:text-rose-400 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
