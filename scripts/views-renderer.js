/**
 * HumAi Visual Onboarding & Product Manual — Views Renderer
 * Generates self-contained, pixel-perfect standalone HTML views of all 12 platform screens.
 * Uses high-fidelity embedded CSS matching HumAi's exact enterprise design tokens.
 * Zero external CDN scripts = Instant, 100% deterministic, high-speed headless rendering.
 */

const fs = require('fs');
const path = require('path');

// Common Head & Styling for all rendered views
function getCommonHead(title) {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Cairo', 'Inter', system-ui, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      font-size: 13px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      width: 1440px;
      min-height: 900px;
      overflow-x: hidden;
    }

    /* Layout & Flex Utilities */
    .flex { display: flex; }
    .inline-flex { display: inline-flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .items-end { align-items: flex-end; }
    .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; }
    .justify-end { justify-content: flex-end; }
    .gap-1 { gap: 4px; }
    .gap-2 { gap: 8px; }
    .gap-3 { gap: 12px; }
    .gap-4 { gap: 16px; }
    .gap-5 { gap: 20px; }
    .gap-6 { gap: 24px; }
    .gap-8 { gap: 32px; }

    /* Grid Utilities */
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .col-span-2 { grid-column: span 2 / span 2; }

    /* Dimensions & Spacing */
    .w-full { width: 100%; }
    .h-full { height: 100%; }
    .max-w-7xl { max-width: 1360px; margin-left: auto; margin-right: auto; }
    .max-w-5xl { max-width: 1100px; margin-left: auto; margin-right: auto; }
    .p-3 { padding: 12px; }
    .p-4 { padding: 16px; }
    .p-5 { padding: 20px; }
    .p-6 { padding: 24px; }
    .p-7 { padding: 28px; }
    .p-8 { padding: 32px; }
    .px-3 { padding-left: 12px; padding-right: 12px; }
    .px-4 { padding-left: 16px; padding-right: 16px; }
    .px-5 { padding-left: 20px; padding-right: 20px; }
    .px-6 { padding-left: 24px; padding-right: 24px; }
    .py-1 { padding-top: 4px; padding-bottom: 4px; }
    .py-2 { padding-top: 8px; padding-bottom: 8px; }
    .py-3 { padding-top: 12px; padding-bottom: 12px; }
    .py-4 { padding-top: 16px; padding-bottom: 16px; }
    .mb-1 { margin-bottom: 4px; }
    .mb-2 { margin-bottom: 8px; }
    .mb-3 { margin-bottom: 12px; }
    .mb-4 { margin-bottom: 16px; }
    .mb-5 { margin-bottom: 20px; }
    .mb-6 { margin-bottom: 24px; }
    .mt-1 { margin-top: 4px; }
    .mt-2 { margin-top: 8px; }
    .mt-3 { margin-top: 12px; }
    .mt-4 { margin-top: 16px; }

    /* Typography */
    .font-bold { font-weight: 700; }
    .font-extrabold { font-weight: 800; }
    .font-black { font-weight: 900; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .font-mono { font-family: 'Inter', monospace; }
    .text-xs { font-size: 11.5px; }
    .text-sm { font-size: 13px; }
    .text-base { font-size: 15px; }
    .text-lg { font-size: 17px; }
    .text-xl { font-size: 19px; }
    .text-2xl { font-size: 23px; }
    .text-3xl { font-size: 28px; }
    .text-4xl { font-size: 34px; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .uppercase { text-transform: uppercase; }

    /* Color Palette — HumAi Obsidian & Emerald */
    .bg-white { background-color: #FFFFFF; }
    .bg-slate-50 { background-color: #F8FAFC; }
    .bg-slate-100 { background-color: #F1F5F9; }
    .bg-slate-200 { background-color: #E2E8F0; }
    .bg-slate-800 { background-color: #1E293B; }
    .bg-slate-900 { background-color: #0F172A; }
    .bg-slate-950 { background-color: #0B0F17; }
    .bg-emerald-50 { background-color: #ECFDF5; }
    .bg-emerald-100 { background-color: #D1FAE5; }
    .bg-emerald-600 { background-color: #059669; }
    .bg-emerald-500 { background-color: #10B981; }
    .bg-emerald-700 { background-color: #047857; }
    .bg-amber-50 { background-color: #FFFBEB; }
    .bg-amber-100 { background-color: #FEF3C7; }
    .bg-blue-50 { background-color: #EFF6FF; }
    .bg-blue-100 { background-color: #DBEAFE; }
    .bg-purple-50 { background-color: #FAF5FF; }
    .bg-purple-100 { background-color: #F3E8FF; }
    .bg-rose-50 { background-color: #FFF1F2; }
    .bg-rose-100 { background-color: #FFE4E6; }

    .text-white { color: #FFFFFF; }
    .text-slate-400 { color: #94A3B8; }
    .text-slate-500 { color: #64748B; }
    .text-slate-600 { color: #475569; }
    .text-slate-700 { color: #334155; }
    .text-slate-800 { color: #1E293B; }
    .text-slate-900 { color: #0F172A; }
    .text-slate-950 { color: #020617; }
    .text-emerald-300 { color: #6EE7B7; }
    .text-emerald-400 { color: #34D399; }
    .text-emerald-600 { color: #059669; }
    .text-emerald-700 { color: #047857; }
    .text-emerald-800 { color: #065F46; }
    .text-amber-500 { color: #F59E0B; }
    .text-amber-600 { color: #D97706; }
    .text-amber-700 { color: #B45309; }
    .text-blue-600 { color: #2563EB; }
    .text-blue-700 { color: #1D4ED8; }
    .text-blue-800 { color: #1E40AF; }
    .text-purple-700 { color: #7E22CE; }
    .text-rose-600 { color: #E11D48; }
    .text-rose-700 { color: #BE123C; }

    /* Borders & Radius */
    .border { border: 1px solid #E2E8F0; }
    .border-2 { border: 2px solid #E2E8F0; }
    .border-b { border-bottom: 1px solid #E2E8F0; }
    .border-t { border-top: 1px solid #E2E8F0; }
    .border-r { border-right: 1px solid #E2E8F0; }
    .border-slate-100 { border-color: #F1F5F9; }
    .border-slate-200 { border-color: #E2E8F0; }
    .border-emerald-200 { border-color: #A7F3D0; }
    .border-emerald-300 { border-color: #6EE7B7; }
    .border-emerald-500 { border-color: #10B981; }
    .border-amber-200 { border-color: #FDE68A; }
    .border-blue-200 { border-color: #BFDBFE; }
    .rounded-lg { border-radius: 8px; }
    .rounded-xl { border-radius: 12px; }
    .rounded-2xl { border-radius: 16px; }
    .rounded-full { border-radius: 9999px; }

    /* Shadows */
    .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
    .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .card-shadow { box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04); }

    /* Tables */
    table { width: 100%; border-collapse: collapse; }
    th { padding: 12px 16px; font-weight: 700; color: #64748B; background-color: #F8FAFC; text-align: right; border-bottom: 1px solid #E2E8F0; }
    td { padding: 14px 16px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }

    /* Buttons */
    button {
      border: none;
      cursor: pointer;
      font-family: inherit;
      font-size: 12px;
      font-weight: 700;
      border-radius: 10px;
      padding: 8px 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .btn-emerald {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }
    .btn-white {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      color: #334155;
    }

    /* Radar Canvas Visual */
    .radar-box {
      background: #0B0F17;
      border-radius: 12px;
      position: relative;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .radar-circle {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .radar-point {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 16px #10B981;
      z-index: 2;
    }
  </style>
</head>
`;
}

// App Topbar Header Mockup
function getAppNavbar(activeRole = 'موظف', userName = 'م/ سارة إبراهيم') {
  return `
  <header style="background:#FFFFFF; border-bottom:1px solid #E2E8F0; padding:12px 32px; display:flex; align-items:center; justify-content:space-between;">
    <div style="display:flex; align-items:center; gap:24px;">
      <!-- HumAi Logo -->
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:36px; height:36px; border-radius:10px; background:#0F172A; display:flex; align-items:center; justify-content:center;">
          <svg width="22" height="22" viewBox="0 0 60 56" fill="none">
            <circle cx="14" cy="10" r="5.5" fill="#FFFFFF"/>
            <rect x="9" y="19" width="10" height="28" rx="5" fill="#FFFFFF"/>
            <circle cx="46" cy="10" r="5.5" fill="#10B981"/>
            <rect x="41" y="19" width="10" height="28" rx="5" fill="#10B981"/>
            <path d="M 18 29 C 23 37, 37 37, 42 29 C 40 37, 20 37, 18 29 Z" fill="#10B981"/>
          </svg>
        </div>
        <div>
          <div style="font-weight:900; font-size:20px; line-height:1; color:#0F172A;">
            <span>HUM</span><span style="display:inline-block; transform:scaleY(0.95); margin:0 1px;">Λ</span><span style="position:relative;">I<span style="position:absolute; top:-3px; right:0; width:5px; height:5px; border-radius:50%; background:#10B981;"></span></span>
          </div>
          <p style="font-size:9px; font-weight:700; color:#94A3B8; text-transform:uppercase; margin-top:2px;">HR Intelligence & Payroll</p>
        </div>
      </div>

      <!-- Navigation Links -->
      <div style="display:flex; align-items:center; gap:6px; background:#F1F5F9; padding:4px 6px; border-radius:10px; font-size:12px; font-weight:700;">
        <span style="background:#FFFFFF; color:#065F46; padding:5px 12px; border-radius:8px; box-shadow:0 1px 2px rgba(0,0,0,0.05); display:flex; align-items:center; gap:6px;">
          <span style="width:6px; height:6px; border-radius:50%; background:#10B981;"></span> مساحة العمل اليومية
        </span>
        <span style="padding:5px 12px; color:#64748B;">سجل النشاط</span>
        <span style="padding:5px 12px; color:#64748B;">المستندات</span>
        <span style="padding:5px 12px; color:#64748B;">مساعد واتساب</span>
      </div>
    </div>

    <!-- User Profile & Status -->
    <div style="display:flex; align-items:center; gap:16px;">
      <div style="display:flex; align-items:center; gap:6px; background:#ECFDF5; border:1px solid #A7F3D0; padding:4px 12px; border-radius:9999px; font-size:11px; font-weight:700; color:#065F46;">
        <span style="width:6px; height:6px; border-radius:50%; background:#10B981;"></span>
        <span>متصل بالنظام المباشر</span>
      </div>
      <div style="display:flex; align-items:center; gap:12px; border-right:1px solid #E2E8F0; padding-right:12px;">
        <div style="text-align:left;">
          <p style="font-size:12px; font-weight:800; color:#0F172A;">${userName}</p>
          <p style="font-size:10px; color:#64748B;">${activeRole} • فرع المعادي الرئيسي</p>
        </div>
        <div style="width:36px; height:36px; border-radius:50%; background:#059669; color:#FFFFFF; font-weight:800; display:flex; align-items:center; justify-content:center; font-size:13px;">
          سي
        </div>
      </div>
    </div>
  </header>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 1: Smart Attendance (دليل الموظف - الحضور الذكي)
// ─────────────────────────────────────────────────────────────────────────────
function renderViewSmartAttendance() {
  return `
${getCommonHead('تسجيل الحضور الذكي - HumAi')}
<body>
  ${getAppNavbar('موظف', 'م/ سارة إبراهيم')}
  
  <main class="max-w-7xl p-8" style="display:flex; flex-direction:column; gap:24px;">
    <!-- Breadcrumb & Title -->
    <div class="flex justify-between items-center">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
          <span>دليل الموظف</span> <span>/</span> <span class="text-slate-500">مساحة العمل اليومية</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900">تسجيل الحضور والانصراف الذكي (Smart Geofence Attendance)</h1>
      </div>
      <div class="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-700 flex items-center gap-2">
        <span>📅 الخميس، 8 أكتوبر 2026</span>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid" style="grid-template-columns: 2fr 1fr; gap: 24px;">
      
      <!-- Terminal Card -->
      <div class="bg-white rounded-2xl border border-slate-200 p-7 card-shadow">
        <div class="flex justify-between items-center border-b border-slate-100 pb-5 mb-6">
          <div class="flex items-center gap-3">
            <div style="width:48px; height:48px; border-radius:12px; background:#ECFDF5; border:1px solid #A7F3D0; display:flex; align-items:center; justify-content:center; font-size:22px;">
              ⏱️
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-900">بوابة تسجيل البصمة والـ GPS</h2>
              <p class="text-xs text-slate-500">التحقق الجغرافي النشط من نطاق الفرع (Geofence Radius: 150m)</p>
            </div>
          </div>
          <div class="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <span style="width:6px; height:6px; border-radius:50%; background:#10B981;"></span>
            <span>أنت داخل نطاق الفرع (18 متر من المركز)</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 items-center">
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div class="bg-slate-900 text-white p-5 rounded-2xl text-center shadow-lg" style="position:relative;">
              <span style="position:absolute; top:10px; right:12px; font-size:10px; background:#1E293B; color:#94A3B8; padding:2px 8px; border-radius:6px;" class="font-mono">توقيت القاهرة (EET)</span>
              <p class="text-xs text-slate-400 font-medium mb-1">الوقت الفعلي المعتمد</p>
              <div class="text-4xl font-black font-mono text-emerald-400">08:54:32 <span class="text-base text-slate-300">AM</span></div>
              <p class="text-xs text-emerald-300 mt-1 font-bold">ضمن فترة السماح (Grace Period) — بدون أي تأخير</p>
            </div>

            <button class="btn-emerald py-4 px-6 text-sm font-black" style="width:100%;">
              <span>✓ تسجيل حضور الآن (Check-In)</span>
            </button>

            <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span class="text-slate-600 font-bold">نمط العمل المعتمد:</span>
              <div class="flex gap-2">
                <span style="background:#059669; color:#FFFFFF; padding:4px 10px; border-radius:6px; font-weight:700;">حضوري بالمقر</span>
                <span style="background:#E2E8F0; color:#64748B; padding:4px 10px; border-radius:6px; font-weight:600;">عن بُعد (Remotely)</span>
              </div>
            </div>
          </div>

          <!-- Radar Visual -->
          <div class="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between" style="height:100%;">
            <div class="flex justify-between items-center text-xs mb-2">
              <span class="font-bold text-slate-800">📍 محيط فرع المعادي تكنولوجي زون</span>
              <span class="text-slate-500 font-mono">نصف القطر: 150m</span>
            </div>

            <div class="radar-box">
              <div class="radar-circle" style="width:140px; height:140px;"></div>
              <div class="radar-circle" style="width:90px; height:90px; background:rgba(16,185,129,0.08);"></div>
              <div class="radar-circle" style="width:40px; height:40px; background:rgba(16,185,129,0.15);"></div>
              <div class="radar-point"></div>
              <span style="position:absolute; bottom:8px; left:8px; font-size:10px; color:#34D399; background:rgba(0,0,0,0.6); padding:2px 8px; border-radius:4px;" class="font-mono">
                Lat: 29.9602° N, Lon: 31.2569° E
              </span>
            </div>

            <p class="text-xs text-slate-500 text-center mt-2 font-medium">تم التحقق من دقة إحداثيات GPS المشفرة بنجاح</p>
          </div>
        </div>
      </div>

      <!-- Right Column: Shift Details -->
      <div style="display:flex; flex-direction:column; gap:20px;">
        <div class="bg-white rounded-2xl border border-slate-200 p-6 card-shadow">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-black text-slate-900">الوردية المخصصة اليوم</h3>
            <span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">وردية ثابتة</span>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:12px;" class="text-xs">
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-slate-500">اسم الوردية:</span>
              <span class="font-bold text-slate-800">الوردية الصباحية الهندسية</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-slate-500">مواعيد العمل:</span>
              <span class="font-bold text-slate-900 font-mono">09:00 AM — 05:00 PM</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-slate-500">سماحية الحضور:</span>
              <span class="font-bold text-emerald-700">15 دقيقة (حتى 09:15 AM)</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-slate-500">فترة الراحة اليومية:</span>
              <span class="font-bold text-slate-800">60 دقيقة مدفوعة</span>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
          <p class="text-xs text-slate-400 font-medium mb-1">إجمالي ساعات العمل هذا الأسبوع</p>
          <div class="text-3xl font-black text-emerald-400 font-mono mb-2">38h 45m</div>
          <div style="background:#334155; border-radius:9999px; height:8px; width:100%; overflow:hidden;" class="mb-2">
            <div style="background:#10B981; height:8px; width:96%; border-radius:9999px;"></div>
          </div>
          <div class="flex justify-between text-xs text-slate-300">
            <span>المستهدف: 40 ساعة</span>
            <span class="text-emerald-400 font-bold">96% منجز</span>
          </div>
        </div>
      </div>

    </div>
  </main>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 2: Leaves & Permissions (دليل الموظف - الإجازات والاستئذانات)
// ─────────────────────────────────────────────────────────────────────────────
function renderViewLeavesPermissions() {
  return `
${getCommonHead('الإجازات والاستئذانات - HumAi')}
<body>
  ${getAppNavbar('موظف', 'م/ سارة إبراهيم')}
  
  <main class="max-w-7xl p-8" style="display:flex; flex-direction:column; gap:24px;">
    <div class="flex justify-between items-center">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
          <span>دليل الموظف</span> <span>/</span> <span class="text-slate-500">الطلبات الذاتية</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900">رصيد الإجازات وأذونات العمل (Leaves & Permissions Hub)</h1>
      </div>
      <button class="btn-emerald py-2.5 px-5 text-xs font-bold">
        <span>+ تقديم طلب إجازة / استئذان جديد</span>
      </button>
    </div>

    <!-- Balance Metrics Cards -->
    <div class="grid grid-cols-4 gap-5">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow">
        <p class="text-xs font-bold text-slate-500 mb-1">الرصيد السنوي المتبقي</p>
        <div class="text-3xl font-black text-slate-900 font-mono">16 <span class="text-sm font-semibold text-slate-400">/ 21 يوم</span></div>
        <div class="mt-2 text-xs text-emerald-600 font-bold">✓ متاح للاستخدام فوراً</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow">
        <p class="text-xs font-bold text-slate-500 mb-1">الإجازات العارضة (Casual)</p>
        <div class="text-3xl font-black text-slate-900 font-mono">4 <span class="text-sm font-semibold text-slate-400">/ 6 أيام</span></div>
        <div class="mt-2 text-xs text-slate-500 font-medium">بحد أقصى يومين متتاليين</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow">
        <p class="text-xs font-bold text-slate-500 mb-1">أذونات الشهر الحالي (2 ساعة)</p>
        <div class="text-3xl font-black text-amber-600 font-mono">1 <span class="text-sm font-semibold text-slate-400">مستخدم من 2</span></div>
        <div class="mt-2 text-xs text-amber-600 font-semibold">متبقي إذن واحد لشهر أكتوبر</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow">
        <p class="text-xs font-bold text-slate-500 mb-1">رصيد تعويضي (بدل عطلات)</p>
        <div class="text-3xl font-black text-emerald-600 font-mono">+2 <span class="text-sm font-semibold text-slate-400">أيام</span></div>
        <div class="mt-2 text-xs text-emerald-700 font-semibold">عن تشغيل يوم الجمعة 18 سبتمبر</div>
      </div>
    </div>

    <!-- Active Requests & History Table -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 card-shadow">
      <div class="flex justify-between items-center mb-5">
        <h3 class="text-base font-black text-slate-900">سجل طلبات الإجازات والأذونات لعام 2026</h3>
        <div class="flex gap-2">
          <span style="background:#F1F5F9; color:#475569; padding:4px 12px; border-radius:8px; font-size:12px; font-weight:700;">جميع الطلبات (6)</span>
          <span style="background:#ECFDF5; color:#047857; padding:4px 12px; border-radius:8px; font-size:12px; font-weight:700;">المعتمدة (4)</span>
          <span style="background:#FFFBEB; color:#B45309; padding:4px 12px; border-radius:8px; font-size:12px; font-weight:700;">قيد الانتظار (1)</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>نوع الطلب</th>
            <th>الفترة / التاريخ</th>
            <th>المدة</th>
            <th>السبب والملاحظات</th>
            <th>مسار الاعتماد</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-bold text-slate-900">🌴 إجازة اعتيادية سنوية</td>
            <td class="font-mono text-slate-700">12 أكتوبر 2026 — 15 أكتوبر 2026</td>
            <td class="font-bold text-slate-800">4 أيام عمل</td>
            <td class="text-slate-500">إجازة عائلية دورية</td>
            <td class="text-slate-600">م/ أحمد محمود (مدير الإدارة)</td>
            <td><span style="background:#FFFBEB; color:#B45309; border:1px solid #FDE68A; padding:3px 10px; border-radius:9999px; font-weight:700; font-size:11px;">قيد المراجعة</span></td>
          </tr>
          <tr>
            <td class="font-bold text-slate-900">⏰ إذن تأخير صباحي</td>
            <td class="font-mono text-slate-700">2 أكتوبر 2026 (09:00 - 11:00 AM)</td>
            <td class="font-bold text-slate-800">ساعتان (2h)</td>
            <td class="text-slate-500">مراجعة مصلحة حكومية</td>
            <td class="text-slate-600">اعتماد تلقائي (سياسة الشركة)</td>
            <td><span style="background:#ECFDF5; color:#047857; border:1px solid #A7F3D0; padding:3px 10px; border-radius:9999px; font-weight:700; font-size:11px;">معتمد ✓</span></td>
          </tr>
          <tr>
            <td class="font-bold text-slate-900">📌 إجازة عارضة (Casual)</td>
            <td class="font-mono text-slate-700">15 سبتمبر 2026</td>
            <td class="font-bold text-slate-800">يوم واحد</td>
            <td class="text-slate-500">ظرف عائلي طارئ</td>
            <td class="text-slate-600">م/ أحمد محمود</td>
            <td><span style="background:#ECFDF5; color:#047857; border:1px solid #A7F3D0; padding:3px 10px; border-radius:9999px; font-weight:700; font-size:11px;">معتمد ✓</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 3: Digital Payslips (دليل الموظف - قسيمة الراتب الرقمية)
// ─────────────────────────────────────────────────────────────────────────────
function renderViewDigitalPayslip() {
  return `
${getCommonHead('قسيمة الراتب الرقمية المعتمدة - HumAi')}
<body>
  ${getAppNavbar('موظف', 'م/ سارة إبراهيم')}
  
  <main class="max-w-5xl p-8" style="display:flex; flex-direction:column; gap:24px;">
    <div class="flex justify-between items-center">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
          <span>دليل الموظف</span> <span>/</span> <span class="text-slate-500">الرواتب والمستحقات</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900">قسيمة الراتب الرقمية المعتمدة (Certified Digital Payslip)</h1>
      </div>
      <div class="flex gap-3">
        <button class="btn-white">🖨️ طباعة</button>
        <button class="btn-emerald">📥 تحميل بصيغة PDF</button>
      </div>
    </div>

    <!-- Official Payslip Canvas -->
    <div class="bg-white rounded-2xl border-2 border-slate-200 p-8 card-shadow">
      <!-- Payslip Header -->
      <div class="flex justify-between items-center border-b border-slate-200 pb-6 mb-6">
        <div class="flex items-center gap-3">
          <div style="width:48px; height:48px; border-radius:12px; background:#0F172A; display:flex; align-items:center; justify-content:center;">
            <svg width="26" height="26" viewBox="0 0 60 56" fill="none">
              <circle cx="14" cy="10" r="5.5" fill="#FFFFFF"/>
              <rect x="9" y="19" width="10" height="28" rx="5" fill="#FFFFFF"/>
              <circle cx="46" cy="10" r="5.5" fill="#10B981"/>
              <rect x="41" y="19" width="10" height="28" rx="5" fill="#10B981"/>
              <path d="M 18 29 C 23 37, 37 37, 42 29 C 40 37, 20 37, 18 29 Z" fill="#10B981"/>
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-black text-slate-900">شركة هُم آي للحلول الذكية (HumAi Technologies LLC)</h2>
            <p class="text-xs text-slate-500 font-medium">دورة صرف الرواتب الشهرية: 26 أغسطس 2026 إلى 25 سبتمبر 2026</p>
          </div>
        </div>

        <div style="background:#ECFDF5; border:1px solid #A7F3D0; padding:8px 16px; border-radius:12px; text-align:left;">
          <p style="font-size:10px; font-weight:800; color:#065F46; text-transform:uppercase;">الرقم المرجعي للقسيمة</p>
          <p class="text-sm font-black font-mono text-emerald-950">PAY-2026-09-8842</p>
          <p style="font-size:10px; color:#059669;">تاريخ الاعتماد: 26 سبتمبر 2026</p>
        </div>
      </div>

      <!-- Employee Info Summary -->
      <div class="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs">
        <div>
          <span class="text-slate-400 block font-medium">اسم الموظف:</span>
          <span class="font-bold text-slate-900">سارة إبراهيم الدسوقي</span>
        </div>
        <div>
          <span class="text-slate-400 block font-medium">المسمى الوظيفي:</span>
          <span class="font-bold text-slate-900">مهندس برمجيات أول (Senior SWE)</span>
        </div>
        <div>
          <span class="text-slate-400 block font-medium">الإدارة / الفرع:</span>
          <span class="font-bold text-slate-900">الهندسة والابتكار • المعادي</span>
        </div>
        <div>
          <span class="text-slate-400 block font-medium">قناة تحويل الراتب:</span>
          <span class="font-bold text-emerald-700 font-mono">⚡ InstaPay: sara@instapay</span>
        </div>
      </div>

      <!-- Breakdown -->
      <div class="grid grid-cols-2 gap-8 mb-6">
        <!-- Earnings -->
        <div>
          <div class="flex justify-between items-center border-b-2 border-emerald-500 pb-2 mb-3">
            <h3 class="text-sm font-black text-slate-900">الاستحقاقات والبدلات (Earnings)</h3>
            <span style="background:#ECFDF5; color:#047857; padding:2px 8px; border-radius:6px; font-size:11px; font-weight:700;">إجمالي الدخل</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;" class="text-xs">
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-600">الراتب الأساسي الشهري (Basic Salary)</span>
              <span class="font-bold font-mono text-slate-900">32,500.00 EGP</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-600">بدل ساعات عمل إضافية (Overtime - 12h)</span>
              <span class="font-bold font-mono text-emerald-600">+ 2,450.00 EGP</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-600">مكافأة تحقيق الأهداف الشهرية (KPI Bonus)</span>
              <span class="font-bold font-mono text-emerald-600">+ 1,500.00 EGP</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-600">بدل انتقالات واتصالات</span>
              <span class="font-bold font-mono text-emerald-600">+ 1,000.00 EGP</span>
            </div>
            <div class="flex justify-between pt-2 font-bold text-sm bg-slate-50 p-2.5 rounded-lg">
              <span class="text-slate-800">إجمالي الاستحقاقات (Gross):</span>
              <span class="text-emerald-700 font-mono">37,450.00 EGP</span>
            </div>
          </div>
        </div>

        <!-- Deductions -->
        <div>
          <div class="flex justify-between items-center border-b-2 border-slate-400 pb-2 mb-3">
            <h3 class="text-sm font-black text-slate-900">الاستقطاعات والخصومات (Deductions)</h3>
            <span style="background:#FFF1F2; color:#BE123C; padding:2px 8px; border-radius:6px; font-size:11px; font-weight:700;">إجمالي الخصم</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;" class="text-xs">
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-600">التأمينات الاجتماعية (حصة الموظف)</span>
              <span class="font-bold font-mono text-rose-600">- 2,150.00 EGP</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-600">ضريبة كسب العمل التقديرية (Income Tax)</span>
              <span class="font-bold font-mono text-rose-600">- 1,850.00 EGP</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-600">خصم سلفة معتمدة سابقة (Salary Advance)</span>
              <span class="font-bold font-mono text-rose-600">- 2,000.00 EGP</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-600">خصومات تأخير (Lateness Deduction)</span>
              <span class="font-bold font-mono text-slate-400">0.00 EGP</span>
            </div>
            <div class="flex justify-between pt-2 font-bold text-sm bg-rose-50 p-2.5 rounded-lg">
              <span class="text-rose-900">إجمالي الاستقطاعات:</span>
              <span class="text-rose-700 font-mono">- 6,000.00 EGP</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Net Payout Banner -->
      <div style="background:linear-gradient(135deg, #0B0F17 0%, #0F172A 70%, #064E3B 100%); padding:24px; border-radius:16px; color:#FFFFFF; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(16,185,129,0.3);">
        <div>
          <p class="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">صافي الراتب المستحق للصرف (Net Pay)</p>
          <div class="text-3xl font-black font-mono">31,450.00 <span class="text-lg text-emerald-400">EGP</span></div>
          <p class="text-xs text-slate-300 mt-1">واحد وثلاثون ألفاً وأربعمائة وخمسون جنيهاً مصرياً لا غير</p>
        </div>
        <div style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); padding:10px 18px; border-radius:12px; text-align:left;">
          <span style="font-size:11px; color:#A7F3D0; display:block; font-weight:600;">حالة التحويل البنكي</span>
          <span style="font-size:14px; font-weight:800; color:#FFFFFF;">● تم الإيداع بنجاح ✓</span>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 4: Targets & KPIs (دليل الموظف - متابعة الأهداف والمهام)
// ─────────────────────────────────────────────────────────────────────────────
function renderViewTargetsKPIs() {
  return `
${getCommonHead('متابعة الأهداف والمهام - HumAi')}
<body>
  ${getAppNavbar('موظف', 'م/ سارة إبراهيم')}
  
  <main class="max-w-7xl p-8" style="display:flex; flex-direction:column; gap:24px;">
    <div class="flex justify-between items-center">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
          <span>دليل الموظف</span> <span>/</span> <span class="text-slate-500">مؤشرات الأداء التشغيلي</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900">متابعة الأهداف وتسجيل الإنجازات اليومية (KPIs & Target Tracker)</h1>
      </div>
      <button class="btn-emerald py-2.5 px-5 text-xs font-bold">
        <span>+ تسجيل إنجاز مهمة جديدة</span>
      </button>
    </div>

    <div class="grid" style="grid-template-columns: 1fr 2fr; gap: 24px;">
      <!-- Target Progress Radial -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 card-shadow" style="display:flex; flex-direction:column; gap:20px;">
        <h3 class="text-base font-black text-slate-900">الهدف الشهري الحالي (أكتوبر 2026)</h3>
        
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px;">
          <div style="width:140px; height:140px; border-radius:50%; border:10px solid #ECFDF5; border-top-color:#10B981; border-right-color:#10B981; border-left-color:#10B981; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <span class="text-3xl font-black text-slate-900 font-mono">87%</span>
            <span style="font-size:10px; color:#94A3B8; font-weight:700; text-transform:uppercase;">نسبة الإنجاز</span>
          </div>
          <p class="text-xs text-slate-600 font-bold mt-3">منجز 87 من أصل 100 نقطة مستهدفة</p>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; padding-top:12px; border-top:1px solid #F1F5F9;" class="text-xs">
          <div class="flex justify-between text-slate-600">
            <span>الوحدة المعتمدة:</span>
            <span class="font-bold text-slate-800">نقاط مهام هندسية (Story Points)</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>الأيام المتبقية في الدورة:</span>
            <span class="font-bold text-emerald-700">17 يوم عمل</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>المعدل اليومي المطلوب:</span>
            <span class="font-bold text-slate-900 font-mono">0.76 نقطة / يوم</span>
          </div>
        </div>
      </div>

      <!-- Quick Entry Form & History -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 card-shadow" style="display:flex; flex-direction:column; gap:16px;">
        <h3 class="text-base font-black text-slate-900">سجل الإنجازات اليومية المسجلة</h3>
        
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المهمة / الإنجاز</th>
              <th>الكمية / النقاط</th>
              <th>الحالة والاعتماد</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-mono text-slate-600">07 أكتوبر 2026</td>
              <td class="font-bold text-slate-900">إطلاق وتحديث محرك الرواتب السحابي (PR #342)</td>
              <td class="font-mono font-bold text-emerald-600">+12 Points</td>
              <td><span style="background:#ECFDF5; color:#047857; padding:3px 10px; border-radius:6px; font-weight:700; font-size:11px;">معتمد من الإدارة</span></td>
            </tr>
            <tr>
              <td class="font-mono text-slate-600">06 أكتوبر 2026</td>
              <td class="font-bold text-slate-900">حل واختبار 5 تذاكر دعم فني حرجة للعملاء</td>
              <td class="font-mono font-bold text-emerald-600">+8 Points</td>
              <td><span style="background:#ECFDF5; color:#047857; padding:3px 10px; border-radius:6px; font-weight:700; font-size:11px;">معتمد من الإدارة</span></td>
            </tr>
            <tr>
              <td class="font-mono text-slate-600">05 أكتوبر 2026</td>
              <td class="font-bold text-slate-900">كتابة وثائق الـ API لمساعد واتساب الذكي</td>
              <td class="font-mono font-bold text-emerald-600">+5 Points</td>
              <td><span style="background:#ECFDF5; color:#047857; padding:3px 10px; border-radius:6px; font-weight:700; font-size:11px;">معتمد من الإدارة</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 5: Live Attendance Monitor (دليل المدير - مراقبة الحضور المباشر)
// ─────────────────────────────────────────────────────────────────────────────
function renderViewAttendanceMonitor() {
  return `
${getCommonHead('مراقبة الحضور المباشر للفريق - HumAi')}
<body>
  ${getAppNavbar('مدير مباشر', 'م/ أحمد محمود')}
  
  <main class="max-w-7xl p-8" style="display:flex; flex-direction:column; gap:24px;">
    <div class="flex justify-between items-center">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
          <span>دليل المدير المباشر</span> <span>/</span> <span class="text-slate-500">إشراف الفريق</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900">شاشة مراقبة الحضور اللحظية (Live Team Attendance Monitor)</h1>
      </div>
      <div style="background:#ECFDF5; border:1px solid #A7F3D0; color:#065F46; padding:6px 14px; border-radius:12px; font-size:12px; font-weight:800; display:flex; align-items:center; gap:6px;">
        <span style="width:6px; height:6px; border-radius:50%; background:#10B981;"></span>
        <span>تحديث لحظي نشط (Live Polling)</span>
      </div>
    </div>

    <!-- Live Status Overview Cards -->
    <div class="grid grid-cols-4 gap-5">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow flex justify-between items-center">
        <div>
          <p class="text-xs font-bold text-slate-400">حاضرون الآن بالمقر</p>
          <div class="text-3xl font-black text-emerald-600 font-mono">11 <span class="text-sm font-semibold text-slate-400">موظف</span></div>
        </div>
        <div style="font-size:26px;">🏢</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow flex justify-between items-center">
        <div>
          <p class="text-xs font-bold text-slate-400">عمل عن بُعد (Remote)</p>
          <div class="text-3xl font-black text-blue-600 font-mono">3 <span class="text-sm font-semibold text-slate-400">موظفين</span></div>
        </div>
        <div style="font-size:26px;">💻</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow flex justify-between items-center">
        <div>
          <p class="text-xs font-bold text-slate-400">تأخير مسجل اليوم</p>
          <div class="text-3xl font-black text-amber-500 font-mono">2 <span class="text-sm font-semibold text-slate-400">أفراد</span></div>
        </div>
        <div style="font-size:26px;">⏱️</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow flex justify-between items-center">
        <div>
          <p class="text-xs font-bold text-slate-400">إجازات رسمية معتمدة</p>
          <div class="text-3xl font-black text-slate-600 font-mono">1 <span class="text-sm font-semibold text-slate-400">موظف</span></div>
        </div>
        <div style="font-size:26px;">🌴</div>
      </div>
    </div>

    <!-- Live Attendance Table -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 card-shadow">
      <div class="flex justify-between items-center mb-5">
        <h3 class="text-base font-black text-slate-900">سجل بصمات الفريق اللحظي (إدارة البرمجيات والمنتج - 17 عضواً)</h3>
        <div class="flex gap-3">
          <input type="text" placeholder="بحث باسم الموظف أو الكود..." style="padding:6px 14px; border-radius:10px; border:1px solid #CBD5E1; font-size:12px; width:220px;">
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>الموظف</th>
            <th>الوردية المجدولة</th>
            <th>وقت الحضور</th>
            <th>موقع التحقق (GPS)</th>
            <th>حالة الالتزام</th>
            <th>الإجراء السريع</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-bold text-slate-900">
              سارة إبراهيم الدسوقي
              <span class="block text-slate-400 text-xs font-normal">Senior Software Engineer</span>
            </td>
            <td class="font-mono text-slate-700">09:00 AM — 05:00 PM</td>
            <td class="font-mono font-bold text-emerald-600">08:54 AM</td>
            <td class="text-slate-600">فرع المعادي (داخل النطاق)</td>
            <td><span style="background:#ECFDF5; color:#047857; padding:3px 10px; border-radius:9999px; font-weight:700; font-size:11px;">في الموعد ✓</span></td>
            <td><button class="btn-white">عرض السجل</button></td>
          </tr>
          <tr>
            <td class="font-bold text-slate-900">
              عمر خالد أحمد
              <span class="block text-slate-400 text-xs font-normal">UI/UX Designer</span>
            </td>
            <td class="font-mono text-slate-700">09:00 AM — 05:00 PM</td>
            <td class="font-mono font-bold text-amber-600">09:18 AM</td>
            <td class="text-slate-600">فرع المعادي (داخل النطاق)</td>
            <td><span style="background:#FFFBEB; color:#B45309; padding:3px 10px; border-radius:9999px; font-weight:700; font-size:11px;">تأخير 18 دقيقة</span></td>
            <td><button style="background:#FFFBEB; border:1px solid #FDE68A; color:#B45309; font-weight:700; border-radius:8px; padding:6px 12px;">تبرير التأخير</button></td>
          </tr>
          <tr>
            <td class="font-bold text-slate-900">
              منى العسال
              <span class="block text-slate-400 text-xs font-normal">QA Lead</span>
            </td>
            <td class="font-mono text-slate-700">09:00 AM — 05:00 PM</td>
            <td class="font-mono font-bold text-blue-600">09:02 AM</td>
            <td class="text-blue-700 font-bold">عن بُعد (معتمد)</td>
            <td><span style="background:#EFF6FF; color:#1D4ED8; padding:3px 10px; border-radius:9999px; font-weight:700; font-size:11px;">Remote Punch ✓</span></td>
            <td><button class="btn-white">عرض السجل</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 6: Approval Center (دليل المدير - مركز اعتمادات الفريق)
// ─────────────────────────────────────────────────────────────────────────────
function renderViewApprovalCenter() {
  return `
${getCommonHead('مركز اعتمادات الفريق - HumAi')}
<body>
  ${getAppNavbar('مدير مباشر', 'م/ أحمد محمود')}
  
  <main class="max-w-7xl p-8" style="display:flex; flex-direction:column; gap:24px;">
    <div class="flex justify-between items-center">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
          <span>دليل المدير المباشر</span> <span>/</span> <span class="text-slate-500">مركز القرارات الإدارية</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900">مركز اعتمادات الفريق والطلبات المعلقة (Approval Center)</h1>
      </div>
      <span style="background:#FFFBEB; border:1px solid #FDE68A; color:#B45309; font-weight:800; padding:6px 14px; border-radius:12px; font-size:12px;">
        3 طلبات جديدة بانتظار قرارك
      </span>
    </div>

    <!-- Request Cards Grid -->
    <div class="grid grid-cols-3 gap-6">
      
      <!-- Card 1 -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-6 card-shadow flex flex-col justify-between" style="border-top:4px solid #10B981;">
        <div>
          <div class="flex justify-between items-center mb-4">
            <span style="background:#ECFDF5; color:#047857; padding:4px 10px; border-radius:8px; font-weight:700; font-size:11px;">إجازة اعتيادية</span>
            <span class="text-slate-400 font-mono text-xs">منذ ساعتين</span>
          </div>
          
          <div class="flex items-center gap-3 mb-4">
            <div style="width:38px; height:38px; border-radius:50%; background:#0F172A; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-weight:800;">كا</div>
            <div>
              <h3 class="text-sm font-black text-slate-900">كريم عادل</h3>
              <p class="text-xs text-slate-500">Frontend Developer</p>
            </div>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl text-xs" style="display:flex; flex-direction:column; gap:8px;">
            <div class="flex justify-between">
              <span class="text-slate-500">الفترة المطلوبة:</span>
              <span class="font-bold text-slate-800 font-mono">18 - 20 أكتوبر (3 أيام)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">الرصيد المتبقي:</span>
              <span class="font-bold text-emerald-700">14 يوماً متاحاً</span>
            </div>
            <div style="border-top:1px solid #E2E8F0; padding-top:6px;" class="text-slate-600">
              <span class="font-bold text-slate-700 block">السبب:</span>
              سفر عائلي مع تسليم كافة المهام لزميلي عمر.
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-slate-100 mt-4">
          <button class="btn-emerald" style="flex:1;">اعتماد الطلب ✓</button>
          <button style="flex:1; background:#FFF1F2; border:1px solid #FFE4E6; color:#BE123C; border-radius:10px; font-weight:700;">رفض مع تبرير</button>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-6 card-shadow flex flex-col justify-between" style="border-top:4px solid #7E22CE;">
        <div>
          <div class="flex justify-between items-center mb-4">
            <span style="background:#FAF5FF; color:#7E22CE; padding:4px 10px; border-radius:8px; font-weight:700; font-size:11px;">تبديل وردية (Swap)</span>
            <span class="text-slate-400 font-mono text-xs">منذ 4 ساعات</span>
          </div>
          
          <div class="flex items-center gap-3 mb-4">
            <div style="width:38px; height:38px; border-radius:50%; background:#581C87; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-weight:800;">نص</div>
            <div>
              <h3 class="text-sm font-black text-slate-900">نور الدين سامح</h3>
              <p class="text-xs text-slate-500">DevOps Specialist</p>
            </div>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl text-xs" style="display:flex; flex-direction:column; gap:8px;">
            <div class="flex justify-between">
              <span class="text-slate-500">التبديل مع الزميل:</span>
              <span class="font-bold text-slate-800">أحمد كمال (موافق)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">تاريخ التبديل:</span>
              <span class="font-bold text-slate-800 font-mono">السبت، 10 أكتوبر</span>
            </div>
            <div style="border-top:1px solid #E2E8F0; padding-top:6px;" class="text-slate-600">
              <span class="font-bold text-slate-700 block">التفاصيل:</span>
              تغطية صيانة السيرفرات في الوردية المسائية.
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-slate-100 mt-4">
          <button class="btn-emerald" style="flex:1;">اعتماد التبديل ✓</button>
          <button style="flex:1; background:#FFF1F2; border:1px solid #FFE4E6; color:#BE123C; border-radius:10px; font-weight:700;">رفض الطلب</button>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-6 card-shadow flex flex-col justify-between" style="border-top:4px solid #2563EB;">
        <div>
          <div class="flex justify-between items-center mb-4">
            <span style="background:#EFF6FF; color:#1D4ED8; padding:4px 10px; border-radius:8px; font-weight:700; font-size:11px;">إذن استئذان ساعتين</span>
            <span class="text-slate-400 font-mono text-xs">منذ يوم</span>
          </div>
          
          <div class="flex items-center gap-3 mb-4">
            <div style="width:38px; height:38px; border-radius:50%; background:#1E40AF; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-weight:800;">يم</div>
            <div>
              <h3 class="text-sm font-black text-slate-900">ياسمين مصطفى</h3>
              <p class="text-xs text-slate-500">Product Manager</p>
            </div>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl text-xs" style="display:flex; flex-direction:column; gap:8px;">
            <div class="flex justify-between">
              <span class="text-slate-500">الوقت المطلوب:</span>
              <span class="font-bold text-slate-800 font-mono">09:00 - 11:00 AM</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">استهلاك الشهر:</span>
              <span class="font-bold text-slate-700 font-mono">0 / 2 أذونات</span>
            </div>
            <div style="border-top:1px solid #E2E8F0; padding-top:6px;" class="text-slate-600">
              <span class="font-bold text-slate-700 block">السبب:</span>
              حضور اجتماع رسمي مع عميل بالمقر الإقليمي.
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-slate-100 mt-4">
          <button class="btn-emerald" style="flex:1;">اعتماد الإذن ✓</button>
          <button style="flex:1; background:#FFF1F2; border:1px solid #FFE4E6; color:#BE123C; border-radius:10px; font-weight:700;">رفض الإذن</button>
        </div>
      </div>

    </div>
  </main>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 7: Team Performance & Financial Suggestions (دليل المدير - تقييم الأداء والمقترحات)
// ─────────────────────────────────────────────────────────────────────────────
function renderViewTeamEvaluations() {
  return `
${getCommonHead('تقييمات الأداء والمقترحات المالية - HumAi')}
<body>
  ${getAppNavbar('مدير مباشر', 'م/ أحمد محمود')}
  
  <main class="max-w-5xl p-8" style="display:flex; flex-direction:column; gap:24px;">
    <div class="flex justify-between items-center">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
          <span>دليل المدير المباشر</span> <span>/</span> <span class="text-slate-500">تطوير الكوادر والمكافآت</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900">تقييمات الأداء الشهرية والتوصيات المالية (Evaluations & Bonus Engine)</h1>
      </div>
      <div class="bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
        دورة التقييم: سبتمبر 2026
      </div>
    </div>

    <!-- Evaluation Form Card -->
    <div class="bg-white rounded-2xl border border-slate-200 p-8 card-shadow" style="display:flex; flex-direction:column; gap:24px;">
      <div class="flex justify-between items-center border-b border-slate-100 pb-5">
        <div class="flex items-center gap-4">
          <div style="width:52px; height:52px; border-radius:14px; background:#0F172A; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900;">
            أك
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-900">أحمد كمال الشناوي</h3>
            <p class="text-xs text-slate-500 font-medium">Backend Engineer • تم التعيين منذ 1.5 سنة • الراتب الأساسي: 26,000 EGP</p>
          </div>
        </div>

        <div style="background:#ECFDF5; border:1px solid #A7F3D0; padding:8px 16px; border-radius:12px; text-align:left;">
          <span style="font-size:10px; color:#065F46; font-weight:800; display:block;">متوسط الأداء التراكمي</span>
          <span class="text-lg font-black text-emerald-700 font-mono">4.7 / 5.0 ⭐</span>
        </div>
      </div>

      <!-- 4 Pillars -->
      <div class="grid grid-cols-2 gap-5">
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-slate-800">1. الانضباط والالتزام بمواعيد العمل:</span>
            <span class="text-amber-500 font-bold font-mono text-sm">★★★★★ (5.0)</span>
          </div>
          <p class="text-xs text-slate-500">سجل حضور خالٍ من أي تأخيرات أو غيابات غير مبررة طوال الشهر.</p>
        </div>

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-slate-800">2. جودة المخرجات البرمجية (Code Quality):</span>
            <span class="text-amber-500 font-bold font-mono text-sm">★★★★☆ (4.5)</span>
          </div>
          <p class="text-xs text-slate-500">كتابة اختبارات أوتوماتيكية بنسبة تغطية تجاوزت 85%.</p>
        </div>

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-slate-800">3. حل المشكلات والسرعة في الإنجاز:</span>
            <span class="text-amber-500 font-bold font-mono text-sm">★★★★★ (5.0)</span>
          </div>
          <p class="text-xs text-slate-500">إنجاز ترقية قاعدة البيانات دون أي انقطاع في الخدمة (Zero-Downtime).</p>
        </div>

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-slate-800">4. روح الفريق والتعاون والتواصل:</span>
            <span class="text-amber-500 font-bold font-mono text-sm">★★★★☆ (4.5)</span>
          </div>
          <p class="text-xs text-slate-500">مساعدة الموظفين الجدد في برنامج الـ Onboarding بكفاءة عالية.</p>
        </div>
      </div>

      <!-- Financial Recommendation Box -->
      <div style="background:#ECFDF5; border:1px solid #6EE7B7; border-radius:14px; padding:18px; display:flex; flex-direction:column; gap:12px;">
        <div class="flex justify-between items-center">
          <h4 class="text-sm font-black text-emerald-950">💰 مقترح التوصية المالية المرفوع للإدارة العليا (Financial Adjustment)</h4>
          <span style="background:#059669; color:#FFFFFF; padding:4px 12px; border-radius:8px; font-size:12px; font-weight:800;" class="font-mono">
            + 1,500.00 EGP (مكافأة تميز)
          </span>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">المبررات الرسمية للتوصية المالية (تُرفق آلياً في مسير الرواتب):</label>
          <div style="background:#FFFFFF; border:1px solid #A7F3D0; padding:10px 14px; border-radius:10px; font-size:12px; color:#334155; font-weight:600;">
            "نظراً لقيام الموظف بتطوير وتنفيذ خطة الترحيل السحابي في وقت قياسي وتوفير أكثر من 30 ساعة عمل للفريق، نوصي بصرف مكافأة استثنائية قدرها 1500 جنيه تضاف لمسير شهر سبتمبر 2026."
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button class="btn-white">حفظ كمسودة</button>
        <button class="btn-emerald">اعتماد وإرسال التقييم للإدارة العليا ✓</button>
      </div>
    </div>
  </main>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 8: Company & Branch Setup (دليل السوبر أدمن - إعدادات الشركة والفروع)
// ─────────────────────────────────────────────────────────────────────────────
function renderViewCompanyBranches() {
  return `
${getCommonHead('إعدادات الشركة والفروع والـ Geofence - HumAi')}
<body>
  ${getAppNavbar('سوبر أدمن', 'م/ مصطفى عشماوي')}
  
  <main class="max-w-7xl p-8" style="display:flex; flex-direction:column; gap:24px;">
    <div class="flex justify-between items-center">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
          <span>دليل الإدارة العليا</span> <span>/</span> <span class="text-slate-500">السياسات والبنية التحتية</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900">إعدادات الفروع ونطاق الـ GPS الجغرافي (Branch Geofencing Engine)</h1>
      </div>
      <button class="btn-emerald py-2.5 px-5 text-xs font-bold">
        <span>+ إضافة فرع أو مقر جديد</span>
      </button>
    </div>

    <!-- Active Branches List -->
    <div class="grid grid-cols-2 gap-6">
      
      <!-- Branch 1: Cairo HQ -->
      <div class="bg-white rounded-2xl border-2 border-emerald-500 p-7 card-shadow" style="display:flex; flex-direction:column; gap:20px;">
        <div class="flex justify-between items-center border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <div style="width:48px; height:48px; border-radius:12px; background:#ECFDF5; border:1px solid #A7F3D0; display:flex; align-items:center; justify-content:center; font-size:22px;">
              🏢
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-black text-slate-900">المقر الرئيسي — المعادي تكنولوجي زون</h3>
                <span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-xs">الفرع الرئيسي</span>
              </div>
              <p class="text-xs text-slate-500">القاهرة، جمهورية مصر العربية • 38 موظف نشط</p>
            </div>
          </div>
          <span style="background:#ECFDF5; color:#047857; padding:4px 10px; border-radius:9999px; font-weight:700; font-size:11px;">نشط ومتصل</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px;" class="text-xs">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span class="text-slate-400 block font-medium mb-1">الإحداثيات الجغرافية (GPS):</span>
              <span class="font-mono font-bold text-slate-900">29.9602° N, 31.2569° E</span>
            </div>
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span class="text-slate-400 block font-medium mb-1">نصف قطر السماح (Geofence):</span>
              <span class="font-mono font-bold text-emerald-700">150 متراً (محيط المبنى)</span>
            </div>
          </div>

          <div class="radar-box" style="height:140px;">
            <div class="radar-circle" style="width:110px; height:110px;"></div>
            <div class="radar-circle" style="width:60px; height:60px; background:rgba(16,185,129,0.1);"></div>
            <div class="radar-point"></div>
            <span style="position:absolute; bottom:8px; right:12px; font-size:10px; color:#94A3B8;" class="font-mono">Google Maps API Linked</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; padding-top:8px; border-top:1px solid #F1F5F9;">
            <div class="flex justify-between text-slate-600">
              <span>فترة سماح الحضور الصباحي:</span>
              <span class="font-bold text-slate-900">15 دقيقة</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>سياسة البصمة من خارج النطاق:</span>
              <span class="font-bold text-rose-600">رفض فوري مع تنبيه للإدارة</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button class="btn-white">تعديل الإحداثيات</button>
          <button style="background:#ECFDF5; color:#047857; font-weight:700; border:1px solid #A7F3D0; border-radius:10px; padding:6px 14px;">اختبار الموقع الحي</button>
        </div>
      </div>

      <!-- Branch 2: Alexandria Hub -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-7 card-shadow" style="display:flex; flex-direction:column; gap:20px;">
        <div class="flex justify-between items-center border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <div style="width:48px; height:48px; border-radius:12px; background:#EFF6FF; border:1px solid #BFDBFE; display:flex; align-items:center; justify-content:center; font-size:22px;">
              🌊
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-black text-slate-900">فرع الإسكندرية — سموحة كينغز واي</h3>
                <span class="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-xs">فرع إقليمي</span>
              </div>
              <p class="text-xs text-slate-500">الإسكندرية • 10 موظفين نشطين</p>
            </div>
          </div>
          <span style="background:#ECFDF5; color:#047857; padding:4px 10px; border-radius:9999px; font-weight:700; font-size:11px;">نشط ومتصل</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px;" class="text-xs">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span class="text-slate-400 block font-medium mb-1">الإحداثيات الجغرافية (GPS):</span>
              <span class="font-mono font-bold text-slate-900">31.2156° N, 29.9553° E</span>
            </div>
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span class="text-slate-400 block font-medium mb-1">نصف قطر السماح (Geofence):</span>
              <span class="font-mono font-bold text-blue-700">200 متراً</span>
            </div>
          </div>

          <div class="radar-box" style="height:140px;">
            <div class="radar-circle" style="width:110px; height:110px; border-color:rgba(59,130,246,0.3);"></div>
            <div class="radar-circle" style="width:60px; height:60px; background:rgba(59,130,246,0.1); border-color:rgba(59,130,246,0.4);"></div>
            <div class="radar-point" style="background:#3B82F6; box-shadow:0 0 16px #3B82F6;"></div>
            <span style="position:absolute; bottom:8px; right:12px; font-size:10px; color:#94A3B8;" class="font-mono">Google Maps API Linked</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; padding-top:8px; border-top:1px solid #F1F5F9;">
            <div class="flex justify-between text-slate-600">
              <span>فترة سماح الحضور الصباحي:</span>
              <span class="font-bold text-slate-900">15 دقيقة</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>سياسة البصمة من خارج النطاق:</span>
              <span class="font-bold text-rose-600">رفض فوري مع تنبيه للإدارة</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button class="btn-white">تعديل الإحداثيات</button>
          <button style="background:#EFF6FF; color:#1D4ED8; font-weight:700; border:1px solid #BFDBFE; border-radius:10px; padding:6px 14px;">اختبار الموقع الحي</button>
        </div>
      </div>

    </div>
  </main>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 9: Shifts & Operations Engine (دليل السوبر أدمن - محرك الورديات)
// ─────────────────────────────────────────────────────────────────────────────
function renderViewShiftsEngine() {
  return `
${getCommonHead('محرك الورديات والتشغيل - HumAi')}
<body>
  ${getAppNavbar('سوبر أدمن', 'م/ مصطفى عشماوي')}
  
  <main class="max-w-7xl p-8" style="display:flex; flex-direction:column; gap:24px;">
    <div class="flex justify-between items-center">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
          <span>دليل الإدارة العليا</span> <span>/</span> <span class="text-slate-500">إدارة العمليات والجدولة</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900">محرك جدولة الورديات والتشغيل المتقدم (Operations & Shift Engine)</h1>
      </div>
      <button class="btn-emerald py-2.5 px-5 text-xs font-bold">
        <span>+ إنشاء وردية عمل جديدة</span>
      </button>
    </div>

    <!-- Shifts Roster Grid -->
    <div class="grid grid-cols-3 gap-6">
      
      <!-- Shift 1 -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-6 card-shadow" style="display:flex; flex-direction:column; gap:16px;">
        <div class="flex justify-between items-center">
          <span style="background:#ECFDF5; color:#047857; padding:4px 10px; border-radius:8px; font-weight:700; font-size:11px;">وردية ثابتة (Fixed)</span>
          <span class="text-xs text-slate-400 font-mono">32 موظفاً</span>
        </div>

        <div>
          <h3 class="text-base font-black text-slate-900">الوردية الصباحية العامة</h3>
          <p class="text-xs text-slate-500">للإدارات الهندسية، التسويق، والموارد البشرية</p>
        </div>

        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs" style="display:flex; flex-direction:column; gap:10px;">
          <div class="flex justify-between items-center">
            <span class="text-slate-500">ساعات العمل:</span>
            <span class="font-bold font-mono text-slate-900">09:00 AM — 05:00 PM</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">أيام العمل الأسبوعية:</span>
            <span class="font-bold text-slate-800">الأحد إلى الخميس</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">بدل وردية إضافي:</span>
            <span class="font-bold text-slate-400">0% (ساعات اعتيادية)</span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
          <span class="text-emerald-700 font-bold">الحالة: مفعلة بنجاح</span>
          <button class="text-slate-600 font-bold">تعديل الوردية</button>
        </div>
      </div>

      <!-- Shift 2 -->
      <div class="bg-white rounded-2xl border-2 border-slate-900 p-6 card-shadow" style="display:flex; flex-direction:column; gap:16px;">
        <div class="flex justify-between items-center">
          <span style="background:#EEF2FF; color:#4338CA; padding:4px 10px; border-radius:8px; font-weight:700; font-size:11px;">وردية ليلية (Overnight)</span>
          <span class="text-xs text-slate-400 font-mono">10 موظفين</span>
        </div>

        <div>
          <h3 class="text-base font-black text-slate-900">وردية الدعم الفني الليلي (NOC)</h3>
          <p class="text-xs text-slate-500">مراقبة الخوادم ودعم العملاء الدوليين 24/7</p>
        </div>

        <div style="background:#F5F3FF; border:1px solid #DDD6FE; padding:16px; border-radius:12px; display:flex; flex-direction:column; gap:10px;" class="text-xs">
          <div class="flex justify-between items-center">
            <span class="text-slate-500">ساعات العمل:</span>
            <span class="font-bold font-mono text-indigo-950">11:00 PM — 07:00 AM (+1)</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">تخطي منتصف الليل:</span>
            <span class="font-bold text-emerald-700">مدعوم آلياً (Auto-Spanning)</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">بدل الوردية الليلية:</span>
            <span class="font-bold font-mono text-indigo-700" style="background:#EDE9FE; padding:2px 8px; border-radius:6px;">+ 20% بدل نقدي</span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
          <span class="text-emerald-700 font-bold">الحالة: مفعلة بنجاح</span>
          <button class="text-slate-600 font-bold">تعديل الوردية</button>
        </div>
      </div>

      <!-- Shift 3 -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-6 card-shadow" style="display:flex; flex-direction:column; gap:16px;">
        <div class="flex justify-between items-center">
          <span style="background:#FFFBEB; color:#B45309; padding:4px 10px; border-radius:8px; font-weight:700; font-size:11px;">وردية منقسمة (Split Shift)</span>
          <span class="text-xs text-slate-400 font-mono">6 موظفين</span>
        </div>

        <div>
          <h3 class="text-base font-black text-slate-900">وردية المبيعات والمتاجر المجزأة</h3>
          <p class="text-xs text-slate-500">فترة ذروة صباحية ومسائية مع راحة ممتدة</p>
        </div>

        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs" style="display:flex; flex-direction:column; gap:10px;">
          <div class="flex justify-between items-center">
            <span class="text-slate-500">الفترة الأولى:</span>
            <span class="font-bold font-mono text-slate-900">10:00 AM — 02:00 PM</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">الفترة الثانية:</span>
            <span class="font-bold font-mono text-slate-900">06:00 PM — 10:00 PM</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">فترة التوقف الوسيطة:</span>
            <span class="font-bold text-slate-700">4 ساعات راحة حرة</span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
          <span class="text-emerald-700 font-bold">الحالة: مفعلة بنجاح</span>
          <button class="text-slate-600 font-bold">تعديل الوردية</button>
        </div>
      </div>

    </div>
  </main>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 10: Employee Directory & Vault (دليل السوبر أدمن - دليل الموظفين والخزينة)
// ─────────────────────────────────────────────────────────────────────────────
function renderViewEmployeeVault() {
  return `
${getCommonHead('دليل الموظفين وخزينة المستندات - HumAi')}
<body>
  ${getAppNavbar('سوبر أدمن', 'م/ مصطفى عشماوي')}
  
  <main class="max-w-7xl p-8" style="display:flex; flex-direction:column; gap:24px;">
    <div class="flex justify-between items-center">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
          <span>دليل الإدارة العليا</span> <span>/</span> <span class="text-slate-500">قاعدة بيانات الموارد البشرية</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900">دليل الموظفين وخزينة الملفات المشفرة (Directory & Document Vault)</h1>
      </div>
      <div class="flex gap-3">
        <button class="btn-white">📥 تصدير CSV كامل</button>
        <button class="btn-emerald">+ إضافة موظف جديد (Onboard)</button>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-4 gap-5">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow">
        <span class="text-xs font-bold text-slate-400">إجمالي الكادر الوظيفي</span>
        <div class="text-3xl font-black text-slate-900 font-mono mt-1">48 <span class="text-sm font-semibold text-slate-400">موظف</span></div>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow">
        <span class="text-xs font-bold text-slate-400">تحويلات InstaPay المعتمدة</span>
        <div class="text-3xl font-black text-emerald-600 font-mono mt-1">29 <span class="text-sm font-semibold text-slate-400">حساب</span></div>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow">
        <span class="text-xs font-bold text-slate-400">تحويل بنكي مباشر (CIB / NBE)</span>
        <div class="text-3xl font-black text-blue-600 font-mono mt-1">15 <span class="text-sm font-semibold text-slate-400">حساب</span></div>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow">
        <span class="text-xs font-bold text-slate-400">مستندات مكتملة بالخزينة</span>
        <div class="text-3xl font-black text-purple-600 font-mono mt-1">98% <span class="text-sm font-semibold text-slate-400">مؤرشف</span></div>
      </div>
    </div>

    <!-- Employee Directory Table -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 card-shadow">
      <div class="flex justify-between items-center mb-5">
        <h3 class="text-base font-black text-slate-900">سجل الكوادر وقنوات الصرف والمستندات</h3>
        <input type="text" placeholder="بحث بالاسم، الرقم القومي، أو الإدارة..." style="padding:6px 14px; border-radius:10px; border:1px solid #CBD5E1; font-size:12px; width:260px;">
      </div>

      <table>
        <thead>
          <tr>
            <th>الموظف والبيانات الأساسية</th>
            <th>الإدارة والمسمى</th>
            <th>نوع العقد</th>
            <th>قناة صرف الراتب</th>
            <th>الخزينة الرقمية (Vault)</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-bold text-slate-900">
              سارة إبراهيم الدسوقي
              <span class="block text-slate-400 font-mono text-xs font-normal">ID: EMP-00104 • رقم قومي: 29508140102938</span>
            </td>
            <td>
              <p class="font-bold text-slate-800">الهندسة والتطوير</p>
              <p class="text-slate-500 text-xs">Senior Software Engineer</p>
            </td>
            <td><span style="background:#F1F5F9; color:#334155; padding:3px 10px; border-radius:6px; font-weight:700;">دوام كامل (Full-Time)</span></td>
            <td>
              <span style="background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; padding:4px 10px; border-radius:6px; font-weight:700;" class="font-mono">
                ⚡ InstaPay: sara@instapay
              </span>
            </td>
            <td>
              <span style="color:#047857; font-weight:700; font-size:11px;">
                🔒 بطاقة الرقم القومي + العقد المعتمد (2)
              </span>
            </td>
            <td><button class="btn-white">إدارة الملف</button></td>
          </tr>

          <tr>
            <td class="font-bold text-slate-900">
              أحمد كمال الشناوي
              <span class="block text-slate-400 font-mono text-xs font-normal">ID: EMP-00105 • رقم قومي: 29403210108871</span>
            </td>
            <td>
              <p class="font-bold text-slate-800">الهندسة والتطوير</p>
              <p class="text-slate-500 text-xs">Backend Engineer</p>
            </td>
            <td><span style="background:#F1F5F9; color:#334155; padding:3px 10px; border-radius:6px; font-weight:700;">دوام كامل (Full-Time)</span></td>
            <td>
              <span style="background:#EFF6FF; color:#1E40AF; border:1px solid #BFDBFE; padding:4px 10px; border-radius:6px; font-weight:700;" class="font-mono">
                🏦 بنك CIB: ****8819
              </span>
            </td>
            <td>
              <span style="color:#047857; font-weight:700; font-size:11px;">
                🔒 شهادة الجيش + العقد + المؤهل (3)
              </span>
            </td>
            <td><button class="btn-white">إدارة الملف</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 11: Automated Payroll Engine (دليل السوبر أدمن - محرك مسيرات الرواتب)
// ─────────────────────────────────────────────────────────────────────────────
function renderViewPayrollEngine() {
  return `
${getCommonHead('محرك مسيرات الرواتب المؤتمت - HumAi')}
<body>
  ${getAppNavbar('سوبر أدمن', 'م/ مصطفى عشماوي')}
  
  <main class="max-w-7xl p-8" style="display:flex; flex-direction:column; gap:24px;">
    <div class="flex justify-between items-center">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
          <span>دليل الإدارة العليا</span> <span>/</span> <span class="text-slate-500">المحرك المالي الشامل</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900">محرك حساب واعتماد مسيرات الرواتب (Automated Payroll Engine)</h1>
      </div>
      <div class="flex gap-3 items-center">
        <span style="background:#ECFDF5; border:1px solid #A7F3D0; color:#065F46; padding:6px 14px; border-radius:12px; font-size:12px; font-weight:800;">
          الدورة المالية النشطة: 26 أغسطس - 25 سبتمبر 2026
        </span>
        <button class="btn-emerald">🔒 إقفال الدورة وتصدير ملف البنك (WPS / ACH)</button>
      </div>
    </div>

    <!-- Cycle Financial Summary Cards -->
    <div class="grid grid-cols-4 gap-5">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow">
        <span class="text-xs font-bold text-slate-400">إجمالي الرواتب الأساسية</span>
        <div class="text-2xl font-black text-slate-900 font-mono mt-1">420,000 <span class="text-xs text-slate-400 font-semibold">EGP</span></div>
        <p class="text-xs text-slate-500 mt-1">48 موظفاً مدرجاً في المسير</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow">
        <span class="text-xs font-bold text-slate-400">البدلات والإضافي والمكافآت</span>
        <div class="text-2xl font-black text-emerald-600 font-mono mt-1">+ 65,200 <span class="text-xs text-slate-400 font-semibold">EGP</span></div>
        <p class="text-xs text-emerald-700 font-semibold mt-1">تشمل بدلات الورديات الليلية</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 card-shadow">
        <span class="text-xs font-bold text-slate-400">الاستقطاعات والتأمينات والسلف</span>
        <div class="text-2xl font-black text-rose-600 font-mono mt-1">- 42,800 <span class="text-xs text-slate-400 font-semibold">EGP</span></div>
        <p class="text-xs text-rose-700 font-semibold mt-1">خصم 24,000 سلف معتمدة</p>
      </div>

      <div style="background:linear-gradient(135deg, #0B0F17 0%, #064E3B 100%); color:#FFFFFF; padding:20px; border-radius:16px; border:1px solid rgba(16,185,129,0.3);" class="shadow-md">
        <span class="text-xs font-bold text-emerald-300">صافي التحويل البنكي الفعلي</span>
        <div class="text-2xl font-black text-white font-mono mt-1">442,400 <span class="text-xs text-emerald-400">EGP</span></div>
        <p class="text-xs text-emerald-300 mt-1">جاهز للتحويل الفوري عبر InstaPay/البنوك</p>
      </div>
    </div>

    <!-- Payroll Engine Table with Proration & Toggles -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 card-shadow" style="display:flex; flex-direction:column; gap:16px;">
      <div class="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h3 class="text-base font-black text-slate-900">جدول مراجعة الرواتب الفردية واحتساب النسب المئوية (Proration Matrix)</h3>
          <p class="text-xs text-slate-500">تم احتساب أجور التعيينات الجديدة نسبياً تلقائياً بناءً على تاريخ مباشرة العمل الفعلي</p>
        </div>
        <div class="flex gap-2">
          <span style="background:#F1F5F9; color:#334155; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:700;">☑ تفعيل خصم التأمينات الاجتماعية</span>
          <span style="background:#F1F5F9; color:#334155; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:700;">☑ تفعيل شرائح ضريبة الدخل 2026</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>الموظف</th>
            <th>الأساسي الشهري</th>
            <th>حالة الاحتساب (Prorated)</th>
            <th>مكافآت وإضافي</th>
            <th>سلف مستردة</th>
            <th>تأمينات وضرائب</th>
            <th>صافي الصرف</th>
            <th>طريقة الدفع</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-bold text-slate-900">سارة إبراهيم الدسوقي</td>
            <td class="font-mono text-slate-700">32,500 EGP</td>
            <td><span class="text-emerald-700 font-bold">شهر كامل (30 يوم)</span></td>
            <td class="font-mono text-emerald-600 font-bold">+ 4,950 EGP</td>
            <td class="font-mono text-rose-600 font-bold">- 2,000 EGP</td>
            <td class="font-mono text-rose-600 font-bold">- 4,000 EGP</td>
            <td class="font-mono text-slate-950 font-black text-sm">31,450 EGP</td>
            <td><span style="background:#ECFDF5; color:#065F46; padding:2px 8px; border-radius:6px; font-weight:700;" class="font-mono">InstaPay</span></td>
          </tr>

          <tr style="background:#F0FDF4;">
            <td class="font-bold text-slate-900">
              طارق محمد سعيد
              <span style="background:#DCFCE7; color:#15803D; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:700; margin-right:4px;">تعيين جديد</span>
            </td>
            <td class="font-mono text-slate-700">24,000 EGP</td>
            <td><span class="text-blue-700 font-bold font-mono">احتساب نسبي (14 يوماً)</span></td>
            <td class="font-mono text-emerald-600 font-bold">+ 800 EGP</td>
            <td class="font-mono text-slate-400 font-bold">0 EGP</td>
            <td class="font-mono text-rose-600 font-bold">- 1,450 EGP</td>
            <td class="font-mono text-slate-950 font-black text-sm">10,550 EGP</td>
            <td><span style="background:#EFF6FF; color:#1E40AF; padding:2px 8px; border-radius:6px; font-weight:700;" class="font-mono">Bank Transfer</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 12: Audit Trail & Governance (دليل السوبر أدمن - سجل التدقيق والحوكمة)
// ─────────────────────────────────────────────────────────────────────────────
function renderViewAuditTrail() {
  return `
${getCommonHead('سجل التدقيق والحوكمة الرقابية - HumAi')}
<body>
  ${getAppNavbar('سوبر أدمن', 'م/ مصطفى عشماوي')}
  
  <main class="max-w-7xl p-8" style="display:flex; flex-direction:column; gap:24px;">
    <div class="flex justify-between items-center">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
          <span>دليل الإدارة العليا</span> <span>/</span> <span class="text-slate-500">الأمان والحوكمة المؤسسية</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900">سجل التدقيق والامتثال الإداري (System Audit Trail & Governance)</h1>
      </div>
      <button class="btn-white">📥 تصدير السجل المشفر (CSV/PDF)</button>
    </div>

    <!-- Badges -->
    <div class="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 text-xs font-bold">
      <span style="background:#0F172A; color:#FFFFFF; padding:8px 16px; border-radius:10px;">كافة العمليات (142)</span>
      <span style="color:#64748B; padding:8px 16px;">تعديلات مالية ورواتب (24)</span>
      <span style="color:#64748B; padding:8px 16px;">تجاوزات البصمة والحضور (18)</span>
      <span style="color:#64748B; padding:8px 16px;">إعدادات النظام والفروع (8)</span>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 card-shadow">
      <table>
        <thead>
          <tr>
            <th>الوقت والتاريخ</th>
            <th>المسؤول (Actor)</th>
            <th>التصنيف الإداري</th>
            <th>تفاصيل الإجراء المنجز</th>
            <th>عنوان الـ IP والجهاز</th>
            <th>الفروقات الموثقة (Diff)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-mono text-slate-600">08 أكتوبر 2026 • 14:22:10</td>
            <td class="font-bold text-slate-900">
              م/ مصطفى عشماوي
              <span class="block text-emerald-600 text-xs font-normal">Super Admin</span>
            </td>
            <td><span style="background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; padding:3px 10px; border-radius:6px; font-weight:700;">FINANCIAL_PAYROLL</span></td>
            <td class="font-bold text-slate-800">اعتماد مسير رواتب دورة سبتمبر 2026 وتصدير ملف الـ ACH</td>
            <td class="font-mono text-slate-500">197.34.120.44 (Cairo)</td>
            <td><span style="background:#F1F5F9; color:#1E293B; padding:3px 8px; border-radius:6px; font-family:'Inter',monospace; font-size:11px; font-weight:700;">Status: PENDING ➔ APPROVED</span></td>
          </tr>

          <tr>
            <td class="font-mono text-slate-600">08 أكتوبر 2026 • 11:05:40</td>
            <td class="font-bold text-slate-900">
              م/ أحمد محمود
              <span class="block text-blue-600 text-xs font-normal">Dept Manager</span>
            </td>
            <td><span style="background:#FFFBEB; color:#B45309; border:1px solid #FDE68A; padding:3px 10px; border-radius:6px; font-weight:700;">ATTENDANCE_OVERRIDE</span></td>
            <td class="font-bold text-slate-800">تبرير تأخير رسمي للموظف عمر خالد (+18 دقيقة عطل مواصلات)</td>
            <td class="font-mono text-slate-500">197.34.120.12 (Cairo)</td>
            <td><span style="background:#F1F5F9; color:#1E293B; padding:3px 8px; border-radius:6px; font-family:'Inter',monospace; font-size:11px; font-weight:700;">Deduction: 150 EGP ➔ 0 EGP</span></td>
          </tr>

          <tr>
            <td class="font-mono text-slate-600">07 أكتوبر 2026 • 16:45:12</td>
            <td class="font-bold text-slate-900">
              م/ مصطفى عشماوي
              <span class="block text-emerald-600 text-xs font-normal">Super Admin</span>
            </td>
            <td><span style="background:#FAF5FF; color:#7E22CE; border:1px solid #E9D5FF; padding:3px 10px; border-radius:6px; font-weight:700;">GEOFENCE_UPDATE</span></td>
            <td class="font-bold text-slate-800">توسيع نصف قطر فرع الإسكندرية (سموحة) من 150m إلى 200m</td>
            <td class="font-mono text-slate-500">197.34.120.44 (Cairo)</td>
            <td><span style="background:#F1F5F9; color:#1E293B; padding:3px 8px; border-radius:6px; font-family:'Inter',monospace; font-size:11px; font-weight:700;">Radius: 150m ➔ 200m</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</body>
</html>
`;
}

module.exports = {
  views: [
    { id: 'smart-attendance', title: 'Smart Attendance', tier: 'employee', render: renderViewSmartAttendance },
    { id: 'leaves-permissions', title: 'Leaves & Permissions', tier: 'employee', render: renderViewLeavesPermissions },
    { id: 'digital-payslips', title: 'Digital Payslips', tier: 'employee', render: renderViewDigitalPayslip },
    { id: 'targets-kpis', title: 'Targets & KPIs', tier: 'employee', render: renderViewTargetsKPIs },
    { id: 'attendance-monitor', title: 'Live Attendance Monitor', tier: 'manager', render: renderViewAttendanceMonitor },
    { id: 'approval-center', title: 'Approval Center', tier: 'manager', render: renderViewApprovalCenter },
    { id: 'team-evaluations', title: 'Team Evaluations & Adjustments', tier: 'manager', render: renderViewTeamEvaluations },
    { id: 'company-branches', title: 'Company & Branch Geofence', tier: 'admin', render: renderViewCompanyBranches },
    { id: 'shifts-engine', title: 'Shifts & Operations Engine', tier: 'admin', render: renderViewShiftsEngine },
    { id: 'employee-vault', title: 'Employee Directory & Vault', tier: 'admin', render: renderViewEmployeeVault },
    { id: 'payroll-engine', title: 'Automated Payroll Engine', tier: 'admin', render: renderViewPayrollEngine },
    { id: 'audit-trail', title: 'Audit Trail & Governance', tier: 'admin', render: renderViewAuditTrail },
  ]
};
