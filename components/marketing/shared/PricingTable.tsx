'use client';

import Link from 'next/link';
import { Check, X, Sparkles, Zap, Building2 } from 'lucide-react';

interface PricingFeature {
  name: string;
  starter: string | boolean;
  growth: string | boolean;
  enterprise: string | boolean;
  category?: string;
}

const FEATURES: PricingFeature[] = [
  {
    name: 'الحضور الجغرافي والانصراف (Geofencing)',
    starter: true,
    growth: true,
    enterprise: true,
  },
  {
    name: 'إدارة الإجازات والأذونات والرصيد',
    starter: true,
    growth: true,
    enterprise: true,
  },
  {
    name: 'مفردات الراتب الرقمية للموظفين',
    starter: true,
    growth: true,
    enterprise: true,
  },
  {
    name: 'محرك الرواتب وحساب الاستقطاعات',
    starter: 'أساسي',
    growth: 'كامل',
    enterprise: 'كامل + Proration متقدم',
  },
  {
    name: 'قوالب التشغيل الجاهزة (Blueprints)',
    starter: false,
    growth: true,
    enterprise: true,
  },
  {
    name: 'إدارة الشفتات والورديات المتقدمة',
    starter: false,
    growth: true,
    enterprise: true,
  },
  {
    name: 'سلسلة الموافقات متعددة المستويات',
    starter: false,
    growth: true,
    enterprise: true,
  },
  {
    name: 'مساعد واتساب الذكي بالذكاء الاصطناعي',
    starter: 'محدود (حتى 50 استعلام/شهر) // TODO: confirm real value',
    growth: 'حد أعلى (حتى 300 استعلام/شهر) // TODO: confirm real value',
    enterprise: 'غير محدود بالكامل',
  },
  {
    name: 'سجل الرقابة الإداري الكامل (Audit Trail)',
    starter: 'أساسي',
    growth: true,
    enterprise: 'متقدم مع تصدير تقارير',
  },
  {
    name: 'مستوى الدعم الفني',
    starter: 'بريد إلكتروني',
    growth: 'بريد إلكتروني + شات مباشر',
    enterprise: 'مدير حساب مخصص (Account Manager)',
  },
  {
    name: 'ربط بيانات مخصص (API & Webhooks)',
    starter: false,
    growth: false,
    enterprise: true,
  },
];

