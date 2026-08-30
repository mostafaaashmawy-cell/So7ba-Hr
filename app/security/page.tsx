import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Database, 
  RefreshCcw, 
  FileSearch, 
  ArrowLeft, 
  Fingerprint 
} from 'lucide-react';
import { MarketingNavbar } from '@/components/marketing/layout/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/layout/MarketingFooter';
import { CTASection } from '@/components/marketing/shared/CTASection';

export const metadata = {
  title: 'الأمان وحماية البيانات في HumAi',
  description: 'بيانات موظفيك ورواتب شركتك... محمية بأعلى معايير الأمان السحابي. تعرّف على كيفية حماية وعزل بيانات شركتك في HumAi.',
};

export default function SecurityPage() {
  const securityPillars = [
    {
      icon: Database,
      title: 'عزل تام للبيانات (Multi-Tenant Architecture)',
      description:
        'تعمل كل شركة في بيئة بيانات مستقلة تماماً ومعزولة برمجياً عن بقية الشركات، مما يضمن استحالة تداخل البيانات أو تسريبها.',
    },
    {
      icon: Lock,
      title: 'تشفير البيانات أثناء النقل والتخزين',
      description:
        'نعتمد معايير تشفير قياسية حديثة (TLS/SSL و AES-256) لحماية كافة السجلات والملفات والمحادثات من أي وصول غير مصرح به.',
    },
    {
      icon: KeyRound,
      title: 'صلاحيات محددة حسب الدور (Role-Based Access)',
      description:
        'منظومة صلاحيات دقيقة (Super Admin، مدير فرع، موظف) تضمن أن كل مستخدم يرى فقط البيانات المخصصة له بحكم منصبه.',
    },
    {
      icon: RefreshCcw,
      title: 'نسخ احتياطي دوري وآلي',
      description:
        'نسخ احتياطية مشفرة ومؤتمتة تُجرى بصفة دورية لضمان استمرارية الأعمال وحماية سجلات الرواتب والحضور من أي فقدان طارئ.',
    },
    {
      icon: FileSearch,
      title: 'سجل رقابة شامل وتدقيق إداري (Audit Trail)',
      description:
        'توثيق دقيق وغير قابل للتعديل لكل عملية إضافة أو حذف أو تعديل، متضمناً اسم المنفذ، التوقيت الزمني، والفروق قبل وبعد الإجراء.',
    },
    {
      icon: Fingerprint,
      title: 'تأكيد مزدوج للعمليات المالية والإدارية',
      description:
        'لا يُنفَّذ أي خصم، مكافأة، أو اعتماد إجازة عبر مساعد واتساب إلا بعد تأكيد صريح ومباشر من الحساب المخول بالصلاحية.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <MarketingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-14 pb-20 md:pt-20 md:pb-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>الأمان وحماية الخصوصية</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.25] max-w-4xl mx-auto">
              بيانات موظفيك ورواتب شركتك... محمية بأعلى معايير الأمان السحابي.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              ندرك في HumAi حساسية البيانات المالية والإدارية، ولذلك صممنا بنيتنا التحتية وفق مبادئ العزل التام والتشفير الصارم لحماية خصوصية كل منشأة.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
              >
                <span>احجز جلسة استشارة أمنية وتقنية</span>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Security Pillars Grid */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                كيف نحمي بياناتك؟
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                ستة محاور دفاعية وتقنية متقدمة تضمن سلامة وسرية عملياتك التشغيلية
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {securityPillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={index}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 hover:border-teal-500/40 transition-all shadow-xl"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{pillar.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Commitment Banner */}
        <section className="py-16 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h3 className="text-xl font-bold text-white">التزامنا بالشفافية والممارسات الموثوقة</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              نلتزم دائماً بتطبيق أحدث الممارسات الهندسية لحماية البيانات دون إطلاق ادعاءات مبالغ فيها، ونوفر لعملائنا في باقة المؤسسات إمكانية الاطلاع على تقارير الأداء وسجلات التدقيق الخاصة بهم في أي وقت.
            </p>
          </div>
        </section>

        {/* CTA */}
        <CTASection
          title="أدر فريقك ورواتبك في بيئة سحابية آمنة وموثوقة"
          description="انضم الآن وابدأ تجربتك المجانية دون الحاجة لبطاقة ائتمان."
          buttonText="ابدأ تجربتك المجانية"
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
