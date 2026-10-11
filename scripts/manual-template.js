/**
 * HumAi Visual Onboarding & Product Manual — HTML-to-PDF Master Template
 * Styled precisely with HumAi Enterprise Brand Identity:
 * - Deep Obsidian Navy (#0B0F17 / #0F172A)
 * - Radiant Emerald Green (#10B981 / #059669)
 * - Light Slate (#F8FAFC / #FFFFFF)
 * - Modern Arabic Sans Hierarchy (Cairo / Inter)
 * - Interactive Hyperlinked Table of Contents
 * - Numbered Callout Annotations & Device Frames
 * 
 * Strict Brand Guidelines:
 * - HumAi must NEVER be written in Arabic. Always "HumAi" in English.
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
      font-size: 11.5px;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }

    .page-sheet {
      width: 210mm;
      min-height: 297mm;
      padding: 14mm 16mm 14mm 16mm;
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
      padding: 22mm 20mm 18mm 20mm;
    }

    .page-sheet.dark-divider {
      background: linear-gradient(145deg, #0B0F17 0%, #0F172A 100%);
      color: #FFFFFF;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 30mm 20mm;
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
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.08);
      background-color: #FFFFFF;
      margin: 8px 0 12px 0;
    }

    .device-browser-header {
      background-color: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      direction: ltr;
    }

    .device-dots {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot-red { background-color: #EF4444; }
    .dot-yellow { background-color: #F59E0B; }
    .dot-green { background-color: #10B981; }

    .device-address-bar {
      flex: 1;
      max-width: 400px;
      background-color: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 2px 10px;
      font-size: 10px;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .device-header-title {
      font-size: 10.5px;
      font-weight: 700;
      color: #0F172A;
      direction: rtl;
    }

    .device-viewport {
      width: 100%;
      background-color: #0F172A;
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
    }

    .viewport-placeholder {
      padding: 60px 20px;
      color: #94A3B8;
      font-weight: 600;
      text-align: center;
    }

    /* Modern Card Layouts */
    .feature-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 8px;
    }

    .feature-card.highlight {
      border-right: 4px solid #10B981;
      background: linear-gradient(90deg, #FFFFFF 0%, #F0FDF4 100%);
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    .badge-emerald {
      background-color: #ECFDF5;
      color: #059669;
      border: 1px solid #A7F3D0;
    }

    .badge-navy {
      background-color: #0F172A;
      color: #F8FAFC;
    }

    .badge-amber {
      background-color: #FFFBEB;
      color: #D97706;
      border: 1px solid #FDE68A;
    }

    .badge-rose {
      background-color: #FFF1F2;
      color: #E11D48;
      border: 1px solid #FECDD3;
    }

    /* Numbered Callout Annotations */
    .callout-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
    }

    .callout-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 7px;
      padding: 7px 9px;
    }

    .callout-number {
      width: 22px;
      height: 22px;
      background-color: #0F172A;
      color: #10B981;
      border: 1px solid #10B981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .callout-text h4 {
      font-size: 11.5px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 2px;
    }

    .callout-text p {
      font-size: 10.5px;
      color: #475569;
      line-height: 1.45;
    }

    /* Header & Footer Components */
    .page-header-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }

    .page-header-title {
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .page-header-brand {
      font-size: 12px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.2px;
    }

    .page-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #E2E8F0;
      padding-top: 8px;
      margin-top: 10px;
      font-size: 9.5px;
      color: #94A3B8;
    }

    /* Pro-Tip & Warning Boxes */
    .callout-box {
      border-radius: 7px;
      padding: 7px 10px;
      margin: 6px 0;
      display: flex;
      gap: 8px;
      align-items: flex-start;
      font-size: 10.5px;
    }

    .callout-pro {
      background-color: #F0FDF4;
      border: 1px solid #BBF7D0;
      color: #166534;
    }

    .callout-warn {
      background-color: #FFFBEB;
      border: 1px solid #FDE68A;
      color: #92400E;
    }

    .callout-info {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      color: #334155;
    }

    .spec-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 10.5px;
    }

    .spec-table th {
      background-color: #F1F5F9;
      color: #0F172A;
      font-weight: 700;
      padding: 6px 8px;
      text-align: right;
      border: 1px solid #E2E8F0;
    }

    .spec-table td {
      padding: 6px 8px;
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
        <div style="width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; color: #FFFFFF;">H</div>
        <div>
          <div style="font-size: 18px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF;">HumAi</div>
          <div style="font-size: 9.5px; color: #10B981; font-weight: 700; letter-spacing: 0.5px;">SMART HR & OPERATIONS PLATFORM</div>
        </div>
      </div>
      <div class="badge-pill badge-emerald" style="font-size: 10px; padding: 4px 12px;">Enterprise Release 2026.1</div>
    </div>

    <div style="margin: 40px 0;">
      <div class="badge-pill badge-navy" style="border: 1px solid #1E293B; margin-bottom: 14px; font-size: 11px; padding: 5px 12px; color: #10B981;">
        ✦ الدليل المرجعي والتشغيلي الشامل مع لقطات حية من النظام
      </div>
      <h1 style="font-size: 32px; font-weight: 900; line-height: 1.25; margin-bottom: 14px; color: #FFFFFF;">
        دليل الاستخدام والتشغيل الشامل<br>
        <span style="color: #10B981;">لمنصة HumAi الذكية</span>
      </h1>
      <p style="font-size: 14px; color: #94A3B8; max-width: 580px; line-height: 1.6;">
        مرجع تقني وتشغيلي متكامل يوثق بالتفصيل الدقيق كافة الشاشات، السياسات، النوافذ المنبثقة، ومحركات الحساب الآلية لمنظومة الموارد البشرية وإدارة العمليات المؤسسية في منصة HumAi.
      </p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 30px;">
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px;">
        <div style="color: #10B981; font-size: 12px; font-weight: 800; margin-bottom: 4px;">الجزء الأول</div>
        <div style="font-size: 12.5px; font-weight: 700; color: #F8FAFC;">دليل الموظف اليومي</div>
        <div style="font-size: 10px; color: #94A3B8; margin-top: 3px;">الحضور الذكي، الإجازات، السلف، الورديات، قسائم الراتب، ومتابعة الأهداف.</div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px;">
        <div style="color: #10B981; font-size: 12px; font-weight: 800; margin-bottom: 4px;">الجزء الثاني</div>
        <div style="font-size: 12.5px; font-weight: 700; color: #F8FAFC;">دليل المدير المباشر</div>
        <div style="font-size: 10px; color: #94A3B8; margin-top: 3px;">المراقبة الحية للحضور، مركز الاعتمادات، تشغيل العطلات، ومقترحات المكافآت.</div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px;">
        <div style="color: #10B981; font-size: 12px; font-weight: 800; margin-bottom: 4px;">الجزء الثالث</div>
        <div style="font-size: 12.5px; font-weight: 700; color: #F8FAFC;">دليل السوبر أدمن</div>
        <div style="font-size: 10px; color: #94A3B8; margin-top: 3px;">الرواتب الآلية، الفروع وGPS، العقود، الورديات، المبيعات، ومسار التدقيق.</div>
      </div>
    </div>

    <div style="border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748B;">
      <div>الإصدار: HumAi Core v2.4 (Egyptian Labor Law Compliant)</div>
      <div>تاريخ التوثيق المعتمد: أكتوبر 2026</div>
      <div>حالة الاعتماد: وثيقة رسمية معتمدة</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 2: TABLE OF CONTENTS (فهرس المحتويات التفاعلي)
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">فهرس المحتويات الشامل والمترابط</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="margin-bottom: 14px;">
        <h2 style="font-size: 18px; color: #0F172A; margin-bottom: 4px;">فهرس الدليل ومسار التصفح</h2>
        <p style="color: #64748B; font-size: 11px;">دليل مرجعي تفصيلي يغطي 16 قسماً تشغيلياً مع شرح شامل لكافة الإجراءات والشاشات الحية.</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <!-- Column 1 -->
        <div>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
            <div style="color: #059669; font-weight: 800; font-size: 11.5px; margin-bottom: 6px;">الجزء الأول: دليل الموظف اليومي (Employee Workspace)</div>
            <ul style="list-style: none; space-y: 4px; font-size: 10.5px; color: #334155;">
              <li style="padding: 2px 0;"><strong>1.1</strong> بوابة تسجيل الدخول الموحدة والأمان المؤسسي (/login)</li>
              <li style="padding: 2px 0;"><strong>1.2</strong> مساحة العمل وحساب الحضور الذكي بالـ GPS Geofence</li>
              <li style="padding: 2px 0;"><strong>1.3</strong> نموذج طلب الإجازات والأذونات ورصيد الرصيد المتبقي</li>
              <li style="padding: 2px 0;"><strong>1.4</strong> نافذة طلب السلف المالية وسقف الراتب المعتمد</li>
              <li style="padding: 2px 0;"><strong>1.5</strong> بطاقة طلب تبديل الوردية مع زميل واعتماد الإدارة</li>
              <li style="padding: 2px 0;"><strong>1.6</strong> متتبع الأهداف ومؤشرات الأداء التشغيلية KPIs</li>
              <li style="padding: 2px 0;"><strong>1.7</strong> قسائم الرواتب الرقمية المعتمدة وتفقيط الاستحقاقات</li>
            </ul>
          </div>

          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
            <div style="color: #059669; font-weight: 800; font-size: 11.5px; margin-bottom: 6px;">الجزء الثاني: دليل المدير المباشر (Department Manager)</div>
            <ul style="list-style: none; space-y: 4px; font-size: 10.5px; color: #334155;">
              <li style="padding: 2px 0;"><strong>2.1</strong> لوحة المراقبة الحية للحضور والانصراف اللحظي لفريق العمل</li>
              <li style="padding: 2px 0;"><strong>2.2</strong> مركز الاعتمادات الموحد (إجازات، أذونات، ورديات، سلف)</li>
              <li style="padding: 2px 0;"><strong>2.3</strong> توثيق تشغيل العطلات الرسمية والمكافآت التقديرية</li>
            </ul>
          </div>
        </div>

        <!-- Column 2 -->
        <div>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
            <div style="color: #059669; font-weight: 800; font-size: 11.5px; margin-bottom: 6px;">الجزء الثالث: دليل السوبر أدمن (Super Admin Command Center)</div>
            <ul style="list-style: none; space-y: 4px; font-size: 10.5px; color: #334155;">
              <li style="padding: 2px 0;"><strong>3.1</strong> لوحة القيادة الاستراتيجية والذكاء الإداري التنفيذي BI</li>
              <li style="padding: 2px 0;"><strong>3.2</strong> مراقبة سجلات وساعات الدوام الشاملة وتصدير CSV</li>
              <li style="padding: 2px 0;"><strong>3.3</strong> رصيد الإجازات السنوي ومصفوفة الاعتمادات المركزية</li>
              <li style="padding: 2px 0;"><strong>3.4</strong> دليل الموظفين، قنوات الصرف (InstaPay/بنك/كاش) والخزينة</li>
              <li style="padding: 2px 0;"><strong>3.5</strong> الهيكل التنظيمي وإدارة الأقسام وتعيين المدراء</li>
              <li style="padding: 2px 0;"><strong>3.6</strong> صانع العقود القانونية وتوليد النماذج الذكية بالمتغيرات</li>
              <li style="padding: 2px 0;"><strong>3.7</strong> محرك الورديات المتقدم (ثابتة، ليلية، مجزأة، دوارة)</li>
              <li style="padding: 2px 0;"><strong>3.8</strong> محرك الرواتب الآلي (دورة 26-25، ضرائب، تأمينات، WPS)</li>
              <li style="padding: 2px 0;"><strong>3.9</strong> محرك متابعة المبيعات والعمولات التصاعدية</li>
              <li style="padding: 2px 0;"><strong>3.10</strong> تقييمات الأداء ربع السنوية ومنظومة الـ 4 نجوم</li>
              <li style="padding: 2px 0;"><strong>3.11</strong> سجل الرقابة ومسار التدقيق غير القابل للتلاعب JSON Diff</li>
              <li style="padding: 2px 0;"><strong>3.12</strong> إعدادات النظام، الفروع، GPS Geofence وسياسات التأخير</li>
            </ul>
          </div>

          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px;">
            <div style="color: #059669; font-weight: 800; font-size: 11.5px; margin-bottom: 6px;">الملحق التقني ومصفوفة الصلاحيات (RBAC Matrix)</div>
            <p style="font-size: 10px; color: #64748B;">جدول مقارنة الصلاحيات الدقيقة لكل رتبة (موظف / مدير / سوبر أدمن)، وتوافق النظام مع قانون العمل المصري رقم 12 لسنة 2003.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>HumAi Enterprise Documentation</div>
      <div>صفحة 2</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 3: 1.1 تسجيل الدخول والأمان المؤسسي
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الأول: دليل الموظف | 1.1 تسجيل الدخول وبوابة الأمان</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <h2 style="font-size: 16px; color: #0F172A;">بوابة تسجيل الدخول والأمان المؤسسي</h2>
          <p style="color: #64748B; font-size: 11px;">المسار: <span class="font-mono text-emerald-600">/login</span> — نقطة الوصول الموحدة والمؤمنة للكوادر والمسؤولين</p>
        </div>
        <span class="badge-pill badge-emerald">بوابة الدخول الموحدة</span>
      </div>

      ${renderFrame('login-portal', 'بوابة تسجيل الدخول إلى منصة HumAi', '/login')}

      <div class="callout-grid">
        <div class="callout-item">
          <div class="callout-number">1</div>
          <div class="callout-text">
            <h4>حقل البريد الإلكتروني الرسمي (Work Email)</h4>
            <p>إدخال البريد المؤسسي المخصص للموظف أو الإداري المسجل مسبقاً في قاعدة بيانات المنظمة.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">2</div>
          <div class="callout-text">
            <h4>كلمة المرور المشفرة (Secure Password)</h4>
            <p>كلمة المرور الشخصية المحمية بنظام تشفير قوي (bcrypt) ومربوطة بسياسات أمان المؤسسة.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">3</div>
          <div class="callout-text">
            <h4>زر تسجيل الدخول وتوجيه الدور الآلي</h4>
            <p>يتحقق النظام فورياً من صلاحية المستخدم؛ حيث يتم تحويل السوبر أدمن تلقائياً إلى لوحة التحكم التنفيذية، والمدير المباشر إلى شاشة فريقه، والموظف إلى مساحة عمله اليومية.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">4</div>
          <div class="callout-text">
            <h4>شريط العزل المؤسسي (Multi-Tenant Isolation)</h4>
            <p>يضمن عزل بيانات كل مؤسسة وفرع بشكل كلي ومستقل عبر منظومة RLS لحماية سرية الرواتب والوثائق.</p>
          </div>
        </div>
      </div>

      <div class="callout-box callout-info" style="margin-top: 10px;">
        <strong>ملاحظة أمان:</strong> تتيح المنصة خاصية حفظ الجلسة المشفرة وتجديد التوكن التلقائي مع الالتزام بسياسات انتهاء الجلسات الآمنة عند الخمول.
      </div>
    </div>

    <div class="page-footer">
      <div>دليل الموظف — منصة HumAi</div>
      <div>صفحة 3</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 4: 1.2 مساحة عمل الموظف والحضور الذكي
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الأول: دليل الموظف | 1.2 الحضور الذكي بالـ GPS Geofence</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <h2 style="font-size: 16px; color: #0F172A;">مساحة عمل الموظف وتسجيل الحضور والانصراف</h2>
          <p style="color: #64748B; font-size: 11px;">المسار: <span class="font-mono text-emerald-600">/dashboard/employee</span> — تسجيل الحضور اللحظي بالتحقق الجغرافي الدقيق</p>
        </div>
        <span class="badge-pill badge-emerald">حضور ذكي جيومكاني</span>
      </div>

      ${renderFrame('smart-attendance', 'مساحة عمل الموظف ومسجل الحضور الذكي', '/dashboard/employee')}

      <div class="callout-grid">
        <div class="callout-item">
          <div class="callout-number">1</div>
          <div class="callout-text">
            <h4>الساعة الرقمية اللحظية ومؤشر الوردية الحالية</h4>
            <p>تعرض الساعة اللحظية بتوقيت القاهرة الرسمي (Africa/Cairo) مع اسم الوردية المعينة للموظف وتوقيت بدايتها ونهايتها وساعات الراحة المقررة.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">2</div>
          <div class="callout-text">
            <h4>محدد الفرع والتحقق الجغرافي (Branch Geofence Pin)</h4>
            <p>يحدد النظام عبر إحداثيات GPS بالمتصفح المسافة بالمتر بين الموظف والفرع المختار، ويمنع تسجيل الحضور إذا تجاوز الموظف نصف القطر المسموح (مثلاً 100م) إلا في حالة تفعيل العمل عن بُعد.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">3</div>
          <div class="callout-text">
            <h4>زر تسجيل الحضور (Check-In) والانصراف (Check-Out)</h4>
            <p>يسجل لحظة الدخول ويحسب بدقة دقائق التأخير بعد استهلاك فترة السماح المقررة (15 دقيقة افتراضياً)، كما يحسب زر الانصراف ساعات العمل الفعلية والإضافي المعتمد.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">4</div>
          <div class="callout-text">
            <h4>أزرار الإجراءات السريعة (Quick Action Buttons)</h4>
            <p>روابط فورية تمكن الموظف من طلب سلفة مالية، أو طلب تبديل وردية، أو استعراض أحدث قسيمة راتب معتمدة بضغطة زر واحدة.</p>
          </div>
        </div>
      </div>

      <div class="callout-box callout-pro" style="margin-top: 8px;">
        <strong>نظام الورديات الليلية:</strong> يدعم النظام الورديات الليلية الممتدة لبعد منتصف الليل تلقائياً؛ حيث يحتسب جلسة الحضور كوحدة دوام واحدة مع احتساب بدل السهر الليلي المقرر في الوردية.
      </div>
    </div>

    <div class="page-footer">
      <div>دليل الموظف — منصة HumAi</div>
      <div>صفحة 4</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 5: 1.3 طلب الإجازات والأذونات والسلف
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الأول: دليل الموظف | 1.3 الإجازات، الأذونات، والسلف المالية</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <h2 style="font-size: 16px; color: #0F172A;">إدارة الإجازات، الأذونات الساعية، وطلبات السلف</h2>
          <p style="color: #64748B; font-size: 11px;">نماذج الخدمة الذاتية لحساب الأرصدة وتقديم الطلبات إلكترونياً</p>
        </div>
        <span class="badge-pill badge-emerald">خدمة ذاتية متقدمة</span>
      </div>

      ${renderFrame('leaves-ledger', 'سجل وأرصدة الإجازات والأذونات', '/dashboard/leaves')}

      <div class="callout-grid">
        <div class="callout-item">
          <div class="callout-number">1</div>
          <div class="callout-text">
            <h4>أنواع الإجازات المدعومة بالنموذج</h4>
            <p>يدعم النموذج: الإجازة السنوية (Annual)، الإجازة العارضة (Casual)، الإذن الساعي (Permission)، الإجازة المرضية (Sick)، والإجازة بدون راتب (Unpaid) مع إمكانية إرفاق التقارير الطبية.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">2</div>
          <div class="callout-text">
            <h4>عداد الرصيد التفاعلي (Live Quota Tracker)</h4>
            <p>يحتسب النظام رصيد الإجازة السنوية (21 يوماً اعتيادياً أو 30 يوماً لمن تجاوز 50 سنة أو 10 سنوات خدمة) ورصيد العارضة (7 أيام)، ويمنع تجاوز الرصيد المتاح آلياً.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">3</div>
          <div class="callout-text">
            <h4>نافذة طلب السلفة المالية (Salary Advance Modal)</h4>
            <p>نافذة منبثقة تفحص سقف السلفة المسموح به للموظف (بحد أقصى 50% من الراتب الأساسي افتراضياً)، ولا تفتح إلا بعد بلوغ يوم الاستحقاق المحدد في إعدادات المنظمة (مثلاً 15 من الشهر).</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">4</div>
          <div class="callout-text">
            <h4>بطاقة تبديل الوردية مع الزملاء (Shift Swap Card)</h4>
            <p>اختيار الزميل المراد مبادلته وتاريخ الوردية البديلة؛ حيث يمر الطلب بمرحلتين: موافقة الزميل أولاً ثم اعتماد المدير المباشر لحفظ انتظام العمل.</p>
          </div>
        </div>
      </div>

      <div class="callout-box callout-warn" style="margin-top: 8px;">
        <strong>ملاحظة هامة حول السلف:</strong> يتم خصم قسط السلفة المالية المعتمدة تلقائياً في مسير الرواتب الشهري التالي عبر محرك Payroll دون أي تدخل يدوي.
      </div>
    </div>

    <div class="page-footer">
      <div>دليل الموظف — منصة HumAi</div>
      <div>صفحة 5</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 6: 1.4 الأهداف والـ KPIs وقسائم الرواتب
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الأول: دليل الموظف | 1.4 قسائم الرواتب ومتابعة الأهداف KPIs</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <h2 style="font-size: 16px; color: #0F172A;">قسائم الرواتب الرقمية المعتمدة ومتابعة المستهدفات</h2>
          <p style="color: #64748B; font-size: 11px;">المسار: <span class="font-mono text-emerald-600">/dashboard/payslips</span> و <span class="font-mono text-emerald-600">/dashboard/targets</span></p>
        </div>
        <span class="badge-pill badge-emerald">قسائم معتمدة وKPIs</span>
      </div>

      ${renderFrame('digital-payslips', 'قسيمة الراتب الرقمية المعتمدة وتفقيط البنود', '/dashboard/payslips')}

      <div class="callout-grid">
        <div class="callout-item">
          <div class="callout-number">1</div>
          <div class="callout-text">
            <h4>جدول الاستحقاقات التفصيلي (Total Earnings)</h4>
            <p>يوضح الراتب الأساسي، بدل السكن، بدل الانتقال، بدل الوردية الليلية، ساعات العمل الإضافي، ومكافآت التميز وعمولات المبيعات المحققة بدقة مليمترية.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">2</div>
          <div class="callout-text">
            <h4>جدول الاستقطاعات التفصيلي (Total Deductions)</h4>
            <p>يوثق بدقة خصومات دقائق التأخير، أيام الغياب بدون إذن، أقساط السلف المستردة، حصة الموظف في التأمينات الاجتماعية (11%)، وضريبة كسب العمل المستحقة.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">3</div>
          <div class="callout-text">
            <h4>صافي الراتب وقناة الصرف المعتمدة (Payout Channel)</h4>
            <p>يظهر صافي الراتب المستحق رقماً وتفقيطاً، مع توضيح قناة الصرف: حساب InstaPay أو الحساب البنكي برقم الآيبان (IBAN) أو صرف نقدي من الخزينة.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">4</div>
          <div class="callout-text">
            <h4>زر الطباعة والتصدير المعتمد (Certified PDF)</h4>
            <p>توليد مستند رسمي مطبوع يحتوي على الختم الإلكتروني، وتوقيع الإدارة المالية، وتفقيط الراتب وفق اشتراطات مكاتب العمل والتفتيش العمالي.</p>
          </div>
        </div>
      </div>

      <div class="callout-box callout-info" style="margin-top: 8px;">
        <strong>متابعة الأهداف KPIs:</strong> في شاشة المستهدفات التشغيلية، يسجل الموظف إنجازه اليومي (مهام منجزة، مكالمات، طلبات) مع متابعة شريط التقدم ونسبة تحقيق التارجت المالي والنوعي.
      </div>
    </div>

    <div class="page-footer">
      <div>دليل الموظف — منصة HumAi</div>
      <div>صفحة 6</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 7: 2.1 لوحة المدير المباشر ومركز الاعتمادات
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثاني: دليل المدير المباشر | 2.1 مراقبة الفريق ومركز الاعتمادات</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <h2 style="font-size: 16px; color: #0F172A;">لوحة المراقبة الحية لفريق العمل ومركز الاعتمادات</h2>
          <p style="color: #64748B; font-size: 11px;">المسار: <span class="font-mono text-emerald-600">/dashboard/manager</span> — رؤية لحظية للحضور، الغياب، والطلبات المعلقة</p>
        </div>
        <span class="badge-pill badge-emerald">إشراف لحظي ومباشر</span>
      </div>

      ${renderFrame('manager-overview', 'لوحة مراقبة المدير المباشر ومركز اعتمادات الفريق', '/dashboard/manager')}

      <div class="callout-grid">
        <div class="callout-item">
          <div class="callout-number">1</div>
          <div class="callout-text">
            <h4>بطاقات الإحصائيات اللحظية لفريق العمل</h4>
            <p>إحصائيات حية تقيس في الوقت الفعلي: إجمالي عدد أعضاء القسم، الحاضرين حالياً، المتأخرين، الغائبين، الموجودين في إجازة، ومن يعملون عن بُعد بتصريح رسمي.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">2</div>
          <div class="callout-text">
            <h4>جدول الحضور اللحظي ومؤشر الموقع الجغرافي</h4>
            <p>قائمة كاملة بأعضاء القسم توضح وقت تسجيل الدخول، والوردية المعينة، وشارة التحقق من النطاق الجغرافي (داخل الفرع / خارج النطاق / عن بُعد).</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">3</div>
          <div class="callout-text">
            <h4>مركز الاعتمادات الموحد (Approval Center Tabs)</h4>
            <p>تبويبات مخصصة لمراجعة طلبات الإجازات والأذونات الساعية، وطلبات تبديل الورديات، وتوصيات السلف المالية، مع عرض مبررات الموظف ورصيده المتبقي.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">4</div>
          <div class="callout-text">
            <h4>أزرار الاعتماد والرفض المسبّب (Approve / Reject)</h4>
            <p>زر الاعتماد الفوري لنقل الطلب إلى السجل النهائي، أو زر الرفض الذي يفرض إلزامية كتابة سبب الرفض لتصل رسالة فورية إلى الموظف بالسبب التوضيحي.</p>
          </div>
        </div>
      </div>

      <div class="callout-box callout-pro" style="margin-top: 8px;">
        <strong>تشغيل العطلات الرسمية:</strong> يتيح تبويب "تشغيل العطلات" للمدير تسجيل أعضاء الفريق الذين داوموا في أيام الراحات الرسمية أو العطلات لاعتماد بدل التشغيل الإضافي آلياً في الراتب.
      </div>
    </div>

    <div class="page-footer">
      <div>دليل المدير المباشر — منصة HumAi</div>
      <div>صفحة 7</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 8: 3.1 لوحة القيادة التنفيذية ومراقبة الدوام
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن | 3.1 لوحة القيادة وسجلات الدوام</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <h2 style="font-size: 16px; color: #0F172A;">الذكاء الإداري ومراقبة سجلات وساعات الدوام</h2>
          <p style="color: #64748B; font-size: 11px;">المسار: <span class="font-mono text-emerald-600">/dashboard/admin</span> و <span class="font-mono text-emerald-600">/dashboard/attendance</span></p>
        </div>
        <span class="badge-pill badge-emerald">مركز القيادة والتحكم</span>
      </div>

      ${renderFrame('admin-intelligence', 'لوحة القيادة الذكية والذكاء الإداري التنفيذي', '/dashboard/admin')}

      <div class="callout-grid">
        <div class="callout-item">
          <div class="callout-number">1</div>
          <div class="callout-text">
            <h4>المؤشرات التنفيذية الاستراتيجية (Executive KPIs)</h4>
            <p>بطاقات عليا تقيس إجمالي القوة العاملة النشطة، نسبة الانضباط العام لليوم، إجمالي فاتورة الرواتب التقديرية للشهر الجاري، وعدد الطلبات المعلقة على مستوى الشركة.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">2</div>
          <div class="callout-text">
            <h4>الرسوم البيانية التحليلية الذكية (HR Intelligence)</h4>
            <p>مخططات بيانية تفاعلية (Recharts) ترصد منحنى الالتزام بالدوام على مدار الشهر، وتوزيع الموظفين على الأقسام، ونسب التأخير والانصراف المبكر لكل فرع.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">3</div>
          <div class="callout-text">
            <h4>محرك البحث والتصفية المتقدم (Advanced Filters)</h4>
            <p>في شاشة الحضور (/dashboard/attendance)، إمكانية تصفية السجلات بنطاق زمني مخصص، بالقسم، بالموظف، أو بنوع الحالة (حاضر، متأخر، انصراف مبكر، غياب، عن بُعد).</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">4</div>
          <div class="callout-text">
            <h4>تعديل الحضور اليدوي وتصدير ملفات CSV</h4>
            <p>إمكانية قيام السوبر أدمن بتعديل يدوي لوقت الحضور أو الانصراف مع إلزامية تسجيل سبب التعديل للتدقيق الرقابي، وزر لتصدير كافة السجلات لملفات Excel/CSV.</p>
          </div>
        </div>
      </div>

      <div class="callout-box callout-info" style="margin-top: 8px;">
        <strong>إغلاق الجلسات التلقائي:</strong> يشمل النظام إجراءً برمجياً ذكياً يغلق جلسات الحضور المنسية من الأيام السابقة تلقائياً ويقيدها وفق سياسة الانصراف الرسمية للوردية.
      </div>
    </div>

    <div class="page-footer">
      <div>دليل السوبر أدمن — منصة HumAi</div>
      <div>صفحة 8</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 9: 3.2 دليل الموظفين والخزينة الرقمية للمستندات
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن | 3.2 دليل الموظفين والخزينة الرقمية</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <h2 style="font-size: 16px; color: #0F172A;">دليل الموظفين، قنوات الصرف والخزينة الرقمية</h2>
          <p style="color: #64748B; font-size: 11px;">المسار: <span class="font-mono text-emerald-600">/dashboard/employees</span> — إدارة السجلات الوظيفية والملفات الرسمية</p>
        </div>
        <span class="badge-pill badge-emerald">إدارة الكوادر والمستندات</span>
      </div>

      ${renderFrame('employee-vault', 'دليل الموظفين والخزينة الرقمية للوثائق الرسمية', '/dashboard/employees')}

      <div class="callout-grid">
        <div class="callout-item">
          <div class="callout-number">1</div>
          <div class="callout-text">
            <h4>نموذج إضافة وتعديل بيانات الموظف الشامل</h4>
            <p>تسجيل الاسم الكامل، الرقم القومي (14 رقماً للتحقق من العمر وصلاحية التأمينات)، البريد، الهاتف، الوظيفة، القسم، الرتبة (موظف/مدير/سوبر أدمن)، والوردية المخصصة.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">2</div>
          <div class="callout-text">
            <h4>قنوات صرف الرواتب (Payout Channels Setup)</h4>
            <p>تحديد طريقة صرف مستحقات كل موظف بدقة: (1) محفظة أو حساب InstaPay، (2) تحويل بنكي رسمي ببيانات اسم البنك ورقم الآيبان IBAN، (3) صرف نقدي من الخزينة.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">3</div>
          <div class="callout-text">
            <h4>الخزينة الرقمية لمسوغات التعيين (Document Vault)</h4>
            <p>رفع وتخزين آمن لمسوغات التعيين: بطاقة الرقم القومي، عقد العمل الموقع، المؤهل الدراسي، الموقف من التجنيد، صحيفة الحالة الجنائية (فيش وتشبيه)، وكارت التأمين الطبي.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">4</div>
          <div class="callout-text">
            <h4>تنبيهات انتهاء صلاحية الوثائق والتعاقدات</h4>
            <p>نظام إنذار مبكر يرصد تواريخ انتهاء العقود المحددة المدة وبطاقات الرقم القومي والشهادات الصحية، ويرسل إشعارات للإدارة قبل موعد الانتهاء بوقت كافٍ.</p>
          </div>
        </div>
      </div>

      <div class="callout-box callout-pro" style="margin-top: 8px;">
        <strong>ميزة البحث السريع:</strong> يدعم جدول الموظفين البحث الفوري بالاسم، الرقم القومي، رقم الهاتف، أو المسمى الوظيفي مع فرز فوري حسب القسم والحالة التشغيلية.
      </div>
    </div>

    <div class="page-footer">
      <div>دليل السوبر أدمن — منصة HumAi</div>
      <div>صفحة 9</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 10: 3.3 الهيكل التنظيمي وصانع العقود القانونية
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن | 3.3 الأقسام والعقود القانونية</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <h2 style="font-size: 16px; color: #0F172A;">الهيكل التنظيمي وصانع العقود القانونية الذكية</h2>
          <p style="color: #64748B; font-size: 11px;">المسار: <span class="font-mono text-emerald-600">/dashboard/departments</span> و <span class="font-mono text-emerald-600">/dashboard/contracts</span></p>
        </div>
        <span class="badge-pill badge-emerald">هيكل إداري وعقود ذكية</span>
      </div>

      ${renderFrame('departments-hierarchy', 'الهيكل التنظيمي وإدارة الأقسام وتعيين المدراء', '/dashboard/departments')}

      <div class="callout-grid">
        <div class="callout-item">
          <div class="callout-number">1</div>
          <div class="callout-text">
            <h4>إدارة الأقسام وتعيين مدراء الإدارات</h4>
            <p>إنشاء الأقسام والوحدات الإدارية، وتعيين المدير المباشر لكل قسم، مع إحصاء فوري لعدد الموظفين والورديات التابعة لكل إدارة لتنظيم سلاسل الموافقات.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">2</div>
          <div class="callout-text">
            <h4>محرك قوالب العقود (Contract Templates Engine)</h4>
            <p>نماذج عقود قانونية مسبقة الإعداد متوافقة مع قانون العمل المصري رقم 12 لسنة 2003 (عقد محدد المدة، عقد غير محدد المدة، عقد تدريب، واتفاقية عدم الإفصاح NDA).</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">3</div>
          <div class="callout-text">
            <h4>الاستبدال الآلي للمتغيرات (Dynamic Variable Injection)</h4>
            <p>يقوم المحرك تلقائياً بملء بيانات الموظف والراتب وتاريخ التعيين في بنود العقد عبر متغيرات برمجية مثل {{employee_name}} و {{national_id}} و {{basic_salary}} دون كتابة يدوية.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">4</div>
          <div class="callout-text">
            <h4>المعاينة والطباعة الفورية (Live PDF Preview)</h4>
            <p>معاينة شكل العقد المنسق قانونياً بصيغة PDF وطباعته جاهزاً لتوقيع الطرفين وبصمة الإبهام متضمناً خانات الشهود وممثلي الموارد البشرية.</p>
          </div>
        </div>
      </div>

      <div class="callout-box callout-info" style="margin-top: 8px;">
        <strong>مرونة التعديل:</strong> يمكن تخصيص أي بند من بنود العقد وتعديل الشروط الجزائية أو فترات الاختبار (3 أشهر كحد أقصى قانونياً) مباشرة من المحرر الذكي.
      </div>
    </div>

    <div class="page-footer">
      <div>دليل السوبر أدمن — منصة HumAi</div>
      <div>صفحة 10</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 11: 3.4 محرك الورديات والجدولة المتقدمة
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن | 3.4 محرك الورديات والجدولة المتقدمة</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <h2 style="font-size: 16px; color: #0F172A;">محرك الورديات والجدولة التشغيلية المتقدمة</h2>
          <p style="color: #64748B; font-size: 11px;">المسار: <span class="font-mono text-emerald-600">/dashboard/shifts</span> — إدارة الورديات الثابتة، الليلية، والمجزأة</p>
        </div>
        <span class="badge-pill badge-emerald">جدولة متقدمة وورديات</span>
      </div>

      ${renderFrame('shifts-engine', 'محرك الورديات وإدارة جداول العمل والتبديل', '/dashboard/shifts')}

      <div class="callout-grid">
        <div class="callout-item">
          <div class="callout-number">1</div>
          <div class="callout-text">
            <h4>الورديات الثابتة والاعتيادية (Fixed Shifts)</h4>
            <p>تحديد ساعات العمل القياسية (مثلاً من 09:00 إلى 17:00)، وتعيين أيام العمل الرسمية في الأسبوع، وتحديد دقائق الراحة المقتطعة لتطبيقها على الفرق الإدارية.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">2</div>
          <div class="callout-text">
            <h4>الورديات الليلية الممتدة (Overnight Shifts & Allowance)</h4>
            <p>دعم كامل للورديات التي تعبر منتصف الليل (مثلاً 22:00 إلى 06:00 ص) مع تحديد قيمة بدل الوردية الليلية (Night Shift Allowance) ليضاف تلقائياً لمستحقات الموظف.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">3</div>
          <div class="callout-text">
            <h4>الورديات المجزأة (Split Shifts Engine)</h4>
            <p>ميزة متقدمة للأنشطة التجارية والمطاعم؛ تتيح تقسيم يوم العمل إلى فترتين منفصلتين (مثلاً فترة صباحية 10:00-14:00 وفترة مسائية 18:00-22:00) باحتساب دوام واحد.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">4</div>
          <div class="callout-text">
            <h4>الجدولة الدوارة وسجل التبديل (Rotational Rosters)</h4>
            <p>جدولة الورديات الدوارة (أسبوعياً أو كل أسبوعين)، مع إدارة مركزية لكافة طلبات تبديل الورديات التي تمت بين الموظفين وفحص أثرها على سير العمل.</p>
          </div>
        </div>
      </div>

      <div class="callout-box callout-pro" style="margin-top: 8px;">
        <strong>الربط الآلي مع الحضور:</strong> بمجرد تعيين الوردية للموظف، يتعرف محرك الحضور فورياً على مواعيد حضوره، ويقيس فترات التأخير بدقة طبقاً لتوقيت الوردية الخاصة به دون أي تضارب.
      </div>
    </div>

    <div class="page-footer">
      <div>دليل السوبر أدمن — منصة HumAi</div>
      <div>صفحة 11</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 12: 3.5 محرك الرواتب الآلي الشامل
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن | 3.5 محرك الرواتب الآلي الشامل</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <h2 style="font-size: 16px; color: #0F172A;">محرك الرواتب الآلي وحساب الاستحقاقات والضرائب</h2>
          <p style="color: #64748B; font-size: 11px;">المسار: <span class="font-mono text-emerald-600">/dashboard/payroll</span> — دورة الرواتب (من 26 إلى 25) وملفات البنوك</p>
        </div>
        <span class="badge-pill badge-emerald">محرك الرواتب الذكي</span>
      </div>

      ${renderFrame('payroll-engine', 'محرك الرواتب الآلي وحساب المستحقات والاستقطاعات', '/dashboard/payroll')}

      <div class="callout-grid">
        <div class="callout-item">
          <div class="callout-number">1</div>
          <div class="callout-text">
            <h4>دورة الرواتب المعتمدة (من 26 إلى 25) وحساب كسور الشهر</h4>
            <p>حساب مسير الراتب من يوم 26 في الشهر السابق إلى يوم 25 في الشهر الحالي، مع تطبيق معادلة حساب كسور الشهر (Proration Matrix) تلقائياً للملتحقين الجدد أو المستقيلين.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">2</div>
          <div class="callout-text">
            <h4>الخصم الآلي لأقساط السلف والجزاءات</h4>
            <p>استيراد فوري لكافة السلف المعتمدة وخصم القسط الشهري، وخصم جزاءات دقائق التأخير المحسوبة من محرك الحضور، وأيام الغياب بدون إذن دون أي خطأ بشري.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">3</div>
          <div class="callout-text">
            <h4>مفاتيح الضرائب والتأمينات الاجتماعية (Statutory Toggles)</h4>
            <p>تفعيل أو إيقاف استقطاع التأمينات الاجتماعية (11% حصة الموظف و 18.75% حصة صاحب العمل) وحساب ضريبة كسب العمل طبقاً للشرائح التصاعدية والإعفاء الشخصي لمصلحة الضرائب.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">4</div>
          <div class="callout-text">
            <h4>تصدير ملفات البنوك المعتمدة (WPS / ACH Bank Export)</h4>
            <p>توليد ملفات التحويل المصرفي المعتمدة للبنوك المصرية (CIB, QNB, الأهلي، مصر) وملف التحويل المجمع لـ InstaPay لصرف الرواتب بنقرة زر واحدة.</p>
          </div>
        </div>
      </div>

      <div class="callout-box callout-warn" style="margin-top: 8px;">
        <strong>إقفال المسير المالي (Payroll Locking):</strong> بمجرد اعتماد مسير الرواتب من قِبل السوبر أدمن، يتم إقفال الدورة الشهرية لمنع أي تعديل مزدوج وتوليد القسائم الرقمية في حسابات الموظفين فوراً.
      </div>
    </div>

    <div class="page-footer">
      <div>دليل السوبر أدمن — منصة HumAi</div>
      <div>صفحة 12</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 13: 3.6 المبيعات والعمولات والتقييمات
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن | 3.6 المبيعات والعمولات وتقييمات الأداء</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <h2 style="font-size: 16px; color: #0F172A;">إدارة المبيعات، العمولات، وتقييمات الأداء 4 نجوم</h2>
          <p style="color: #64748B; font-size: 11px;">المسار: <span class="font-mono text-emerald-600">/dashboard/sales</span> و <span class="font-mono text-emerald-600">/dashboard/evaluations</span></p>
        </div>
        <span class="badge-pill badge-emerald">أداء ومبيعات وعمولات</span>
      </div>

      ${renderFrame('sales-tracker', 'محرك تسجيل الصفقات البيعية وحساب العمولات', '/dashboard/sales')}

      <div class="callout-grid">
        <div class="callout-item">
          <div class="callout-number">1</div>
          <div class="callout-text">
            <h4>تسجيل الصفقات البيعية وربطها بالمسؤول</h4>
            <p>نموذج تسجيل عمليات البيع يتضمن: اسم الصفقة، العميل، القيمة المالية بالجنيه، تاريخ الإغلاق، ومندوب المبيعات المسؤول لمتابعة أداء فريق المبيعات.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">2</div>
          <div class="callout-text">
            <h4>محرك احتساب العمولات والترحيل للراتب</h4>
            <p>احتساب نسبة العمولة (سواء نسبة ثابتة أو شرائح تصاعدية حسب القيمة)، مع إمكانية اعتماد العمولة لترحيلها آلياً إلى خانة الاستحقاقات في راتب الشهر الحالي.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">3</div>
          <div class="callout-text">
            <h4>منظومة تقييم الأداء بالـ 4 معايير (4-Star Criteria)</h4>
            <p>تقييم ربع سنوي يرتكز على 4 أركان رئيسية: (1) جودة الإنتاجية، (2) الانضباط بمواعيد العمل، (3) التعاون والعمل الجماعي، (4) المبادرة وحل المشكلات التشغيلية.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">4</div>
          <div class="callout-text">
            <h4>الربط بالأثر المالي (مكافآت التميز / خطط التحسين)</h4>
            <p>حساب النتيجة المئوية الإجمالية لكل موظف، مع ربط التقييم الممتاز بمكافأة تميز تضاف للراتب، أو فتح خطة تحسين أداء (PIP) في حال تدني التقييم.</p>
          </div>
        </div>
      </div>

      <div class="callout-box callout-info" style="margin-top: 8px;">
        <strong>تكامل بيعي ومالي:</strong> تضمن منصة HumAi الربط السلس بين أرقام المبيعات المحققة ومسيرات الرواتب دون الحاجة لشيتات إكسيل وسيطة قد تسبب أخطاء في حساب العمولات.
      </div>
    </div>

    <div class="page-footer">
      <div>دليل السوبر أدمن — منصة HumAi</div>
      <div>صفحة 13</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 14: 3.7 سجل التدقيق والحوكمة الرقابية
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن | 3.7 سجل التدقيق والحوكمة</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <h2 style="font-size: 16px; color: #0F172A;">سجل الرقابة ومسار التدقيق غير القابل للتلاعب</h2>
          <p style="color: #64748B; font-size: 11px;">المسار: <span class="font-mono text-emerald-600">/dashboard/audit-logs</span> — توثيق الحركات الإدارية مع مقارنة JSON Diff</p>
        </div>
        <span class="badge-pill badge-emerald">حوكمة وأمان تام</span>
      </div>

      ${renderFrame('audit-trail', 'سجل التدقيق الرقابي ومقارنة الفروق اللحظية', '/dashboard/audit-logs')}

      <div class="callout-grid">
        <div class="callout-item">
          <div class="callout-number">1</div>
          <div class="callout-text">
            <h4>توثيق هوية الفاعل والحركة (Actor & Action Tracking)</h4>
            <p>تسجيل كامل لبيانات القائم بالإجراء: البريد الإلكتروني، الرتبة الإدارية، عنوان الـ IP، والتوقيت الزمني الدقيق بالثانية لكل حركة إدارية تتم بالنظام.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">2</div>
          <div class="callout-text">
            <h4>تصنيف العمليات (CREATE, UPDATE, DELETE, OVERRIDE)</h4>
            <p>تصنيف بصري ملون يوضح نوع العملية الإدارية والكيان المتأثر بها (ملف موظف، تعديل راتب، تغيير وقت حضور، اعتماد إجازة، أو تعديل سياسة فرع).</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">3</div>
          <div class="callout-text">
            <h4>عارض الفروق الذكي (JSON Before/After Diff Viewer)</h4>
            <p>أداة مقارنة متقدمة تكشف القيمة الأصلية للبيانات قبل التعديل والقيمة الجديدة بعد التعديل، مما يمنع التلاعب السري في الرواتب أو سجلات الحضور والانصراف.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">4</div>
          <div class="callout-text">
            <h4>تصدير تقارير الامتثال والحوكمة الرقابية</h4>
            <p>تصدير كامل لسجلات التدقيق لتقديمها لمجالس الإدارة أو لجان المراجعة والتدقيق الخارجي لإثبات الشفافية والامتثال المؤسسي الكامل.</p>
          </div>
        </div>
      </div>

      <div class="callout-box callout-pro" style="margin-top: 8px;">
        <strong>أمان السجلات:</strong> يتم حفظ سجلات التدقيق في جداول مؤمنة ضد التعديل أو الحذف (Immutable Ledger) لضمان موثوقيتها القانونية أمام الجهات الرقابية.
      </div>
    </div>

    <div class="page-footer">
      <div>دليل السوبر أدمن — منصة HumAi</div>
      <div>صفحة 14</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 15: 3.8 إعدادات النظام وسياسات الفروع والـ GPS
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الجزء الثالث: دليل السوبر أدمن | 3.8 إعدادات النظام وسياسات الفروع</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <h2 style="font-size: 16px; color: #0F172A;">إعدادات النظام، الفروع، GPS Geofence وسياسات التأخير</h2>
          <p style="color: #64748B; font-size: 11px;">المسار: <span class="font-mono text-emerald-600">/dashboard/settings</span> — ضبط سياسات العمل والخصومات والفروع</p>
        </div>
        <span class="badge-pill badge-emerald">مركز الإعدادات والسياسات</span>
      </div>

      ${renderFrame('system-settings', 'مركز إعدادات النظام وتحديد النطاق الجغرافي للفروع', '/dashboard/settings')}

      <div class="callout-grid">
        <div class="callout-item">
          <div class="callout-number">1</div>
          <div class="callout-text">
            <h4>إعداد الفروع ومحلل روابط Google Maps الذكي</h4>
            <p>إضافة فروع الشركة؛ حيث يدعم النظام لصق رابط الموقع مباشرة من Google Maps ليقوم المحرك الذكي باستخراج خطوط الطول والعرض (Lat/Lng) بدقة فائقة.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">2</div>
          <div class="callout-text">
            <h4>شريط تحديد نصف قطر النطاق الجغرافي (Geofence Radius)</h4>
            <p>شريط تحكم لتحديد المسافة المسموح بها لتسجيل الحضور حول مقر الفرع (من 20 متراً إلى 1000 متر) لمنع تسجيل الحضور الوهمي من خارج مقر العمل.</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">3</div>
          <div class="callout-text">
            <h4>فترة السماح ومصفوفة خصومات التأخير (Lateness Modes)</h4>
            <p>تحديد دقائق السماح (مثلاً 15 دقيقة)، واختيار أسلوب الخصم: (أ) خصم بالدقيقة الواحدة (Minute-by-minute) أو (ب) خصم تصاعدي بالشرائح (إنذار، ربع يوم، نصف يوم، يوم كامل).</p>
          </div>
        </div>
        <div class="callout-item">
          <div class="callout-number">4</div>
          <div class="callout-text">
            <h4>سياسات السلف، الإضافي، ومفاتيح المزايا (Feature Toggles)</h4>
            <p>ضبط سقف السلف (50%)، وتحديد معامل الإضافي (1.5x لليوم العادي و 2.0x للعطلات)، ومفاتيح تشغيل وإيقاف: العمل عن بُعد، متابعة المبيعات، ونظام الـ KPIs.</p>
          </div>
        </div>
      </div>

      <div class="callout-box callout-warn" style="margin-top: 8px;">
        <strong>تطبيق السياسات الفوري:</strong> أي تعديل يجريه السوبر أدمن على فترة السماح أو نصف قطر الفرع ينعكس فورياً ولحظياً على جميع جلسات الموظفين القادمة.
      </div>
    </div>

    <div class="page-footer">
      <div>دليل السوبر أدمن — منصة HumAi</div>
      <div>صفحة 15</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════
       PAGE 16: الملحق الفني ومصفوفة الصلاحيات والدعم
       ═══════════════════════════════════════════════════════════════════ -->
  <div class="page-sheet">
    <div>
      <div class="page-header-nav">
        <div class="page-header-title">الملحق الفني | مصفوفة الصلاحيات (RBAC) والتوافق القانوني</div>
        <div class="page-header-brand">HumAi Platform</div>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 16px; color: #0F172A; margin-bottom: 4px;">مصفوفة الصلاحيات والتوافق مع قانون العمل المصري</h2>
        <p style="color: #64748B; font-size: 11px;">جدول الصلاحيات المفصل للأدوار الثلاثة في منصة HumAi، والضوابط القانونية المدمجة بمحرك النظام.</p>
      </div>

      <table class="spec-table">
        <thead>
          <tr>
            <th style="width: 32%;">المهمة / الخاصية التشغيلية</th>
            <th style="width: 22%; text-align: center;">الموظف (Employee)</th>
            <th style="width: 23%; text-align: center;">المدير المباشر (Manager)</th>
            <th style="width: 23%; text-align: center;">السوبر أدمن (Super Admin)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>تسجيل الحضور بالـ GPS والانصراف</strong></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">نعم (فرعه فقط)</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">نعم (فرعه فقط)</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">نعم (كافة الفروع)</span></td>
          </tr>
          <tr>
            <td><strong>طلب الإجازات والأذونات والسلف</strong></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">نعم (شخصي)</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">نعم (شخصي)</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">نعم (شخصي)</span></td>
          </tr>
          <tr>
            <td><strong>اعتماد إجازات وسلف وتبديل ورديات الفريق</strong></td>
            <td style="text-align: center;"><span class="badge-pill badge-rose">لا يملك صلاحية</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">نعم (أعضاء قسمه)</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">نعم (كافة الأقسام)</span></td>
          </tr>
          <tr>
            <td><strong>الاطلاع على قسائم الرواتب</strong></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">قسيمته فقط</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">قسيمته فقط</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">كافة موظفي الشركة</span></td>
          </tr>
          <tr>
            <td><strong>تشغيل وحساب مسير الرواتب الآلي</strong></td>
            <td style="text-align: center;"><span class="badge-pill badge-rose">لا يملك صلاحية</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-rose">لا يملك صلاحية</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">صلاحية حصرية كاملة</span></td>
          </tr>
          <tr>
            <td><strong>إضافة/تعديل الموظفين والخزينة الرقمية</strong></td>
            <td style="text-align: center;"><span class="badge-pill badge-rose">لا يملك صلاحية</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-rose">عرض محدود</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">صلاحية كاملة وإدارة</span></td>
          </tr>
          <tr>
            <td><strong>صياغة العقود وتوليد النماذج القانونية</strong></td>
            <td style="text-align: center;"><span class="badge-pill badge-rose">لا يملك صلاحية</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-rose">لا يملك صلاحية</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">صلاحية حصرية كاملة</span></td>
          </tr>
          <tr>
            <td><strong>تعديل إعدادات الفروع ونطاق الـ GPS</strong></td>
            <td style="text-align: center;"><span class="badge-pill badge-rose">لا يملك صلاحية</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-rose">لا يملك صلاحية</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">صلاحية حصرية كاملة</span></td>
          </tr>
          <tr>
            <td><strong>الاطلاع على مسار التدقيق الرقابي JSON Diff</strong></td>
            <td style="text-align: center;"><span class="badge-pill badge-rose">لا يملك صلاحية</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-rose">لا يملك صلاحية</span></td>
            <td style="text-align: center;"><span class="badge-pill badge-emerald">صلاحية حصرية كاملة</span></td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 14px;">
        <h3 style="font-size: 13px; color: #0F172A; margin-bottom: 6px;">بنود التوافق مع قانون العمل المصري رقم 12 لسنة 2003:</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div class="callout-box callout-info">
            <div>
              <strong>مادة 47 (الإجازات السنوية):</strong> 21 يوماً بأجر كامل لمن أمضى سنة، تزداد إلى 30 يوماً لمن تجاوز 50 سنة أو بلغت خدمته 10 سنوات، و7 أيام عارضة بحد أقصى يومين متتاليين.
            </div>
          </div>
          <div class="callout-box callout-info">
            <div>
              <strong>مادة 85 (ساعات العمل الإضافي):</strong> أجر إضافي لا يقل عن الأجر الأصلي مضافاً إليه 35% عن ساعات النهار و70% عن ساعات الليل، ومضاعفة الأجر (100%) في العطلات الرسمية.
            </div>
          </div>
        </div>
      </div>

      <div style="background-color: #0F172A; color: #F8FAFC; border-radius: 8px; padding: 12px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 12px; font-weight: 800; color: #10B981;">مركز دعم وتشغيل منصة HumAi</div>
          <div style="font-size: 10px; color: #94A3B8; margin-top: 2px;">فريق الدعم الفني والعمليات متاح لخدمتكم على مدار الساعة طوال أيام الأسبوع.</div>
        </div>
        <div style="text-align: left; font-size: 10px; color: #E2E8F0;">
          <div>الدعم الفني: support@humai.io</div>
          <div class="font-mono">https://humai.io</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>دليل التشغيل والاستخدام — منصة HumAi | وثيقة معتمدة ومحمية بموجب حقوق النشر © 2026</div>
      <div>صفحة 16</div>
    </div>
  </div>

</body>
</html>
  `;
}

module.exports = { generateManualHtml };
