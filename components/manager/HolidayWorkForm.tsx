'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { UserProfile, HolidayWorkRecord } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/dateUtils';
import { useLanguage } from '@/lib/context/LanguageContext';

interface HolidayWorkFormProps {
  teamMembers: UserProfile[];
  currentUserId: string;
  isSuperAdmin: boolean;
}

export default function HolidayWorkForm({ teamMembers, currentUserId, isSuperAdmin }: HolidayWorkFormProps) {
  const { isRtl } = useLanguage();
  const [selectedEmployee, setSelectedEmployee] = useState<string>(teamMembers[0]?.id || '');
  const [workingDate, setWorkingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  
  const [records, setRecords] = useState<HolidayWorkRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const supabase = createClient();

  const fetchRecords = async () => {
    let query = supabase
      .from('holiday_work')
      .select('*, user:users!user_id(*)');
    
    // If not super admin, filter by team members' IDs
    if (!isSuperAdmin) {
      const ids = teamMembers.map((m) => m.id);
      if (ids.length > 0) {
        query = query.in('user_id', ids);
      } else {
        setRecords([]);
        return;
      }
    }

    const { data, error } = await query.order('working_date', { ascending: false });
    if (data && !error) {
      setRecords(data as HolidayWorkRecord[]);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from('holiday_work')
      .insert({
        user_id: selectedEmployee,
        working_date: workingDate,
        notes: notes.trim() || null,
        created_by: currentUserId,
      })
      .select('*, user:users!user_id(*)')
      .single();

    if (error) {
      setMsg({ text: error.message, error: true });
    } else if (data) {
      setRecords([data as HolidayWorkRecord, ...records]);
      setNotes('');
      setMsg({
        text: isRtl
          ? 'تم تسجيل يوم العمل في العطلة وإضافته لرصيد الإجازات بنجاح!'
          : 'Holiday working day successfully logged and credited to leave balance!',
        error: false,
      });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? 'هل تريد حذف هذا السجل وإلغاء رصيد الإجازة المضافة للموظف؟' : 'Are you sure you want to delete this record and cancel the credited leave day?')) return;

    const { error } = await supabase.from('holiday_work').delete().eq('id', id);
    if (error) {
      setMsg({ text: error.message, error: true });
    } else {
      setRecords(records.filter((r) => r.id !== id));
      setMsg({
        text: isRtl ? 'تم حذف السجل بنجاح.' : 'Record deleted successfully.',
        error: false,
      });
    }
  };

  return (
    <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white">
            {isRtl ? 'أيام العمل في العطلات الرسمية' : 'Holidays Working Days Compensation'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isRtl
              ? 'تسجيل الموظفين الذين عملوا في أيام العطلات الرسمية لإضافة يوم إجازة إضافي لرصيدهم'
              : 'Log holiday working days for team members to credit them with extra leaves'}
          </p>
        </div>
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

      {/* Log Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">
            {isRtl ? 'الموظف:' : 'Employee:'}
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            required
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">{isRtl ? 'اختر الموظف' : 'Select employee'}</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name} ({m.job_title || 'Staff'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">
            {isRtl ? 'يوم العمل:' : 'Working Day:'}
          </label>
          <input
            type="date"
            value={workingDate}
            onChange={(e) => setWorkingDate(e.target.value)}
            required
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">
            {isRtl ? 'المناسبة / الملاحظة:' : 'Occasion / Note:'}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isRtl ? 'المناسبة (مثال: عيد الفطر)' : 'e.g. Eid Holiday Shift'}
            required
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="gradient-btn w-full md:w-auto px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {isRtl ? 'تسجيل وإضافة رصيد' : 'Log & Credit Leave'}
          </button>
        </div>
      </form>

      {/* Log History Table */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          {isRtl ? 'سجل العمل في العطلات المسجل' : 'Logged Holiday Compensation History'}
        </h4>
        {records.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
            {isRtl ? 'لا توجد سجلات عمل في العطلات بعد.' : 'No holiday compensation records logged yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-200 uppercase text-[10px] tracking-wider font-extrabold">
                <tr>
                  <th className="px-4 py-3.5">{isRtl ? 'الموظف' : 'Employee'}</th>
                  <th className="px-4 py-3.5">{isRtl ? 'تاريخ العمل' : 'Working Date'}</th>
                  <th className="px-4 py-3.5">{isRtl ? 'الملاحظات' : 'Notes'}</th>
                  <th className="px-4 py-3.5 text-right">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-950 dark:text-white">
                      {r.user?.full_name || 'Staff Member'}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-200 font-sans">
                      {formatDate(r.working_date)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 dark:text-slate-300 font-medium">
                      {r.notes || '--'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg transition-all cursor-pointer"
                        title={isRtl ? 'حذف السجل' : 'Delete record'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
