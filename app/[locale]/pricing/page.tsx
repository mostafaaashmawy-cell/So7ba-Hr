import { getDictionary, locales, type Locale } from '@/lib/i18n';
import { MarketingNavbar } from '@/components/marketing/layout/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/layout/MarketingFooter';
import { GlowOrbs } from '@/components/marketing/shared/GlowOrbs';
import { CTASection } from '@/components/marketing/shared/CTASection';
import { SectionWrapper } from '@/components/marketing/motion/SectionWrapper';
import { PricingTable } from '@/components/marketing/shared/PricingTable';
import { FAQAccordion } from '@/components/marketing/shared/FAQAccordion';

export async function generateStaticParams() {
  return locales.map(l => ({ locale: l }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  return { title: dict.pricing.meta.title, description: dict.pricing.meta.description };
}

export default async function PricingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const dir = dict.dir;

  return (
    <main dir={dir} className="min-h-screen bg-[#05070D] text-slate-200 font-sans selection:bg-cyan-500/30">
      <MarketingNavbar dict={dict} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 bg-[#05070D]">
        <div className="absolute inset-0 dot-grid-bg opacity-30"></div>
        <GlowOrbs />
        <div className="container mx-auto px-6 relative z-10">
          <SectionWrapper>
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center border border-cyan-400/30 text-cyan-400 bg-cyan-400/5 text-xs font-semibold px-3 py-1 rounded-full">
                {dict.locale === 'ar' ? 'الأسعار والباقات' : 'Pricing & Plans'}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                {dict.pricing.hero.title}
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {dict.pricing.hero.description}
              </p>
              
              {dict.pricing.hero.badges && dict.pricing.hero.badges.length > 0 && (
                <div className="pt-4 flex flex-wrap justify-center gap-4">
                  {dict.pricing.hero.badges.map((badge: string, i: number) => (
                    <span key={i} className="text-xs font-medium text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="py-12 bg-[#0D1117] relative z-10">
        <div className="container mx-auto px-6">
          <PricingTable dict={dict} />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#05070D] relative z-10">
        <div className="container mx-auto px-6 max-w-3xl">
          <FAQAccordion items={dict.pricing.faq} sectionTitle={dict.shared.faq.sectionTitle} />
        </div>
      </section>

      {/* CTA */}
      <CTASection 
        title={dict.pricing.cta.title} 
        description={dict.pricing.cta.description} 
        button={dict.pricing.cta.button} 
        href={'/' + locale + '/contact'} 
      />

      <MarketingFooter dict={dict} />
    </main>
  );
}
