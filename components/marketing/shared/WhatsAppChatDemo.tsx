'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCheck, 
  Send, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  CheckCircle2 
} from 'lucide-react';

interface ChatScenario {
  id: string;
  category: string;
  title: string;
  icon: React.ElementType;
  messages: Array<{
    sender: 'user' | 'assistant';
    text: string;
    time: string;
    isAction?: boolean;
    actionConfirmed?: boolean;
  }>;
}

const SCENARIOS: ChatScenario[] = [
  {
    id: 'attendance',
    category: 'استعلامات الحضور والتشغيل',
    title: 'الحضور والغياب والتأخيرات',
    icon: Clock,
    messages: [
      {
        sender: 'user',
        text: 'مين اتأخر النهارده في فرع التجمع؟',
        time: '09:42 ص',
      },
      {
        sender: 'assistant',
        text: 'فرع التجمع: اتأخر اليوم 2 موظفين (كريم سامي 25 دقيقة، سارة أحمد 15 دقيقة). باقي الموظفين (8 موظفين) حضروا في الموعد المحدد وتم التحقق بالموقع الجغرافي (Geofence).',
        time: '09:42 ص',
      },
      {
        sender: 'user',
        text: 'إيه نسبة حضور الموظفين لحد دلوقتي؟',
        time: '09:45 ص',
      },
      {
        sender: 'assistant',
        text: 'نسبة الحضور الإجمالية اليوم حتى الساعة 09:45 ص هي 94% عبر كافة الفروع (47 من 50 موظف). يوجد 2 في إجازة معتمدة، و1 غياب غير مبرر.',
        time: '09:45 ص',
      },
    ],
  },
  {
    id: 'payroll',
    category: 'الاستعلامات المالية والرواتب',
    title: 'الإجازات والسلف والتحويلات',
    icon: DollarSign,
    messages: [
      {
        sender: 'user',
        text: 'رصيد إجازات أحمد علي باقي فيه كام يوم؟',
        time: '11:15 ص',
      },
      {
        sender: 'assistant',
        text: 'الموظف أحمد علي (قسم المبيعات): رصيد الإجازات السنوية المتبقي 14 يوم من أصل 21 يوم. استنفد 7 أيام حتى الآن وفق لائحة 2026.',
        time: '11:15 ص',
      },
      {
        sender: 'user',
        text: 'إجمالي السلف المطلوبة والمعتمدة الشهر ده كام؟',
        time: '11:18 ص',
      },
      {
        sender: 'assistant',
        text: 'شهر أغسطس 2026: تم تقديم 4 طلبات سلف بإجمالي 18,500 ج، تم اعتماد 3 سلف بإجمالي 14,000 ج (جميعها ضمن حد الـ 50% من صافي الراتب).',
        time: '11:18 ص',
      },
    ],
  },
  {
    id: 'actions',
    category: 'تنفيذ العمليات بأمان (تأكيد مزدوج)',
    title: 'تسجيل مكافأة أو اعتماد إجراء',
    icon: CheckCircle2,
    messages: [
      {
        sender: 'user',
        text: 'ضيف مكافأة 500 جنيه لمحمد بسبب تحقيق التارجت',
        time: '02:30 م',
      },
      {
        sender: 'assistant',
        text: '⚠️ سيتم إضافة مكافأة بقيمة 500 ج للموظف محمد السيد على مسير رواتب شهر أغسطس.\n\nهل تؤكد تسجيل هذا الإجراء في مسير الرواتب؟',
        time: '02:30 م',
        isAction: true,
      },
      {
        sender: 'user',
        text: 'نعم، أؤكد الإضافة',
        time: '02:31 م',
      },
      {
        sender: 'assistant',
        text: '✅ تم تسجيل المكافأة بنجاح وتحديث مسير الرواتب تلقائياً. تم توثيق العملية في سجل الرقابة (Audit Trail) برقم مرجعي #TX-8924.',
        time: '02:31 م',
      },
    ],
  },
];