export function PricingTable() {
  const renderValue = (val: string | boolean) => {
    if (typeof val === 'boolean') {
      return val ? (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
            <X className="w-3.5 h-3.5" />
          </div>
        </div>
      );
    }
    return (
      <span className="text-xs sm:text-sm font-medium text-slate-200 text-center block">
        {val.replace(/\s*\/\/.*$/, '')}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Desktop Comparison Table */}
      <div className="hidden lg:block overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950">
              <th className="p-6 text-right w-1/4">
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block mb-1">
                  المقارنة التفصيلية
                </span>
                <span className="text-xl font-bold text-white">المزايا والقدرات</span>
              </th>
              {/* Starter */}
              <th className="p-6 text-center w-1/4 border-r border-slate-800">
                <div className="text-center space-y-2">
                  <div className="inline-flex p-2 rounded-xl bg-slate-800 text-slate-300 mb-1">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Starter</h3>
                  <p className="text-xs text-slate-400">للشركات الناشئة (حتى 15 موظف)</p>
                  <div className="pt-2">
                    <span className="text-base font-bold text-slate-200">السعر عند الطلب</span>
                    <p className="text-[11px] text-slate-400">تجربة مجانية متاحة</p>
                  </div>
                  <div className="pt-3">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                    >
                      ابدأ تجربتك المجانية
                    </Link>
                  </div>
                </div>
              </th>

              {/* Growth - Highlighted */}
              <th className="p-6 text-center w-1/4 bg-teal-950/40 border-r border-l border-teal-500/30 relative">
                <div className="absolute -top-0 right-1/2 translate-x-1/2 bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-b-md shadow-md uppercase">
                  الأكثر طلباً
                </div>
                <div className="text-center space-y-2 pt-2">
                  <div className="inline-flex p-2 rounded-xl bg-teal-500/20 text-teal-400 mb-1">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Growth & Automation</h3>
                  <p className="text-xs text-teal-200/80">للشركات المتوسعة (حتى 50 موظف)</p>
                  <div className="pt-2">
                    <span className="text-base font-bold text-teal-300">السعر عند الطلب</span>
                    <p className="text-[11px] text-teal-400/80">تشمل كافة قوالب التشغيل</p>
                  </div>
                  <div className="pt-3">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all shadow-md shadow-teal-500/20"
                    >
                      ابدأ تجربتك المجانية
                    </Link>
                  </div>
                </div>
              </th>

              {/* Enterprise */}
              <th className="p-6 text-center w-1/4 border-l border-slate-800">
                <div className="text-center space-y-2">
                  <div className="inline-flex p-2 rounded-xl bg-slate-800 text-slate-300 mb-1">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">HumAi Enterprise</h3>
                  <p className="text-xs text-slate-400">للمؤسسات الكبرى (+50 موظف)</p>
                  <div className="pt-2">
                    <span className="text-base font-bold text-slate-200">باقة مخصصة</span>
                    <p className="text-[11px] text-slate-400">دعم وربط API مخصص</p>
                  </div>
                  <div className="pt-3">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                    >
                      تواصل مع فريق المبيعات
                    </Link>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-sm">
            {FEATURES.map((feature, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 px-6 font-medium text-slate-300">
                  {feature.name}
                </td>
                <td className="p-4 px-6 text-center border-r border-slate-800">
                  {renderValue(feature.starter)}
                </td>
                <td className="p-4 px-6 text-center bg-teal-950/20 border-r border-l border-teal-500/20">
                  {renderValue(feature.growth)}
                </td>
                <td className="p-4 px-6 text-center border-l border-slate-800">
                  {renderValue(feature.enterprise)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Stacked Cards */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Starter Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                حتى 15 موظف
              </span>
              <Zap className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Starter</h3>
              <p className="text-xs text-slate-400 mt-1">للشركات الصغيرة والناشئة</p>
            </div>
            <div className="border-y border-slate-800 py-3">
              <span className="text-lg font-bold text-white">السعر عند الطلب</span>
              <p className="text-xs text-slate-400">بدون بطاقة ائتمان</p>
            </div>
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-slate-300">المزايا المشمولة:</p>
              {FEATURES.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  {typeof feat.starter === 'boolean' ? (
                    feat.starter ? (
                      <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )
                  ) : (
                    <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  )}
                  <span className={feat.starter === false ? 'text-slate-400 line-through' : 'text-slate-200'}>
                    {feat.name}:{' '}
                    {typeof feat.starter === 'string' && (
                      <span className="text-teal-300 font-semibold">
                        {feat.starter.replace(/\s*\/\/.*$/, '')}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/contact"
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-center text-xs font-bold transition-colors border border-slate-700 block"
          >
            ابدأ تجربتك المجانية
          </Link>
        </div>

        {/* Growth Card - Highlighted */}
        <div className="bg-slate-900 border-2 border-teal-500 rounded-3xl p-6 space-y-6 flex flex-col justify-between relative shadow-xl shadow-teal-500/10">
          <div className="absolute -top-3 right-1/2 translate-x-1/2 bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
            الأكثر طلباً
          </div>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-300 bg-teal-950 px-3 py-1 rounded-full border border-teal-500/30">
                حتى 50 موظف
              </span>
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Growth & Automation</h3>
              <p className="text-xs text-teal-200/80 mt-1">للشركات سريعة النمو</p>
            </div>
            <div className="border-y border-teal-500/20 py-3 bg-teal-950/20 px-2 rounded-xl">
              <span className="text-lg font-bold text-teal-300">السعر عند الطلب</span>
              <p className="text-xs text-teal-400/80">تشمل كافة قوالب التشغيل ومساعد واتساب</p>
            </div>
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-slate-200">كل ما في Starter بالإضافة إلى:</p>
              {FEATURES.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  {typeof feat.growth === 'boolean' ? (
                    feat.growth ? (
                      <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )
                  ) : (
                    <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  )}
                  <span className={feat.growth === false ? 'text-slate-400 line-through' : 'text-slate-200'}>
                    {feat.name}:{' '}
                    {typeof feat.growth === 'string' && (
                      <span className="text-teal-300 font-semibold">
                        {feat.growth.replace(/\s*\/\/.*$/, '')}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/contact"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-center text-xs font-bold transition-all shadow-md block"
          >
            ابدأ تجربتك المجانية
          </Link>
        </div>

        {/* Enterprise Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                أكثر من 50 موظف
              </span>
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">HumAi Enterprise</h3>
              <p className="text-xs text-slate-400 mt-1">للمؤسسات وسلاسل الفروع الكبرى</p>
            </div>
            <div className="border-y border-slate-800 py-3">
              <span className="text-lg font-bold text-white">باقة مخصصة</span>
              <p className="text-xs text-slate-400">حسب متطلبات الربط والفروع</p>
            </div>
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-slate-300">مزايا المؤسسات الكبرى:</p>
              {FEATURES.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">
                    {feat.name}:{' '}
                    {typeof feat.enterprise === 'string' && (
                      <span className="text-teal-300 font-semibold">{feat.enterprise}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/contact"
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-center text-xs font-bold transition-colors border border-slate-700 block"
          >
            تواصل مع فريق المبيعات
          </Link>
        </div>
      </div>
    </div>
  );
}
