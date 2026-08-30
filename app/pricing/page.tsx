import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle 
} from 'lucide-react';
import { MarketingNavbar } from '@/components/marketing/layout/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/layout/MarketingFooter';
import { PricingTable } from '@/components/marketing/shared/PricingTable';
import { FAQAccordion, PRICING_FAQS } from '@/components/marketing/shared/FAQAccordion';
import { CTASection } from '@/components/marketing/shared/CTASection';

export const metadata = {
  title: 'أسعار وباقات HumAi لإدارة الموارد البشرية | ابدأ تجربتك المجانية',
  description: 'اختر الباقة المناسبة لحجم فريقك. كل الباقات تشمل تجربة مجانية بدون بطاقة ائتمان.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <MarketingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-14 pb-16 md:pt-20 md:pb-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-6">
              <CreditCard className="w-3.5 h-3.5" />
              <span>خطط وباقات مرنة</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.25] max-w-3xl mx-auto">
              باقات مصممة لتنمو مع حجم فريقك
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              اختر الباقة المناسبة لحجم فريقك. كل الباقات تشمل تجربة مجانية بدون بطاقة ائتمان.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>بدون التزام أو بطاقة ائتمان</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>إمكانية الترقية أو الإلغاء في أي وقت</span>
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Comparison Table Component */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PricingTable />
          </div>
        </section>

        {/* Pricing FAQ */}
        <FAQAccordion
          items={PRICING_FAQS}
          title="أسئلة شائعة عن الأسعار والاشتراك"
          subtitle="كل ما تحتاج معرفته عن آليات الدفع والترقية والتجربة المجانية"
        />

        {/* CTA */}
        <CTASection
          title="جاهز لبدء تجربتك المجانية اليوم؟"
          description="انضم إلى الشركات التي طوّرت أداءها ووفرت ساعات العمل الإدارية مع HumAi."
          buttonText="ابدأ الآن مجاناً — بدون بطاقة ائتمان"
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
