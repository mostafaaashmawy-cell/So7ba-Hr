import { 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  ArrowLeft, 
  Calendar 
} from 'lucide-react';
import { MarketingNavbar } from '@/components/marketing/layout/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/layout/MarketingFooter';
import { DemoBookingForm } from '@/components/marketing/contact/DemoBookingForm';

export const metadata = {
  title: 'تواصل معنا | احجز عرضاً توضيحياً مجانياً — HumAi',
  description: 'عايز تشوف HumAi شغّال على بيانات شركتك؟ احجز عرضاً توضيحياً مجانياً مدته 30 دقيقة مع أحد مختصينا، وشوف إزاي هتوفر وقتك من أول أسبوع.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <MarketingNavbar />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="relative pt-14 pb-16 md:pt-20 md:pb-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-6">
              <Calendar className="w-3.5 h-3.5" />
              <span>عرض توضيحي مباشر ومخصص</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.25] max-w-3xl mx-auto">
              عايز تشوف HumAi شغّال على بيانات شركتك؟
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              احجز عرضاً توضيحياً مجانياً مدته 30 دقيقة مع أحد مختصينا، وشوف إزاي هتوفر وقتك من أول أسبوع.
            </p>
          </div>
        </section>

        {/* Content Section: Form & Direct Contact */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Form Side (7 Cols) */}
              <div className="lg:col-span-7">
                <DemoBookingForm />
              </div>

              {/* Info & Direct Contact Side (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Fast WhatsApp Alternative Card */}
                <div className="bg-gradient-to-b from-[#075E54]/30 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-8 space-y-5 shadow-xl relative overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      بديل سريع
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      تواصل معنا مباشرة عبر واتساب
                    </h3>
                    <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                      تفضل التحدث فوراً؟ تواصل مع فريق المبيعات والاستشارات وسنرد عليك في دقائق.
                    </p>
                  </div>

                  {/* TODO: replace with real phone number */}
                  <a
                    href="https://wa.me/201000000000"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <span>فتح محادثة واتساب الآن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                  <div className="text-center">
                    {/* TODO: replace with real contact */}
                    <span className="text-xs text-slate-400 dir-ltr inline-block">
                      +20 100 000 0000
                    </span>
                  </div>
                </div>

                {/* What to expect card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
                  <h4 className="font-bold text-white text-base">ماذا تتوقع خلال العرض التوضيحي؟</h4>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>جولة حية في لوحة التحكم وتطبيق الموظفين</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>تجربة حية لمساعد واتساب وتأكيد العمليات</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>تطبيق الـ Blueprint المناسب لنشاط شركتك</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>إجابة كافة الأسئلة الفنية والقانونية</span>
                    </li>
                  </ul>
                </div>

                {/* Direct Email */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="text-xs text-slate-400">البريد الإلكتروني المباشر</p>
                      {/* TODO: replace with real contact */}
                      <p className="text-sm font-semibold text-white dir-ltr text-right">
                        info@humai.app
                      </p>
                    </div>
                  </div>
                  <a
                    href="mailto:info@humai.app"
                    className="text-xs font-semibold text-teal-400 hover:underline"
                  >
                    مراسلة
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
