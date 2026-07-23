'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/lib/types/database';
import { Shield, Edit3, Save, X, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/context/LanguageContext';

interface EmployeeManagementProps {
  initialUsers: UserProfile[];
}

export default function EmployeeManagement({ initialUsers }: EmployeeManagementProps) {
  const { t, isRtl } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<{
    role: UserRole;
    basic_salary: number;
    kpi_unit: string;
    manager_id: string | null;
  }>({
    role: 'employee',
    basic_salary: 0,
    kpi_unit: 'tasks',
    manager_id: null,
  });

  const [kpiUnits, setKpiUnits] = useState<{ id: string; name: string }[]>([]);
  const [newUnitName, setNewUnitName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const supabase = createClient();

  const fetchKpiUnits = async () => {
    const { data, error } = await supabase
      .from('kpi_units')
      .select('id, name')
      .order('name', { ascending: true });

    if (data && !error) {
      setKpiUnits(data);
    }
  };

  useEffect(() => {
    fetchKpiUnits();
  }, []);

  const startEdit = (user: UserProfile) => {
    setEditingUserId(user.id);
    setEditForm({
      role: user.role,
      basic_salary: Number(user.basic_salary),
      kpi_unit: user.kpi_unit || 'tasks',
      manager_id: user.manager_id,
    });
    setMsg(null);
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setMsg(null);
  };

  const handleSave = async (userId: string) => {
    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from('users')
      .update({
        role: editForm.role,
        basic_salary: Number(editForm.basic_salary),
        kpi_unit: editForm.kpi_unit,
        manager_id: editForm.manager_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      setMsg({ text: error.message, error: true });
    } else if (data) {
      setUsers(users.map((u) => (u.id === userId ? (data as UserProfile) : u)));
      setEditingUserId(null);
      setMsg({ text: isRtl ? 'تم تحديث إعدادات الموظف بنجاح!' : 'Employee settings updated successfully!', error: false });
    }
    setLoading(false);
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    setLoading(true);

    const nameLower = newUnitName.trim().toLowerCase();

    const { data, error } = await supabase
      .from('kpi_units')
      .insert({ name: nameLower })
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

  const handleDeleteUnit = async (id: string, name: string) => {
    const confirmMsg = isRtl
      ? `هل أنت متأكد من حذف وحدة القياس "${name}"؟`
      : `Are you sure you want to delete "${name}"?`;
    if (!confirm(confirmMsg)) return;

    setLoading(true);
    const { error } = await supabase.from('kpi_units').delete().eq('id', id);

    if (error) {
      setMsg({ text: error.message, error: true });
    } else {
      setKpiUnits(kpiUnits.filter((u) => u.id !== id));
      setMsg({ text: isRtl ? 'تم حذف وحدة القياس.' : 'KPI Unit deleted.', error: false });
    }
    setLoading(false);
  };

  const managersList = users.filter((u) => u.role === 'manager' || u.role === 'super_admin');

  return (
    <div className="space-y-6">
      {/* 1. Employee Settings Card */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" /> {t('empManagement')}
            </h3>
            <p className="text-xs text-gray-400">{t('empManagementDesc')}</p>
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
            {msg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300 font-sans">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                <th className="px-4 py-3">{t('role')}</th>
                <th className="px-4 py-3">{t('basicSalary')}</th>
                <th className="px-4 py-3">{t('unit')}</th>
                <th className="px-4 py-3">{t('manager')}</th>
                <th className="px-4 py-3 text-right rounded-r-lg">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-sans">
              {users.map((u) => {
                const isEditing = editingUserId === u.id;
                const managerObj = users.find((m) => m.id === u.manager_id);

                return (
                  <tr key={u.id} className="hover:bg-gray-900/40">
                    <td className="px-4 py-3 font-semibold text-white">{u.full_name}</td>

                    {/* ROLE */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                          className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="employee">Employee</option>
                          <option value="manager">Manager</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'super_admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : u.role === 'manager'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      )}
                    </td>

                    {/* BASIC SALARY */}
                    <td className="px-4 py-3 font-bold text-gray-100">
                      {isEditing ? (
                        <input
                          type="number"
                          step="500"
                          value={editForm.basic_salary}
                          onChange={(e) =>
                            setEditForm({ ...editForm, basic_salary: Number(e.target.value) })
                          }
                          className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      ) : (
                        `${Number(u.basic_salary).toLocaleString()} EGP`
                      )}
                    </td>

                    {/* DEFAULT KPI UNIT */}
                    <td className="px-4 py-3 capitalize text-purple-300 font-medium">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.kpi_unit}
                          onChange={(e) => setEditForm({ ...editForm, kpi_unit: e.target.value })}
                          placeholder="e.g. calls, pieces"
                          className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      ) : (
                        u.kpi_unit || 'tasks'
                      )}
                    </td>

                    {/* MANAGER */}
                    <td className="px-4 py-3 text-gray-400">
                      {isEditing ? (
                        <select
                          value={editForm.manager_id || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, manager_id: e.target.value || null })
                          }
                          className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white max-w-[120px]"
                        >
                          <option value="">None</option>
                          {managersList
                            .filter((m) => m.id !== u.id)
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.full_name}
                              </option>
                            ))}
                        </select>
                      ) : (
                        managerObj?.full_name || 'None'
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSave(u.id)}
                            disabled={loading}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
                            title={t('save')}
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all"
                            title={t('cancel')}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(u)}
                          className="p-1.5 bg-gray-900 hover:bg-purple-600/20 text-gray-400 hover:text-purple-300 border border-gray-800 rounded-lg transition-all"
                          title="Edit User"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Global KPI Units Control Card */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" /> {isRtl ? 'إدارة وحدات القياس (KPI Units)' : 'Global KPI Measuring Units'}
          </h3>
          <p className="text-xs text-gray-400">
            {isRtl ? 'أضف أو احذف وحدات القياس المتاحة للموظفين لتسجيل إنتاجيتهم' : 'Add or delete metrics units available for employees to log their production'}
          </p>
        </div>

        <form onSubmit={handleAddUnit} className="flex gap-4 max-w-md">
          <input
            type="text"
            required
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
            placeholder={isRtl ? 'مثال: مكالمات، عملاء، تقارير' : 'e.g. calls, sales, reports'}
            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1 transition-all disabled:opacity-50 shrink-0"
          >
            <Plus className="w-4 h-4" /> {isRtl ? 'إضافة وحدة' : 'Add Unit'}
          </button>
        </form>

        <div className="flex flex-wrap gap-2.5">
          {kpiUnits.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-medium text-gray-300 hover:text-white transition-all"
            >
              <span className="capitalize">{u.name}</span>
              <button
                onClick={() => handleDeleteUnit(u.id, u.name)}
                disabled={loading}
                className="text-gray-500 hover:text-rose-400 p-0.5 rounded transition-all"
                title="Delete Unit"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {kpiUnits.length === 0 && (
            <span className="text-xs text-gray-500 italic">No units registered. Add some above.</span>
          )}
        </div>
      </div>
    </div>
  );
}
