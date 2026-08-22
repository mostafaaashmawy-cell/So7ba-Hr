'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import {
  UserProfile,
  UserRole,
  DepartmentRecord,
  ShiftRecord,
  PayoutMethod,
  MilitaryStatus,
} from '@/lib/types/database';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Download,
  FileText,
  Building2,
  Clock,
  ShieldCheck,
  Briefcase,
  DollarSign,
  Phone,
  CreditCard,
  Wallet,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  UserCheck,
  Send,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { exportToCSV } from '@/lib/utils/csvExport';
import { logAuditAction } from '@/lib/utils/auditLogger';
import DocumentUploader from '@/components/common/DocumentUploader';

const MILITARY_STATUS_OPTIONS: { value: MilitaryStatus; labelEn: string; labelAr: string }[] = [
  { value: 'completed', labelEn: 'Completed (أدى الخدمة)', labelAr: 'أدى الخدمة العسكرية' },
  { value: 'exempted', labelEn: 'Exempted (معافى نهائي)', labelAr: 'معافى نهائياً' },
  { value: 'postponed', labelEn: 'Postponed (مؤجل)', labelAr: 'مؤجل' },
  { value: 'not_applicable', labelEn: 'Not Applicable (غير مطلوب / إناث)', labelAr: 'غير مطلوب / إناث' },
];

const PAYOUT_METHODS: { value: PayoutMethod; labelEn: string; labelAr: string; icon: string }[] = [
  { value: 'bank_transfer', labelEn: 'Bank Transfer (تحويل بنكي)', labelAr: 'تحويل بنكي', icon: 'bank' },
  { value: 'instapay', labelEn: 'InstaPay (إنستاباي)', labelAr: 'إنستاباي', icon: 'instapay' },
  { value: 'e_wallet', labelEn: 'E-Wallet (محفظة إلكترونية)', labelAr: 'محفظة إلكترونية', icon: 'wallet' },
  { value: 'cash', labelEn: 'Cash (نقدي)', labelAr: 'نقدي', icon: 'cash' },
];

const CONTRACT_TYPES = ['Full-Time', 'Part-Time', 'Contractor', 'Internship', 'Remotely'];

interface EditFormState {
  id?: string;
  full_name: string;
  full_name_ar: string;
  full_name_en: string;
  role: UserRole;
  mobile: string;
  national_id: string;
  id_expiry_date: string;
  birth_date: string;
  age: number;
  address: string;
  qualification: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  military_status: MilitaryStatus | string;

  // Employment
  job_title: string;
  department_id: string;
  manager_id: string;
  hire_date: string;
  contract_type: string;
  probation_period: number;
  probation_end_date: string;
  contract_end_date: string;
  shift_id: string;
  is_remote: boolean;
  is_flexible: boolean;
  required_daily_hours: number;

  // Financials
  basic_salary: number;
  commission_rate: number;
  social_insurance: number;
  health_insurance: number;
  insurance_number: string;
  payout_method: PayoutMethod | string;
  bank_name: string;
  bank_account_number: string;
  iban: string;
  wallet_phone_number: string;
  instapay_handle: string;

  // Documents
  national_id_front_url: string | null;
  national_id_back_url: string | null;
  criminal_record_url: string | null;
  graduation_cert_url: string | null;
  military_cert_url: string | null;
  insurance_print_url: string | null;
}

const emptyForm: EditFormState = {
  full_name: '',
  full_name_ar: '',
  full_name_en: '',
  role: 'employee',
  mobile: '',
  national_id: '',
  id_expiry_date: '',
  birth_date: '',
  age: 25,
  address: '',
  qualification: '',
  emergency_contact_phone: '',
  emergency_contact_relation: '',
  military_status: 'not_applicable',

  job_title: '',
  department_id: '',
  manager_id: '',
  hire_date: '',
  contract_type: 'Full-Time',
  probation_period: 3,
  probation_end_date: '',
  contract_end_date: '',
  shift_id: '',
  is_remote: false,
  is_flexible: false,
  required_daily_hours: 8,

  basic_salary: 6000,
  commission_rate: 5,
  social_insurance: 0,
  health_insurance: 0,
  insurance_number: '',
  payout_method: 'cash',
  bank_name: '',
  bank_account_number: '',
  iban: '',
  wallet_phone_number: '',
  instapay_handle: '',

  national_id_front_url: null,
  national_id_back_url: null,
  criminal_record_url: null,
  graduation_cert_url: null,
  military_cert_url: null,
  insurance_print_url: null,
};

