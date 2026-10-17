/**
 * HumAi Visual Onboarding & Product Manual — HTML-to-PDF Master Template
 * Styled precisely with HumAi Enterprise Brand Identity:
 * - Deep Obsidian Navy (#0B0F17 / #0F172A)
 * - Radiant Emerald Green (#10B981 / #059669)
 * - Light Slate (#F8FAFC / #FFFFFF)
 * - Modern Arabic Sans Hierarchy (Cairo / Inter)
 * - Full-Page Dedicated Section Dividers
 * - Numbered Callout Annotations & Device Frames
 * 
 * Strict Brand Guidelines:
 * - HumAi must NEVER be written in Arabic. Always strictly "HumAi" in English.
 * - 100% authentic system screenshots from live running system.
 * - Every single option, setting, modal, tab, and button is explained accurately based on the codebase.
 */

function generateManualHtml(screenshotsMap) {
  // Helper for rendering screenshots inside modern device browser frames
  const renderFrame = (imgKey, title, urlText) => {
    const imgSrc = screenshotsMap[imgKey] || '';
    return `
      <div class="device-browser-frame">
        <div class="device-browser-header">
          <div class="device-dots">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
          </div>
          <div class="device-address-bar font-mono">
            <span class="lock-icon">🔒</span> https://app.humai.io${urlText}
          </div>
          <div class="device-header-title">${title}</div>
        </div>
        <div class="device-viewport">
          ${imgSrc ? `<img src="${imgSrc}" alt="${title}" class="viewport-img" />` : `<div class="viewport-placeholder">صورة الشاشة الحية: ${title}</div>`}
        </div>
      </div>
    `;
  };

  const renderFooter = (pageNumber) => `
    <div class="page-footer">
      <div class="footer-brand">
        <div class="footer-logo">H</div>
        <span>HumAi Enterprise Core v2.4</span>
      </div>
      <div class="footer-doc-info">دليل التشغيل والاستخدام المعتمد — سري ومخصص للاستخدام الداخلي</div>
      <div class="footer-page-num">${pageNumber}</div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>دليل الاستخدام والتشغيل الشامل — منصة HumAi</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
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
      font-size: 11px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    .page-sheet {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      padding: 12mm 15mm 10mm 15mm;
      position: relative;
      page-break-after: always;
      break-after: page;
      background-color: #FFFFFF;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    .page-sheet.cover-page {
      background: radial-gradient(circle at 80% 20%, #162438 0%, #0B0F17 60%, #05070B 100%);
      color: #FFFFFF;
      padding: 20mm 18mm 16mm 18mm;
    }

    .page-sheet.dark-divider {
      background: radial-gradient(circle at 50% 30%, #162438 0%, #0B0F17 70%, #05070B 100%);
      color: #FFFFFF;
      justify-content: space-between;
      padding: 20mm 18mm 16mm 18mm;
    }

    h1, h2, h3, h4, h5 {
      font-weight: 800;
      line-height: 1.25;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .font-mono {
      font-family: 'Inter', monospace;
    }

    .emerald-text { color: #10B981; }
    .emerald-bg { background-color: #10B981; }
    .emerald-border { border-color: #10B981; }

    /* Device Mockup Frame */
    .device-browser-frame {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 14px -2px rgba(15, 23, 42, 0.08);
      background-color: #FFFFFF;
      margin: 6px 0 10px 0;
    }

    .device-browser-header {
      background-color: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
      padding: 5px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      direction: ltr;
    }

    .device-dots {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot-red { background-color: #EF4444; }
    .dot-yellow { background-color: #F59E0B; }
    .dot-green { background-color: #10B981; }

    .device-address-bar {
      flex: 1;
      max-width: 380px;
      background-color: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 5px;
      padding: 2px 8px;
      font-size: 9.5px;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .device-header-title {
      font-size: 10px;
      font-weight: 700;
      color: #0F172A;
      direction: rtl;
    }

    .device-viewport {
      width: 100%;
      background-color: #0B0F17;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .viewport-img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
      max-height: 480px;
    }

    .viewport-placeholder {
      padding: 40px;
      color: #94A3B8;
      font-size: 11px;
      text-align: center;
    }

    /* Header Nav */
    .page-header-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #F1F5F9;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }

    .page-header-title {
      font-size: 10px;
      font-weight: 700;
      color: #64748B;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .page-header-brand {
      font-size: 11px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: -0.3px;
    }

    /* Badges */
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 9999px;
      font-size: 9.5px;
      font-weight: 700;
    }

    .badge-emerald {
      background-color: #ECFDF5;
      color: #059669;
      border: 1px solid #A7F3D0;
    }

    .badge-blue {
      background-color: #EFF6FF;
      color: #2563EB;
      border: 1px solid #BFDBFE;
    }

    .badge-purple {
      background-color: #FAF5FF;
      color: #7E22CE;
      border: 1px solid #E9D5FF;
    }

    .badge-amber {
      background-color: #FFFBEB;
      color: #D97706;
      border: 1px solid #FDE68A;
    }

    .badge-navy {
      background-color: #0F172A;
      color: #F8FAFC;
    }

    /* Numbered Callout Cards */
    .callouts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 6px;
    }

    .callout-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 8px 10px;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .callout-num {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #FFFFFF;
      font-weight: 800;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      shrink: 0;
      margin-top: 2px;
    }

    .callout-content {
      flex: 1;
    }

    .callout-title {
      font-size: 11px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 2px;
    }

    .callout-desc {
      font-size: 10px;
      color: #475569;
      line-height: 1.45;
    }

    /* Alerts */
    .pro-tip-box {
      background: #F0FDF4;
      border-right: 3px solid #10B981;
      border-radius: 0 6px 6px 0;
      padding: 6px 10px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 10px;
      color: #065F46;
    }

    .warning-box {
      background: #FFFBEB;
      border-right: 3px solid #F59E0B;
      border-radius: 0 6px 6px 0;
      padding: 6px 10px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 10px;
      color: #92400E;
    }

    /* Page Footer */
    .page-footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 6px;
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #64748B;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      color: #0F172A;
    }

    .footer-logo {
      width: 14px;
      height: 14px;
      border-radius: 4px;
      background-color: #10B981;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: 900;
    }

    .footer-page-num {
      font-weight: 800;
      color: #0F172A;
      background: #F1F5F9;
      padding: 2px 8px;
      border-radius: 4px;
    }

    /* Tables */
    .spec-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin: 6px 0;
    }

    .spec-table th {
      background-color: #0F172A;
      color: #FFFFFF;
      padding: 6px 10px;
      text-align: right;
      font-weight: 700;
      border: 1px solid #1E293B;
    }

    .spec-table td {
      padding: 5px 10px;
      border: 1px solid #E2E8F0;
      color: #334155;
    }

    .spec-table tr:nth-child(even) td {
      background-color: #F8FAFC;
    }
  </style>
</head>
<body>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 1: MASTER COVER PAGE
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet cover-page">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: #FFFFFF;">H</div>
        <div>
          <div style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF;">HumAi</div>
          <div style="font-size: 10px; color: #10B981; font-weight: 700; letter-spacing: 0.5px;">SMART HR & OPERATIONS PLATFORM</div>
        </div>
      </div>
      <div class="badge-pill badge-emerald" style="font-size: 10.5px; padding: 5px 14px;">Enterprise Release 2026.1</div>
    </div>

    <div style="margin: 40px 0;">
      <div class="badge-pill badge-navy" style="border: 1px solid #1E293B; margin-bottom: 16px; font-size: 11.5px; padding: 6px 14px; color: #10B981;">
        ✦ الدليل المرجعي والتشغيلي المعتمد والشامل مع لقطات حية من النظام
      </div>
      <h1 style="font-size: 34px; font-weight: 900; line-height: 1.25; margin-bottom: 16px; color: #FFFFFF;">
        دليل الاستخدام والتشغيل الشامل<br>
        <span style="color: #10B981;">لمنظومة HumAi المؤسسية</span>
      </h1>
      <p style="font-size: 13.5px; color: #94A3B8; max-width: 620px; line-height: 1.65;">
        مرجع تشغيلي وتقني متكامل يوثق خطوة بخطوة كافة الشاشات الحية، الإجراءات اليومية، محركات الاحتساب الآلية، وسياسات الحوكمة لمختلف الأدوار: الموظفين، مدراء الأقسام، والسوبر أدمن.
      </p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 25px;">
      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px;">
        <div style="color: #10B981; font-size: 11px; font-weight: 800; margin-bottom: 3px;">التهيئة والتأسيس</div>
        <div style="font-size: 12px; font-weight: 700; color: #F8FAFC;">خطوات التفعيل الـ 5</div>
        <div style="font-size: 9.5px; color: #94A3B8; margin-top: 3px;">تفعيل الحساب، هوية المؤسسة، الفروع وGPS، الورديات، ودعوة الفريق.</div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px;">
        <div style="color: #10B981; font-size: 11px; font-weight: 800; margin-bottom: 3px;">الجزء الأول</div>
        <div style="font-size: 12px; font-weight: 700; color: #F8FAFC;">دليل الموظف اليومي</div>
        <div style="font-size: 9.5px; color: #94A3B8; margin-top: 3px;">الحضور الذكي، طلب الإجازات، السلف، تبديل الورديات، وقسائم الراتب.</div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px;">
        <div style="color: #10B981; font-size: 11px; font-weight: 800; margin-bottom: 3px;">الجزء الثاني</div>
        <div style="font-size: 12px; font-weight: 700; color: #F8FAFC;">دليل المدير المباشر</div>
        <div style="font-size: 9.5px; color: #94A3B8; margin-top: 3px;">المراقبة الحية للحضور، مركز الاعتمادات، المبيعات، والتقييم الربعي.</div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px;">
        <div style="color: #10B981; font-size: 11px; font-weight: 800; margin-bottom: 3px;">الجزء الثالث</div>
        <div style="font-size: 12px; font-weight: 700; color: #F8FAFC;">دليل السوبر أدمن</div>
        <div style="font-size: 9.5px; color: #94A3B8; margin-top: 3px;">مركز الذكاء، مسير الرواتب 26-25، العقود، والضبط الشامل.</div>
      </div>
    </div>

    <div style="border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #64748B;">
      <div>الإصدار: HumAi Enterprise Core v2.4 (Egyptian Labor Law Compliant)</div>
      <div>تاريخ التوثيق: أكتوبر 2026</div>
      <div>سري ومخصص للاستخدام المؤسسي الداخلي</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 2: ONBOARDING & INITIAL SETUP (5 STEPS SETUP WIZARD)
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">مرحلة التأسيس — خطوات الإعداد والتهيئة الأولي لمنظومة HumAi</div>
        <div class="page-header-brand">HumAi Onboarding</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 16px; color: #0F172A;">خطوات التهيئة الـ 5 لتأسيس بيئة العمل بعد رابط التفعيل</h2>
          <span class="badge-pill badge-emerald">Onboarding Setup Wizard</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          بمجرد استلام المنظمة لرابط التفعيل المؤسسي الفريد (<span class="font-mono">/onboarding?token=...</span>)، يوجه معالج التهيئة السوبر أدمن عبر 5 خطوات تأسيسية متتابعة لضبط البيئة التشغيلية:
        </p>
      </div>

      ${renderFrame('onboarding-wizard', 'معالج تفعيل الحساب وتأسيس المنظمة (Setup Wizard)', '/onboarding?token=...')}

      <div class="callouts-grid" style="grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px;">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">الخطوة 1: تفعيل الحساب وحساب السوبر أدمن الرئيسي</div>
            <div class="callout-desc">التحقق اللحظي من توقيع وصلاحية رمز التفعيل المخصص للشركة، ثم إنشاء الحساب الإداري الأعلى (الاسم الكامل، البريد المؤسسي، وتعيين كلمة المرور الرئيسية).</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">الخطوة 2: هوية وبيانات المؤسسة ومجال العمل</div>
            <div class="callout-desc">تحديد الاسم الرسمي للمؤسسة وقطاع النشاط (عقارات، تجزئة، رعاية صحية، تعليم، استشارات، تصنيع، وكالات وغيرها) لتهيئة قوالب النظام المناسبة.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">الخطوة 3: تفعيل الميزات ونظام الموافقات</div>
            <div class="callout-desc">اختيار الميزات النشطة: نظام الورديات المتعددة، السلف المالية، عمولات المبيعات، التأمينات والضرائب، ونمط اعتماد الإجازات (اعتماد تلقائي أم هرمي ذو مرحلتين).</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">الخطوة 4: مواعيد العمل الافتراضية والفروع والجيوفنسينج</div>
            <div class="callout-desc">تحديد ساعات البداية والنهاية الافتراضية وأيام العمل الأسبوعية، وإضافة أول فرع للشركة مع حل رابط خرائط جوجل تلقائياً وضبط نصف قطر الحضور الجغرافي (Geofence).</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ الخطوة 5 (إتمام التهيئة ودعوة الفريق):</strong> فور حفظ المعالج، يقوم النظام بتوليد بيئة العمل المعزولة في السحابة وإنشاء الفرع وسجلات الإعدادات وتوجيه السوبر أدمن لغرفة القيادة لإضافة الموظفين وتعيين وردياتهم.
      </div>
    </div>
    ${renderFooter(2)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 3: TABLE OF CONTENTS
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">فهرس المحتويات الشامل والتفاعلي للمنظومة</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 17px; color: #0F172A; margin-bottom: 3px;">خريطة الدليل وفهرس الأقسام التشغيلية</h2>
        <p style="color: #64748B; font-size: 10.5px;">دليل مرجعي شامل مقسم إلى 3 أجزاء رئيسية مسبوقة بمرحلة التهيئة، مع فواصل مستقلة لكل فئة وظيفية:</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
            <div style="color: #059669; font-weight: 800; font-size: 11px; margin-bottom: 6px;">مرحلة التأسيس ودليل الموظف (Part I)</div>
            <ul style="list-style: none; font-size: 10px; color: #334155; line-height: 1.8;">
              <li><strong>ص 2:</strong> معالج تفعيل الحساب والتهيئة الأولي (خطوات الـ 5 Setup)</li>
              <li><strong>ص 4:</strong> فاصل قسم: دليل الموظف اليومي (Employee Workspace)</li>
              <li><strong>ص 5:</strong> بوابة تسجيل الدخول والأمان متعدد المستأجرين (/login)</li>
              <li><strong>ص 6:</strong> مساحة العمل وإثبات الحضور بالـ GPS Geofence (/dashboard/employee)</li>
              <li><strong>ص 7:</strong> تقديم طلبات الإجازات والأذونات ودليل حساب الأرصدة (/dashboard/leaves)</li>
              <li><strong>ص 8:</strong> طلبات السلف المالية، تبديل الورديات، وتسجيل إنجاز الأهداف KPIs</li>
              <li><strong>ص 9:</strong> كشف الحضور والتايم شيت وساعات العمل وتصدير CSV (/dashboard/attendance)</li>
              <li><strong>ص 10:</strong> قسائم الرواتب الرقمية المعتمدة وتفصيل الاستحقاقات (/dashboard/payslips)</li>
            </ul>
          </div>

          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px;">
            <div style="color: #0284C7; font-weight: 800; font-size: 11px; margin-bottom: 6px;">الجزء الثاني: دليل المدير المباشر (Part II)</div>
            <ul style="list-style: none; font-size: 10px; color: #334155; line-height: 1.8;">
              <li><strong>ص 11:</strong> فاصل قسم: دليل المدير المباشر (Department Manager)</li>
              <li><strong>ص 12:</strong> لوحة المراقبة الحية للحضور ومؤشرات إنجاز الفريق (/dashboard/manager)</li>
              <li><strong>ص 13:</strong> مركز اعتمادات الفريق (إجازات، أذونات، وبدلات تشغيل العطلات)</li>
              <li><strong>ص 14:</strong> سجل مبيعات الفريق وعمولات الإغلاق البيعية (/dashboard/sales)</li>
              <li><strong>ص 15:</strong> التقييم الربع سنوي ومعايير النجوم الأربعة (/dashboard/evaluations)</li>
            </ul>
          </div>
        </div>

        <div>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px;">
            <div style="color: #7C3AED; font-weight: 800; font-size: 11px; margin-bottom: 6px;">الجزء الثالث: دليل السوبر أدمن والقيادة المركزية (Part III)</div>
            <ul style="list-style: none; font-size: 10px; color: #334155; line-height: 1.8;">
              <li><strong>ص 16:</strong> فاصل قسم: دليل السوبر أدمن والإدارة العليا (Command Center)</li>
              <li><strong>ص 17:</strong> مركز الذكاء والتحليلات المؤسسية وشرح كافة الـ Charts (/dashboard/admin)</li>
              <li><strong>ص 18:</strong> دليل الموظفين: خطوات إضافة موظف جديد وقنوات الصرف (/dashboard/employees)</li>
              <li><strong>ص 19:</strong> الهيكل التنظيمي وشجرة الأقسام وتوزيع الإشراف (/dashboard/departments)</li>
              <li><strong>ص 20:</strong> صانع ومحرر العقود القانونية ونماذج العمل الذكية (/dashboard/contracts)</li>
              <li><strong>ص 21:</strong> محرك الورديات والعمليات الليلية وبدل الورديات (/dashboard/shifts)</li>
              <li><strong>ص 22:</strong> محرك الرواتب الآلي ومسير دورة 26 إلى 25 والضرائب (/dashboard/payroll)</li>
              <li><strong>ص 23:</strong> سجل التدقيق الرقابي غير القابل للتلاعب وتتبع IP (/dashboard/audit-logs)</li>
              <li><strong>ص 24:</strong> إعدادات النظام 1: الفروع وضبط إحداثيات GPS Geofence (/dashboard/settings)</li>
              <li><strong>ص 25:</strong> إعدادات النظام 2: سياسات التأخير، السلف، وحوكمة الميزات (/dashboard/settings)</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 14px;">
        <strong>✦ معايير الجودة والامتثال في وثيقة HumAi:</strong> كافة الصور المرفقة مأخوذة مباشرة بدقة 2x DPI من النظام الحي وتوضح بيانات حقيقية مطابقة تماماً للمنطق البرمجي وقانون العمل المصري.
      </div>
    </div>
    ${renderFooter(3)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 4: FULL-PAGE SECTION DIVIDER 1 — PART I (EMPLOYEE GUIDE)
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet dark-divider">
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 32px; height: 32px; border-radius: 8px; background: #10B981; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; color: #FFFFFF;">H</div>
        <span style="font-size: 14px; font-weight: 800; color: #FFFFFF;">HumAi Platform</span>
      </div>
      <span class="badge-pill badge-emerald">PART I : EMPLOYEE GUIDE</span>
    </div>

    <div style="margin: auto 0; text-align: center; max-width: 580px; align-self: center;">
      <div style="display: inline-block; width: 70px; height: 70px; border-radius: 20px; background: rgba(16, 185, 129, 0.15); border: 1.5px solid #10B981; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px auto;">
        👤
      </div>
      <div class="badge-pill badge-navy" style="border: 1px solid #1E293B; margin-bottom: 14px; font-size: 11px; padding: 5px 14px; color: #10B981;">
        دليل الخدمات الذاتية ومساحة العمل اليومية للموظف
      </div>
      <h1 style="font-size: 28px; font-weight: 900; color: #FFFFFF; line-height: 1.3; margin-bottom: 14px;">
        الجزء الأول: دليل الموظف<br>
        <span style="color: #10B981;">Employee Daily Workspace & Self-Service</span>
      </h1>
      <p style="font-size: 12.5px; color: #94A3B8; line-height: 1.7;">
        دليل تفصيلي يوجه الموظف خطوة بخطوة في استخدام مساحة عمله اليومية: تسجيل الحضور والانصراف بالـ GPS، تقديم طلبات الإجازات والأذونات الرسمية ومتابعة رصيدها، طلب السلفيات وتبديل الورديات، تسجيل إنجاز الأهداف اليومية، واستعراض قسائم الرواتب المعتمدة.
      </p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 25px; text-align: right;">
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px;">
          <div style="color: #10B981; font-weight: 800; font-size: 10.5px;">الحضور الذكي</div>
          <div style="color: #E2E8F0; font-size: 9.5px; margin-top: 2px;">إثبات التواجد الجغرافي داخل الفرع بالـ GPS والعداد اللحظي.</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px;">
          <div style="color: #10B981; font-weight: 800; font-size: 10.5px;">الإجازات والسلف</div>
          <div style="color: #E2E8F0; font-size: 9.5px; margin-top: 2px;">تقديم الإجازة العارضة والاعتيادية والسلف وتبديل الورديات.</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px;">
          <div style="color: #10B981; font-weight: 800; font-size: 10.5px;">قسائم الرواتب</div>
          <div style="color: #E2E8F0; font-size: 9.5px; margin-top: 2px;">استعراض وطباعة مفردات الراتب الشهرية وصافي المستحقات.</div>
        </div>
      </div>
    </div>

    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #64748B; width: 100%;">
      <div>HumAi Enterprise Documentation</div>
      <div>الصفحة 4</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 5: LOGIN & AUTHENTICATION PORTAL
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الأول: دليل الموظف — بوابة تسجيل الدخول والأمان</div>
        <div class="page-header-brand">HumAi Auth Portal</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">1.1 بوابة تسجيل الدخول الموحدة والأمان المؤسسي (/login)</h2>
          <span class="badge-pill badge-emerald">Secure Session Gate</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          نقطة الدخول المركزية الموحدة لكافة مستخدمي المنظومة، وتتضمن تشفيراً آمناً لجلسات العمل مع التحقق التلقائي من ارتباط الموظف بمؤسسته:
        </p>
      </div>

      ${renderFrame('login-portal', 'بوابة تسجيل الدخول الآمنة', '/login')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">البريد الإلكتروني المؤسسي وكلمة المرور</div>
            <div class="callout-desc">إدخال البريد المسجل للموظف في قاعدة بيانات الشركة مع كلمة المرور المشفرة بتقنيات Argon2 السحابية المقاومة للاختراق.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">التحقق من المؤسسة (Tenant Routing)</div>
            <div class="callout-desc">يقوم النظام تلقائياً بتحديد هوية الشركة التابع لها الموظف وتطبيق سياساتها الخاصة من فروع وورديات ومسارات صرف.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">التوجيه التلقائي بحسب الصلاحية (Role Routing)</div>
            <div class="callout-desc">بمجرد التحقق، يوجه النظام الموظف لمساحة العمل الشخصية، أو المدير للوحة الإشراف، أو السوبر أدمن لغرفة العمليات المركزية.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">جلسات العمل المستمرة والحماية الأمنية</div>
            <div class="callout-desc">حفظ آمن لجلسة تسجيل الدخول مع منع الجلسات المزدوجة المتزامنة وتسجيل كل عملية دخول في سجل التدقيق الرقابي.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ نصيحة للموظف:</strong> في حال نسيت كلمة المرور، يمكنك الضغط على "نسيت كلمة المرور" لاستلام رابط استعادة فوري على بريدك الإلكتروني المعتمد لدى الشركة.
      </div>
    </div>
    ${renderFooter(5)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 6: SMART ATTENDANCE WORKSPACE
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الأول: دليل الموظف — مساحة العمل وإثبات الحضور بالـ GPS</div>
        <div class="page-header-brand">HumAi Smart Attendance</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">1.2 مساحة العمل اليومية وإثبات الحضور الذكي بالـ GPS (/dashboard/employee)</h2>
          <span class="badge-pill badge-emerald">Geofenced GPS Check-In</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          الواجهة اليومية الرئيسية للموظف لإثبات تواجده الفعلي في مقر الفرع أو عن بُعد مع العداد اللحظي لساعات العمل:
        </p>
      </div>

      ${renderFrame('smart-attendance', 'مساحة عمل الموظف وتسجيل الحضور بالـ GPS', '/dashboard/employee')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">زر تسجيل الحضور بالـ GPS (Check-In)</div>
            <div class="callout-desc">يتحقق النظام من مطابقة إحداثيات موقع الموظف مع النطاق الجغرافي المحدد للفرع (مثلاً 150 متراً). لا يُقبل الحضور خارج النطاق إلا للموظفين المصرح لهم بالعمل عن بعد.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">العداد اللحظي لساعات الوردية الحالية</div>
            <div class="callout-desc">عرض تفاعلي لزمن الوردية المنقضي، إجمالي الدقائق المحتسبة، وتحديد ما إذا كان الموظف ضمن فترة السماح أو دخل في عداد العمل الإضافي (Overtime).</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">زر تسجيل الانصراف وإنهاء الوردية (Check-Out)</div>
            <div class="callout-desc">حساب دقيق لصافي ساعات العمل المنجزة وتوثيق وقت الانصراف الفعلي في التايم شيت مع إمكانية إضافة ملاحظة إدارية عند الانصراف.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">بطاقات الإجراءات السريعة (Action Cards)</div>
            <div class="callout-desc">وصول فوري من داخل مساحة العمل إلى: نافذة طلب السلفة المالية، نموذج طلب تبديل الوردية، وطلب الإجازات والأذونات الرسمية.</div>
          </div>
        </div>
      </div>

      <div class="warning-box" style="margin-top: 8px;">
        <strong>⚠️ تنبيه انضباطي:</strong> الإغلاق الآلي للورديات المنسية: يقوم محرك HumAi تلقائياً بإغلاق أي وردية لم يسجل الموظف انصرافها قبل بدء اليوم التالي مع وسمها إدارياً للمراجعة.
      </div>
    </div>
    ${renderFooter(6)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 7: LEAVE & ABSENCE REQUEST LEDGER (HOW EMPLOYEE REQUESTS)
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الأول: دليل الموظف — تقديم طلبات الإجازات والأذونات والأرصدة</div>
        <div class="page-header-brand">HumAi Leaves Engine</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">1.3 تقديم طلبات الإجازات والأذونات ومتابعة الأرصدة المتبقية (/dashboard/leaves)</h2>
          <span class="badge-pill badge-emerald">Leave Request Engine</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          دليل تقديم الموظف لطلبات الغياب الرسمية، مع الحساب التلقائي للأرصدة المستحقة ومتابعة مراحل الموافقة:
        </p>
      </div>

      ${renderFrame('leaves-ledger', 'دفتر رصيد الإجازات وسجل طلبات الموظف', '/dashboard/leaves')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">خطوة 1: اختيار نوع الطلب (Request Type)</div>
            <div class="callout-desc">الاختيار بين: <strong>إجازة اعتيادية سنوية</strong> (تُخصم من رصيد الـ 21 يوماً)، <strong>إجازة عارضة</strong> (بحد أقصى يومين متتاليين و 6-7 أيام سنوياً)، <strong>إذن ساعي</strong> (ساعات محددة خلال اليوم)، أو <strong>تعويض عطلة رسمية</strong>.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">خطوة 2: تحديد فترة الغياب والمبرر الإداري</div>
            <div class="callout-desc">اختيار تاريخ البداية والنهاية عبر الروزنامة، وكتابة سبب الإجازة أو المبرر الإلزامي، مع إمكانية إرفاق تقرير طبي في حالات الإجازات المرضية.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">خطوة 3: التحقق الفوري من الرصيد المتبقي</div>
            <div class="callout-desc">يقوم النظام فورياً بفحص رصيد الموظف المتاح؛ وفي حال تجاوز الرصيد أو طلب عارضة أكثر من يومين يظهر تنبيه فوري بالسياسة المتبعة قبل الإرسال.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">متابعة حالة الطلب في السجل الحي</div>
            <div class="callout-desc">يتابع الموظف حالة طلبه: <span class="badge-pill badge-amber">معلق قيد المراجعة</span>، <span class="badge-pill badge-emerald">معتمد</span> (يتم الخصم تلقائياً من الرصيد)، أو <span class="badge-pill badge-navy">مرفوض</span> مع ظهور سبب الرفض المدون من المدير.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ رصيد تعويضات العطلات الرسمية:</strong> عند عمل الموظف في يوم عطلة رسمية واعتماده من مديره، يُضاف يوم إجازة تعويضي تلقائياً في رصيده يُمكّنه من استخدامه دون استهلاك رصيده السنوي.
      </div>
    </div>
    ${renderFooter(7)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 8: ADVANCES, SHIFT SWAPS & KPI LOGGING
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الأول: دليل الموظف — طلبات السلف المالية، تبديل الورديات، والأهداف اليومية</div>
        <div class="page-header-brand">HumAi Employee Actions</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">1.4 طلبات السلف، تبديل الوردية مع زميل، وإدخال الأهداف اليومية</h2>
          <span class="badge-pill badge-emerald">Self-Service Actions</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          خدمات الموظف الذاتية لطلب السلفة على الراتب، تنسيق تبديل الورديات لتفادي الغياب، وتسجيل إنجاز المهام اليومية:
        </p>
      </div>

      <div class="callouts-grid" style="grid-template-columns: 1fr; gap: 8px;">
        <div class="callout-card">
          <div class="callout-num">💰</div>
          <div class="callout-content">
            <div class="callout-title">كيفية طلب سلفة مالية (Salary Advance Request Modal)</div>
            <div class="callout-desc">
              1. يضغط الموظف على زر "طلب سلفة مالية" من كروت مساحة العمل.<br>
              2. يفحص النظام أهلية الموظف وسقف السلفة (حتى 50% من الراتب الأساسي، وبعد تاريخ الأهلية المحدد شهرياً كالـ 15 من الشهر).<br>
              3. يدخل الموظف المبلغ المطلوب في حدود السقف الأقصى، ويحدد شهر استقطاع السلفة من مسير الراتب القادم، ويكتب مبرر الطلب.<br>
              4. بمجرد الاعتماد، يظهر المبلغ معتمداً ويُخصم آلياً من قسيمة الراتب القادمة في مسير 26-25.
            </div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">🔄</div>
          <div class="callout-content">
            <div class="callout-title">كيفية تقديم طلب تبديل وردية مع زميل (Shift Swap Request)</div>
            <div class="callout-desc">
              1. يفتح الموظف بطاقة "طلب تبديل وردية" المتاحة في مساحة العمل.<br>
              2. يختار الزميل البديل من نفس القسم، ويحدد تاريخ الوردية المستهدفة والسبب التشغيلي للتبديل.<br>
              3. ينتقل الطلب إلى مدير القسم المباشر لضمان عدم حدوث عجز في طاقة العمل بالقسم، وفور الموافقة يتغير جدول الموظفين آلياً.
            </div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">🎯</div>
          <div class="callout-content">
            <div class="callout-title">تسجيل إنجاز الأهداف والإنتاجية ومتابعة الـ KPIs اليومية</div>
            <div class="callout-desc">
              1. يدخل الموظف على قسم "سجل مؤشرات الأداء والمهام اليومية" (<span class="font-mono">/dashboard/targets</span>).<br>
              2. يحدد التاريخ ويدخل الكمية المنجزة بالوحدة المعتمدة لوظيفته (مثل: مهام منجزة، مكالمات، عقود، تذاكر دعم، تصميمات).<br>
              3. تظهر نسبة إنجاز الهدف التراكمي في العداد اللحظي وشريط التقدم مقارنة بالهدف الشهري المعين له من الإدارة.
            </div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 10px;">
        <strong>✦ الربط المالي المباشر:</strong> كل سلفة معتمدة تظهر فوراً في قسيمة الراتب الرقمية، وكل إنجاز في الأهداف ينعكس مباشرة على التقييم الربع سنوي وعمولات الأداء المعتمدة.
      </div>
    </div>
    ${renderFooter(8)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 9: ATTENDANCE TIMESHEETS REGISTRY (LIVE DATA)
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الأول: دليل الموظف — سجل الحضور والانصراف والتايم شيت الرسمي</div>
        <div class="page-header-brand">HumAi Attendance Registry</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">1.5 كشف الحضور والانصراف وساعات العمل المعتمدة وتصدير CSV (/dashboard/attendance)</h2>
          <span class="badge-pill badge-emerald">Live Timesheet Registry</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          سجل تفصيلي موثق لكافة جلسات الحضور والانصراف اليومية والشهرية، مع فحص أوقات الدخول والخروج وصافي الساعات المحتسبة:
        </p>
      </div>

      ${renderFrame('attendance-timesheets', 'سجل الحضور والانصراف الحي مع فلاتر التاريخ وتصدير البيانات', '/dashboard/attendance')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">فلاتر التاريخ والأقسام والورديات</div>
            <div class="callout-desc">إمكانية تصفية السجل بحسب اليوم المحدد أو الشهر بالكامل، وتصفية الحالات: حاضر، قيد العمل (In Progress)، منتهية الوردية، أو متأخر.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">مؤشرات الإحصاء اللحظية لليوم</div>
            <div class="callout-desc">عرض إجمالي تسجيلات الحضور لليوم (Total Check-Ins)، عدد المتواجدين على رأس العمل حالياً (Currently On Duty)، والورديات المكتملة.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">احتساب دقيق لصافي ساعات العمل (Duration)</div>
            <div class="callout-desc">حساب آلي لزمن التواجد الفعلي (مثال: 8 ساعات و 30 دقيقة) مع توضيح وضع العمل (مقر الشركة Office أو عن بُعد Remote).</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">زر تصدير البيانات المعتمد (Export CSV)</div>
            <div class="callout-desc">تصدير فوري لكشف الحضور المفلتر بصيغة CSV المتوافقة مع جداول Excel لإجراء أي تقارير تدقيقية أو تقديمها للمالية.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ الشفافية التامة:</strong> يمكن للموظف مراجعة سجل حضوره بالكامل في أي وقت لضمان عدم وجود أي دقائق تأخير غير مبررة أو وردية غير مغلقة قبل موعد احتساب الرواتب.
      </div>
    </div>
    ${renderFooter(9)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 10: CERTIFIED DIGITAL PAYSLIPS
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الأول: دليل الموظف — قسائم الرواتب الرقمية المعتمدة</div>
        <div class="page-header-brand">HumAi Payslip Generator</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">1.6 قسائم الرواتب الرقمية المعتمدة وتفصيل الاستحقاقات والاستقطاعات (/dashboard/payslips)</h2>
          <span class="badge-pill badge-emerald">Itemized Payslip Stubs</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          استعراض قسيمة الراتب الشهرية الرسمية متضمنة التفقيط الدقيق والمطابقة الكاملة لقانون العمل المصري مع زر الطباعة:
        </p>
      </div>

      ${renderFrame('digital-payslips', 'قسيمة الراتب الشهرية المعتمدة مع التفقيط الكامل وقناة الصرف', '/dashboard/payslips')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">البيانات الوظيفية وقناة الصرف المعتمدة</div>
            <div class="callout-desc">توثيق اسم الموظف، المسمى الوظيفي، القسم، الرقم القومي، وقناة استلام المستحقات (محفظة InstaPay، تحويل بنكي IBAN، أو استلام نقدي Cash).</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">بند الاستحقاقات الإيجابية (Earnings Breakdown)</div>
            <div class="callout-desc">الراتب الأساسي التعاقدي، أجر ساعات العمل الإضافي المعتمدة، بدلات الورديات الليلية، عمولات مبيعات الصفقات المغلقة، والمكافآت التقديرية.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">بند الاستقطاعات المالية (Deductions Breakdown)</div>
            <div class="callout-desc">خصومات دقائق التأخير، أيام الغياب غير المبرر، استقطاع السلف المالية الممنوحة خلال الشهر، وحصص التأمينات الاجتماعية وضريبة الدخل.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">صافي الراتب القابل للصرف والتفقيط بالعربية</div>
            <div class="callout-desc">حساب صافي الأجر المستحق كتابةً ورقماً (تفقيط رسمي: فقط وقدره...) مع الختم الرقمي وزر طباعة أو تنزيل القسيمة بصيغة PDF.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ التوثيق القانوني:</strong> تعد قسائم رواتب HumAi مستنداً رقمياً رسمياً معتمداً ومؤرخاً بدقة وموثقاً في سجل التدقيق الرقابي للشركة.
      </div>
    </div>
    ${renderFooter(10)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 11: FULL-PAGE SECTION DIVIDER 2 — PART II (MANAGER GUIDE)
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet dark-divider">
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 32px; height: 32px; border-radius: 8px; background: #0284C7; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; color: #FFFFFF;">H</div>
        <span style="font-size: 14px; font-weight: 800; color: #FFFFFF;">HumAi Platform</span>
      </div>
      <span class="badge-pill badge-blue">PART II : DEPARTMENT MANAGER GUIDE</span>
    </div>

    <div style="margin: auto 0; text-align: center; max-width: 580px; align-self: center;">
      <div style="display: inline-block; width: 70px; height: 70px; border-radius: 20px; background: rgba(2, 132, 199, 0.15); border: 1.5px solid #0284C7; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px auto;">
        👥
      </div>
      <div class="badge-pill badge-navy" style="border: 1px solid #1E293B; margin-bottom: 14px; font-size: 11px; padding: 5px 14px; color: #38BDF8;">
        دليل الإشراف والاعتمادات الميدانية لمدراء الأقسام
      </div>
      <h1 style="font-size: 28px; font-weight: 900; color: #FFFFFF; line-height: 1.3; margin-bottom: 14px;">
        الجزء الثاني: دليل المدير المباشر<br>
        <span style="color: #38BDF8;">Department Manager Guide & Team Oversight</span>
      </h1>
      <p style="font-size: 12.5px; color: #94A3B8; line-height: 1.7;">
        دليل شامل لمدراء الأقسام ورؤساء فرق العمل لإدارة العمليات اليومية: المراقبة الحية لحضور وانصراف أعضاء الفريق، مركز فحص واعتماد طلبات الإجازات والأذونات، تسجيل عمولات مبيعات الصفقات، وتقييم أداء الموظفين وفق معايير النجوم الأربعة المعتمدة.
      </p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 25px; text-align: right;">
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px;">
          <div style="color: #38BDF8; font-weight: 800; font-size: 10.5px;">المراقبة الحية للحضور</div>
          <div style="color: #E2E8F0; font-size: 9.5px; margin-top: 2px;">متابعة تواجد الفريق اللحظي ونسب إنجاز المهام التشغيلية.</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px;">
          <div style="color: #38BDF8; font-weight: 800; font-size: 10.5px;">مركز الاعتمادات والبدلات</div>
          <div style="color: #E2E8F0; font-size: 9.5px; margin-top: 2px;">الموافقة والرفض المسبب للإجازات وتوثيق بدلات أيام العطلات.</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px;">
          <div style="color: #38BDF8; font-weight: 800; font-size: 10.5px;">المبيعات والتقييم الربعي</div>
          <div style="color: #E2E8F0; font-size: 9.5px; margin-top: 2px;">تدقيق الصفقات وتقييم الموظفين على معايير النجوم الأربعة.</div>
        </div>
      </div>
    </div>

    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #64748B; width: 100%;">
      <div>HumAi Enterprise Documentation</div>
      <div>الصفحة 11</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 12: LIVE TEAM MONITOR & PRODUCTIVITY INDEX
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثاني: دليل المدير المباشر — لوحة المراقبة الحية ومؤشرات إنجاز الفريق</div>
        <div class="page-header-brand">HumAi Team Command</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">2.1 لوحة القيادة اللحظية ومؤشر إنجاز أهداف الفريق (/dashboard/manager)</h2>
          <span class="badge-pill badge-blue">Live Team Monitor</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          مركز المراقبة الميداني المخصص لمدير القسم لمتابعة الحضور اللحظي، شريط تقدم الأهداف اليومية، والطلبات المعلقة:
        </p>
      </div>

      ${renderFrame('manager-overview', 'لوحة مراقبة المدير مع شريط إنجاز الأهداف وقائمة أعضاء القسم', '/dashboard/manager')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">أشرطة إنجاز الأهداف الحية (Live Productivity Index)</div>
            <div class="callout-desc">عرض تفاعلي مباشر لمعدل إنجاز كل موظف (مثل: أحمد محمود 78%، نور الدين 87%، سارة خليل 85%) بناءً على مقارنة المهام المنجزة بالهدف الشهري.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">كروت الإجراءات السريعة للمدير (Manager Shortcuts)</div>
            <div class="callout-desc">روابط سريعة بلمسة واحدة للانتقال إلى: نموذج التقييم الشهري، اعتماد عمولات الصفقات البيعية، ولوحة تعيين ومراجعة الأهداف التشغيلية.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">مركز طلبات الفريق المعلقة (Pending Approvals Bar)</div>
            <div class="callout-desc">شريط عداد الطلبات الحية مع التبويب التلقائي: الطلبات المعلقة (Pending)، المعتمدة (Approved)، المرفوضة، وإجمالي طلبات الشهر.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">لوحة جدول أعضاء الفريق (Team Overview Table)</div>
            <div class="callout-desc">جدول متكامل يعرض حالة كل موظف بالقسم: الحضور والانصراف، فترات التأخير، رصيد الإجازات المتبقي، ووحدة الإنتاجية المقررة.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ تمكين الإشراف الفعال:</strong> يتيح مؤشر الإنتاجية للمدير رصد أي موظف متأخر في تحقيق مستهدفه الشهري مبكراً وتقديم الدعم والتوجيه اللازم قبل نهاية الشهر.
      </div>
    </div>
    ${renderFooter(12)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 13: APPROVALS CENTER & HOLIDAY WORK COMPENSATION
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثاني: دليل المدير المباشر — مركز الاعتمادات وبدلات تشغيل العطلات</div>
        <div class="page-header-brand">HumAi Approval Center</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">2.2 مركز اعتمادات الإجازات والورديات وبدلات تشغيل العطلات الرسمية</h2>
          <span class="badge-pill badge-blue">Approval Workflows</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          كيفية تدقيق واعتماد أو رفض طلبات الفريق، وتسجيل أيام الراحة التعويضية للعمل في العطلات الرسمية:
        </p>
      </div>

      <div class="callouts-grid" style="grid-template-columns: 1fr; gap: 8px;">
        <div class="callout-card">
          <div class="callout-num">✓</div>
          <div class="callout-content">
            <div class="callout-title">آلية فحص واعتماد طلبات الإجازات والأذونات (Team Requests Approval Center)</div>
            <div class="callout-desc">
              1. يستعرض المدير الطلبات الواردة من أعضاء قسمه متضمنة: اسم الموظف، نوع الإجازة، التاريخ، وسبب الطلب.<br>
              2. زر <strong>"اعتماد الطلب" (Approve)</strong>: يعتمد الإجازة فورياً، ويقوم النظام تلقائياً بخصم الأيام من رصيد الموظف وتعديل كشف الحضور.<br>
              3. زر <strong>"رفض الطلب" (Reject)</strong>: يفتح نافذة تسجيل سبب الرفض الإداري لتوثيقه رسمياً في إشعار الموظف وملفه الشخصي.<br>
              4. في النظام الهرمي (Hierarchical Mode): تُرسل موافقة المدير المباشر إلى إدارة الـ HR/Admin للاعتماد النهائي.
            </div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">🏖️</div>
          <div class="callout-content">
            <div class="callout-title">نموذج توثيق تشغيل أيام العطلات الرسمية (Holiday Work Compensation Form)</div>
            <div class="callout-desc">
              1. عند تكليف موظف بالعمل أثناء يوم عطلة رسمية أو إجازة أسبوعية، يفتح المدير نموذج التعويضات أسفل اللوحة.<br>
              2. يختار اسم الموظف من القائمة المنسدلة، ويحدد تاريخ يوم العطلة الفعلي الذي تم العمل فيه، ويدون طبيعة التكليف.<br>
              3. بمجرد الحفظ، يضيف النظام يوماً تعويضياً معتمداً في رصيد الموظف يظهر في كشف إجازاته كحق مكتسب وفقاً للمادة 52 من قانون العمل المصري.
            </div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">🔄</div>
          <div class="callout-content">
            <div class="callout-title">اعتماد طلبات تبديل الورديات بين الزملاء (Shift Swap Approvals)</div>
            <div class="callout-desc">
              يفحص المدير طلبات التبديل بين الزملاء للتأكد من توافق المهارات وعدم تأثر جدول التغطية التشغيلية للقسم قبل تأكيد التبديل في الروستر.
            </div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 10px;">
        <strong>✦ الضبط الرقابي:</strong> كافة قرارات الموافقة أو الرفض تُسجل فورياً مع اسم المدير وتاريخ وتوقيت القرار في سجل التدقيق الرقابي للشركة.
      </div>
    </div>
    ${renderFooter(13)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 14: SALES LOGGING & COMMISSIONS
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثاني: دليل المدير المباشر — سجل مبيعات الفريق وعمولات الإغلاق</div>
        <div class="page-header-brand">HumAi Sales Tracker</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">2.3 تسجيل صفقات المبيعات واحتساب عمولات الإغلاق (/dashboard/sales)</h2>
          <span class="badge-pill badge-blue">Performance Commissions</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          إدارة الصفقات البيعية المغلقة وحساب نسب العمولات الآلية لكل مسؤول مبيعات لإضافتها في مسير الرواتب الشهري:
        </p>
      </div>

      ${renderFrame('sales-tracker', 'سجل المبيعات والصفقات المغلقة وحساب العمولات الآلية', '/dashboard/sales')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">توثيق بيانات الصفقة والعميل</div>
            <div class="callout-desc">تسجيل اسم مسؤول المبيعات، اسم العميل، رقم الهاتف، قيمة الصفقة الإجمالية، والإيراد الصافي المحصل فعلياً لحساب العمولة عليه.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">حساب العمولة الآلي بحسب شريحة الموظف</div>
            <div class="callout-desc">تطبيق نسبة العمولة التعاقدية المحددة في ملف الموظف (مثال: 5% أو 10%) تلقائياً على صافي المحصل دون أي خطأ بشري في الحساب.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">مراجعة وتأكيد التحصيل من الإدارة</div>
            <div class="callout-desc">علامة التحقق من سداد العميل للتأكد من دخول الإيراد في حسابات الشركة قبل ترحيل العمولة للاستحقاق في الراتب.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">الترحيل الآلي لمسير الرواتب الشهري</div>
            <div class="callout-desc">تُجمع عمولات الشهر المعتمدة وتُرحل آلياً إلى خانة "عمولات المبيعات" في مسير رواتب دورة 26-25 وفي قسيمة الراتب الرقمية.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ التحفيز البيعي:</strong> يُمكّن السجل مسؤولي المبيعات ومدير القسم من رؤية إجمالي العمولات المتراكمة يوم بيوم مما يرفع الحافز نحو تحقيق مستهدفات البيع.
      </div>
    </div>
    ${renderFooter(14)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 15: QUARTERLY 4-STAR REVIEWS
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثاني: دليل المدير المباشر — التقييم الربع سنوي ومعايير النجوم الأربعة</div>
        <div class="page-header-brand">HumAi Merit Reviews</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">2.4 التقييم الربع سنوي ومعايير النجوم الأربعة المعتمدة (/dashboard/evaluations)</h2>
          <span class="badge-pill badge-blue">4-Star Merit Criteria</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          نموذج تقييم جدارة واستحقاق الموظفين المعتمد في HumAi استناداً إلى 4 معايير موضوعية واضحة من 1 إلى 5 نجوم:
        </p>
      </div>

      ${renderFrame('team-evaluations', 'نموذج تقييم أداء الموظفين بمعايير النجوم الأربعة وسجل المراجعات', '/dashboard/evaluations')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">⭐</div>
          <div class="callout-content">
            <div class="callout-title">معيار 1: الانضباط والالتزام بالمواعيد (Punctuality)</div>
            <div class="callout-desc">تقييم من 1 إلى 5 نجوم يقيس الحضور في الموعد المحدد، قلة التأخيرات، الالتزام بمواعيد تسليم المهام، وتغطية ساعات الوردية كاملة.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">⭐</div>
          <div class="callout-content">
            <div class="callout-title">معيار 2: جودة المخرجات والإتقان (Work Quality)</div>
            <div class="callout-desc">تقييم من 1 إلى 5 نجوم يقيس دقة العمل المنفذ، قلة الأخطاء الفنية، الالتزام بمعايير المؤسسة، والاهتمام بالتفاصيل الاحترافية.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">⭐</div>
          <div class="callout-content">
            <div class="callout-title">معيار 3: حل المشكلات والابتكار (Problem Solving)</div>
            <div class="callout-desc">تقييم من 1 إلى 5 نجوم يقيس المبادرة الإيجابية في تجاوز العقبات، تقديم حلول بديلة، والتصرف السليم أثناء ضغط العمل الميداني.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">⭐</div>
          <div class="callout-content">
            <div class="callout-title">معيار 4: التواصل الفعال والعمل الجماعي (Communication)</div>
            <div class="callout-desc">تقييم من 1 إلى 5 نجوم يقيس التعاون مع الزملاء، استجابة الموظف للتوجيهات، الوضوح في التقارير، والروح الإيجابية داخل القسم.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ ملاحظات المدير التوجيهية:</strong> يشتمل التقييم على حقل "الملاحظات الإدارية" لتدوين نقاط القوة والتوصيات التطويرية، ويُحسب المتوسط التراكمي آلياً ويظهر في ملف الموظف.
      </div>
    </div>
    ${renderFooter(15)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 16: FULL-PAGE SECTION DIVIDER 3 — PART III (SUPER ADMIN GUIDE)
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet dark-divider">
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 32px; height: 32px; border-radius: 8px; background: #7C3AED; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; color: #FFFFFF;">H</div>
        <span style="font-size: 14px; font-weight: 800; color: #FFFFFF;">HumAi Platform</span>
      </div>
      <span class="badge-pill badge-purple">PART III : SUPER ADMIN COMMAND CENTER</span>
    </div>

    <div style="margin: auto 0; text-align: center; max-width: 580px; align-self: center;">
      <div style="display: inline-block; width: 70px; height: 70px; border-radius: 20px; background: rgba(124, 58, 237, 0.15); border: 1.5px solid #7C3AED; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px auto;">
        ⚡
      </div>
      <div class="badge-pill badge-navy" style="border: 1px solid #1E293B; margin-bottom: 14px; font-size: 11px; padding: 5px 14px; color: #A78BFA;">
        غرفة العمليات المركزية والحوكمة المؤسسية العليا
      </div>
      <h1 style="font-size: 28px; font-weight: 900; color: #FFFFFF; line-height: 1.3; margin-bottom: 14px;">
        الجزء الثالث: دليل السوبر أدمن والإدارة العليا<br>
        <span style="color: #A78BFA;">Super Admin Command Center & Governance</span>
      </h1>
      <p style="font-size: 12.5px; color: #94A3B8; line-height: 1.7;">
        الدليل الشامل لأصحاب الصلاحيات السيادية لإدارة المنظومة: مركز الذكاء والتحليلات المؤسسية المتقدمة، إضافة وتسكين الموظفين وقنوات الصرف، الهيكل التنظيمي، مصمم العقود القانونية، محرك الورديات المتقدم، مسير الرواتب الآلي لدورة 26-25، سجل التدقيق الرقابي، وإعدادات الفروع والجيوفنسينج والسياسات.
      </p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 25px; text-align: right;">
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px;">
          <div style="color: #A78BFA; font-weight: 800; font-size: 10.5px;">التحليلات والموظفين</div>
          <div style="color: #E2E8F0; font-size: 9.5px; margin-top: 2px;">مركز الذكاء، إضافة الموظفين، وقنوات الصرف (InstaPay/بنك/كاش).</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px;">
          <div style="color: #A78BFA; font-weight: 800; font-size: 10.5px;">الرواتب والعقود</div>
          <div style="color: #E2E8F0; font-size: 9.5px; margin-top: 2px;">مسير 26 إلى 25 الآلي، الخصومات، ومولد العقود القانونية.</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px;">
          <div style="color: #A78BFA; font-weight: 800; font-size: 10.5px;">الحوكمة والإعدادات</div>
          <div style="color: #E2E8F0; font-size: 9.5px; margin-top: 2px;">سجل التدقيق الرقابي، فروع GPS، وسياسات التأخير والسماح.</div>
        </div>
      </div>
    </div>

    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #64748B; width: 100%;">
      <div>HumAi Enterprise Documentation</div>
      <div>الصفحة 16</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 17: ADMIN INTELLIGENCE & ALL CHARTS BREAKDOWN
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن — مركز الذكاء والتحليلات المؤسسية المتقدمة</div>
        <div class="page-header-brand">HumAi HR Intelligence</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">3.1 مركز الذكاء والتحليلات المؤسسية وشرح كل رسم بياني بالتفصيل (/dashboard/admin)</h2>
          <span class="badge-pill badge-purple">Executive Analytics Hub</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          لوحة قيادة استراتيجية تعتمد على محرك رسومات بيانية حية (Recharts) مرتبطة لحظياً بقاعدة البيانات لتقديم رؤى تشغيلية متعمقة:
        </p>
      </div>

      ${renderFrame('admin-intelligence', 'لوحة تحليلات الذكاء الإداري وكافة الرسوم البيانية الإحصائية', '/dashboard/admin')}

      <div class="callouts-grid" style="grid-template-columns: 1fr 1fr; gap: 7px;">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">Workforce Status Donut (توزيع القوى العاملة)</div>
            <div class="callout-desc">رسم دائري يوضح نسبة الحضور اللحظي: الحاضرون بالمقر، العاملون عن بُعد، في إجازة رسمية، ونسبة الغياب غير المبرر لليوم.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">Department Headcount Donut (كثافة الأقسام)</div>
            <div class="callout-desc">يوضح التوزيع العددي والنسبي للموظفين عبر الأقسام (العمليات، المبيعات، المالية، الكول سنتر) لتحديد مراكز الكثافة البشرية.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">Department Lateness Bar Chart (دقائق التأخير)</div>
            <div class="callout-desc">أعمدة بيانية تقارن إجمالي دقائق التأخير التراكمية وعدد حالات التأخير المرصودة في كل قسم لرصد بؤر التسيب وضبط الانضباط.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">Leave Balances Column Chart (أرصدة الإجازات)</div>
            <div class="callout-desc">يقارن بين الأرصدة المتبقية والمستهلكة من الإجازات في كل قسم لتقدير الالتزامات المالية ومستحقات نهاية الخدمة.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">5</div>
          <div class="callout-content">
            <div class="callout-title">Turnover & Absence Trend Chart (مسار الغياب)</div>
            <div class="callout-desc">منحنى زمني يقيس تطور معدلات الغياب ودوران العمالة شهراً بشهر، مما يساعد في التنبؤ بالمواسم الحرجة واستقرار الكادر.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">6</div>
          <div class="callout-content">
            <div class="callout-title">Payroll Cost Stacked Bar (تشريح كتلة الأجور)</div>
            <div class="callout-desc">أعمدة تراكمية تقسم إجمالي الإنفاق الشهري لكل قسم: الراتب الأساسي، العمل الإضافي والبدلات، والاستقطاعات لضبط الميزانية.</div>
          </div>
        </div>
      </div>
    </div>
    ${renderFooter(17)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 18: EMPLOYEE DIRECTORY & ADD EMPLOYEE GUIDE
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن — دليل وخزينة بيانات الموظفين وإضافة موظف جديد</div>
        <div class="page-header-brand">HumAi Employee Directory</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">3.2 دليل الموظفين: خطوات إضافة موظف جديد وتحديد مسار الصرف (/dashboard/employees)</h2>
          <span class="badge-pill badge-purple">Staff Management & Vault</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          الخزينة المركزية لملفات الكادر البشري، مع الشرح المفصل لخطوات إضافة وتعيين موظف جديد في المنظومة:
        </p>
      </div>

      ${renderFrame('employee-vault', 'خزينة ملفات الموظفين ومسارات الصرف والفلاتر المتقدمة', '/dashboard/employees')}

      <div class="callouts-grid" style="grid-template-columns: 1fr 1fr; gap: 8px;">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">خطوة 1: البيانات الشخصية والمستندات الرسمية</div>
            <div class="callout-desc">إدخال الاسم الكامل، البريد الإلكتروني، رقم الهاتف، الرقم القومي المكون من 14 رقماً، تاريخ الميلاد، ورفع صور: بطاقة الرقم القومي، المؤهل الدراسي، والفيش الجنائي.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">خطوة 2: التسكين الوظيفي والتبعية الإدارية</div>
            <div class="callout-desc">تحديد الدور (موظف / مدير / سوبر أدمن)، المسمى الوظيفي، ربطه بالقسم، وتعيين المدير المباشر، نوع العقد (دوام كامل / جزئي / حر)، وفترة الاختبار (3 أشهر).</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">خطوة 3: البيانات المالية وقناة صرف الراتب</div>
            <div class="callout-desc">تحديد الراتب الأساسي التعاقدي، رصيد الإجازات السنوية (21 يوماً)، وحدة قياس الأداء (kpi_unit)، وقناة الصرف: محفظة InstaPay، حساب بنكي IBAN، أو نقداً (Cash).</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">خطوة 4: نظام العمل وتعيين الوردية</div>
            <div class="callout-desc">تحديد هل الموظف يعمل في المقر أم عن بُعد (Remote)، تخصيص ساعات مرنة، أو تعيين الوردية الرسمية الصباحية أو المسائية لتطبيق قواعد التأخير والحضور عليها.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ التخزين المشفر للمستندات:</strong> تُرفع كافة مستندات الموظف في مساحات تخزين سحابية مشفرة برمجياً تضمن الخصوصية التامة ولا يمكن الوصول إليها إلا للمصرح لهم.
      </div>
    </div>
    ${renderFooter(18)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 19: ORGANIZATIONAL STRUCTURE & DEPARTMENTS
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن — الهيكل التنظيمي وشجرة الأقسام</div>
        <div class="page-header-brand">HumAi Organization Tree</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">3.3 الهيكل التنظيمي وشجرة الأقسام ومستويات التبعية الإدارية (/dashboard/departments)</h2>
          <span class="badge-pill badge-purple">Hierarchy & Teams</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          رسم وضبط شجرة المؤسسة التنظيمية، ربط الأقسام برؤساء الإدارات، وتحديد مسارات الإشراف والتصعيد:
        </p>
      </div>

      ${renderFrame('departments-hierarchy', 'الهيكل التنظيمي للأقسام وتوزيع الكادر الإداري', '/dashboard/departments')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">إنشاء وتسمية الأقسام المؤسسية</div>
            <div class="callout-desc">إضافة الأقسام التنظيمية للشركة (مثل: العمليات، المبيعات، المالية، الدعم وخدمة العملاء، التقنية) مع وصف مسؤوليات كل قسم.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">تعيين رؤساء الأقسام (HOD Assignments)</div>
            <div class="callout-desc">اختيار مدير القسم وتفويضه بصلاحيات الإشراف، ليظهر أعضاء القسم تلقائياً في لوحة المراقبة ومركز اعتمادات الإجازات الخاص به.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">توزيع ونقل الموظفين بين الأقسام</div>
            <div class="callout-desc">مرونة كاملة في نقل الموظف من قسم لآخر أو تغيير مديره المباشر بضغطة زر دون فقدان سجل حضوره أو قسائم رواتبه السابقة.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">تحديد مسارات الاعتماد الهرمية</div>
            <div class="callout-desc">ضبط تسلسل الموافقات: الموظف يطلب -> يُخطر مدير القسم المباشر -> يُعتمد من الـ HR/السوبر أدمن، مما يضمن الضبط الإداري الصارم.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ التكامل مع الرسوم البيانية:</strong> ينعكس أي تعديل في شجرة الأقسام فورياً على الرسوم البيانية لكثافة القوى العاملة (Headcount Donut) وتكلفة كتلة الأجور في مركز الذكاء الإداري.
      </div>
    </div>
    ${renderFooter(19)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 20: DEDICATED LEGAL CONTRACT GENERATOR
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن — صانع ومحرر العقود القانونية ونماذج العمل</div>
        <div class="page-header-brand">HumAi Contract Builder</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">3.4 صانع ومحرر العقود القانونية ونماذج التوظيف الذكية (/dashboard/contracts)</h2>
          <span class="badge-pill badge-purple">Legal Contract Generator</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          محرك قانوني ذكي لتوليد عقود العمل ثنائية اللغة المتوافقة مع قانون العمل المصري عبر الدمج الآلي للمتغيرات التعاقدية:
        </p>
      </div>

      ${renderFrame('contracts-builder', 'صانع العقود القانونية مع المعاينة الفورية والمتغيرات الديناميكية', '/dashboard/contracts')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">اختيار الموظف والتعبئة الآلية للبيانات</div>
            <div class="callout-desc">اختيار اسم الموظف من القائمة ليقوم المحرك بسحب كافة بياناته المسجلة (الرقم القومي، الراتب، المسمى الوظيفي، وتاريخ التعيين) وحقنها في بنود العقد.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">المتغيرات الديناميكية الذكية (Smart Variables)</div>
            <div class="callout-desc">استخدام وسوم ديناميكية مثل: <span class="font-mono">{{Employee_Name}}</span>, <span class="font-mono">{{National_ID}}</span>, <span class="font-mono">{{Basic_Salary}}</span>, <span class="font-mono">{{Payment_Method}}</span>, <span class="font-mono">{{Contract_Type}}</span>, <span class="font-mono">{{Probation_Period}}</span> لإنشاء صياغات مرنة.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">محرر القوالب القانونية وحفظها بالسحابة</div>
            <div class="callout-desc">إمكانية تعديل وحفظ مسودة العقد المعتمدة لدى الشركة في جدول <span class="font-mono">contract_templates</span> لتكون القالب الافتراضي لكافة التعيينات المستقبلية.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">المعاينة الحية الفورية والطباعة والـ PDF</div>
            <div class="callout-desc">نافذة معاينة فورية تظهر العقد بشكله النهائي الرسمي مع مساحات التوقيع المعتمدة للشركة والموظف، وجاهزية فورية للطباعة أو التصدير PDF.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ الامتثال لقانون العمل:</strong> تُراعى في الصياغة الافتراضية لعقود HumAi كافة المتطلبات الإلزامية كفترة الاختبار، التوصيف الوظيفي، وتوثيق قنوات الأجر لضمان السلامة القانونية للشركة.
      </div>
    </div>
    ${renderFooter(20)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 21: SHIFTS & ROSTERING ENGINE
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن — محرك الورديات وجدول العمليات المتقدم</div>
        <div class="page-header-brand">HumAi Shifts Engine</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">3.5 محرك الورديات المتقدمة والعمليات الليلية وفترات السماح (/dashboard/shifts)</h2>
          <span class="badge-pill badge-purple">Shifts & Rostering</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          هندسة أوقات العمل: ورديات ثابتة، مقسمة (Split)، ورديات ليلية عابرة لمنتصف الليل، وفترات الراحة وبدل الشيفت الليلي:
        </p>
      </div>

      ${renderFrame('shifts-engine', 'محرك الورديات والجدولة مع خيارات البدلات والورديات الليلية', '/dashboard/shifts')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">الورديات الثابتة والدورية (Fixed & Rotational)</div>
            <div class="callout-desc">إنشاء الورديات الصباحية والمسائية المعتادة مع تحديد أيام العمل المخصصة لكل وردية ومواعيد البداية والنهاية بالساعة والدقيقة.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">الورديات الليلية العابرة لمنتصف الليل (Overnight)</div>
            <div class="callout-desc">معالجة برمجية ذكية للورديات التي تبدأ في يوم وتنتهي في اليوم التالي (مثل: 8 مساءً حتى 4 صباحاً) لضمان دقة احتساب ساعات العمل دون لبس بالتواريخ.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">بدل الشيفت الليلي المالي (Night Allowance)</div>
            <div class="callout-desc">تحديد قيمة مالية إضافية تُمنح تلقائياً لكل وردية ليلية يثبت الموظف حضوره فيها، وتُرحل آلياً إلى قسيمة الراتب في نهاية الشهر.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">الورديات المقسمة وفترات الراحة (Split Shifts & Breaks)</div>
            <div class="callout-desc">دعم الورديات المجزأة إلى فترتين خلال اليوم (مثل المطاعم والمتاجر)، مع استقطاع فترات الراحة المحددة من إجمالي الساعات الصافية.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ تبديل الورديات الذكي:</strong> عند اعتماد أي طلب تبديل وردية بين زميلين، يقوم النظام تلقائياً بتحديث إسناد الوردية لليوم المعني في التايم شيت دون تدخل يدوي.
      </div>
    </div>
    ${renderFooter(21)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 22: AUTOMATED PAYROLL ENGINE (CYCLE 26-TO-25)
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن — محرك الرواتب الآلي لدورة 26 إلى 25</div>
        <div class="page-header-brand">HumAi Payroll Engine</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">3.6 محرك مسير الرواتب الآلي المعتمد لدورة 26 إلى 25 والاستقطاعات (/dashboard/payroll)</h2>
          <span class="badge-pill badge-purple">Automated Payroll Core</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          المحرك المالي المركزي لاحتساب رواتب المنظمة بدقة متناهية بناءً على دورة الرواتب المعتمدة (من يوم 26 حتى 25):
        </p>
      </div>

      ${renderFrame('payroll-engine', 'محرك مسير الرواتب مع معالجة السلف والبدلات والضرائب والتأمينات', '/dashboard/payroll')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">دورة الرواتب الرسمية المعتمدة (26th to 25th)</div>
            <div class="callout-desc">حساب دقيق لكافة أيام الحضور والتأخيرات والغياب من يوم 26 في الشهر السابق حتى يوم 25 في الشهر الحالي، مما يتيح إصدار الرواتب قبل نهاية الشهر.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">الخصم الآلي للسلفيات المستحقة (Advances Deduction)</div>
            <div class="callout-desc">يقوم المحرك برصد كافة السلف المالية المعتمدة للموظف والمستحقة الخصم في دورة الشهر الحالي وإسقاطها آلياً من صافي الراتب المستحق.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">احتساب التناسب للتعيينات الجديدة (Proration Engine)</div>
            <div class="callout-desc">حساب آلي للأجر النسبي للموظفين الجدد الذين بدأوا العمل في منتصف دورة الراتب بحسب عدد أيام العمل الفعلية بدقة متناهية.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">مفاتيح استثناء التأمينات والضرائب والاعتماد النهائي</div>
            <div class="callout-desc">إمكانية استثناء التأمينات الاجتماعية أو ضريبة الدخل لموظفين محددين، ومراجعة المسير بالكامل قبل الضغط على "اعتماد مسير الرواتب" وتوليد قسائم الراتب.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ التصدير المصرفي:</strong> يولد النظام ملف صرف الرواتب متضمناً تفاصيل التحويل لكل موظف (رقم الحساب البنكي IBAN، معرف InstaPay، أو الكاش) لتسليمها لإدارة الحسابات.
      </div>
    </div>
    ${renderFooter(22)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 23: TAMPER-PROOF AUDIT TRAIL
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن — سجل التدقيق الرقابي والحوكمة الأمنية</div>
        <div class="page-header-brand">HumAi Audit Vault</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">3.7 سجل التدقيق الرقابي غير القابل للتلاعب والحوكمة الأمنية (/dashboard/audit-logs)</h2>
          <span class="badge-pill badge-purple">Immutable Audit Trail</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          سجل رقابي مشفر وغير قابل للتعديل يوثق كل إجراء إداري، تعديل في البيانات، أو استثناء تشغيلي في المنظومة:
        </p>
      </div>

      ${renderFrame('audit-trail', 'سجل التدقيق الرقابي الشامل وتتبع الفروقات وعناوين الـ IP', '/dashboard/audit-logs')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">توثيق الفاعل وهوية المستخدم (Actor Tracking)</div>
            <div class="callout-desc">تسجيل اسم المستخدم المنفذ للعملية وبريده الإلكتروني ودوره الوظيفي في لحظة اتخاذ الإجراء، مما يمنع التنصل من القرارات الإدارية.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">نوع الإجراء والكيان المتأثر (Action & Entity)</div>
            <div class="callout-desc">تصنيف دقيق للعملية: إنشاء (CREATE)، تعديل (UPDATE)، حذف (DELETE)، أو اعتماد (APPROVE) على مستوى الكيان (موظف، راتب، إجازة، وردية، فرع).</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">فحص الفروقات قبل وبعد (Diff Inspection)</div>
            <div class="callout-desc">تسجيل القيمة السابقة (Old Value) والقيمة الجديدة (New Value) للبيانات المعدلة بدقة فائقة لكشف أي تلاعب في الرواتب أو سجلات الحضور.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">توثيق البصمة الرقمية (IP Address & User Agent)</div>
            <div class="callout-desc">تسجيل عنوان الـ IP الفعلي للجهاز، نوع المتصفح ونظام التشغيل، والختم الزمني بدقة الأجزاء من الثانية لضمان الحجية القانونية والرقابية.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ غير قابل للحذف:</strong> جدول سجل التدقيق محمي على مستوى قاعدة البيانات PostgreSQL بسياسات أمان تمنع أي مستخدم - حتى السوبر أدمن - من حذف أو تعديل أي سجل تاريخي.
      </div>
    </div>
    ${renderFooter(23)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 24: SYSTEM SETTINGS 1 — GEOFENCE & BRANCHES
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن — إعدادات النظام: الفروع ونطاق GPS Geofence</div>
        <div class="page-header-brand">HumAi System Settings</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">3.8 إعدادات النظام الشاملة: الفروع، إحداثيات GPS، ونصف قطر النطاق الجغرافي</h2>
          <span class="badge-pill badge-purple">Multi-Branch Geofencing</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          التهيئة الدقيقة لفروع الشركة ومواقع العمل الميدانية ومحددات النطاق الجغرافي لإثبات الحضور بالـ GPS:
        </p>
      </div>

      ${renderFrame('settings-geofence', 'تبويب فروع الشركة والنطاق الجغرافي وحل روابط الخرائط', '/dashboard/settings?tab=geofence')}

      <div class="callouts-grid">
        <div class="callout-card">
          <div class="callout-num">1</div>
          <div class="callout-content">
            <div class="callout-title">إضافة فروع متعددة للمؤسسة (Multi-Branch)</div>
            <div class="callout-desc">دعم كامل لإنشاء فروع متعددة للشركة (المقر الرئيسي، الفروع الإقليمية، المستودعات، ونقاط البيع) مع إمكانية ربط كل موظف بفرعه المعتمد.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">2</div>
          <div class="callout-content">
            <div class="callout-title">محلل روابط خرائط جوجل الذكي (Maps URL Resolver)</div>
            <div class="callout-desc">يكفي أن يضع الأدمن رابط موقع الفرع من تطبيق Google Maps أو رابط مختصر، ليقوم المحرك آلياً باستخراج خط الطول ودائرة العرض بدقة.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">3</div>
          <div class="callout-content">
            <div class="callout-title">إحداثيات خط العرض والطول الدقيقة (Latitude / Longitude)</div>
            <div class="callout-desc">إدخال يدوي أو تلقائي لإحداثيات مقر الفرع بدقة تصل إلى 6 خانات عشرية لضمان عدم حدوث أي انحراف في قياس موقع الهاتف الذكي.</div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">4</div>
          <div class="callout-content">
            <div class="callout-title">نصف قطر النطاق الجغرافي بالأمتار (Geofence Radius)</div>
            <div class="callout-desc">تحديد قطر الدائرة الجغرافية المسموح داخلها بتسجيل الحضور (مثلاً 100م، 150م، 200م) بحسب مساحة المبنى ومواقف السيارات التابعة له.</div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ دقة الموقع:</strong> يحسب محرك HumAi المسافة بين إحداثيات هاتف الموظف ومركز الفرع بمعادلة Haversine الرياضية المعتمدة عالمياً لمنع أي تلاعب بالموقع.
      </div>
    </div>
    ${renderFooter(24)}
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 25: SYSTEM SETTINGS 2 — POLICIES, LATENESS & TOGGLES
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن — إعدادات النظام: سياسات التأخير، السلف، والحوكمة</div>
        <div class="page-header-brand">HumAi Policy Rules</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 15px; color: #0F172A;">3.9 إعدادات النظام الشاملة: سياسات التأخير، الإضافي، السلف، وتفعيل الميزات</h2>
          <span class="badge-pill badge-purple">Policy Configuration</span>
        </div>
        <p style="color: #64748B; font-size: 10px; margin-top: 2px;">
          التحكم الكامل في سياسات الانضباط، قواعد استحقاق الأجور والخصومات، وتفعيل الوحدات البرمجية بالمنظومة:
        </p>
      </div>

      ${renderFrame('settings-policies', 'تبويب سياسات التأخير والسلف والعمل الإضافي وتفعيل الميزات', '/dashboard/settings?tab=toggles')}

      <div class="callouts-grid" style="grid-template-columns: 1fr 1fr; gap: 8px;">
        <div class="callout-card">
          <div class="callout-num">⏱️</div>
          <div class="callout-content">
            <div class="callout-title">فترة السماح وسياسة التأخير (Lateness Policy)</div>
            <div class="callout-desc">
              • <strong>فترة السماح (Grace Period):</strong> بالدقائق (مثلاً 15 دقيقة) لا يُحسب خلالها تأخير.<br>
              • <strong>نمط الخصم:</strong> بالشرائح (15د=0.25 يوم، 30د=0.5 يوم، 60د=1 يوم كامل) أو بالنسبة المئوية لكل دقيقة تأخير (0.5% بالدقيقة).
            </div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">⚡</div>
          <div class="callout-content">
            <div class="callout-title">محرك العمل الإضافي (Overtime Rules)</div>
            <div class="callout-desc">
              • تفعيل أو تعطيل احتساب الساعات الإضافية بعد نهاية الوردية.<br>
              • اختيار نمط الاحتساب: مضاعف الراتب بالساعة (مثلاً 1.5x من أجر الساعة العادية) أو قيمة نقدية ثابتة لكل ساعة عمل إضافي.
            </div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">💳</div>
          <div class="callout-content">
            <div class="callout-title">ضوابط السلف المالية (Advance Rules)</div>
            <div class="callout-desc">
              • تحديد الحد الأقصى للسلفة كنسبة من الراتب الأساسي (مثلاً 50%).<br>
              • تحديد يوم الأهلية الشهري (مثل يوم 15 في الشهر).<br>
              • تحديد سقف الميزانية الإجمالية للسلفيات المسموح بها للمؤسسة شهرياً.
            </div>
          </div>
        </div>

        <div class="callout-card">
          <div class="callout-num">⚙️</div>
          <div class="callout-content">
            <div class="callout-title">مفاتيح تفعيل الميزات ونظام الاعتمادات</div>
            <div class="callout-desc">
              • مفاتيح تشغيل/إيقاف: نظام الورديات، السلف، العمولات، التأمينات، والضرائب.<br>
              • <strong>نمط اعتماد الإجازات:</strong> اختيار الاعتماد التلقائي المباشر (<span class="font-mono">auto_approve</span>) أو الاعتماد الهرمي ذو المرحلتين (<span class="font-mono">hierarchical</span>).
            </div>
          </div>
        </div>
      </div>

      <div class="pro-tip-box" style="margin-top: 8px;">
        <strong>✦ المرونة المؤسسية:</strong> تتيح هذه التبويبات تكييف منصة HumAi بدقة فائقة لتلائم لائحة العمل الداخلية لأي منظومة مهما اختلف حجمها أو قطاعها.
      </div>
    </div>
    ${renderFooter(25)}
  </div>

</body>
</html>`;
}

module.exports = { generateManualHtml };
