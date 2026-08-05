'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Settings,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Download,
  Upload,
  ExternalLink,
  Target
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
  const uniqueJobTitles = Array.from(new Set(users.map((u) => u.job_title).filter(Boolean)));
  const uniquePaymentMethods = Array.from(new Set(users.map((u) => u.payment_method).filter(Boolean)));
  const managersList = users.filter((u) => u.role === 'manager' || u.role === 'super_admin');

  // File Upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;

    setUploadingField(fieldName);
    setMsg(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${fieldName}/${selectedUser.id}_${Date.now()}.${fileExt}`;

      // Upload file
      const { error } = await supabase.storage
        .from('employee_documents')
        .upload(fileName, file, { cacheControl: '3600', overwrite: true });

      if (error) throw error;

      // Retrieve public url
      const { data } = supabase.storage.from('employee_documents').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      // Update form state
      setEditForm((prev) => ({ ...prev, [fieldName]: publicUrl }));
      setMsg({
        text: isRtl ? 'تم رفع الملف وحفظ الرابط بنجاح!' : 'File uploaded and link saved successfully!',
        error: false,
      });
    } catch (err: any) {
      setMsg({ text: err.message || 'Upload failed', error: true });
    } finally {
      setUploadingField(null);
    }
  };

  // Open Edit Form Panel
  const handleEditClick = (user: UserProfile) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      role: user.role || 'employee',
      basic_salary: Number(user.basic_salary || 5000),
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedUser.id)
      .select()
      .single();

    if (error) {
      setMsg({ text: error.message, error: true });
    } else if (data) {
      // Re-fetch profiles to update departments relation cleanly
      const { data: refreshedUsers } = await supabase
        .from('users')
        .select('*, department:departments(*)');

      if (refreshedUsers) {
        setUsers(refreshedUsers as UserProfile[]);
      } else {
        setUsers(users.map((u) => (u.id === selectedUser.id ? (data as UserProfile) : u)));
      }

      setSelectedUser(null);
      setMsg({
        text: isRtl
          ? 'تم تحديث بيانات الموظف بنجاح!'
          : 'Employee details updated successfully!',
        error: false,
      });
    }
    setLoading(false);
  };

  // EXPORT TO EXCEL (CSV)
  const handleExportRegistry = () => {
    const exportData = filteredUsers.map((u) => {
      const dept = departments.find((d) => d.id === u.department_id);
      return {
        Name: u.full_name,
        Role: u.role,
        Mobile: u.mobile || '',
        'ID Number': u.id_number || '',
        'ID Photo URL': u.id_photo_url || '',
        Age: u.age || '',
        'Birth Date': u.birth_date || '',
        'Birth Certificate URL': u.birth_cert_url || '',
        Qualification: u.qualification || '',
        'Qualification Certificate URL': u.qualification_url || '',
        Address: u.address || '',
        'Job Title': u.job_title || '',
        'Criminal Record URL': u.criminal_record_url || '',
        Department: dept?.name || '',
        'Salary Payment Method': u.payment_method || '',
        Salary: u.basic_salary,
      };
    });

    exportToCSV(exportData, `Employee_Database_${new Date().toISOString().split('T')[0]}`);
  };

  // Add Dynamic Department
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
      <div className="flex gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('registry'); setSelectedUser(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'registry'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users className="w-4 h-4" /> {isRtl ? 'قاعدة بيانات الموظفين' : 'Employee Database Registry'}
        </button>

        <button
          onClick={() => { setActiveTab('departments'); setSelectedUser(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'departments'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <FolderOpen className="w-4 h-4" /> {isRtl ? 'إعدادات الأقسام' : 'Departments Config'}
        </button>

        <button
          onClick={() => { setActiveTab('kpis'); setSelectedUser(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'kpis'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Target className="w-4 h-4" /> {isRtl ? 'إعدادات مؤشرات الأداء' : 'KPI Metrics Config'}
        </button>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            msg.error
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {msg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* TAB 1: EMPLOYEE REGISTRY DATABASE */}
      {activeTab === 'registry' && !selectedUser && (
        <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-500 absolute left-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'ابحث بالاسم أو الهاتف...' : 'Search by Name or Mobile...'}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Department filter */}
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none"
              >
                <option value="all">{isRtl ? 'جميع الأقسام' : 'All Departments'}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* Job filter */}
              <select
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none"
              >
                <option value="all">{isRtl ? 'جميع المسميات' : 'All Job Titles'}</option>
                {uniqueJobTitles.map((job) => (
                  <option key={job} value={job}>
                    {job}
                  </option>
                ))}
              </select>

              {/* Excel Exporter */}
              <button
                onClick={handleExportRegistry}
                className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 ml-auto"
              >
                <Download className="w-4 h-4" /> {isRtl ? 'تصدير إكسل' : 'Export Excel'}
              </button>
            </div>
          </div>

          {/* Database Grid / Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                  <th className="px-4 py-3">{isRtl ? 'الهاتف' : 'Mobile'}</th>
                  <th className="px-4 py-3">{isRtl ? 'الرقم القومي' : 'ID Number'}</th>
                  <th className="px-4 py-3">{isRtl ? 'السن' : 'Age'}</th>
                  <th className="px-4 py-3">{isRtl ? 'القسم' : 'Department'}</th>
                  <th className="px-4 py-3">{isRtl ? 'المسمى الوظيفي' : 'Job Title'}</th>
                  <th className="px-4 py-3">{isRtl ? 'طريقة الدفع' : 'Payment'}</th>
                  <th className="px-4 py-3">{t('salary')}</th>
                  <th className="px-4 py-3">{isRtl ? 'المستندات' : 'Docs'}</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredUsers.map((u) => {
                  const dept = departments.find((d) => d.id === u.department_id);
                  return (
                    <tr key={u.id} className="hover:bg-gray-900/40">
                      <td className="px-4 py-3 font-semibold text-white">{u.full_name}</td>
                      <td className="px-4 py-3 text-gray-400 font-sans">{u.mobile || '--'}</td>
                      <td className="px-4 py-3 text-gray-400 font-sans">{u.id_number || '--'}</td>
                      <td className="px-4 py-3 text-gray-400 font-sans">{u.age || '--'}</td>
                      <td className="px-4 py-3 text-sky-400">{dept?.name || '--'}</td>
                      <td className="px-4 py-3 text-gray-400">{u.job_title || '--'}</td>
                      <td className="px-4 py-3 text-gray-400">{u.payment_method || '--'}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400 font-sans">
                        {Number(u.basic_salary).toLocaleString()} EGP
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        <div className="flex gap-2">
                          {u.id_photo_url && (
                            <a
                              href={u.id_photo_url}
                              target="_blank"
                              rel="noreferrer"
                              title="ID Photo"
                              className="text-sky-400 hover:text-sky-300"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          {u.qualification_url && (
                            <a
                              href={u.qualification_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Qualification"
                              className="text-purple-400 hover:text-purple-300"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          {u.criminal_record_url && (
                            <a
                              href={u.criminal_record_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Criminal Record"
                              className="text-red-400 hover:text-red-300"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="p-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30 rounded-lg transition-all"
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
        <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div>
              <h3 className="font-bold text-lg text-white">
                {isRtl ? `تعديل ملف الموظف: ${selectedUser.full_name}` : `Edit Profile: ${selectedUser.full_name}`}
              </h3>
              <p className="text-xs text-gray-400">
                {isRtl ? 'تحديث السجل الإداري والمستندات الثبوتية' : 'Update registry fields and official documents'}
              </p>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-xs text-gray-400 hover:text-white border border-gray-800 px-3 py-1.5 rounded-lg"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

          <form onSubmit={handleSaveDetails} className="space-y-6 font-sans">
            {/* 1. Core Bio Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">{t('fullName')}</label>
                <input
                  type="text"
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">{isRtl ? 'رقم الهاتف' : 'Mobile Number'}</label>
                <input
                  type="text"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">{isRtl ? 'الرقم القومي' : 'ID National Number'}</label>
                <input
                  type="text"
                  value={editForm.id_number}
                  onChange={(e) => setEditForm({ ...editForm, id_number: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">{isRtl ? 'السن' : 'Age'}</label>
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">{isRtl ? 'تاريخ الميلاد' : 'Birth Date'}</label>
                <input
                  type="date"
                  value={editForm.birth_date}
                  onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">{isRtl ? 'المؤهل الدراسي' : 'Academic Qualification'}</label>
                <input
                  type="text"
                  value={editForm.qualification}
                  onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Job & Financial Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">{isRtl ? 'المسمى الوظيفي' : 'Job Title'}</label>
                <input
                  type="text"
                  value={editForm.job_title}
                  onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">{isRtl ? 'القسم' : 'Department'}</label>
                <select
                  value={editForm.department_id}
                  onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
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
                <label className="block text-xs font-semibold text-gray-400 mb-1">{isRtl ? 'طريقة دفع الراتب' : 'Salary Payment Method'}</label>
                <select
                  value={editForm.payment_method}
                  onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                >
                  <option value="Cash">{isRtl ? 'نقداً' : 'Cash'}</option>
                  <option value="Bank Transfer">{isRtl ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                  <option value="InstaPay">{isRtl ? 'إنستاباي' : 'InstaPay'}</option>
                  <option value="Vodafone Cash">{isRtl ? 'فودافون كاش' : 'Vodafone Cash'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">{t('salary')}</label>
                <input
                  type="number"
                  value={editForm.basic_salary}
                  onChange={(e) => setEditForm({ ...editForm, basic_salary: Number(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">{t('role')}</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                >
                  <option value="employee">{t('employee')}</option>
                  <option value="manager">{t('manager')}</option>
                  <option value="super_admin">{t('superAdmin')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">{t('manager')}</label>
                <select
                  value={editForm.manager_id}
                  onChange={(e) => setEditForm({ ...editForm, manager_id: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                >
                  <option value="">{t('none')}</option>
                  {managersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">{isRtl ? 'العنوان بالكامل' : 'Full Home Address'}</label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
              />
            </div>

            {/* 3. Official Documents Upload Section */}
            <div className="space-y-4 border-t border-gray-800 pt-4">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                {isRtl ? 'المستندات الرسمية والشهادات' : 'Official Documents & Certifications'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Photo */}
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
                  <span className="block text-xs font-bold text-gray-300">{isRtl ? 'صورة بطاقة الرقم القومي:' : 'National ID Photo:'}</span>
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
                      className="cursor-pointer flex items-center gap-1.5 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-700 transition-all font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5 text-sky-400" />
                      <span>{uploadingField === 'id_photo_url' ? 'Uploading...' : 'Choose File'}</span>
                    </label>
                    {editForm.id_photo_url && (
                      <a
                        href={editForm.id_photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Uploaded
                      </a>
                    )}
                  </div>
                </div>

                {/* Birth Cert */}
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
                  <span className="block text-xs font-bold text-gray-300">{isRtl ? 'شهادة الميلاد:' : 'Birth Certificate Photo:'}</span>
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
                      className="cursor-pointer flex items-center gap-1.5 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-700 transition-all font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5 text-sky-400" />
                      <span>{uploadingField === 'birth_cert_url' ? 'Uploading...' : 'Choose File'}</span>
                    </label>
                    {editForm.birth_cert_url && (
                      <a
                        href={editForm.birth_cert_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Uploaded
                      </a>
                    )}
                  </div>
                </div>

                {/* Qualification */}
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
                  <span className="block text-xs font-bold text-gray-300">{isRtl ? 'صورة المؤهل الدراسي:' : 'Academic Qualification Photo:'}</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'qualification_url')}
                      className="hidden"
                      id="upload-qualification"
                    />
                    <label
                      htmlFor="upload-qualification"
                      className="cursor-pointer flex items-center gap-1.5 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-700 transition-all font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5 text-sky-400" />
                      <span>{uploadingField === 'qualification_url' ? 'Uploading...' : 'Choose File'}</span>
                    </label>
                    {editForm.qualification_url && (
                      <a
                        href={editForm.qualification_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Uploaded
                      </a>
                    )}
                  </div>
                </div>

                {/* Criminal Record */}
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
                  <span className="block text-xs font-bold text-gray-300">{isRtl ? 'صحيفة الحالة الجنائية (الفيش):' : 'Criminal Record Photo:'}</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'criminal_record_url')}
                      className="hidden"
                      id="upload-criminal-record"
                    />
                    <label
                      htmlFor="upload-criminal-record"
                      className="cursor-pointer flex items-center gap-1.5 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-700 transition-all font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5 text-sky-400" />
                      <span>{uploadingField === 'criminal_record_url' ? 'Uploading...' : 'Choose File'}</span>
                    </label>
                    {editForm.criminal_record_url && (
                      <a
                        href={editForm.criminal_record_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Uploaded
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="bg-gray-900 border border-gray-800 px-5 py-2 rounded-xl text-xs text-gray-400 font-bold hover:text-white"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="gradient-btn px-6 py-2 rounded-xl text-xs text-white font-bold shadow-md disabled:opacity-50"
              >
                {loading ? 'Saving...' : t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS CONFIGURATOR */}
      {activeTab === 'departments' && (
        <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
          <div>
            <h3 className="font-bold text-lg text-white">{isRtl ? 'إعدادات الأقسام الإدارية' : 'Departments Registry Config'}</h3>
            <p className="text-xs text-gray-400">{isRtl ? 'إضافة وتعديل الأقسام التي تظهر في قاعدة بيانات الموظفين' : 'Manage core administrative departments for registry dropdowns'}</p>
          </div>

          <form onSubmit={handleAddDept} className="flex gap-3 max-w-md">
            <input
              type="text"
              required
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder={isRtl ? 'اسم القسم الجديد...' : 'New Department name...'}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> {isRtl ? 'إضافة قسم' : 'Add Department'}
            </button>
          </form>

          <div className="space-y-2 max-w-md border-t border-gray-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{isRtl ? 'الأقسام المسجلة' : 'Registered Departments'}</h4>
            {departments.length === 0 ? (
              <div className="text-center text-xs text-gray-500 py-4">{isRtl ? 'لا توجد أقسام مسجلة.' : 'No departments found.'}</div>
            ) : (
              departments.map((d) => (
                <div key={d.id} className="p-3 bg-gray-900/40 border border-gray-800/80 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">{d.name}</span>
                  <button
                    onClick={() => handleDeleteDept(d.id, d.name)}
                    className="p-1 text-red-400 hover:text-red-200"
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
        <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
          <div>
            <h3 className="font-bold text-lg text-white">{isRtl ? 'إعدادات مؤشرات الأداء' : 'KPI Metrics Settings'}</h3>
            <p className="text-xs text-gray-400">{isRtl ? 'إدارة وحدات قياس مؤشرات الإنتاجية للموظفين' : 'Manage metric units allowed for logging productivity entries'}</p>
          </div>

          <form onSubmit={handleAddUnit} className="flex gap-3 max-w-md">
            <input
              type="text"
              required
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="e.g. calls, pieces, pages..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> {isRtl ? 'إضافة معيار' : 'Add Metric'}
            </button>
          </form>

          <div className="space-y-2 max-w-md border-t border-gray-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{isRtl ? 'المعايير المعتمدة' : 'Approved KPI Metric Units'}</h4>
            {kpiUnits.length === 0 ? (
              <div className="text-center text-xs text-gray-500 py-4">{isRtl ? 'لا توجد وحدات قياس.' : 'No units configured.'}</div>
            ) : (
              kpiUnits.map((u) => (
                <div key={u.id} className="p-3 bg-gray-900/40 border border-gray-800/80 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-semibold text-white capitalize">{u.name}</span>
                  <button
                    onClick={() => handleDeleteUnit(u.id, u.name)}
                    className="p-1 text-red-400 hover:text-red-200"
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
