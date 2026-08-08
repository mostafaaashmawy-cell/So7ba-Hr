'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types/database';
import { FileText, Save, Download, RefreshCw, AlertCircle, CheckCircle2, FileEdit } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function ContractsPage() {
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  // Contract variables
  const [contractType, setContractType] = useState('Full-Time');
  const [probationMonths, setProbationMonths] = useState(3);
  const [endDate, setEndDate] = useState('');

  // Rich Text Master Template State
  const [templateBody, setTemplateBody] = useState<string>('');
  
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const defaultTemplate = `EMPLOYMENT AGREEMENT

This Agreement is made on {{Current_Date}} between Simply HR System (hereinafter "the Company") and {{Employee_Name}} (hereinafter "the Employee").

1. POSITION AND DESIGNATION:
The Employee is hired as a {{Job_Title}} in the {{Department_Name}} department.

2. COMPENSATION & PAYMENTS:
The Company shall pay the Employee a monthly basic salary of {{Basic_Salary}} EGP, payable via {{Payment_Method}}.

3. CONTRACT TERM & PROBATION:
This contract is {{Contract_Type}} starting {{Start_Date}} and ending {{Contract_End_Date}}.
The Employee will be subject to a probation period of {{Probation_Period}} months.

4. COLLABORATION:
The Employee will report directly to their manager {{Manager_Name}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

______________________                  ______________________
For the Company                         Employee Signature`;

  const loadData = async () => {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    // Profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      setCurrentUser(profile as UserProfile);

      // Load all employees in tenant
      const { data: users } = await supabase
        .from('users')
        .select('*, department:departments(name)')
        .eq('tenant_id', profile.tenant_id);
      
      if (users) {
        setEmployees(users as UserProfile[]);
        if (users.length > 0) {
          setSelectedEmployee(users[0].id);
        }
      }

      // Load contract template from DB
      const { data: template } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .maybeSingle();

      if (template) {
        setTemplateBody(template.template_body);
      } else {
        setTemplateBody(defaultTemplate);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveTemplate = async () => {
    if (!currentUser) return;
    setSaving(true);
    setMsg(null);

    try {
      const { data: existing } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('tenant_id', currentUser.tenant_id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('contract_templates')
          .update({ template_body: templateBody })
          .eq('tenant_id', currentUser.tenant_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contract_templates')
          .insert({ tenant_id: currentUser.tenant_id, template_body: templateBody });
        if (error) throw error;
      }

      setMsg({ text: isRtl ? 'تم حفظ نموذج العقد الرئيسي!' : 'Master contract template saved!', error: false });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmployeeContracts = async () => {
    if (!selectedEmployee) return;
    
    const { error } = await supabase
      .from('users')
      .update({
        contract_type: contractType,
        probation_period: Number(probationMonths),
        contract_end_date: endDate || null
      })
      .eq('id', selectedEmployee);

    if (!error) {
      // Refresh local list
      loadData();
    }
  };

  const generateContractText = () => {
    const emp = employees.find((e) => e.id === selectedEmployee);
    if (!emp) return;

    let text = templateBody;
    const today = new Date().toLocaleDateString();

    text = text.replace(/{{Employee_Name}}/g, emp.full_name || 'N/A');
    text = text.replace(/{{Job_Title}}/g, emp.job_title || 'N/A');
    text = text.replace(/{{Basic_Salary}}/g, Number(emp.basic_salary || 0).toLocaleString() + ' EGP');
    text = text.replace(/{{Department_Name}}/g, ((emp as unknown) as { department?: { name?: string } }).department?.name || 'N/A');
    text = text.replace(/{{Payment_Method}}/g, emp.payment_method || 'Cash');
    text = text.replace(/{{Contract_Type}}/g, emp.contract_type || 'Full-Time');
    text = text.replace(/{{Probation_Period}}/g, String(emp.probation_period || 3));
    text = text.replace(/{{Contract_End_Date}}/g, emp.contract_end_date || 'Undetermined');
    text = text.replace(/{{Start_Date}}/g, emp.created_at ? new Date(emp.created_at).toLocaleDateString() : today);
    text = text.replace(/{{Current_Date}}/g, today);
    
    // Find manager name if assigned
    const mgr = employees.find((e) => e.id === emp.manager_id);
    text = text.replace(/{{Manager_Name}}/g, mgr?.full_name || 'Direct Supervisor');

    setPreviewContent(text);
    setShowPreview(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-gray-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-sky-400 mr-2" />
        Loading contracts configurator...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar user={currentUser} activeRoleView="super_admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6 print:bg-white print:text-black print:p-0">
        
        {/* Printable preview output overlay */}
        {showPreview && (
          <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4 print:border-none print:shadow-none print:bg-white print:text-black print:p-0">
            <div className="flex justify-between items-center pb-3 border-b border-gray-800 print:hidden">
              <h3 className="font-bold text-sm text-gray-200">Generated Contract Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="gradient-btn px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download / Print Contract
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                >
                  Back to Template
                </button>
              </div>
            </div>

            {/* Print Header Logo */}
            <div className="hidden print:flex items-center justify-between border-b-2 border-black pb-4 mb-8">
              <div>
                <h1 className="text-xl font-black text-black">Simply HR System</h1>
                <p className="text-[10px] text-gray-700">Official Employment Documentation</p>
              </div>
              <div className="w-12 h-12 bg-black text-white font-extrabold text-2xl flex items-center justify-center rounded-xl">
                S
              </div>
            </div>

            {/* Printable Document Body */}
            <pre className="whitespace-pre-wrap font-serif text-sm text-gray-300 print:text-black leading-relaxed p-4 bg-gray-900/20 rounded-xl border border-gray-800 print:border-none print:bg-transparent print:p-0">
              {previewContent}
            </pre>
          </div>
        )}

        {!showPreview && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
            
            {/* Editor Workspace Column */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileEdit className="w-5 h-5 text-sky-400" /> Master Contract Text Editor
                </h2>
                <button
                  onClick={saveTemplate}
                  disabled={saving}
                  className="gradient-btn px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>

              {msg && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  msg.error ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}>
                  {msg.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{msg.text}</span>
                </div>
              )}

              <p className="text-xs text-gray-400">
                You can write custom contracts using template variables. They will auto-fill with selected employee details:
                <br />
                <code className="text-sky-300 text-[10px] font-sans">
                  {"{{Employee_Name}}"}, {"{{Job_Title}}"}, {"{{Basic_Salary}}"}, {"{{Department_Name}}"}, {"{{Payment_Method}}"}, {"{{Contract_Type}}"}, {"{{Probation_Period}}"}, {"{{Contract_End_Date}}"}, {"{{Manager_Name}}"}, {"{{Current_Date}}"}
                </code>
              </p>

              <textarea
                value={templateBody}
                onChange={(e) => setTemplateBody(e.target.value)}
                rows={18}
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-xs font-mono text-gray-100 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Employee Generator Parameters Panel */}
            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
              <div>
                <h3 className="font-bold text-sm text-gray-200">Contract Generator</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Select employee and update terms before downloading contract.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Target Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => {
                      setSelectedEmployee(e.target.value);
                      const emp = employees.find((u) => u.id === e.target.value);
                      if (emp) {
                        setContractType(emp.contract_type || 'Full-Time');
                        setProbationMonths(emp.probation_period || 3);
                        setEndDate(emp.contract_end_date || '');
                      }
                    }}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-900">
                  <h4 className="text-xs font-bold text-gray-300">Override Agreement Terms</h4>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Contract Type</label>
                    <select
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Probation Period (Months)</label>
                    <input
                      type="number"
                      value={probationMonths}
                      onChange={(e) => setProbationMonths(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Contract End Date (Optional)</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 focus:outline-none font-sans"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleUpdateEmployeeContracts}
                    className="w-full bg-sky-500/10 border border-sky-500/20 text-sky-400 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/20 transition-all"
                  >
                    Apply Terms to Employee Profile
                  </button>
                </div>

                <button
                  onClick={generateContractText}
                  className="w-full gradient-btn py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-lg pt-3 border-t border-gray-900"
                >
                  <FileText className="w-4 h-4" /> Compile Agreement Text
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
