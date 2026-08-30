import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface CTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

export function CTASection({
  title = 'جاهز تنقل إدارة شركتك لعصر الأتمتة الذكية؟',
  description = 'انضم الآن وابدأ إدارة فريقك بكفاءة ودقة وبدون أي تعقيد.',
  buttonText = 'ابدأ الآن مجاناً — بدون بطاقة ائتمان',
}: CTASectionProps) {
  return (
    <section className="py-20 relative overflow-hidden bg-slate-950">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[300px] bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 p-8 sm:p-14 text-center shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تجربة مجانية كاملة المزايا</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-2xl mx-auto">
            {title}
          </h2>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            {description}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all duration-200 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              <span>{buttonText}</span>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              href="/whatsapp-assistant"
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-850 transition-colors border border-slate-700/80 flex items-center justify-center gap-2"
            >
              <span>استكشف مساعد واتساب</span>
            </Link>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>بدون بطاقة ائتمان</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-teal-400" />
              <span>إعداد فوري في دقيقتين</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>إلغاء في أي وقت</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
