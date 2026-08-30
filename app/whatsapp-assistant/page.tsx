import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Fingerprint, 
  Database, 
  Cpu 
} from 'lucide-react';
import { MarketingNavbar } from '@/components/marketing/layout/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/layout/MarketingFooter';
import { WhatsAppChatDemo } from '@/components/marketing/shared/WhatsAppChatDemo';
import { CTASection } from '@/components/marketing/shared/CTASection';

export const metadata = {
  title: 'مساعد واتساب لإدارة الموارد البشرية بالذكاء الاصطناعي | HumAi',
  description: 'أول مساعد موارد بشرية ذكي يدير شركتك عبر محادثات واتساب. استعلم عن الحضور، الإجازات، والرواتب ونفّذ الإجراءات بدقة وأمان تام.',
};

export default function WhatsAppAssistantPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <MarketingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-14 pb-20 md:pt-20 md:pb-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>مساعد واتساب المخصص للشركات</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.25] max-w-4xl mx-auto">
              أول مساعد موارد بشرية ذكي يدير شركتك عبر محادثات واتساب.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              لا داعي لفتح لوحة التحكم كل ساعة. أرسل رسالة نصية أو صوتية للمساعد الذكي على واتساب، وهيرد عليك فوراً من واقع بيانات شركتك، أو ينفّذ الإجراءات المالية والإدارية بدقة وأمان تام.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
              >
                <span>جرّب المساعد الذكي لشركتك</span>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Live Interactive Chat Simulator */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                ماذا يمكن لمساعد واتساب أن يفعل؟
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                اختر نوع الاستعلام أدناه وشاهد تفاعل المساعد الفوري من واقع بيانات السيستم
              </p>
            </div>

            <WhatsAppChatDemo />
          </div>
        </section>

        {/* Capabilities Breakdown */}
        <section className="py-20 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Capability 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">استعلامات الحضور والتشغيل اللحظية</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  معرفة المتأخرين، نسب الحضور، والإجازات اللحظية لكل فرع وقسم بدون انتظار تقارير نهاية اليوم.
                </p>
                <div className="pt-2 space-y-2 text-xs text-slate-400">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300">
                    &ldquo;مين اتأخر النهارده في فرع التجمع؟&rdquo;
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300">
                    &ldquo;إيه نسبة حضور الموظفين لحد دلوقتي؟&rdquo;
                  </div>
                </div>
              </div>

              {/* Capability 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">الاستعلامات المالية والرواتب</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  الاستعلام المباشر عن أرصدة الإجازات، إجمالي السلف المعتمدة، وبيانات تحويل مسيرات الرواتب.
                </p>
                <div className="pt-2 space-y-2 text-xs text-slate-400">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300">
                    &ldquo;رصيد إجازات أحمد علي باقي فيه كام يوم؟&rdquo;
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300">
                    &ldquo;إجمالي السلف المطلوبة والمعتمدة الشهر ده؟&rdquo;
                  </div>
                </div>
              </div>

              {/* Capability 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">تنفيذ العمليات بأمان (تأكيد مزدوج)</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  تسجيل المكافآت، اعتماد الإجازات، أو تسجيل الخصومات مع رسالة تأكيد صريحة قبل القيد في مسير الرواتب.
                </p>
                <div className="pt-2 space-y-2 text-xs text-slate-400">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300">
                    &ldquo;ضيف مكافأة 500 جنيه لمحمد بسبب تحقيق التارجت&rdquo;
                  </div>
                  <div className="bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/30 text-emerald-300">
                    &ldquo;⚠️ هل تؤكد الإضافة؟ — لن تُسجل إلا بعد موافقتك&rdquo;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Data Isolation */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>معايير أمان مشددة</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  أمان وعزل البيانات في مساعد واتساب
                </h2>
                <p className="text-slate-400 text-sm">
                  تم بناء المساعد وفق أحدث بروتوكولات الأمان والتحقق لضمان سرية بياناتك
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <Fingerprint className="w-8 h-8 text-teal-400" />
                  <h4 className="font-bold text-white text-base">التحقق من هوية الراسل</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    لا يتعامل المساعد إلا مع أرقام الهواتف المسجلة مسبقاً في النظام كأصحاب صلاحية (Super Admin أو Manager).
                  </p>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <Database className="w-8 h-8 text-teal-400" />
                  <h4 className="font-bold text-white text-base">عزل كامل للبيانات (Tenant ID)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    استحالة وصول المساعد لبيانات أي شركة أخرى عبر قفل كافة الاستعلامات برمجياً بمعرّف الشركة المستقل.
                  </p>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <Cpu className="w-8 h-8 text-teal-400" />
                  <h4 className="font-bold text-white text-base">دقة بدون تخمين (Function Calling)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    يعتمد المساعد على استدعاء دوال محددة لقراءة البيانات الحقيقية من قاعدة البيانات دون اختلاق أي أرقام.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plan Availability Table */}
        <section className="py-16 bg-slate-900/60 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                توفر مساعد واتساب حسب الباقة
              </h2>
              <p className="text-slate-400 text-xs">
                شفافية كاملة في توفر المساعد عبر مختلف باقات الخدمة
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-300">
                    <th className="p-4 font-bold">الباقة</th>
                    <th className="p-4 font-bold">حد الاستعلامات الشهرية</th>
                    <th className="p-4 font-bold">التأكيد المزدوج للعمليات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 text-xs sm:text-sm">
                  <tr>
                    <td className="p-4 font-bold text-white">Starter</td>
                    <td className="p-4">استعلامات أساسية محدودة [مثال: حتى 50 استعلام/شهر]</td>
                    <td className="p-4 text-teal-400">✓ متاح</td>
                  </tr>
                  <tr className="bg-teal-950/20">
                    <td className="p-4 font-bold text-teal-300">Growth & Automation</td>
                    <td className="p-4 text-teal-200">حد أعلى [مثال: حتى 300 استعلام/شهر]</td>
                    <td className="p-4 text-teal-400">✓ متاح</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white">Enterprise</td>
                    <td className="p-4 text-emerald-400 font-semibold">غير محدود بالكامل</td>
                    <td className="p-4 text-teal-400">✓ متاح + سجل تدقيق متقدم</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <CTASection
          title="شغّل مساعد واتساب الذكي لشركتك الآن"
          description="ابدأ تجربة مجانية وشاهد كيف يدير الذكاء الاصطناعي تفاصيل الحضور والرواتب وأنت في طريقك."
          buttonText="ابدأ تجربتك المجانية"
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
