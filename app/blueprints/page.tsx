import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Layers, 
  CheckCircle2, 
  Briefcase, 
  Store, 
  Building, 
  Zap, 
  Sliders, 
  Scale 
} from 'lucide-react';
import { MarketingNavbar } from '@/components/marketing/layout/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/layout/MarketingFooter';
import { CTASection } from '@/components/marketing/shared/CTASection';

export const metadata = {
  title: 'قوالب تشغيل جاهزة لإدارة الموارد البشرية | HumAi Blueprints',
  description: 'قوالب تشغيل إدارية جاهزة ومجرّبة.. شغّل شركتك وفق أفضل الممارسات في دقائق. اختر Blueprint يناسب نشاطك التجاري.',
};

export default function BlueprintsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <MarketingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-14 pb-20 md:pt-20 md:pb-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-6">
              <Layers className="w-3.5 h-3.5" />
              <span>مكتبة Blueprints الجاهزة</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.25] max-w-4xl mx-auto">
              قوالب تشغيل إدارية جاهزة ومجرّبة.. شغّل شركتك وفق أفضل الممارسات في دقائق.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              لا تضيّع وقتك في صياغة لوائح الحضور أو كتابة نماذج العقود من الصفر. توفر لك HumAi مكتبة متكاملة من الـBlueprints المصممة لتلائم مختلف الأنشطة التجارية في السوق المحلي.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
              >
                <span>ابدأ بتطبيق Blueprint مجاناً</span>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Blueprint Cards */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                أنواع القوالب المتاحة لنشاطك
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                اختر القالب الأنسب لنموذج عملك، وفّعله فوراً مع إمكانية التخصيص في أي وقت
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Blueprint 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-teal-500/40 transition-all shadow-xl">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">قالب الشركات الخدمية والوكالات</h3>
                    <div className="mt-2 text-xs font-semibold text-teal-300 bg-teal-950/80 px-3 py-1 rounded-full inline-block border border-teal-500/30">
                      الفائدة: مرونة كاملة لفرق العمل عن بُعد بدون تعقيد إداري
                    </div>
                  </div>
                  <ul className="space-y-3.5 text-sm text-slate-300 pt-2 border-t border-slate-800">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>ساعات عمل مرنة (Flexible Hours) تتناسب مع طبيعة المشاريع</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>تسجيل حضور عن بُعد بدون قيود جغرافية صارمة</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>إدارة مستهدفات المشاريع وتقييمات الأداء الدورية</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/contact"
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-center text-xs font-bold transition-colors border border-slate-700 block"
                >
                  اختر هذا القالب
                </Link>
              </div>

              {/* Blueprint 2 */}
              <div className="bg-slate-900 border-2 border-teal-500/60 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-teal-500 transition-all shadow-xl shadow-teal-500/5 relative">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">قالب المحلات وسلاسل التجزئة والمطاعم</h3>
                    <div className="mt-2 text-xs font-semibold text-teal-300 bg-teal-950/80 px-3 py-1 rounded-full inline-block border border-teal-500/30">
                      الفائدة: ضبط دقيق للورديات المتعددة الفروع بدون تسجيل حضور وهمي
                    </div>
                  </div>
                  <ul className="space-y-3.5 text-sm text-slate-300 pt-2 border-t border-slate-800">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>إدارة الشفتات المتغيرة والورديات الليلية الممتدة لبعد منتصف الليل</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>ربط الحضور بالبصمة الجغرافية الدقيقة لكل فرع لمنع التلاعب</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>احتساب بدلات العمل في العطلات الرسمية والمناوبات الإضافية تلقائياً</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/contact"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 hover:from-teal-300 hover:to-emerald-300 text-center text-xs font-bold transition-all shadow-md block"
                >
                  اختر هذا القالب
                </Link>
              </div>

              {/* Blueprint 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-teal-500/40 transition-all shadow-xl">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">قالب الشركات الصغيرة والمكاتب الناشئة</h3>
                    <div className="mt-2 text-xs font-semibold text-teal-300 bg-teal-950/80 px-3 py-1 rounded-full inline-block border border-teal-500/30">
                      الفائدة: منظومة رواتب كاملة جاهزة من اليوم الأول بدون خبرة HR سابقة
                    </div>
                  </div>
                  <ul className="space-y-3.5 text-sm text-slate-300 pt-2 border-t border-slate-800">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>دورة رواتب قياسية (من 26 إلى 25 من كل شهر)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>لائحة إجازات سنوية (21 يوم) وضوابط سلف بحد أقصى 50% من الراتب</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>منشئ عقود عمل ونماذج استلام نقدية وتحويلات InstaPay فورية</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/contact"
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-center text-xs font-bold transition-colors border border-slate-700 block"
                >
                  اختر هذا القالب
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Key Blueprint Features (مميزات استخدام الـBlueprints) */}
        <section className="py-20 bg-slate-900/60 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                مميزات استخدام الـBlueprints
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                لماذا تفضل الشركات بدء رحلتها مع قوالب HumAi الإدارية؟
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-7 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">تفعيل بنقرة واحدة</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  تطبيق اللائحة وسياسات التأخير والخصومات والورديات تلقائياً على حساب شركتك دون إعداد يدوي مجهد.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-7 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">قابلة للتخصيص بالكامل</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  عدّل ساعات العمل، نسب الخصومات، ومسارات الموافقات في أي وقت بما يلائم متطلبات شركتك الخاصة.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-7 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">مبنية وفق ممارسات السوق المصري</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  معدّة استناداً إلى أفضل الممارسات المتبعة محلياً، مع توصية دائمة بمراجعة قانونية دورية لضمان التوافق التام.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <CTASection
          title="ابدأ بتطبيق Blueprint نشاطك اليوم في دقائق"
          description="لا داعي لإعادة اختراع العجلة. شغّل شركتك وفق أفضل المعايير الإدارية من اليوم الأول."
          buttonText="ابدأ تجربتك المجانية الآن"
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
