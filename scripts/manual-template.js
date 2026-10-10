/**
 * HumAi Visual Onboarding & Product Manual — HTML-to-PDF Master Template
 * Styled precisely with HumAi Enterprise Brand Identity:
 * - Deep Obsidian Navy (#0B0F17 / #0F172A)
 * - Radiant Emerald Green (#10B981 / #059669)
 * - Light Slate (#F8FAFC / #FFFFFF)
 * - Modern Arabic Sans Hierarchy (Cairo / Inter)
 * - Interactive Hyperlinked Table of Contents
 * - Numbered Callout Annotations & Device Frames
 */

function generateManualHtml(screenshotsMap) {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>دليل الاستخدام والتشغيل المرئي — منصة HumAi</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    /* ═══════════════════════════════════════════════════════════════════
       PRINT & PAGE GEOMETRY SETTINGS (A4 Landscape / Portrait)
       ═══════════════════════════════════════════════════════════════════ */
    @page {
      size: A4 portrait;
      margin: 0;
      @bottom-center {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Cairo', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #FFFFFF;
      color: #0F172A;
      font-size: 13px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    /* Page Breaks */
    .page-sheet {
      width: 210mm;
      min-height: 297mm;
      padding: 18mm 18mm 18mm 18mm;
      position: relative;
      page-break-after: always;
      break-after: page;
      background-color: #FFFFFF;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .page-sheet.cover-page {
      background: radial-gradient(circle at 80% 20%, #162438 0%, #0B0F17 60%, #05070B 100%);
      color: #FFFFFF;
      padding: 24mm 22mm 20mm 22mm;
    }

    .page-sheet.dark-divider {
      background: linear-gradient(145deg, #0B0F17 0%, #0F172A 100%);
      color: #FFFFFF;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    /* Typography Utilities */
    h1, h2, h3, h4, h5 {
      font-weight: 800;
      line-height: 1.3;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .font-mono {
      font-family: 'Inter', monospace;
    }

    /* Brand Accents */
    .emerald-text { color: #10B981; }
    .emerald-bg { background-color: #10B981; }
    .emerald-border { border-color: #10B981; }

    /* Browser Mockup Device Frame */
    .device-browser-frame {
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
      background: #FFFFFF;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
      margin-bottom: 14px;
    }

    .browser-topbar {
      background: #F1F5F9;
      padding: 7px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #E2E8F0;
      direction: ltr;
    }

    .mac-dots {
      display: flex;
      gap: 5px;
    }
    .mac-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }
    .mac-dot-red { background-color: #EF4444; }
    .mac-dot-yellow { background-color: #F59E0B; }
    .mac-dot-green { background-color: #10B981; }

    .browser-url-pill {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 2px 14px;
      font-size: 10px;
      font-family: 'Inter', monospace;
      color: #64748B;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .screenshot-img-container {
      width: 100%;
      height: 330px;
      overflow: hidden;
      background: #F8FAFC;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      position: relative;
    }

    .screenshot-img-container img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
      object-position: top;
    }

    /* Numbered Callout Badges */
    .badge-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #10B981;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 11px;
      line-height: 1;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
      margin-left: 6px;
      vertical-align: middle;
      flex-shrink: 0;
    }

    /* Section Cards */
    .info-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 8px;
    }

    .pro-tip-box {
      background: #ECFDF5;
      border-right: 4px solid #10B981;
      border-radius: 0 8px 8px 0;
      padding: 9px 13px;
      margin-top: 8px;
    }

    /* Header & Footer Rules */
    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px solid #E2E8F0;
      margin-bottom: 12px;
    }

    .document-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid #E2E8F0;
      font-size: 10px;
      color: #94A3B8;
      margin-top: 12px;
    }

    .logo-mark-svg {
      display: inline-block;
      vertical-align: middle;
    }
  </style>
</head>
<body>

  <!-- ═══════════════════════════════════════════════════════════════════
       COVER PAGE (Deep Obsidian Navy + Radiant Emerald)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet cover-page">
    <!-- Top Metadata -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <svg width="42" height="42" viewBox="0 0 60 56" fill="none">
          <circle cx="14" cy="10" r="5.5" fill="#FFFFFF"/>
          <rect x="9" y="19" width="10" height="28" rx="5" fill="#FFFFFF"/>
          <circle cx="46" cy="10" r="5.5" fill="#10B981"/>
          <rect x="41" y="19" width="10" height="28" rx="5" fill="#10B981"/>
          <path d="M 18 29 C 23 37, 37 37, 42 29 C 40 37, 20 37, 18 29 Z" fill="#10B981"/>
          <path d="M 17 29.5 Q 30 40.5 43 29.5" stroke="#10B981" stroke-width="5" stroke-linecap="round" fill="none"/>
        </svg>
        <div>
          <div style="font-weight: 900; font-size: 26px; letter-spacing: 0.05em; line-height: 1;">
            <span>HUM</span><span style="display:inline-block; transform: scaleY(0.95); margin: 0 1px;">Λ</span><span style="position:relative;">I<span style="position:absolute; top:-4px; right:0; width:6px; height:6px; border-radius:50%; background:#10B981;"></span></span>
          </div>
          <span style="font-size: 10px; color: #94A3B8; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">HR Intelligence & Payroll Platform</span>
        </div>
      </div>

      <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 9999px; padding: 6px 16px; font-size: 11px; font-weight: 800; color: #34D399;">
        DOCUMENT CODE: HUMAI-PROD-GUIDE-2026
      </div>
    </div>

    <!-- Main Title & Badge -->
    <div style="margin: 30mm 0 25mm 0;">
      <div style="display: inline-block; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 4px 14px; font-size: 12px; font-weight: 700; color: #A7F3D0; margin-bottom: 18px;">
        ✦ التوثيق التشغيلي والكتالوج البصري المعتمد 2026
      </div>

      <h1 style="font-size: 40px; font-weight: 900; line-height: 1.25; margin-bottom: 16px; color: #FFFFFF;">
        دليل استخدام منصة <span style="color: #10B981;">هُم آي (HumAi)</span><br>
        والمرجع التشغيلي الميداني المصور
      </h1>

      <p style="font-size: 16px; color: #94A3B8; max-width: 620px; line-height: 1.8;">
        دليل هندسي مصور وموثق خطوة بخطوة لكافة شاشات ومحركات النظام: بدءاً من تسجيل الحضور الجغرافي للموظف، مروراً بمركز اعتمادات المدير، وصولاً إلى محرك الرواتب والامتثال القانوني للإدارة العليا.
      </p>

      <!-- 3 Tier Cards Summary -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 30px;">
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 14px;">
          <span style="font-size: 10px; color: #34D399; font-weight: 800; display: block; margin-bottom: 4px;">المستوى الأول</span>
          <h4 style="font-size: 14px; color: #FFFFFF; font-weight: 800;">دليل الموظف اليومي</h4>
          <p style="font-size: 11px; color: #94A3B8; margin-top: 4px;">الحضور الذكي، رصيد الإجازات، قسيمة الراتب، ومتابعة الأهداف.</p>
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 14px;">
          <span style="font-size: 10px; color: #34D399; font-weight: 800; display: block; margin-bottom: 4px;">المستوى الثاني</span>
          <h4 style="font-size: 14px; color: #FFFFFF; font-weight: 800;">دليل المدير المباشر</h4>
          <p style="font-size: 11px; color: #94A3B8; margin-top: 4px;">المراقبة اللحظية، مركز الاعتمادات، وتقييمات الأداء والبدلات.</p>
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 14px;">
          <span style="font-size: 10px; color: #34D399; font-weight: 800; display: block; margin-bottom: 4px;">المستوى الثالث</span>
          <h4 style="font-size: 14px; color: #FFFFFF; font-weight: 800;">دليل السوبر أدمن</h4>
          <p style="font-size: 11px; color: #94A3B8; margin-top: 4px;">إعدادات الفروع، محرك الورديات، الرواتب الآلية، وسجل الحوكمة.</p>
        </div>
      </div>
    </div>

    <!-- Cover Footer -->
    <div style="border-top: 1px solid rgba(255, 255, 255, 0.12); padding-top: 16px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748B;">
      <div>
        <p style="color: #E2E8F0; font-weight: 700;">فريق هندسة المنتج وتجربة المستخدم — شركة هُم آي للحلول الذكية</p>
        <p style="margin-top: 2px;">تاريخ التحديث: أكتوبر 2026 • متوافق مع قانون العمل المصري والأنظمة السحابية</p>
      </div>
      <div style="text-align: left; direction: ltr; font-family: 'Inter', monospace; color: #10B981; font-weight: 700;">
        https://app.humai.eg
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       TABLE OF CONTENTS & ARCHITECTURE (الفهرس وهندسة النظام)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet" id="table-of-contents">
    <div>
      <div class="document-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:900; color:#0F172A; font-size:15px;">HUM<span style="color:#10B981;">Λ</span>I</span>
          <span style="font-size:11px; color:#64748B;">| الفهرس العام ومقدمة المنظومة</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#10B981;">دليل الاستخدام الرسمي v2.4</span>
      </div>

      <div style="margin-bottom: 20px;">
        <span style="color: #10B981; font-weight: 800; font-size: 12px; display: block; margin-bottom: 4px;">التنقل التفاعلي في الدليل</span>
        <h2 style="font-size: 26px; color: #0F172A; font-weight: 900;">فهرس المحتويات والمحاور التشغيلية</h2>
        <p style="font-size: 12px; color: #64748B;">يمكنك النقر مباشرة على أي قسم أو شاشة للانتقال الفوري إلى صفحتها التفصيلية في هذا المستند.</p>
      </div>

      <!-- TOC Table List -->
      <div style="display: grid; grid-template-columns: 1fr; gap: 14px;">
        
        <!-- Part I -->
        <div style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0F172A; color: #FFFFFF; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
            <a href="#part-1" style="font-weight: 800; font-size: 13px; color: #FFFFFF;">
              الجزء الأول: دليل الموظف (Employee Guide — مساحة العمل اليومية)
            </a>
            <span style="background: #10B981; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">المستوى 1</span>
          </div>
          <div style="padding: 10px 16px; background: #FAFAFA; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <a href="#view-1" style="display: flex; justify-content: space-between; padding: 6px 10px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; font-weight: 600;">
              <span>1.1 تسجيل الحضور الجغرافي الذكي (Smart Attendance)</span>
              <span style="color: #10B981; font-weight: 800;">صفحة 3</span>
            </a>
            <a href="#view-2" style="display: flex; justify-content: space-between; padding: 6px 10px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; font-weight: 600;">
              <span>1.2 رصيد الإجازات والأذونات (Leaves & Permissions)</span>
              <span style="color: #10B981; font-weight: 800;">صفحة 4</span>
            </a>
            <a href="#view-3" style="display: flex; justify-content: space-between; padding: 6px 10px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; font-weight: 600;">
              <span>1.3 قسيمة الراتب الرقمية المعتمدة (Digital Payslip)</span>
              <span style="color: #10B981; font-weight: 800;">صفحة 5</span>
            </a>
            <a href="#view-4" style="display: flex; justify-content: space-between; padding: 6px 10px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; font-weight: 600;">
              <span>1.4 متابعة الأهداف والمهام (Targets & KPIs)</span>
              <span style="color: #10B981; font-weight: 800;">صفحة 6</span>
            </a>
          </div>
        </div>

        <!-- Part II -->
        <div style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0F172A; color: #FFFFFF; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
            <a href="#part-2" style="font-weight: 800; font-size: 13px; color: #FFFFFF;">
              الجزء الثاني: دليل المدير المباشر (Manager Guide — إشراف الفريق)
            </a>
            <span style="background: #3B82F6; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">المستوى 2</span>
          </div>
          <div style="padding: 10px 16px; background: #FAFAFA; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <a href="#view-5" style="display: flex; justify-content: space-between; padding: 6px 10px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; font-weight: 600;">
              <span>2.1 شاشة مراقبة الحضور اللحظية (Attendance Monitor)</span>
              <span style="color: #3B82F6; font-weight: 800;">صفحة 7</span>
            </a>
            <a href="#view-6" style="display: flex; justify-content: space-between; padding: 6px 10px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; font-weight: 600;">
              <span>2.2 مركز اعتمادات الفريق والطلبات (Approval Center)</span>
              <span style="color: #3B82F6; font-weight: 800;">صفحة 8</span>
            </a>
            <a href="#view-7" style="display: flex; justify-content: space-between; padding: 6px 10px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; font-weight: 600; grid-column: span 2;">
              <span>2.3 تقييمات الأداء والمقترحات المالية (Team Evaluations & Bonus Engine)</span>
              <span style="color: #3B82F6; font-weight: 800;">صفحة 9</span>
            </a>
          </div>
        </div>

        <!-- Part III -->
        <div style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0F172A; color: #FFFFFF; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
            <a href="#part-3" style="font-weight: 800; font-size: 13px; color: #FFFFFF;">
              الجزء الثالث: دليل السوبر أدمن (Super Admin — القيادة والضبط)
            </a>
            <span style="background: #8B5CF6; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">المستوى 3</span>
          </div>
          <div style="padding: 10px 16px; background: #FAFAFA; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <a href="#view-8" style="display: flex; justify-content: space-between; padding: 6px 10px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; font-weight: 600;">
              <span>3.1 إعدادات الفروع ونطاق الـ GPS (Company & Branches)</span>
              <span style="color: #8B5CF6; font-weight: 800;">صفحة 10</span>
            </a>
            <a href="#view-9" style="display: flex; justify-content: space-between; padding: 6px 10px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; font-weight: 600;">
              <span>3.2 محرك الورديات والتشغيل المتقدم (Shifts Engine)</span>
              <span style="color: #8B5CF6; font-weight: 800;">صفحة 11</span>
            </a>
            <a href="#view-10" style="display: flex; justify-content: space-between; padding: 6px 10px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; font-weight: 600;">
              <span>3.3 دليل الموظفين وخزينة المستندات (Employee Vault)</span>
              <span style="color: #8B5CF6; font-weight: 800;">صفحة 12</span>
            </a>
            <a href="#view-11" style="display: flex; justify-content: space-between; padding: 6px 10px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; font-weight: 600;">
              <span>3.4 محرك مسيرات الرواتب المؤتمت (Payroll Engine)</span>
              <span style="color: #8B5CF6; font-weight: 800;">صفحة 13</span>
            </a>
            <a href="#view-12" style="display: flex; justify-content: space-between; padding: 6px 10px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; font-weight: 600; grid-column: span 2;">
              <span>3.5 سجل التدقيق والامتثال والحوكمة (Audit Trail & Governance)</span>
              <span style="color: #8B5CF6; font-weight: 800;">صفحة 14</span>
            </a>
          </div>
        </div>

      </div>
    </div>

    <!-- Page Footer -->
    <div class="document-footer">
      <span>منصة HumAi للإدارة الذكية والأتمتة</span>
      <span>وثيقة رقمية معتمدة • الإصدار 2.4</span>
      <span>صفحة 2</span>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       SECTION 1: SMART ATTENDANCE (تسجيل الحضور الذكي)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet" id="view-1">
    <div>
      <div class="document-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:900; color:#0F172A; font-size:15px;">HUM<span style="color:#10B981;">Λ</span>I</span>
          <span style="font-size:11px; color:#64748B;">| دليل الموظف: الحضور والانصراف</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#10B981;">1.1 تسجيل الحضور الجغرافي</span>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 20px; color: #0F172A; font-weight: 900;">
          1.1 تسجيل الحضور والانصراف الذكي (Smart Geofence Attendance)
        </h2>
        <p style="font-size: 11px; color: #64748B;">
          بوابة البصمة الإلكترونية المرتبطة جغرافياً بنطاق مقر العمل ومواعيد الورديات المعتمدة.
        </p>
      </div>

      <!-- Device Browser Frame with Embedded Screenshot -->
      <div class="device-browser-frame">
        <div class="browser-topbar">
          <div class="mac-dots">
            <span class="mac-dot mac-dot-red"></span>
            <span class="mac-dot mac-dot-yellow"></span>
            <span class="mac-dot mac-dot-green"></span>
          </div>
          <div class="browser-url-pill">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            <span>https://app.humai.eg/dashboard/employee/attendance</span>
          </div>
          <div style="font-size:9px; color:#94A3B8; font-weight:700;">100% SECURE</div>
        </div>
        <div class="screenshot-img-container">
          <img src="${screenshotsMap['smart-attendance'] || ''}" alt="Smart Attendance Screenshot">
        </div>
      </div>

      <!-- Feature Breakdown & Callouts -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        
        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">1</span> ما تقدمه هذه الشاشة (Core Purpose)
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>التحقق الجغرافي الفوري:</strong> قراءة إحداثيات GPS لجهاز الموظف ومطابقتها مع محيط الفرع المسموح به.</li>
            <li><strong>التزامن الدقيق مع الوردية:</strong> احتساب الحضور ضمن فترة السماح (Grace Period) المحددة من الشركة.</li>
            <li><strong>مرونة نمط العمل:</strong> التبديل بين الحضور المكتبي والعمل عن بُعد بموافقة مسبقة.</li>
          </ul>
        </div>

        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">2</span> الإجراءات المتاحة (Key Actions)
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>تسجيل بصمة الحضور/الانصراف:</strong> نقرة واحدة على زر "Check-In" الأخضر عند دخول النطاق.</li>
            <li><strong>مراجعة مؤقت الوردية:</strong> استعراض مواعيد بدء الوردية، وقت الراحة المدفوعة، ورادار الموقع.</li>
            <li><strong>متابعة ساعات الأسبوع:</strong> شريط إنجاز يوضح إجمالي الساعات الفعلية مقارنة بهدف الـ 40 ساعة.</li>
          </ul>
        </div>

      </div>

      <!-- Pro-Tips Box -->
      <div class="pro-tip-box">
        <strong style="color: #065F46; font-size: 11px; display: block; margin-bottom: 2px;">💡 نصائح احترافية وحالات استثنائية (Pro-Tips & Edge Cases):</strong>
        <p style="font-size: 10.5px; color: #047857; line-height: 1.5;">
          • في حال واجهت رسالة "خارج النطاق الجغرافي"، تأكد من تفعيل صلاحية الـ Location الدقيقة في متصفحك أو هاتف المحمول، ثم انقر على "تحديث الموقع".<br>
          • إذا كانت شركتك تفعل خيار "تلقائية الإغلاق للورديات المتداخلة"، سيقوم النظام بإنهاء الجلسة تلقائياً في نهاية مواعيد الوردية المعتمدة لحفظ حقك.
        </p>
      </div>
    </div>

    <div class="document-footer">
      <span>منصة HumAi للإدارة الذكية</span>
      <span>دليل الموظف — مساحة العمل اليومية</span>
      <span>صفحة 3</span>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       SECTION 2: LEAVES & PERMISSIONS (الإجازات والاستئذانات)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet" id="view-2">
    <div>
      <div class="document-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:900; color:#0F172A; font-size:15px;">HUM<span style="color:#10B981;">Λ</span>I</span>
          <span style="font-size:11px; color:#64748B;">| دليل الموظف: الطلبات الذاتية</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#10B981;">1.2 الإجازات والاستئذانات</span>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 20px; color: #0F172A; font-weight: 900;">
          1.2 رصيد الإجازات وأذونات العمل (Leaves & Permissions Hub)
        </h2>
        <p style="font-size: 11px; color: #64748B;">
          إدارة الأرصدة السنوية والعارضة وتقديم طلبات الإجازات والأذونات مع المتابعة الحية للاعتماد.
        </p>
      </div>

      <div class="device-browser-frame">
        <div class="browser-topbar">
          <div class="mac-dots">
            <span class="mac-dot mac-dot-red"></span>
            <span class="mac-dot mac-dot-yellow"></span>
            <span class="mac-dot mac-dot-green"></span>
          </div>
          <div class="browser-url-pill">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            <span>https://app.humai.eg/dashboard/leaves</span>
          </div>
          <div style="font-size:9px; color:#94A3B8; font-weight:700;">LIVE CONNECTED</div>
        </div>
        <div class="screenshot-img-container">
          <img src="${screenshotsMap['leaves-permissions'] || ''}" alt="Leaves & Permissions Screenshot">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">1</span> ما تقدمه هذه الشاشة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>عدادات الأرصدة الشفافة:</strong> تتبع فوري للرصيد الاعتيادي (21 يوماً)، العارض، وأذونات الساعتين الشهرية.</li>
            <li><strong>سجل الاعتمادات التفاعلي:</strong> عرض دورة حياة كل طلب (قيد المراجعة ➔ معتمد ➔ مرفوض مع ذكر السبب).</li>
            <li><strong>الرصيد التعويضي:</strong> إضافة أيام إضافية تلقائياً عند اعتماد تشغيل أيام العطلات الرسمية.</li>
          </ul>
        </div>

        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">2</span> الإجراءات المتاحة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>تقديم طلب إجازة جديد:</strong> تحديد التاريخ، النوع، والملاحظات ليتم إخطار المدير عبر لوحة التحكم وواتساب.</li>
            <li><strong>طلب إذن صباحي/مسائي:</strong> استئذان لمدة ساعتين دون الخصم من الراتب وفق سياسة المنشأة.</li>
            <li><strong>إلغاء الطلب المعلق:</strong> إمكانية سحب الطلب قبل اعتماده النهائي بنقرة واحدة.</li>
          </ul>
        </div>
      </div>

      <div class="pro-tip-box">
        <strong style="color: #065F46; font-size: 11px; display: block; margin-bottom: 2px;">💡 نصائح وحالات استثنائية:</strong>
        <p style="font-size: 10.5px; color: #047857; line-height: 1.5;">
          • يُفضل تقديم الإجازات الاعتيادية قبل موعدها بـ 48 ساعة على الأقل لضمان انسيابية العمل في القسم.<br>
          • إذا تجاوزت حصة الأذونات المسموحة شهرياً (إذنان كحد أقصى)، سيقوم النظام بتحويل الاستئذان الإضافي إلى خصم زمني مباشر في مسير الراتب.
        </p>
      </div>
    </div>

    <div class="document-footer">
      <span>منصة HumAi للإدارة الذكية</span>
      <span>دليل الموظف — مساحة العمل اليومية</span>
      <span>صفحة 4</span>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       SECTION 3: DIGITAL PAYSLIP (قسيمة الراتب الرقمية)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet" id="view-3">
    <div>
      <div class="document-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:900; color:#0F172A; font-size:15px;">HUM<span style="color:#10B981;">Λ</span>I</span>
          <span style="font-size:11px; color:#64748B;">| دليل الموظف: المستحقات المالية</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#10B981;">1.3 قسيمة الراتب الرقمية</span>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 20px; color: #0F172A; font-weight: 900;">
          1.3 قسيمة الراتب الرقمية المعتمدة (Certified Digital Payslip)
        </h2>
        <p style="font-size: 11px; color: #64748B;">
          عرض وتحميل مستند الراتب الشهري المفصل مع تفكيك الاستحقاقات والاستقطاعات والتحويل البنكي.
        </p>
      </div>

      <div class="device-browser-frame">
        <div class="browser-topbar">
          <div class="mac-dots">
            <span class="mac-dot mac-dot-red"></span>
            <span class="mac-dot mac-dot-yellow"></span>
            <span class="mac-dot mac-dot-green"></span>
          </div>
          <div class="browser-url-pill">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            <span>https://app.humai.eg/dashboard/payslips</span>
          </div>
          <div style="font-size:9px; color:#94A3B8; font-weight:700;">ENCRYPTED WPS / ACH</div>
        </div>
        <div class="screenshot-img-container">
          <img src="${screenshotsMap['digital-payslips'] || ''}" alt="Digital Payslip Screenshot">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">1</span> ما تقدمه هذه الشاشة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>بيان مالي رسمي مشفر:</strong> تفصيل دقيق لكل قرش: الراتب الأساسي، العمل الإضافي، البدلات، والمكافآت.</li>
            <li><strong>شفافية الاستقطاعات:</strong> إيضاح حصة الموظف في التأمينات الاجتماعية وضريبة كسب العمل بدقة القانون المصري.</li>
            <li><strong>تأكيد التحويل البنكي:</strong> إظهار الرقم المرجعي للعملية وقناة الدفع (InstaPay أو التحويل المصرفي).</li>
          </ul>
        </div>

        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">2</span> الإجراءات المتاحة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>تحميل نسخة PDF معتمدة:</strong> وثيقة رسمية مختومة بالـ Watermark تصلح للاستخدام البنكي والجهات الرسمية.</li>
            <li><strong>أمر الطباعة المباشر:</strong> تهيئة فورية للطباعة بتنسيق A4 أنيق وبدون عناصر المتصفح الجانبية.</li>
            <li><strong>التنقل بين الأشهر السابقة:</strong> أرشيف كامل يتيح مقارنة الدخل الشهري على مدار العام.</li>
          </ul>
        </div>
      </div>

      <div class="pro-tip-box">
        <strong style="color: #065F46; font-size: 11px; display: block; margin-bottom: 2px;">💡 نصائح وحالات استثنائية:</strong>
        <p style="font-size: 10.5px; color: #047857; line-height: 1.5;">
          • دورة صرف الرواتب في منصة HumAi تعمل وفق التقويم القياسي (من 26 الشهر السابق حتى 25 الشهر الحالي)، ويتم قفل المسير في يوم 26.<br>
          • يمكنك استلام إشعار تلقائي عبر مساعد واتساب فور اعتماد المسير المالي مع ملخص صافي الراتب المستلم.
        </p>
      </div>
    </div>

    <div class="document-footer">
      <span>منصة HumAi للإدارة الذكية</span>
      <span>دليل الموظف — مساحة العمل اليومية</span>
      <span>صفحة 5</span>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       SECTION 4: TARGETS & KPIS (متابعة الأهداف والمهام)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet" id="view-4">
    <div>
      <div class="document-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:900; color:#0F172A; font-size:15px;">HUM<span style="color:#10B981;">Λ</span>I</span>
          <span style="font-size:11px; color:#64748B;">| دليل الموظف: الأداء والإنجاز</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#10B981;">1.4 متابعة الأهداف والـ KPIs</span>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 20px; color: #0F172A; font-weight: 900;">
          1.4 متابعة الأهداف وتسجيل الإنجازات اليومية (KPIs & Targets)
        </h2>
        <p style="font-size: 11px; color: #64748B;">
          تسجيل المخرجات اليومية وربط نسبة الإنجاز بمكافآت الأداء الشهرية المعتمدة تلقائياً.
        </p>
      </div>

      <div class="device-browser-frame">
        <div class="browser-topbar">
          <div class="mac-dots">
            <span class="mac-dot mac-dot-red"></span>
            <span class="mac-dot mac-dot-yellow"></span>
            <span class="mac-dot mac-dot-green"></span>
          </div>
          <div class="browser-url-pill">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            <span>https://app.humai.eg/dashboard/targets</span>
          </div>
          <div style="font-size:9px; color:#94A3B8; font-weight:700;">PERFORMANCE RADAR</div>
        </div>
        <div class="screenshot-img-container">
          <img src="${screenshotsMap['targets-kpis'] || ''}" alt="Targets & KPIs Screenshot">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">1</span> ما تقدمه هذه الشاشة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>مؤشر الهدف الدائري:</strong> قياس مرئي فوري لنسبة تحقيق المستهدف الشهري (مثلاً 87%).</li>
            <li><strong>تنوع وحدات القياس:</strong> دعم مختلف الوحدات حسب التخصص (نقاط برمجية، اتصالات مبيعات، تذاكر دعم).</li>
            <li><strong>حساب وتيرة الإنجاز (Run-rate):</strong> حساب آلي لعدد النقاط المطلوبة يومياً للوصول إلى 100%.</li>
          </ul>
        </div>

        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">2</span> الإجراءات المتاحة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>تسجيل إنجاز يومي:</strong> إدخال كمية المهام المنجزة ووصفها لتوثيق الجهد اليومي في النظام.</li>
            <li><strong>استعراض السجل المعتمد:</strong> تتبع المهام التي تمت مراجعتها واعتمادها من قبل المدير المباشر.</li>
            <li><strong>مؤشر استحقاق المكافأة:</strong> معرفة قيمة مكافأة الأداء التي ستُضاف لمسير الراتب عند إغلاق الشهر.</li>
          </ul>
        </div>
      </div>

      <div class="pro-tip-box">
        <strong style="color: #065F46; font-size: 11px; display: block; margin-bottom: 2px;">💡 نصائح وحالات استثنائية:</strong>
        <p style="font-size: 10.5px; color: #047857; line-height: 1.5;">
          • احرص على تدوين أرقام التذاكر أو روابط الإنجاز في حقل الملاحظات لتسريع دورة اعتماد المدير.<br>
          • في حال تحقيق أكثر من 100% من المستهدف، يقوم محرك الرواتب باحتساب نقاط إضافية (Over-achievement Bonus) تلقائياً.
        </p>
      </div>
    </div>

    <div class="document-footer">
      <span>منصة HumAi للإدارة الذكية</span>
      <span>دليل الموظف — مساحة العمل اليومية</span>
      <span>صفحة 6</span>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       SECTION 5: ATTENDANCE MONITOR (مراقبة الحضور المباشر)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet" id="view-5">
    <div>
      <div class="document-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:900; color:#0F172A; font-size:15px;">HUM<span style="color:#10B981;">Λ</span>I</span>
          <span style="font-size:11px; color:#64748B;">| دليل المدير: إشراف الفريق</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#3B82F6;">2.1 شاشة المراقبة اللحظية</span>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 20px; color: #0F172A; font-weight: 900;">
          2.1 شاشة مراقبة الحضور اللحظية للفريق (Live Attendance Monitor)
        </h2>
        <p style="font-size: 11px; color: #64748B;">
          لوحة قيادة لحظية تمنح المدير رؤية شاملة وتحديثاً فورياً لحالة كل موظف في فريقه.
        </p>
      </div>

      <div class="device-browser-frame">
        <div class="browser-topbar">
          <div class="mac-dots">
            <span class="mac-dot mac-dot-red"></span>
            <span class="mac-dot mac-dot-yellow"></span>
            <span class="mac-dot mac-dot-green"></span>
          </div>
          <div class="browser-url-pill">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            <span>https://app.humai.eg/dashboard/attendance</span>
          </div>
          <div style="font-size:9px; color:#10B981; font-weight:700;">● LIVE STREAMING</div>
        </div>
        <div class="screenshot-img-container">
          <img src="${screenshotsMap['attendance-monitor'] || ''}" alt="Live Attendance Monitor Screenshot">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">1</span> ما تقدمه هذه الشاشة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>توزيع القوى العاملة الفوري:</strong> إحصاء لحظي للمتواجدين بالمقر (11)، العاملين عن بُعد (3)، والمتأخرين (2).</li>
            <li><strong>كشف التأخيرات المبكر:</strong> إبراز دقائق التأخير باللون البرتقالي فور انقضاء فترة السماح مباشرة.</li>
            <li><strong>التحقق من صحة البصمة:</strong> بيان موقع تسجيل البصمة واسم الفرع أو الوسم المعتمد للعمل عن بُعد.</li>
          </ul>
        </div>

        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">2</span> الإجراءات المتاحة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>تبرير التأخير (Lateness Justification):</strong> إمكانية إسقاط دقائق التأخير لموظف واجه ظرفاً قاهراً مع توثيق السبب.</li>
            <li><strong>تصفية الحالات:</strong> عزل الموظفين المتأخرين أو العاملين عن بُعد بنقرة واحدة لسرعة المتابعة.</li>
            <li><strong>تصدير كشف الحضور:</strong> سحب تقرير CSV فوري بالبصمات وساعات العمل اليومية.</li>
          </ul>
        </div>
      </div>

      <div class="pro-tip-box">
        <strong style="color: #065F46; font-size: 11px; display: block; margin-bottom: 2px;">💡 نصائح وحالات استثنائية:</strong>
        <p style="font-size: 10.5px; color: #047857; line-height: 1.5;">
          • التبرير المعتمد من المدير يُرفع فورياً لسجل التدقيق المشفر ويمنع احتساب أي خصم مالي في مسير الرواتب تلقائياً.<br>
          • يتم تحديث الشاشة بتقنية السوكت (Real-time Polling) كل 30 ثانية دون الحاجة لإعادة تحميل الصفحة يدوياً.
        </p>
      </div>
    </div>

    <div class="document-footer">
      <span>منصة HumAi للإدارة الذكية</span>
      <span>دليل المدير — إشراف الفريق</span>
      <span>صفحة 7</span>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       SECTION 6: APPROVAL CENTER (مركز اعتمادات الفريق)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet" id="view-6">
    <div>
      <div class="document-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:900; color:#0F172A; font-size:15px;">HUM<span style="color:#10B981;">Λ</span>I</span>
          <span style="font-size:11px; color:#64748B;">| دليل المدير: القرارات الإدارية</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#3B82F6;">2.2 مركز الاعتمادات والقرارات</span>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 20px; color: #0F172A; font-weight: 900;">
          2.2 مركز اعتمادات الفريق والطلبات المعلقة (Approval Center)
        </h2>
        <p style="font-size: 11px; color: #64748B;">
          منصة مركزية لمراجعة واتخاذ القرارات بشأن طلبات الإجازات، الأذونات، وتبديل الورديات.
        </p>
      </div>

      <div class="device-browser-frame">
        <div class="browser-topbar">
          <div class="mac-dots">
            <span class="mac-dot mac-dot-red"></span>
            <span class="mac-dot mac-dot-yellow"></span>
            <span class="mac-dot mac-dot-green"></span>
          </div>
          <div class="browser-url-pill">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            <span>https://app.humai.eg/dashboard/manager</span>
          </div>
          <div style="font-size:9px; color:#94A3B8; font-weight:700;">FAST-TRACK WORKFLOW</div>
        </div>
        <div class="screenshot-img-container">
          <img src="${screenshotsMap['approval-center'] || ''}" alt="Approval Center Screenshot">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">1</span> ما تقدمه هذه الشاشة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>بطاقات تفاعلية مستقلة:</strong> كل طلب يعرض بيانات الموظف، الرصيد المتبقي، والسبب باختصار واضح.</li>
            <li><strong>دعم تبديل الورديات (Shift Swap):</strong> التحقق المتبادل من موافقة الزميل البديل قبل عرض الطلب على المدير.</li>
            <li><strong>تكامل الأذونات السريعة:</strong> مراجعة أذونات الساعتين مع بيان عدد الأذونات المستهلكة في نفس الشهر.</li>
          </ul>
        </div>

        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">2</span> الإجراءات المتاحة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>الاعتماد الفوري بنقرة واحدة:</strong> الموافقة على الطلب وتحديث جداول العمل وخصم الرصيد آلياً.</li>
            <li><strong>الرفض مع تعليل رسمي:</strong> كتابة سبب الرفض وإرسال تنبيه فوري للموظف عبر المنصة وواتساب.</li>
            <li><strong>فحص التعارضات الزمنية:</strong> كشف تلقائي لأي تداخل بين إجازة الموظف وإجازات زملائه في نفس الإدارة.</li>
          </ul>
        </div>
      </div>

      <div class="pro-tip-box">
        <strong style="color: #065F46; font-size: 11px; display: block; margin-bottom: 2px;">💡 نصائح وحالات استثنائية:</strong>
        <p style="font-size: 10.5px; color: #047857; line-height: 1.5;">
          • يدعم نظام HumAi مسار الاعتماد المزدوج (Hierarchical Mode): موافقة المدير المباشر تليها موافقة الـ HR وفق إعدادات الشركة.<br>
          • يمكنك الرد على الطلبات عبر محادثة مساعد واتساب التفاعلية مباشرة بإرسال كود التأكيد دون فتح لوحة الويب.
        </p>
      </div>
    </div>

    <div class="document-footer">
      <span>منصة HumAi للإدارة الذكية</span>
      <span>دليل المدير — إشراف الفريق</span>
      <span>صفحة 8</span>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       SECTION 7: TEAM EVALUATIONS & BONUSES (تقييمات الأداء والبدلات)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet" id="view-7">
    <div>
      <div class="document-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:900; color:#0F172A; font-size:15px;">HUM<span style="color:#10B981;">Λ</span>I</span>
          <span style="font-size:11px; color:#64748B;">| دليل المدير: التحفيز والمكافآت</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#3B82F6;">2.3 تقييم الأداء والتوصيات المالية</span>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 20px; color: #0F172A; font-weight: 900;">
          2.3 تقييمات الأداء الشهرية والتوصيات المالية (Evaluations & Bonus)
        </h2>
        <p style="font-size: 11px; color: #64748B;">
          محرك التقييم الرباعي ورفع مقترحات المكافآت أو الخصومات المبررة لمسير الرواتب.
        </p>
      </div>

      <div class="device-browser-frame">
        <div class="browser-topbar">
          <div class="mac-dots">
            <span class="mac-dot mac-dot-red"></span>
            <span class="mac-dot mac-dot-yellow"></span>
            <span class="mac-dot mac-dot-green"></span>
          </div>
          <div class="browser-url-pill">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            <span>https://app.humai.eg/dashboard/evaluations</span>
          </div>
          <div style="font-size:9px; color:#94A3B8; font-weight:700;">4-PILLAR RATING MATRIX</div>
        </div>
        <div class="screenshot-img-container">
          <img src="${screenshotsMap['team-evaluations'] || ''}" alt="Team Evaluations Screenshot">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">1</span> ما تقدمه هذه الشاشة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>مصفوفة التقييم بالنجوم:</strong> تقييم 4 ركائز (الانضباط، جودة المخرجات، حل المشكلات، والتعاون).</li>
            <li><strong>المتوسط التراكمي الذكي:</strong> احتساب المعدل الإجمالي (مثلاً 4.7/5.0) مع ربطه بتاريخ تعيين الموظف وراتبه.</li>
            <li><strong>نموذج التعديلات المالية:</strong> اقتراح مكافأة تميز نقدية أو جزاء مع حقل إلزامي لتدوين الأسباب الرسمية.</li>
          </ul>
        </div>

        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">2</span> الإجراءات المتاحة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>رفع توصية مكافأة (Bonus):</strong> تحديد المبلغ وتوثيق الإنجاز لترحيله إلى مسودة مسير الرواتب.</li>
            <li><strong>حفظ التقييم كمسودة:</strong> إمكانية مراجعة التقييمات على مراحل قبل إرسالها النهائي للإدارة العليا.</li>
            <li><strong>الربط مع تقارير الترقية:</strong> أرشفة التقييمات لتشكيل السجل السنوي لجدارة الموظف.</li>
          </ul>
        </div>
      </div>

      <div class="pro-tip-box">
        <strong style="color: #065F46; font-size: 11px; display: block; margin-bottom: 2px;">💡 نصائح وحالات استثنائية:</strong>
        <p style="font-size: 10.5px; color: #047857; line-height: 1.5;">
          • التوصيات المالية المرفوعة من المدير تتطلب اعتماداً نهائياً من السوبر أدمن أو المدير المالي قبل إدراجها في شيك التحويل البنكي.<br>
          • كتابة تفاصيل واضحة في خانة المبررات يسهل على الإدارة العليا اتخاذ قرار الموافقة الفورية دون تأخير صرف الراتب.
        </p>
      </div>
    </div>

    <div class="document-footer">
      <span>منصة HumAi للإدارة الذكية</span>
      <span>دليل المدير — إشراف الفريق</span>
      <span>صفحة 9</span>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       SECTION 8: COMPANY & BRANCH SETUP (إعدادات الشركة والفروع)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet" id="view-8">
    <div>
      <div class="document-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:900; color:#0F172A; font-size:15px;">HUM<span style="color:#10B981;">Λ</span>I</span>
          <span style="font-size:11px; color:#64748B;">| دليل السوبر أدمن: البنية التحتية</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#8B5CF6;">3.1 إعدادات الفروع ونطاق الـ GPS</span>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 20px; color: #0F172A; font-weight: 900;">
          3.1 إعدادات الفروع ونطاق الـ GPS الجغرافي (Branch Geofencing)
        </h2>
        <p style="font-size: 11px; color: #64748B;">
          ضبط المواقع الجغرافية، نصف قطر البصمة، وسياسات الحضور وفترات السماح لكل فرع على حدة.
        </p>
      </div>

      <div class="device-browser-frame">
        <div class="browser-topbar">
          <div class="mac-dots">
            <span class="mac-dot mac-dot-red"></span>
            <span class="mac-dot mac-dot-yellow"></span>
            <span class="mac-dot mac-dot-green"></span>
          </div>
          <div class="browser-url-pill">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            <span>https://app.humai.eg/dashboard/settings</span>
          </div>
          <div style="font-size:9px; color:#94A3B8; font-weight:700;">GEOFENCE ENGINE v3.2</div>
        </div>
        <div class="screenshot-img-container">
          <img src="${screenshotsMap['company-branches'] || ''}" alt="Company & Branches Screenshot">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">1</span> ما تقدمه هذه الشاشة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>إدارة متعددة الفروع (Multi-Branch):</strong> ضبط مستقل للمقر الرئيسي (المعادي) والفروع الإقليمية (سموحة).</li>
            <li><strong>محلل روابط Google Maps الذكي:</strong> استخراج الإحداثيات الدقيقة (Lat/Long) تلقائياً بمجرد لصق رابط خرائط جوجل.</li>
            <li><strong>محيط السماح الديناميكي:</strong> ضبط نصف القطر بين 50 و 500 متر ليتناسب مع مساحة مبنى الشركة.</li>
          </ul>
        </div>

        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">2</span> الإجراءات المتاحة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>إضافة فرع جديد:</strong> تخصيص اسم الفرع، الإحداثيات، وتحديد ساعات السماح الصباحية (Grace Period).</li>
            <li><strong>اختبار الموقع الحي:</strong> تجربة نطاق الحضور مباشرة للتأكد من دقة التقاط أبراج الاتصالات والأقمار الصناعية.</li>
            <li><strong>تفعيل حظر البصمة الخارجية:</strong> قفل تسجيل الحضور فوراً لمن هم خارج النطاق مع إرسال إشعار أمني.</li>
          </ul>
        </div>
      </div>

      <div class="pro-tip-box">
        <strong style="color: #065F46; font-size: 11px; display: block; margin-bottom: 2px;">💡 نصائح وحالات استثنائية:</strong>
        <p style="font-size: 10.5px; color: #047857; line-height: 1.5;">
          • يُوصى بضبط نصف القطر بـ 150 متراً للمباني المرتفعة لمراعاة تفاوت دقة إشارات الـ GPS داخل الأدوار العليا أو الجراجات.<br>
          • أي تعديل في إحداثيات الفرع يتم توثيقه فورياً في سجل الحوكمة الإدارية (Audit Trail) موضحاً المستخدم وعنوان الـ IP.
        </p>
      </div>
    </div>

    <div class="document-footer">
      <span>منصة HumAi للإدارة الذكية</span>
      <span>دليل السوبر أدمن — القيادة والضبط</span>
      <span>صفحة 10</span>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       SECTION 9: SHIFTS & OPERATIONS ENGINE (محرك الورديات والتشغيل)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet" id="view-9">
    <div>
      <div class="document-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:900; color:#0F172A; font-size:15px;">HUM<span style="color:#10B981;">Λ</span>I</span>
          <span style="font-size:11px; color:#64748B;">| دليل السوبر أدمن: محرك التشغيل</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#8B5CF6;">3.2 محرك الورديات والتشغيل</span>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 20px; color: #0F172A; font-weight: 900;">
          3.2 محرك جدولة الورديات والتشغيل المتقدم (Operations & Shift Engine)
        </h2>
        <p style="font-size: 11px; color: #64748B;">
          بناء جداول الورديات الثابتة، المتداولة، الورديات الليلية العابرة لمنتصف الليل، والمنقسمة.
        </p>
      </div>

      <div class="device-browser-frame">
        <div class="browser-topbar">
          <div class="mac-dots">
            <span class="mac-dot mac-dot-red"></span>
            <span class="mac-dot mac-dot-yellow"></span>
            <span class="mac-dot mac-dot-green"></span>
          </div>
          <div class="browser-url-pill">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            <span>https://app.humai.eg/dashboard/shifts</span>
          </div>
          <div style="font-size:9px; color:#94A3B8; font-weight:700;">ROSTER LOGIC ENGINE</div>
        </div>
        <div class="screenshot-img-container">
          <img src="${screenshotsMap['shifts-engine'] || ''}" alt="Shifts Engine Screenshot">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">1</span> ما تقدمه هذه الشاشة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>تغطية كاملة لكافة أنماط العمل:</strong> دعم الورديات العادية (9-5)، الليلية (11PM-7AM)، والمنقسمة (Split).</li>
            <li><strong>دعم العبور الليلي (Midnight Spanning):</strong> معالجة برمجية دقيقة للورديات التي تبدأ في يوم وتنتهي في اليوم التالي.</li>
            <li><strong>بدل الورديات الليلية الآلي:</strong> احتساب نسبة إضافية (مثلاً 20%) وترحيلها مباشرة للاستحقاقات الشهرية.</li>
          </ul>
        </div>

        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">2</span> الإجراءات المتاحة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>إنشاء وردية جديدة:</strong> تحديد ساعات البدء والانتهاء، أيام العمل، وفترة الراحة المعتمدة.</li>
            <li><strong>تسكين الموظفين (Shift Assignment):</strong> تعيين موظفين محددين أو إدارات بأكملها لكل وردية بمرونة.</li>
            <li><strong>جدولة الورديات التناوبية:</strong> تفعيل التدوير كل أسبوعين بين الفرق لتوزيع ساعات العمل الليلية بعدالة.</li>
          </ul>
        </div>
      </div>

      <div class="pro-tip-box">
        <strong style="color: #065F46; font-size: 11px; display: block; margin-bottom: 2px;">💡 نصائح وحالات استثنائية:</strong>
        <p style="font-size: 10.5px; color: #047857; line-height: 1.5;">
          • في الورديات المنقسمة (Split Shift)، يتم احتساب الحضور عبر فترتين منفصلتين دون اعتبار ساعات التوقف بينهما تأخيراً أو انصرافاً مبكراً.<br>
          • إذا نسي الموظف تسجيل الانصراف في وردية ليلية، يقوم النظام آلياً بإغلاق البصمة بعد 12 ساعة من بدء الوردية لحماية سلامة السجلات.
        </p>
      </div>
    </div>

    <div class="document-footer">
      <span>منصة HumAi للإدارة الذكية</span>
      <span>دليل السوبر أدمن — القيادة والضبط</span>
      <span>صفحة 11</span>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       SECTION 10: EMPLOYEE VAULT (دليل الموظفين والخزينة)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet" id="view-10">
    <div>
      <div class="document-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:900; color:#0F172A; font-size:15px;">HUM<span style="color:#10B981;">Λ</span>I</span>
          <span style="font-size:11px; color:#64748B;">| دليل السوبر أدمن: الموارد البشرية</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#8B5CF6;">3.3 دليل الموظفين وخزينة الملفات</span>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 20px; color: #0F172A; font-weight: 900;">
          3.3 دليل الموظفين وخزينة المستندات الرقمية (Employee Directory & Vault)
        </h2>
        <p style="font-size: 11px; color: #64748B;">
          الأرشيف المركزي لكافة الكوادر، قنوات صرف الرواتب، وخزينة الملفات الرسمية المشفرة.
        </p>
      </div>

      <div class="device-browser-frame">
        <div class="browser-topbar">
          <div class="mac-dots">
            <span class="mac-dot mac-dot-red"></span>
            <span class="mac-dot mac-dot-yellow"></span>
            <span class="mac-dot mac-dot-green"></span>
          </div>
          <div class="browser-url-pill">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            <span>https://app.humai.eg/dashboard/employees</span>
          </div>
          <div style="font-size:9px; color:#94A3B8; font-weight:700;">AES-256 ENCRYPTED VAULT</div>
        </div>
        <div class="screenshot-img-container">
          <img src="${screenshotsMap['employee-vault'] || ''}" alt="Employee Vault Screenshot">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">1</span> ما تقدمه هذه الشاشة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>قنوات صرف متعددة:</strong> إمكانية تحديد وسيلة الدفع لكل موظف (InstaPay، تحويل بنكي، محفظة إلكترونية، كاش).</li>
            <li><strong>الخزينة الرقمية المشفرة (Document Vault):</strong> حفظ بطاقات الرقم القومي، عقود العمل، وشهادات الجيش بأمان.</li>
            <li><strong>ملف وظيفي متكامل:</strong> يشمل المسمى، نوع العقد، تاريخ التعيين، وتفاصيل التأمينات الاجتماعية.</li>
          </ul>
        </div>

        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">2</span> الإجراءات المتاحة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>إضافة موظف جديد (Onboarding):</strong> معالج إدخال سريع يولد الحساب ويرسل رابط تفعيل واتساب تلقائياً.</li>
            <li><strong>تحديث بيانات التحويل البنكي:</strong> تسجيل معرف InstaPay (IPA) أو الآيبان المصرفي (IBAN) بدقة.</li>
            <li><strong>تصدير قاعدة البيانات:</strong> استخراج تقرير CSV كامل متوافق مع متطلبات مكاتب العمل والتأمينات.</li>
          </ul>
        </div>
      </div>

      <div class="pro-tip-box">
        <strong style="color: #065F46; font-size: 11px; display: block; margin-bottom: 2px;">💡 نصائح وحالات استثنائية:</strong>
        <p style="font-size: 10.5px; color: #047857; line-height: 1.5;">
          • التحويل عبر InstaPay يوفر تسوية فورية للرواتب على مدار 24 ساعة طوال أيام الأسبوع بما في ذلك العطلات الرسمية.<br>
          • يتم تخزين جميع المستندات في حاويات سحابية مشفرة بتشفير AES-256 مع عزل صارم بين المستأجرين (Tenant Isolation).
        </p>
      </div>
    </div>

    <div class="document-footer">
      <span>منصة HumAi للإدارة الذكية</span>
      <span>دليل السوبر أدمن — القيادة والضبط</span>
      <span>صفحة 12</span>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       SECTION 11: PAYROLL ENGINE (محرك مسيرات الرواتب)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet" id="view-11">
    <div>
      <div class="document-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:900; color:#0F172A; font-size:15px;">HUM<span style="color:#10B981;">Λ</span>I</span>
          <span style="font-size:11px; color:#64748B;">| دليل السوبر أدمن: الشؤون المالية</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#8B5CF6;">3.4 محرك الرواتب والتحويل الآلي</span>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 20px; color: #0F172A; font-weight: 900;">
          3.4 محرك حساب واعتماد مسيرات الرواتب (Automated Payroll Engine)
        </h2>
        <p style="font-size: 11px; color: #64748B;">
          حساب الدورة المالية (26-25)، احتساب النسب للأيام المجتزأة، تسوية السلف، والربط المصرفي.
        </p>
      </div>

      <div class="device-browser-frame">
        <div class="browser-topbar">
          <div class="mac-dots">
            <span class="mac-dot mac-dot-red"></span>
            <span class="mac-dot mac-dot-yellow"></span>
            <span class="mac-dot mac-dot-green"></span>
          </div>
          <div class="browser-url-pill">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            <span>https://app.humai.eg/dashboard/payroll</span>
          </div>
          <div style="font-size:9px; color:#10B981; font-weight:700;">CYCLE: 26TH - 25TH ACTIVE</div>
        </div>
        <div class="screenshot-img-container">
          <img src="${screenshotsMap['payroll-engine'] || ''}" alt="Payroll Engine Screenshot">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">1</span> ما تقدمه هذه الشاشة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>محرك الاحتساب النسبي (Proration Matrix):</strong> احتساب أجور المعينين الجدد باليوم والساعة بدقة متناهية.</li>
            <li><strong>تسوية السلف التلقائية:</strong> استقطاع أقساط السلف المعتمدة تلقائياً قبل حساب صافي التحويل.</li>
            <li><strong>تطبيق شرائح الضرائب والتأمينات:</strong> خيارات تشغيل/تعطيل مرنة لحساب ضرائب الدخل والتأمينات الاجتماعية.</li>
          </ul>
        </div>

        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">2</span> الإجراءات المتاحة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>مراجعة وتعديل المسودة:</strong> فحص كافة المستحقات والاستقطاعات وإجراء أي تعديل يدوي طارئ.</li>
            <li><strong>إقفال الدورة المالية (Lock Payroll):</strong> تجميد البيانات ومنع أي تعديل لاحق عليها لحماية النزاهة.</li>
            <li><strong>تصدير ملف البنك (WPS / ACH Export):</strong> توليد ملف الصرف المباشر للبنوك المصرية ونظام حماية الأجور.</li>
          </ul>
        </div>
      </div>

      <div class="pro-tip-box">
        <strong style="color: #065F46; font-size: 11px; display: block; margin-bottom: 2px;">💡 نصائح وحالات استثنائية:</strong>
        <p style="font-size: 10.5px; color: #047857; line-height: 1.5;">
          • في حال تم تعيين موظف في منتصف الشهر (مثلاً يوم 11)، يقوم النظام بتقسيم الراتب الأساسي على 30 يوماً وضرب الناتج في 14 يوماً عمل.<br>
          • بمجرد النقر على "إقفال الدورة"، تصبح قسائم الرواتب متاحة فوراً في حسابات الموظفين مع إرسال إشعارات الاستلام.
        </p>
      </div>
    </div>

    <div class="document-footer">
      <span>منصة HumAi للإدارة الذكية</span>
      <span>دليل السوبر أدمن — القيادة والضبط</span>
      <span>صفحة 13</span>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       SECTION 12: AUDIT TRAIL & GOVERNANCE (سجل التدقيق والحوكمة)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet" id="view-12">
    <div>
      <div class="document-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:900; color:#0F172A; font-size:15px;">HUM<span style="color:#10B981;">Λ</span>I</span>
          <span style="font-size:11px; color:#64748B;">| دليل السوبر أدمن: الحوكمة والامتثال</span>
        </div>
        <span style="font-size:11px; font-weight:700; color:#8B5CF6;">3.5 سجل التدقيق والامتثال</span>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 20px; color: #0F172A; font-weight: 900;">
          3.5 سجل التدقيق والحوكمة المؤسسية (Audit Trail & Governance)
        </h2>
        <p style="font-size: 11px; color: #64748B;">
          الرقابة الأمنية الصارمة على كافة التعديلات، تبريرات الحضور، التجاوزات المالية، وتغييرات النظام.
        </p>
      </div>

      <div class="device-browser-frame">
        <div class="browser-topbar">
          <div class="mac-dots">
            <span class="mac-dot mac-dot-red"></span>
            <span class="mac-dot mac-dot-yellow"></span>
            <span class="mac-dot mac-dot-green"></span>
          </div>
          <div class="browser-url-pill">
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            <span>https://app.humai.eg/dashboard/audit-logs</span>
          </div>
          <div style="font-size:9px; color:#94A3B8; font-weight:700;">IMMUTABLE AUDIT LOG</div>
        </div>
        <div class="screenshot-img-container">
          <img src="${screenshotsMap['audit-trail'] || ''}" alt="Audit Trail Screenshot">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">1</span> ما تقدمه هذه الشاشة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>سجل غير قابل للتعديل (Immutable Log):</strong> توثيق دقيق لكل عملية: من قام بها (Actor)، متى، ومن أي IP.</li>
            <li><strong>توثيق الفروقات الزمنية (JSON Diff):</strong> إظهار القيمة قبل التعديل وبعده (مثل: الخصم من 150 إلى 0 جنيه).</li>
            <li><strong>تصنيف العمليات الحساسة:</strong> فرز سريع بين العمليات المالية، إعدادات الفروع، وتجاوزات البصمة.</li>
          </ul>
        </div>

        <div class="info-card">
          <h4 style="font-size: 12px; color: #0F172A; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">
            <span class="badge-number">2</span> الإجراءات المتاحة
          </h4>
          <ul style="padding-right: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
            <li><strong>فحص ومراجعة التجاوزات الإدارية:</strong> معرفة أي تدخل يدوي قام به المديرون المباشرون ومبرراتهم.</li>
            <li><strong>التصفية بالأفراد والتواريخ:</strong> تتبع نشاط مسؤول معين خلال فترة زمنية محددة بدقة.</li>
            <li><strong>تصدير السجل الرسمي لجهات التدقيق:</strong> استخراج تقرير مشفر لتقديمه للمدققين الماليين الخارجيين.</li>
          </ul>
        </div>
      </div>

      <div class="pro-tip-box">
        <strong style="color: #065F46; font-size: 11px; display: block; margin-bottom: 2px;">💡 نصائح وحالات استثنائية:</strong>
        <p style="font-size: 10.5px; color: #047857; line-height: 1.5;">
          • سجل التدقيق لا يمكن حذفه أو التعديل عليه حتى من قِبل السوبر أدمن، مما يضمن أعلى معايير الحوكمة المؤسسية والنزاهة.<br>
          • يتم تخزين عنوان بروتوكول الإنترنت (IP Address) ونوع المتصفح المستخدم لكل عملية لمنع التلاعب أو الدخول غير المصرح به.
        </p>
      </div>
    </div>

    <div class="document-footer">
      <span>منصة HumAi للإدارة الذكية</span>
      <span>دليل السوبر أدمن — القيادة والضبط</span>
      <span>صفحة 14</span>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════
       BACK COVER & SUPPORT DIRECTORY (الغلاف الخلفي والدعم الفني)
       ═══════════════════════════════════════════════════════════════════ -->
  <section class="page-sheet dark-divider">
    <div style="max-width: 580px; margin: 0 auto; padding: 20px;">
      
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 20px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); margin-bottom: 20px;">
        <svg width="34" height="34" viewBox="0 0 60 56" fill="none">
          <circle cx="14" cy="10" r="5.5" fill="#FFFFFF"/>
          <rect x="9" y="19" width="10" height="28" rx="5" fill="#FFFFFF"/>
          <circle cx="46" cy="10" r="5.5" fill="#10B981"/>
          <rect x="41" y="19" width="10" height="28" rx="5" fill="#10B981"/>
          <path d="M 18 29 C 23 37, 37 37, 42 29 C 40 37, 20 37, 18 29 Z" fill="#10B981"/>
        </svg>
      </div>

      <h2 style="font-size: 28px; font-weight: 900; color: #FFFFFF; margin-bottom: 10px;">
        منظومة <span style="color: #10B981;">هُم آي (HumAi)</span> الذكية
      </h2>
      <p style="font-size: 13px; color: #94A3B8; line-height: 1.8; margin-bottom: 28px;">
        الجيل القادم من إدارة الموارد البشرية والرواتب المؤتمتة، المصممة خصيصاً لتمكين الشركات الطموحة في مصر والشرق الأوسط عبر حلول سحابية فائقة الأمان ومساعد ذكاء اصطناعي فوري.
      </p>

      <!-- Contact & Channels Box -->
      <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; padding: 18px; text-align: right; margin-bottom: 30px;">
        <h4 style="font-size: 13px; color: #34D399; font-weight: 800; margin-bottom: 12px; text-align: center;">قنوات الدعم الفني وخدمة العملاء على مدار الساعة</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11.5px; color: #CBD5E1;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #10B981;">💬</span>
            <span>مساعد واتساب المؤسسي:</span>
            <strong style="color: #FFFFFF; font-family: 'Inter', monospace; direction: ltr;">+20 100 000 0000</strong>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #10B981;">✉️</span>
            <span>البريد الإلكتروني للدعم:</span>
            <strong style="color: #FFFFFF; font-family: 'Inter', monospace; direction: ltr;">support@humai.eg</strong>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #10B981;">🌐</span>
            <span>بوابة العملاء والمستندات:</span>
            <strong style="color: #FFFFFF; font-family: 'Inter', monospace; direction: ltr;">https://app.humai.eg</strong>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #10B981;">🔒</span>
            <span>شهادات الامتثال والأمان:</span>
            <strong style="color: #FFFFFF;">ISO 27001 & SOC 2 Ready</strong>
          </div>
        </div>
      </div>

      <div style="font-size: 10.5px; color: #64748B;">
        جميع الحقوق محفوظة © 2026 شركة هُم آي للحلول الذكية (HumAi Platform).<br>
        هذا المستند سري ومخصص لعملاء المنظومة وفرق العمل المعتمدة.
      </div>

    </div>
  </section>

</body>
</html>
`;
}

module.exports = {
  generateManualHtml
};
