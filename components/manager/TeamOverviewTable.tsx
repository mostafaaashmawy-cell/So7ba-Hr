'use client';

import React, { useState } from 'react';
import { Users, Clock, Calendar, Wallet, Target, Eye, MapPin } from 'lucide-react';
import { UserProfile, AttendanceRecord, LeavePermissionRecord, AdvanceRecord, KpiEntryRecord } from '@/lib/types/database';
import { formatDate, formatTime, calculateWorkingHours } from '@/lib/utils/dateUtils';

interface TeamOverviewProps {
  teamMembers: UserProfile[];
  attendanceRecords: AttendanceRecord[];
  leaveRecords: LeavePermissionRecord[];
  advanceRecords: AdvanceRecord[];
  kpiRecords: KpiEntryRecord[];
}

export default function TeamOverviewTable({
  teamMembers,
  attendanceRecords,
  leaveRecords,
  advanceRecords,
  kpiRecords,
}: TeamOverviewProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'advances' | 'kpis'>('attendance');
  const [selectedMember, setSelectedMember] = useState<string>('all');

  const filteredAttendance = attendanceRecords.filter(
    (a) => selectedMember === 'all' || a.user_id === selectedMember
  );

  const filteredLeaves = leaveRecords.filter(
    (l) => selectedMember === 'all' || l.user_id === selectedMember
  );

  const filteredAdvances = advanceRecords.filter(
    (a) => selectedMember === 'all' || a.user_id === selectedMember
  );

  const filteredKpis = kpiRecords.filter(
    (k) => selectedMember === 'all' || k.user_id === selectedMember
  );

  return (
    <div className="space-y-6">
      {/* Team Header & Filters */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" /> Team Operations Overview
          </h2>
          <p className="text-xs text-gray-400">Read-only dashboard for team monitoring</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-gray-400 shrink-0 font-medium">Filter Member:</label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none focus:border-amber-500 w-full md:w-56"
          >
            <option value="all">All Team Members ({teamMembers.length})</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name} ({m.kpi_unit || 'tasks'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'attendance'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" /> Attendance ({filteredAttendance.length})
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'leaves'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> Leaves & Permissions ({filteredLeaves.length})
        </button>

        <button
          onClick={() => setActiveTab('advances')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'advances'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Wallet className="w-4 h-4" /> Advances ({filteredAdvances.length})
        </button>

        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'kpis'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Target className="w-4 h-4" /> KPI Logs ({filteredKpis.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800">
        {/* TAB: Attendance */}
        {activeTab === 'attendance' && (
          <div>
            {filteredAttendance.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">No attendance logs found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Employee</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Check-In</th>
                      <th className="px-4 py-3">Check-Out</th>
                      <th className="px-4 py-3">Working Hours</th>
                      <th className="px-4 py-3 rounded-r-lg">Coordinates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-900/40">
                        <td className="px-4 py-3 font-semibold text-white">
                          {rec.user?.full_name || 'Team Member'}
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(rec.date)}</td>
                        <td className="px-4 py-3 font-medium text-emerald-400">{formatTime(rec.check_in_time)}</td>
                        <td className="px-4 py-3 font-medium text-rose-400">{formatTime(rec.check_out_time)}</td>
                        <td className="px-4 py-3 font-bold text-amber-300">
                          {calculateWorkingHours(rec.check_in_time, rec.check_out_time)}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-[11px]">
                          {rec.lat && rec.lng ? (
                            <span className="flex items-center gap-1 text-purple-300">
                              <MapPin className="w-3 h-3" /> {rec.lat.toFixed(4)}, {rec.lng.toFixed(4)}
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: Leaves & Permissions */}
        {activeTab === 'leaves' && (
          <div>
            {filteredLeaves.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">No leaves or permissions logged.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Employee</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 rounded-r-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredLeaves.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-900/40">
                        <td className="px-4 py-3 font-semibold text-white">
                          {rec.user?.full_name || 'Team Member'}
                        </td>
                        <td className="px-4 py-3 capitalize font-medium">
                          {rec.type === 'leave' ? (
                            <span className="text-purple-300">Annual Leave</span>
                          ) : (
                            <span className="text-blue-300">Permission</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(rec.date)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              rec.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-red-500/10 text-red-300 border-red-500/30'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: Advances */}
        {activeTab === 'advances' && (
          <div>
            {filteredAdvances.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">No advance requests logged.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Employee</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Payroll Month</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredAdvances.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-900/40">
                        <td className="px-4 py-3 font-semibold text-white">
                          {rec.user?.full_name || 'Team Member'}
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(rec.created_at || rec.month)}</td>
                        <td className="px-4 py-3 text-purple-300">{rec.month}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-400">
                          {Number(rec.amount).toLocaleString()} EGP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: KPIs */}
        {activeTab === 'kpis' && (
          <div>
            {filteredKpis.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">No KPI records logged.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Employee</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Achieved Quantity</th>
                      <th className="px-4 py-3 rounded-r-lg">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredKpis.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-900/40">
                        <td className="px-4 py-3 font-semibold text-white">
                          {rec.user?.full_name || 'Team Member'}
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(rec.date)}</td>
                        <td className="px-4 py-3 font-bold text-blue-400">{rec.amount}</td>
                        <td className="px-4 py-3 text-gray-400 capitalize">{rec.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
