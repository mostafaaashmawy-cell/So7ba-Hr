'use client';

import React, { useState } from 'react';
import { UserProfile, UserRole } from '@/lib/types/database';
import { Shield, Edit3, Save, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface EmployeeManagementProps {
  initialUsers: UserProfile[];
}

export default function EmployeeManagement({ initialUsers }: EmployeeManagementProps) {
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

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const supabase = createClient();

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
      setMsg({ text: 'Employee settings updated successfully!', error: false });
    }
    setLoading(false);
  };

  const managersList = users.filter((u) => u.role === 'manager' || u.role === 'super_admin');

  return (
    <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" /> Employee & Salary Configuration
          </h3>
          <p className="text-xs text-gray-400">Configure roles, basic salary (EGP), and dynamic KPI units</p>
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
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Full Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Basic Salary (EGP)</th>
              <th className="px-4 py-3">KPI Unit</th>
              <th className="px-4 py-3">Manager</th>
              <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
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

                  {/* KPI UNIT */}
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
                          title="Save"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all"
                          title="Cancel"
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
  );
}