export default function EmployeeDirectoryPage() {
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterPayout, setFilterPayout] = useState('all');
  const [filterContract, setFilterContract] = useState('all');

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeModalTab, setActiveModalTab] = useState<'identity' | 'job' | 'financials' | 'vault'>('identity');
  const [formData, setFormData] = useState<EditFormState>(emptyForm);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isManager = currentUser?.role === 'manager';
  const canEditFinancials = isSuperAdmin;

  const loadData = async () => {
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

    if (profile) {
      setCurrentUser(profile as UserProfile);

      // Fetch all employees in tenant
      const { data: userList } = await supabase
        .from('users')
        .select('*, department:departments(name), shift:shifts(name, start_time, end_time)')
        .eq('tenant_id', profile.tenant_id)
        .order('full_name', { ascending: true });

      if (userList) setUsers(userList as UserProfile[]);

      // Fetch departments
      const { data: depts } = await supabase
        .from('departments')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('name');
      if (depts) setDepartments(depts as DepartmentRecord[]);

      // Fetch shifts
      const { data: shiftList } = await supabase
        .from('shifts')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('start_time');
      if (shiftList) setShifts(shiftList as ShiftRecord[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered & Paginated records
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch =
        u.full_name?.toLowerCase().includes(q) ||
        u.full_name_ar?.toLowerCase().includes(q) ||
        u.full_name_en?.toLowerCase().includes(q);
      const idMatch = u.national_id?.includes(q) || u.id_number?.includes(q);
      const phoneMatch = u.mobile?.includes(q) || u.emergency_contact_phone?.includes(q);
      const deptMatch = u.department?.name?.toLowerCase().includes(q);

      if (q && !nameMatch && !idMatch && !phoneMatch && !deptMatch) return false;
      if (filterDept !== 'all' && u.department_id !== filterDept) return false;
      if (filterRole !== 'all' && u.role !== filterRole) return false;
      if (filterPayout !== 'all' && (u.payout_method || 'cash') !== filterPayout) return false;
      if (filterContract !== 'all' && u.contract_type !== filterContract) return false;

      return true;
    });
  }, [users, searchQuery, filterDept, filterRole, filterPayout, filterContract]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Document completion counter helper
  const countDocs = (u: UserProfile) => {
    let count = 0;
    if (u.national_id_front_url) count++;
    if (u.national_id_back_url) count++;
    if (u.criminal_record_url) count++;
    if (u.graduation_cert_url || u.qualification_url) count++;
    if (u.military_cert_url) count++;
    if (u.insurance_print_url) count++;
    return count;
  };

  // Open Edit Modal
  const handleEdit = (u: UserProfile) => {
    setModalMode('edit');
    setActiveModalTab('identity');
    setMsg(null);
    setFormData({
      id: u.id,
      full_name: u.full_name || '',
      full_name_ar: u.full_name_ar || '',
      full_name_en: u.full_name_en || '',
      role: u.role || 'employee',
      mobile: u.mobile || '',
      national_id: u.national_id || u.id_number || '',
      id_expiry_date: u.id_expiry_date || '',
      birth_date: u.birth_date || '',
      age: Number(u.age ?? 25),
      address: u.address || '',
      qualification: u.qualification || '',
      emergency_contact_phone: u.emergency_contact_phone || '',
      emergency_contact_relation: u.emergency_contact_relation || '',
      military_status: u.military_status || 'not_applicable',

      job_title: u.job_title || '',
      department_id: u.department_id || '',
      manager_id: u.manager_id || '',
      hire_date: u.hire_date || '',
      contract_type: u.contract_type || 'Full-Time',
      probation_period: Number(u.probation_period ?? 3),
      probation_end_date: u.probation_end_date || '',
      contract_end_date: u.contract_end_date || '',
      shift_id: u.shift_id || '',
      is_remote: !!u.is_remote,
      is_flexible: !!u.is_flexible,
      required_daily_hours: Number(u.required_daily_hours ?? 8),

      basic_salary: Number(u.basic_salary ?? 6000),
      commission_rate: Number(u.commission_rate ?? 5),
      social_insurance: Number(u.social_insurance ?? 0),
      health_insurance: Number(u.health_insurance ?? 0),
      insurance_number: u.insurance_number || '',
      payout_method: (u.payout_method as PayoutMethod) || 'cash',
      bank_name: u.bank_name || '',
      bank_account_number: u.bank_account_number || '',
      iban: u.iban || '',
      wallet_phone_number: u.wallet_phone_number || '',
      instapay_handle: u.instapay_handle || '',

      national_id_front_url: u.national_id_front_url || null,
      national_id_back_url: u.national_id_back_url || null,
      criminal_record_url: u.criminal_record_url || null,
      graduation_cert_url: u.graduation_cert_url || u.qualification_url || null,
      military_cert_url: u.military_cert_url || null,
      insurance_print_url: u.insurance_print_url || null,
    });
    setIsModalOpen(true);
  };

  // Open Create Modal
  const handleCreate = () => {
    setModalMode('create');
    setActiveModalTab('identity');
    setMsg(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  // Save Modal (Create / Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.tenant_id) return;

    setSaving(true);
    setMsg(null);

    try {
      const payload: Partial<UserProfile> = {
        full_name: formData.full_name.trim() || formData.full_name_ar || formData.full_name_en,
        full_name_ar: formData.full_name_ar.trim() || null,
        full_name_en: formData.full_name_en.trim() || null,
        role: formData.role,
        mobile: formData.mobile.trim() || null,
        national_id: formData.national_id.trim() || null,
        id_number: formData.national_id.trim() || null,
        id_expiry_date: formData.id_expiry_date || null,
        birth_date: formData.birth_date || null,
        age: Number(formData.age || 25),
        address: formData.address.trim() || null,
        qualification: formData.qualification.trim() || null,
        emergency_contact_phone: formData.emergency_contact_phone.trim() || null,
        emergency_contact_relation: formData.emergency_contact_relation.trim() || null,
        military_status: formData.military_status || 'not_applicable',

        job_title: formData.job_title.trim() || null,
        department_id: formData.department_id || null,
        manager_id: formData.manager_id || null,
        hire_date: formData.hire_date || null,
        contract_type: formData.contract_type || 'Full-Time',
        probation_period: Number(formData.probation_period ?? 3),
        probation_end_date: formData.probation_end_date || null,
        contract_end_date: formData.contract_end_date || null,
        shift_id: formData.shift_id || null,
        is_remote: formData.is_remote,
        is_flexible: formData.is_flexible,
        required_daily_hours: Number(formData.required_daily_hours ?? 8),

        basic_salary: Number(formData.basic_salary ?? 0),
        commission_rate: Number(formData.commission_rate ?? 0),
        social_insurance: Number(formData.social_insurance ?? 0),
        health_insurance: Number(formData.health_insurance ?? 0),
        insurance_number: formData.insurance_number.trim() || null,
        payout_method: formData.payout_method || 'cash',
        bank_name: formData.bank_name.trim() || null,
        bank_account_number: formData.bank_account_number.trim() || null,
        iban: formData.iban.trim() || null,
        wallet_phone_number: formData.wallet_phone_number.trim() || null,
        instapay_handle: formData.instapay_handle.trim() || null,

        national_id_front_url: formData.national_id_front_url,
        national_id_back_url: formData.national_id_back_url,
        criminal_record_url: formData.criminal_record_url,
        graduation_cert_url: formData.graduation_cert_url,
        military_cert_url: formData.military_cert_url,
        insurance_print_url: formData.insurance_print_url,
      };

      if (modalMode === 'edit' && formData.id) {
        const { error } = await supabase
          .from('users')
          .update(payload)
          .eq('id', formData.id);

        if (error) throw error;

        logAuditAction(supabase, {
          tenant_id: currentUser.tenant_id,
          actor_id: currentUser.id,
          action_type: 'UPDATE_EMPLOYEE_PROFILE',
          entity_name: 'users',
          entity_id: formData.id,
          details: { updated_fields: Object.keys(payload) },
        });

        setMsg({
          text: isRtl ? 'تم تحديث بيانات الموظف بنجاح!' : 'Employee profile updated successfully!',
          error: false,
        });
      } else {
        // Create Mode
        const newId = crypto.randomUUID();
        const { error } = await supabase.from('users').insert({
          ...payload,
          id: newId,
          tenant_id: currentUser.tenant_id,
          kpi_unit: 'tasks',
        });

        if (error) throw error;

        logAuditAction(supabase, {
          tenant_id: currentUser.tenant_id,
          actor_id: currentUser.id,
          action_type: 'CREATE_EMPLOYEE_PROFILE',
          entity_name: 'users',
          entity_id: newId,
          details: { full_name: payload.full_name },
        });

        setMsg({
          text: isRtl ? 'تم إنشاء ملف الموظف الجديد بنجاح!' : 'New employee registered successfully!',
          error: false,
        });
      }

      await loadData();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 800);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Save operation failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSaving(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const exportRows = filteredUsers.map((u) => ({
      'Full Name': u.full_name,
      'Name (AR)': u.full_name_ar || '',
      'Name (EN)': u.full_name_en || '',
      Role: u.role,
      'National ID': u.national_id || u.id_number || '',
      Mobile: u.mobile || '',
      Department: u.department?.name || 'Unassigned',
      'Job Title': u.job_title || '',
      'Basic Salary (EGP)': u.basic_salary,
      'Payout Method': u.payout_method || 'cash',
      'Bank / IBAN / Wallet':
        u.payout_method === 'bank_transfer'
          ? `${u.bank_name || ''} - ${u.iban || u.bank_account_number || ''}`
          : u.payout_method === 'instapay'
          ? u.instapay_handle || ''
          : u.payout_method === 'e_wallet'
          ? u.wallet_phone_number || ''
          : 'Cash',
      'Shift Assigned': u.shift?.name || 'Default',
      'Remote Status': u.is_remote ? 'Remote' : 'Onsite',
      'Contract Type': u.contract_type || 'Full-Time',
      'Docs Uploaded': `${countDocs(u)}/6`,
    }));

    exportToCSV(exportRows, `HumAi_Employee_Directory_${new Date().toISOString().split('T')[0]}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg) flex items-center justify-center text-slate-400 text-xs font-bold">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 mr-2" />
        Loading employee directory & MENA HR records...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar user={currentUser} activeRoleView={isSuperAdmin ? 'super_admin' : 'manager'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2.5">
              <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              {isRtl ? 'دليل وسجل الموظفين الشامل' : 'Complete Employee Directory'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isRtl
                ? 'إدارة الملفات الشخصية، قنوات صرف الرواتب (إنستاباي / بنك / محافظ)، العقود، وخزينة المستندات'
                : 'Manage full Egyptian/MENA profiles, payout channels (InstaPay/IBAN/Wallets), contracts & document vaults'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isRtl ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleCreate}
                className="gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isRtl ? 'إضافة موظف جديد' : 'Add Employee'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="cleariq-card p-4 cleariq-card-hover flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                {isRtl ? 'إجمالي الموظفين' : 'Total Headcount'}
              </span>
              <span className="text-lg font-black text-slate-950 dark:text-white font-sans">
                {users.length}
              </span>
            </div>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                {isRtl ? 'تحويل بنكي / إنستاباي' : 'Bank & InstaPay'}
              </span>
              <span className="text-lg font-black text-slate-950 dark:text-white font-sans">
                {
                  users.filter(
                    (u) => u.payout_method === 'bank_transfer' || u.payout_method === 'instapay'
                  ).length
                }
              </span>
            </div>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                {isRtl ? 'محافظ إلكترونية' : 'E-Wallets'}
              </span>
              <span className="text-lg font-black text-slate-950 dark:text-white font-sans">
                {users.filter((u) => u.payout_method === 'e_wallet').length}
              </span>
            </div>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                {isRtl ? 'مستندات مكتملة (6/6)' : 'Complete Vaults'}
              </span>
              <span className="text-lg font-black text-slate-950 dark:text-white font-sans">
                {users.filter((u) => countDocs(u) === 6).length}
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="cleariq-card p-4 cleariq-card-hover space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={
                  isRtl
                    ? 'بحث بالاسم، الرقم القومي، الهاتف، القسم...'
                    : 'Search by Name, National ID, Phone, Dept...'
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Dept Filter */}
            <div>
              <select
                value={filterDept}
                onChange={(e) => {
                  setFilterDept(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="all">{isRtl ? 'جميع الأقسام' : 'All Departments'}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payout Filter */}
            <div>
              <select
                value={filterPayout}
                onChange={(e) => {
                  setFilterPayout(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="all">{isRtl ? 'جميع قنوات الصرف' : 'All Payout Methods'}</option>
                {PAYOUT_METHODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {isRtl ? p.labelAr : p.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Contract Type Filter */}
            <div>
              <select
                value={filterContract}
                onChange={(e) => {
                  setFilterContract(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="all">{isRtl ? 'جميع أنواع العقود' : 'All Contract Types'}</option>
                {CONTRACT_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="cleariq-card overflow-hidden cleariq-card-hover">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">{isRtl ? 'الموظف' : 'Employee'}</th>
                  <th className="py-3.5 px-4">{isRtl ? 'الرقم القومي والاتصال' : 'National ID & Mobile'}</th>
                  <th className="py-3.5 px-4">{isRtl ? 'الدور والدوام' : 'Role & Work Mode'}</th>
                  <th className="py-3.5 px-4">{isRtl ? 'قناة صرف الراتب' : 'Payout Channel'}</th>
                  <th className="py-3.5 px-4">{isRtl ? 'المستندات' : 'Vault Docs'}</th>
                  <th className="py-3.5 px-4 text-right">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {paginatedUsers.map((u) => {
                  const docCount = countDocs(u);
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Employee Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-extrabold flex items-center justify-center shrink-0">
                            {u.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-950 dark:text-white block">
                              {u.full_name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {u.job_title || 'Staff'} • {u.department?.name || 'Operations'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* National ID & Contact */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">
                          {u.national_id || u.id_number || '--'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {u.mobile || 'No mobile'}
                        </span>
                      </td>

                      {/* Role & Mode */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              u.role === 'super_admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400'
                                : u.role === 'manager'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {u.role}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {u.is_remote
                              ? 'Remote'
                              : u.shift?.name
                              ? u.shift.name
                              : 'Standard 9-5'}
                          </span>
                        </div>
                      </td>

                      {/* Payout Channel */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                            {Number(u.basic_salary ?? 0).toLocaleString()} EGP
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 capitalize">
                            {u.payout_method === 'bank_transfer' && (
                              <CreditCard className="w-3 h-3 text-blue-500" />
                            )}
                            {u.payout_method === 'instapay' && (
                              <Send className="w-3 h-3 text-emerald-500" />
                            )}
                            {u.payout_method === 'e_wallet' && (
                              <Wallet className="w-3 h-3 text-purple-500" />
                            )}
                            {u.payout_method || 'cash'}
                          </span>
                        </div>
                      </td>

                      {/* Document Vault Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            docCount >= 4
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          {docCount}/6 {isRtl ? 'ملفات' : 'Docs'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleEdit(u)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                          title="View / Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            {isSuperAdmin ? (isRtl ? 'تعديل' : 'Edit') : isRtl ? 'عرض' : 'View'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-bold">
                      {isRtl ? 'لا يوجد موظفون مطابقون لخيارات البحث.' : 'No matching employees found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">
                {isRtl ? 'عرض:' : 'Show:'}
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-slate-500 dark:text-slate-400">
                {isRtl
                  ? `إجمالي ${filteredUsers.length} موظف`
                  : `Total ${filteredUsers.length} records`}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-bold text-slate-900 dark:text-slate-100">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            COMPREHENSIVE EMPLOYEE PROFILE MODAL (4 TABS)
            ═══════════════════════════════════════════════════════════════ */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="cleariq-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div>
                  <h3 className="font-extrabold text-base text-slate-950 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                    {modalMode === 'create'
                      ? isRtl
                        ? 'إضافة موظف جديد'
                        : 'Register New Employee'
                      : isRtl
                      ? `ملف الموظف: ${formData.full_name}`
                      : `Employee Profile: ${formData.full_name}`}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isRtl
                      ? 'البيانات الشخصية، العمليات، الحسابات البنكية ومحفظة المستندات'
                      : 'Egyptian/MENA HR credentials, payout channels & document vault'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-900/50 gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModalTab('identity')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeModalTab === 'identity'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  {isRtl ? 'البيانات الشخصية والهوية' : '1. Identity & Bio'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab('job')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeModalTab === 'job'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {isRtl ? 'الوظيفة ومواعيد العمل' : '2. Job & Work Shift'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab('financials')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeModalTab === 'financials'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  {isRtl ? 'الراتب وقنوات الصرف' : '3. Financials & Payout'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab('vault')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeModalTab === 'vault'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {isRtl ? 'خزينة المستندات' : '4. Document Vault'}
                </button>
              </div>

              {/* Messages */}
              {msg && (
                <div className="px-6 pt-3">
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      msg.error
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-800 dark:text-rose-300'
                        : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {msg.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span className="font-bold">{msg.text}</span>
                  </div>
                </div>
              )}

              {/* Modal Body / Form */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* ─── TAB 1: IDENTITY & BIO ────────────────────────────── */}
                {activeModalTab === 'identity' && (
                  <div className="space-y-4 animate-in">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'الاسم بالكامل (رسمي):' : 'Full Name (Official):'} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'الاسم باللغة العربية:' : 'Full Name (Arabic):'}
                        </label>
                        <input
                          type="text"
                          value={formData.full_name_ar}
                          onChange={(e) => setFormData({ ...formData, full_name_ar: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'الاسم بالإنجليزية:' : 'Full Name (English):'}
                        </label>
                        <input
                          type="text"
                          value={formData.full_name_en}
                          onChange={(e) => setFormData({ ...formData, full_name_en: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'الرقم القومي (14 رقم):' : 'National ID (14 digits):'}
                        </label>
                        <input
                          type="text"
                          maxLength={14}
                          value={formData.national_id}
                          onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white font-mono focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'تاريخ انتهاء البطاقة:' : 'ID Expiry Date:'}
                        </label>
                        <input
                          type="date"
                          value={formData.id_expiry_date}
                          onChange={(e) => setFormData({ ...formData, id_expiry_date: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'رقم الهاتف الشخصي:' : 'Mobile Phone:'}
                        </label>
                        <input
                          type="text"
                          value={formData.mobile}
                          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'تاريخ الميلاد:' : 'Birth Date:'}
                        </label>
                        <input
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'الموقف من التجنيد:' : 'Military Status:'}
                        </label>
                        <select
                          value={formData.military_status}
                          onChange={(e) => setFormData({ ...formData, military_status: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                        >
                          {MILITARY_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {isRtl ? opt.labelAr : opt.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'المؤهل الدراسي:' : 'Academic Qualification:'}
                        </label>
                        <input
                          type="text"
                          value={formData.qualification}
                          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'رقم هاتف الطوارئ:' : 'Emergency Contact Phone:'}
                        </label>
                        <input
                          type="text"
                          value={formData.emergency_contact_phone}
                          onChange={(e) =>
                            setFormData({ ...formData, emergency_contact_phone: e.target.value })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'صلة القرابة للطوارئ:' : 'Emergency Contact Relation:'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Father / Spouse / Brother"
                          value={formData.emergency_contact_relation}
                          onChange={(e) =>
                            setFormData({ ...formData, emergency_contact_relation: e.target.value })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                        {isRtl ? 'العنوان بالتفصيل:' : 'Residential Address:'}
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* ─── TAB 2: JOB & WORK SCHEDULE ────────────────────────── */}
                {activeModalTab === 'job' && (
                  <div className="space-y-4 animate-in">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'المسمى الوظيفي:' : 'Job Title:'}
                        </label>
                        <input
                          type="text"
                          value={formData.job_title}
                          onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'القسم الإداري:' : 'Department:'}
                        </label>
                        <select
                          value={formData.department_id}
                          onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value="">{isRtl ? 'اختر القسم...' : 'Select Department...'}</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'الدور والصلاحية في النظام:' : 'System Role:'}
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value as UserRole })
                          }
                          disabled={!isSuperAdmin}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value="employee">Employee / موظف</option>
                          <option value="manager">Manager / مدير فريق</option>
                          <option value="super_admin">Super Admin / مشرف عام</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'تاريخ التعيين:' : 'Hire Date:'}
                        </label>
                        <input
                          type="date"
                          value={formData.hire_date}
                          onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'نوع التعاقد:' : 'Contract Type:'}
                        </label>
                        <select
                          value={formData.contract_type}
                          onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                        >
                          {CONTRACT_TYPES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'تاريخ نهاية التعاقد:' : 'Contract End Date:'}
                        </label>
                        <input
                          type="date"
                          value={formData.contract_end_date}
                          onChange={(e) =>
                            setFormData({ ...formData, contract_end_date: e.target.value })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'الوردية المحددة (Shift):' : 'Assigned Shift:'}
                        </label>
                        <select
                          value={formData.shift_id}
                          onChange={(e) => setFormData({ ...formData, shift_id: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value="">{isRtl ? 'الوردية الافتراضية للشركة' : 'Default Company Shift'}</option>
                          {shifts.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.start_time} - {s.end_time})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'المدير المباشر:' : 'Direct Supervisor / Manager:'}
                        </label>
                        <select
                          value={formData.manager_id}
                          onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value="">{isRtl ? 'بدون مدير مباشر' : 'No direct manager'}</option>
                          {users
                            .filter((u) => u.id !== formData.id)
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.full_name} ({u.job_title || u.role})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Remote & Flexible options */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {isRtl ? 'سياسات العمل عن بُعد والدوام المرن' : 'Remote & Flexible Work Overrides'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                          <input
                            type="checkbox"
                            checked={formData.is_remote}
                            onChange={(e) => setFormData({ ...formData, is_remote: e.target.checked })}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{isRtl ? 'موظف عن بُعد (تخطي البصمة المكانية)' : 'Remote Employee (Bypass Geofence)'}</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                          <input
                            type="checkbox"
                            checked={formData.is_flexible}
                            onChange={(e) =>
                              setFormData({ ...formData, is_flexible: e.target.checked })
                            }
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{isRtl ? 'دوام مرن (حساب الساعات بدون تقيد بوقت الحضور)' : 'Flexible Hours (Evaluate Session Hours)'}</span>
                        </label>
                      </div>

                      {formData.is_flexible && (
                        <div>
                          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                            {isRtl ? 'ساعات العمل اليومية المطلوبة:' : 'Required Daily Hours:'}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={formData.required_daily_hours}
                            onChange={(e) =>
                              setFormData({ ...formData, required_daily_hours: Number(e.target.value) })
                            }
                            className="w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-950 dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── TAB 3: FINANCIALS & PAYOUT ───────────────────────── */}
                {activeModalTab === 'financials' && (
                  <div className="space-y-4 animate-in">
                    {!canEditFinancials && (
                      <div className="p-3 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded-xl text-xs font-bold border border-amber-200">
                        {isRtl
                          ? 'تنبيه: تعديل الرواتب وقنوات الصرف متاح للمشرف العام فقط.'
                          : 'Notice: Financial modifications restricted to Super Admin.'}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'الراتب الأساسي الشهري (ج.م):' : 'Monthly Basic Salary (EGP):'}
                        </label>
                        <input
                          type="number"
                          disabled={!canEditFinancials}
                          value={formData.basic_salary}
                          onChange={(e) =>
                            setFormData({ ...formData, basic_salary: Number(e.target.value) })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white font-sans focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'نسبة العمولة الافتراضية (%):' : 'Commission Rate (%):'}
                        </label>
                        <input
                          type="number"
                          disabled={!canEditFinancials}
                          value={formData.commission_rate}
                          onChange={(e) =>
                            setFormData({ ...formData, commission_rate: Number(e.target.value) })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white font-sans focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'الرقم التأميني:' : 'Social Insurance No:'}
                        </label>
                        <input
                          type="text"
                          disabled={!canEditFinancials}
                          value={formData.insurance_number}
                          onChange={(e) =>
                            setFormData({ ...formData, insurance_number: e.target.value })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'خصم التأمين الاجتماعي (ج.م):' : 'Social Insurance (EGP):'}
                        </label>
                        <input
                          type="number"
                          disabled={!canEditFinancials}
                          value={formData.social_insurance}
                          onChange={(e) =>
                            setFormData({ ...formData, social_insurance: Number(e.target.value) })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white font-sans focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                          {isRtl ? 'خصم التأمين الصحي (ج.م):' : 'Health Insurance (EGP):'}
                        </label>
                        <input
                          type="number"
                          disabled={!canEditFinancials}
                          value={formData.health_insurance}
                          onChange={(e) =>
                            setFormData({ ...formData, health_insurance: Number(e.target.value) })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white font-sans focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* PAYOUT CHANNEL SELECTOR & CONDITIONAL INPUTS */}
                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-4">
                      <h4 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" />
                        {isRtl ? 'قناة صرف الراتب والتحويل' : 'Salary Payout Channel Setup'}
                      </h4>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-2">
                          {isRtl ? 'اختر وسيلة الصرف المعتمدة:' : 'Select Payout Channel:'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {PAYOUT_METHODS.map((method) => {
                            const isSelected = formData.payout_method === method.value;
                            return (
                              <button
                                key={method.value}
                                type="button"
                                disabled={!canEditFinancials}
                                onClick={() => setFormData({ ...formData, payout_method: method.value })}
                                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                                }`}
                              >
                                {method.value === 'bank_transfer' && <CreditCard className="w-4 h-4" />}
                                {method.value === 'instapay' && <Send className="w-4 h-4" />}
                                {method.value === 'e_wallet' && <Wallet className="w-4 h-4" />}
                                {method.value === 'cash' && <DollarSign className="w-4 h-4" />}
                                <span>{isRtl ? method.labelAr : method.labelEn}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Conditional Fields: Bank Transfer */}
                      {formData.payout_method === 'bank_transfer' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          <div>
                            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                              {isRtl ? 'اسم البنك:' : 'Bank Name:'}
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. CIB / NBE / QNB"
                              value={formData.bank_name}
                              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                              {isRtl ? 'رقم الحساب البنكي:' : 'Account Number:'}
                            </label>
                            <input
                              type="text"
                              value={formData.bank_account_number}
                              onChange={(e) =>
                                setFormData({ ...formData, bank_account_number: e.target.value })
                              }
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                              {isRtl ? 'رقم الآيبان (IBAN):' : 'IBAN:'}
                            </label>
                            <input
                              type="text"
                              placeholder="EG..."
                              value={formData.iban}
                              onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {/* Conditional Fields: InstaPay */}
                      {formData.payout_method === 'instapay' && (
                        <div className="pt-2">
                          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                            {isRtl ? 'عنوان الدفع اللحظي / إنستاباي (IPA / Handle):' : 'InstaPay Handle / Address:'}
                          </label>
                          <input
                            type="text"
                            placeholder="username@instapay or mobile"
                            value={formData.instapay_handle}
                            onChange={(e) =>
                              setFormData({ ...formData, instapay_handle: e.target.value })
                            }
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white font-mono"
                          />
                        </div>
                      )}

                      {/* Conditional Fields: E-Wallet */}
                      {formData.payout_method === 'e_wallet' && (
                        <div className="pt-2">
                          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                            {isRtl ? 'رقم المحفظة الإلكترونية (فودافون كاش / أورنج / اتصالات / وي):' : 'E-Wallet Registered Phone:'}
                          </label>
                          <input
                            type="text"
                            placeholder="010XXXXXXXX / 011... / 012... / 015..."
                            value={formData.wallet_phone_number}
                            onChange={(e) =>
                              setFormData({ ...formData, wallet_phone_number: e.target.value })
                            }
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-white font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── TAB 4: DOCUMENT VAULT ────────────────────────────── */}
                {activeModalTab === 'vault' && (
                  <div className="space-y-4 animate-in">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {isRtl ? 'خزينة مسوغات التعيين والمستندات الرسمية' : 'Official HR Document Vault'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Supabase Storage: <code className="font-mono text-emerald-600">employee-documents</code>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 1. National ID Front */}
                      <DocumentUploader
                        tenantId={currentUser?.tenant_id}
                        userId={formData.id}
                        documentType="national_id_front"
                        labelEn="National ID (Front)"
                        labelAr="بطاقة الرقم القومي (الوجه الأمامي)"
                        currentUrl={formData.national_id_front_url}
                        onUrlChange={(url) => setFormData({ ...formData, national_id_front_url: url })}
                      />

                      {/* 2. National ID Back */}
                      <DocumentUploader
                        tenantId={currentUser?.tenant_id}
                        userId={formData.id}
                        documentType="national_id_back"
                        labelEn="National ID (Back)"
                        labelAr="بطاقة الرقم القومي (الوجه الخلفي)"
                        currentUrl={formData.national_id_back_url}
                        onUrlChange={(url) => setFormData({ ...formData, national_id_back_url: url })}
                      />

                      {/* 3. Criminal Record */}
                      <DocumentUploader
                        tenantId={currentUser?.tenant_id}
                        userId={formData.id}
                        documentType="criminal_record"
                        labelEn="Criminal Record (فيش وتشبيه)"
                        labelAr="صحيفة الحالة الجنائية (فيش وتشبيه ساري)"
                        currentUrl={formData.criminal_record_url}
                        onUrlChange={(url) => setFormData({ ...formData, criminal_record_url: url })}
                      />

                      {/* 4. Graduation Certificate */}
                      <DocumentUploader
                        tenantId={currentUser?.tenant_id}
                        userId={formData.id}
                        documentType="graduation_cert"
                        labelEn="Graduation Certificate (شهادة المؤهل)"
                        labelAr="شهادة المؤهل الدراسي / التخرج"
                        currentUrl={formData.graduation_cert_url}
                        onUrlChange={(url) => setFormData({ ...formData, graduation_cert_url: url })}
                      />

                      {/* 5. Military Certificate */}
                      <DocumentUploader
                        tenantId={currentUser?.tenant_id}
                        userId={formData.id}
                        documentType="military_cert"
                        labelEn="Military Service Certificate (شهادة التجنيد)"
                        labelAr="شهادة تأدية الخدمة العسكرية / الإعفاء"
                        currentUrl={formData.military_cert_url}
                        onUrlChange={(url) => setFormData({ ...formData, military_cert_url: url })}
                      />

                      {/* 6. Insurance Printout */}
                      <DocumentUploader
                        tenantId={currentUser?.tenant_id}
                        userId={formData.id}
                        documentType="insurance_print"
                        labelEn="Social Insurance Printout (برنت تأميني)"
                        labelAr="برنت الرقم التأميني المعتمد (س1)"
                        currentUrl={formData.insurance_print_url}
                        onUrlChange={(url) => setFormData({ ...formData, insurance_print_url: url })}
                      />
                    </div>
                  </div>
                )}

                {/* Modal Footer Buttons */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving || !formData.full_name}
                      className="gradient-btn px-6 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                      <span>
                        {modalMode === 'create'
                          ? isRtl
                            ? 'حفظ وإنشاء الموظف'
                            : 'Create Profile'
                          : isRtl
                          ? 'حفظ التعديلات'
                          : 'Save Changes'}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
