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
  const { t, isRtl } = useLanguage();
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
        // Return empty if no team members
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
    <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-lime-500/10 text-lime-400 border border-lime-500/20">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">
            {isRtl ? 'أيام العمل في العطلات الرسمية' : 'Holidays Working Days Compensation'}
          </h3>
          <p className="text-xs text-gray-400">
            {isRtl
              ? 'تسجيل الموظفين الذين عملوا في أيام العطلات الرسمية لإضافة يوم إجازة إضافي لرصيدهم'
              : 'Log holiday working days for team members to credit them with extra leaves'}
          </p>
        </div>
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

      {/* Log Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-gray-900/40 p-4 rounded-xl border border-gray-800">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            {isRtl ? 'الموظف:' : 'Employee:'}
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            required
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-lime-500"
          >
            <option value="">{isRtl ? 'اختر الموظف' : 'Select employee'}</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            {isRtl ? 'يوم العمل:' : 'Working Day:'}
          </label>
          <input
            type="date"
            value={workingDate}
            onChange={(e) => setWorkingDate(e.target.value)}
            required
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-lime-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            {isRtl ? 'ملاحظة:' : 'Note:'}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isRtl ? 'المناسبة (مثال: عيد الفطر)' : 'e.g. Eid Holiday'}
            required
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-lime-500"
          />
        </div>

        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto gradient-btn px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> {isRtl ? 'تسجيل وإضافة رصيد' : 'Log & Credit Leave'}
          </button>
        </div>
      </form>

      {/* Log History */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          {isRtl ? 'سجل العمل في العطلات المسجل' : 'Logged Holiday Compensation History'}
        </h4>
        {records.length === 0 ? (
          <div className="text-center py-5 text-xs text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800">
            {isRtl ? 'لا يوجد سجلات مسجلة.' : 'No holiday work records found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 rounded-l-lg">{t('fullName')}</th>
                  <th className="px-4 py-2.5">{isRtl ? 'التاريخ' : 'Date'}</th>
                  <th className="px-4 py-2.5">{t('notes')}</th>
                  <th className="px-4 py-2.5 text-right rounded-r-lg">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-900/40">
                    <td className="px-4 py-3 font-semibold text-white">{r.user?.full_name || r.user_id}</td>
                    <td className="px-4 py-3 text-lime-400">{formatDate(r.working_date)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs italic">{r.notes || '--'}</td>
                    <td className="px-4 py-3 text-right">
                      {(isSuperAdmin || r.created_by === currentUserId) && (
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-lg transition-all"
                          title={t('delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
