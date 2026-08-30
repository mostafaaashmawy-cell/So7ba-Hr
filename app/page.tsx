import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowLeft, 
  Play, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  MessageSquare, 
  Layers, 
  Quote, 
  CheckCircle, 
  Cpu, 
  TrendingUp, 
  CreditCard 
} from 'lucide-react';
import { MarketingNavbar } from '@/components/marketing/layout/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/layout/MarketingFooter';
import { WhatsAppChatDemo } from '@/components/marketing/shared/WhatsAppChatDemo';
import { ComparisonSection } from '@/components/marketing/shared/ComparisonTable';
import { FAQAccordion, DEFAULT_FAQS } from '@/components/marketing/shared/FAQAccordion';
import { CTASection } from '@/components/marketing/shared/CTASection';

export const metadata = {
  title: 'HumAi | نظام إدارة موارد بشرية ذكي مدعوم بمساعد واتساب — لشركات مصر والشرق الأوسط',
  description: 'أدر الحضور والانصراف، الإجازات، والرواتب من لوحة تحكم واحدة، أو مباشرة عبر واتساب. نظام HR سحابي مصمم خصيصاً للشركات الصغيرة والمتوسطة في مصر والمنطقة العربية.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <MarketingNavbar />

      <main className="flex-1">
        {/* ── 1. Hero Section ── */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {/* Subtle Glow circles */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-teal-500/30 shadow-inner">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-xs sm:text-sm font-semibold text-teal-300">
                  الجيل الجديد من إدارة الموارد البشرية والرواتب
                </span>
              </div>

              {/* H1 Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.25] sm:leading-[1.2]">
                إدارة الموارد البشرية والرواتب... في مكان واحد، وبأمر واحد على واتساب.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
                HumAi هو النظام السحابي المتكامل لإدارة الحضور، الإجازات، الرواتب، ولوائح العمل — مصمم خصيصاً للشركات الصغيرة والمتوسطة في مصر والشرق الأوسط، ومدعوم بمساعد ذكاء اصطناعي يفهم لغتك ويتحدث معك على واتساب.
              </p>

              {/* CTA Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all duration-200 shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
                >
                  <span>ابدأ تجربتك المجانية — بدون بطاقة ائتمان</span>
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <a
                  href="#whatsapp-demo"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-800 transition-all border border-slate-700 flex items-center justify-center gap-2"
                >
                  <span>شاهد مساعد واتساب في العمل</span>
                  <Play className="w-4 h-4 text-teal-400 fill-teal-400" />
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-300 leading-snug">
                    مصمم وفق أفضل ممارسات وقوانين العمل المصرية والإقليمية
                  </span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-300 leading-snug">
                    بنية بيانات معزولة بالكامل لكل شركة (Multi-Tenant Security)
                  </span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-300 leading-snug">
                    دعم كامل لقنوات الدفع المحلية: InstaPay، المحافظ الإلكترونية، التحويل البنكي
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Numbers that Inspire Trust (أرقام تستحق الثقة) ── */}
        <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                أرقام تستحق الثقة
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                كفاءة تشغيلية مثبتة تنعكس مباشرة على وقتك وميزانية شركتك
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3 relative overflow-hidden group hover:border-teal-500/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold text-teal-400 tracking-tight font-sans">
                  80%
                </div>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">
                  وفّر حتى 80% من الوقت المستغرق شهرياً في إعداد مسيرات الرواتب وحساب الاستقطاعات
                </p>
              </div>

              {/* Stat 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3 relative overflow-hidden group hover:border-teal-500/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
                  Geofencing
                </div>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">
                  رصد حضور دقيق عبر التحقق بالموقع الجغرافي يحدّ من التلاعب في التسجيل
                </p>
              </div>

              {/* Stat 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3 relative overflow-hidden group hover:border-teal-500/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold text-teal-400 tracking-tight font-sans">
                  ثوانٍ معدودة
                </div>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">
                  استعلم في ثوانٍ عن حضور وغياب فريقك مباشرة من واتساب — بدون فتح أي شاشة
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Core Pillars (ركائز النظام الثلاث) ── */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
                <Layers className="w-3.5 h-3.5" />
                <span>الأساس المتين</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                ركائز النظام الثلاث
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                ثلاثة أركان رئيسية صُممت لتمنح أصحاب الأعمال والمديرين راحة بال تامة وسيطرة محكمة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5 hover:border-teal-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-lg">
                    ①
                  </div>
                  <h3 className="text-xl font-bold text-white">منظومة إدارية متكاملة</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    لوحة تحكم مرنة تمنحك سيطرة كاملة على ملفات الموظفين، العقود الرقمية، إدارة الشفتات، ورصيد الإجازات — بدقة وحوكمة مشددة.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-teal-400 font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>حوكمة كاملة لملفات الموظفين</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5 hover:border-teal-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-lg">
                    ②
                  </div>
                  <h3 className="text-xl font-bold text-white">مكتبة قوالب تشغيل جاهزة</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    لا تبدأ من الصفر. فعّل لوائح الحضور، نماذج العقود، وسياسات الجزاءات والمكافآت المعتمدة للشركات المصرية بضغطة زر.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-teal-400 font-semibold">
                  <Link href="/blueprints" className="hover:underline flex items-center gap-1">
                    <span>استكشف مكتبة Blueprints</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-slate-900 border-2 border-teal-500/50 rounded-3xl p-8 space-y-5 shadow-lg shadow-teal-500/5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-lg">
                    ③
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">مدير تنفيذي على واتساب</h3>
                    <span className="text-[10px] bg-teal-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                      AI Powered
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    مساعد ذكي متصل مباشرة ببيانات شركتك. اسأله بالعامية المصرية عن التأخيرات، أو اطلب منه تسجيل مكافأة أو اعتماد إجازة فوراً وأنت في طريقك.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-teal-400 font-semibold">
                  <Link href="/whatsapp-assistant" className="hover:underline flex items-center gap-1">
                    <span>تعرف على قدرات المساعد</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. WhatsApp Interactive Demo Section ── */}
        <section id="whatsapp-demo" className="py-20 bg-slate-900/60 border-y border-slate-800 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>تجربة تفاعلية حية</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                شاهد مساعد واتساب في العمل
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                جرّب بنفسك كيف يفهم المساعد الذكي استفساراتك اليومية بالعامية المصرية وينفذ العمليات بدقة وأمان
              </p>
            </div>

            <WhatsAppChatDemo />
          </div>
        </section>

        {/* ── 5. How It Works (كيف يعمل النظام؟) ── */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>خطوات سريعة</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                كيف يعمل النظام؟
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                انتقل من التعقيد الإداري إلى التشغيل المؤتمت بالكامل في 3 خطوات بسيطة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 relative">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 font-bold flex items-center justify-center shadow-md">
                  1
                </div>
                <h3 className="text-lg font-bold text-white">أنشئ حساب شركتك في دقيقتين</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  اختر اسم الشركة وفروعك الجغرافية، وحدد مواعيد العمل الأساسية بكل سهولة.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 relative">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 font-bold flex items-center justify-center shadow-md">
                  2
                </div>
                <h3 className="text-lg font-bold text-white">اختر Blueprint مناسب لنشاطك</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  طبّق شفتات ولوائح جاهزة ومجرّبة (تجزئة، مكاتب، مطاعم، وكالات) بضغطة زر واحدة.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 relative">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 font-bold flex items-center justify-center shadow-md">
                  3
                </div>
                <h3 className="text-lg font-bold text-white">أضف فريقك وابدأ التشغيل</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  الموظفون يسجلون الحضور من الموبايل، والنظام يحسب الخصومات والسلف ومسيرات الرواتب تلقائياً.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Comparison Section (ليه HumAi وملهوش غيره؟) ── */}
        <ComparisonSection />

        {/* ── 7. Testimonials Section (آراء العملاء) ── */}
        <section className="py-20 bg-slate-900/30 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
                <Quote className="w-3.5 h-3.5" />
                <span>تجارب حقيقية</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                آراء العملاء ودراسات الحالة التجريبية
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                ماذا يقول قادة الشركات والمديرون التنفيذيون بعد تجربة HumAi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {'★★★★★'}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    &ldquo;وفرنا أكثر من 15 ساعة كنا بنقضيها شهرياً في حساب الإكسيل ومراجعة الخصومات والسلف.. ومساعد واتساب خلاني أتابع الشغل وأنا برّه المكتب بكل سهولة.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-teal-400 font-bold flex items-center justify-center text-sm border border-slate-700">
                    أ.م
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">أحمد م.</h4>
                    <p className="text-xs text-slate-400">مدير تنفيذي لشركة تجارة وتوزيع</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {'★★★★★'}
                    </div>
                    {/* TODO: replace with real client data */}
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                      دراسة حالة تجريبية (Pilot)
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    &ldquo;من ساعة ما بدأنا نستخدم HumAi، بقى عندي رؤية لحظية على كل فروعي من مكان واحد — حاجة كنت بستنى فيها ريبورت من المحاسب كل شهر.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                  {/* TODO: replace with real photo */}
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-teal-400 font-bold flex items-center justify-center text-sm border border-slate-700">
                    م.ح
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">م. حسام ع.</h4>
                    <p className="text-xs text-slate-400">مدير تشغيل — سلسلة مطاعم وكافيهات</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {'★★★★★'}
                    </div>
                    {/* TODO: replace with real client data */}
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                      دراسة حالة تجريبية (Pilot)
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    &ldquo;تسجيل الحضور بالبصمة الجغرافية على موبايلات الموظفين قضى تماماً على التلاعب، ومسير الرواتب بينزل بالخصومات المعتمدة بضغطة زر.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                  {/* TODO: replace with real photo */}
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-teal-400 font-bold flex items-center justify-center text-sm border border-slate-700">
                    س.ك
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">سارة ك.</h4>
                    <p className="text-xs text-slate-400">مديرة موارد بشرية — وكالة تسويق رقمي</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. FAQ Accordion ── */}
        <FAQAccordion items={DEFAULT_FAQS} />

        {/* ── 9. Final CTA ── */}
        <CTASection
          title="جاهز تنقل إدارة شركتك لعصر الأتمتة الذكية؟"
          description="انضم الآن وابدأ إدارة فريقك بكفاءة ودقة وبدون أي تعقيد."
          buttonText="ابدأ الآن مجاناً — بدون بطاقة ائتمان"
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
