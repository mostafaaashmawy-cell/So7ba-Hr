'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

export const DEFAULT_FAQS: FAQItem[] = [
  {
    question: 'هل بيانات شركتي آمنة ومعزولة عن باقي العملاء؟',
    answer:
      'نعم، تعتمد HumAi على بنية Multi-Tenant تضمن عزل بيانات كل شركة بالكامل عن غيرها، مع صلاحيات وصول محددة لكل مستخدم وتشفير كامل للبيانات أثناء النقل والتخزين.',
  },
  {
    question: 'هل النظام متوافق مع قانون العمل المصري؟',
    answer:
      'النظام مُصمَّم وفق أفضل الممارسات السائدة في السوق المصري (دورات الرواتب، الإجازات، بدلات العمل الإضافي). ننصح دائماً بمراجعة قانونية داخلية لضمان التوافق الكامل مع طبيعة نشاطكم.',
  },
  {
    question: 'هل أحتاج فريق تقني لتركيب النظام؟',
    answer:
      'لا، النظام سحابي بالكامل (SaaS) ويعمل مباشرة من المتصفح أو تطبيق الموبايل دون تركيب أو صيانة من جانبكم.',
  },
  {
    question: 'هل مساعد واتساب متاح في كل الباقات؟',
    answer:
      'متاح بشكل تجريبي محدود في باقتي Starter وGrowth، وبدون حدود في باقة Enterprise. راجع صفحة الأسعار للتفاصيل.',
  },
  {
    question: 'هل يوجد تجربة مجانية؟',
    answer:
      'نعم، يمكنك البدء بتجربة مجانية كاملة المزايا دون الحاجة لبطاقة ائتمان.',
  },
];

export const PRICING_FAQS: FAQItem[] = [
  {
    question: 'هل يمكن الترقية بين الباقات لاحقاً؟',
    answer:
      'نعم، يمكنك الترقية أو تغيير باقتك في أي وقت بسهولة وبدون أي انقطاع في الخدمة أو فقدان لبياناتك المسجلة.',
  },
  {
    question: 'هل التجربة المجانية تشمل كل المزايا؟',
    answer:
      'نعم، تمنحك التجربة المجانية وصولاً كاملاً للاطلاع على كافة قدرات النظام والـ Blueprints قبل اتخاذ قرار الاشتراك.',
  },
  {
    question: 'كيف يتم سداد قيمة الاشتراك؟',
    answer:
      'نوفر دعماً كاملاً لقنوات الدفع المحلية الأكثر ملاءمة في مصر: InstaPay، المحافظ الإلكترونية (فودافون كاش وغيرها)، والتحويل البنكي المباشر.',
  },
];

interface FAQAccordionProps {
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
}

export function FAQAccordion({
  items = DEFAULT_FAQS,
  title = 'الأسئلة الشائعة',
  subtitle = 'إجابات واضحة على أكثر الأسئلة التي يطرحها عملاؤنا قبل البدء',
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-slate-900/50 border-y border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>لديك استفسار؟</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-slate-400 text-base max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {items.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900 border-teal-500/40 shadow-lg shadow-teal-500/5'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4 text-right flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-sm sm:text-base text-slate-100">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-teal-500 text-slate-950 rotate-180'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-300 text-sm leading-relaxed border-t border-slate-800/60 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