export function WhatsAppChatDemo() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('actions');
  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Category Switcher Tabs */}
      <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl mb-6 overflow-x-auto">
        {SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          const isActive = scenario.id === activeScenarioId;
          return (
            <button
              key={scenario.id}
              onClick={() => setActiveScenarioId(scenario.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-teal-400'}`} />
              <span>{scenario.category}</span>
            </button>
          );
        })}
      </div>

      {/* WhatsApp Device Mockup */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-950">
        {/* Top Phone Speaker Bar */}
        <div className="bg-slate-900 px-6 py-2 flex items-center justify-between border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">10:00</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            <span className="text-[11px] text-teal-400">شبكة الجيل الخامس 5G</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>مشفر بالكامل من طرف لطرف</span>
          </div>
        </div>

        {/* WhatsApp Chat Header */}
        <div className="bg-[#075E54] text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-inner">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#075E54]"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm sm:text-base text-white">HumAi Assistant</h4>
                <span className="bg-emerald-400/20 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-medium border border-emerald-400/30">
                  موثّق ✓
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 flex items-center gap-1">
                <span>متصل الآن • يرد في ثوانٍ</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] bg-emerald-800/80 text-emerald-100 px-2.5 py-1 rounded-full border border-emerald-700">
              {activeScenario.title}
            </span>
          </div>
        </div>

        {/* Chat Messages Body with WhatsApp Style Background */}
        <div 
          className="p-4 sm:p-6 space-y-4 min-h-[380px] flex flex-col justify-end relative bg-slate-900/90"
          style={{
            backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        >
          {/* Security Notice */}
          <div className="flex justify-center">
            <div className="bg-slate-800/80 text-slate-300 text-[11px] px-3.5 py-1 rounded-lg border border-slate-700/60 shadow-sm flex items-center gap-1.5 max-w-md text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>محادثة مشفرة • صلاحيات المدير التنفيذي (Super Admin)</span>
            </div>
          </div>

          {/* Messages Stream */}
          {activeScenario.messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={index}
                className={`flex w-full ${isUser ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-md relative text-sm ${
                    isUser
                      ? 'bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700'
                      : 'bg-[#005C4B] text-white rounded-tl-none border border-emerald-600/40'
                  }`}
                >
                  {/* Sender Name tag if assistant */}
                  {!isUser && (
                    <div className="flex items-center gap-1 text-[11px] text-teal-300 font-semibold mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>HumAi HR AI</span>
                    </div>
                  )}

                  {/* Message content */}
                  <p className="leading-relaxed whitespace-pre-line font-medium text-xs sm:text-sm">
                    {msg.text}
                  </p>

                  {/* Time and ticks */}
                  <div
                    className={`flex items-center gap-1 mt-1 text-[10px] ${
                      isUser ? 'text-slate-400 justify-start' : 'text-emerald-200/80 justify-end'
                    }`}
                  >
                    <span>{msg.time}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fake Input Bar */}
        <div className="bg-slate-900 p-3 sm:p-4 border-t border-slate-800 flex items-center gap-3">
          <div className="flex-1 bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-400 flex items-center justify-between">
            <span className="text-slate-400">اسأل المساعد الذكي عن أي شيء بالعامية...</span>
            <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 shadow-md">
            <Send className="w-4 h-4 rotate-180" />
          </div>
        </div>
      </div>

      {/* Helper Quick Prompts under demo */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
        <span className="font-medium text-slate-300">أمثلة شائعة يمكنك تجربتها:</span>
        <span className="bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700 text-slate-300">
          &ldquo;مين واخد إجازة النهارده في قسم المبيعات؟&rdquo;
        </span>
        <span className="bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700 text-slate-300">
          &ldquo;بيانات تحويل الراتب للموظف محمود حسن؟&rdquo;
        </span>
      </div>
    </div>
  );
}
